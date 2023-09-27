/*
    Calculate relationship between two shapes and return result in the form of
    Dimensionally Extended nine-Intersection Matrix (https://en.wikipedia.org/wiki/DE-9IM)
 */

/**
 * @module Relation
 */
"use strict";

import Flatten from "../flatten";
import DE9IM from "../data_structures/de9im";
import {
    intersectLine2Arc,
    intersectLine2Box,
    intersectLine2Circle,
    intersectLine2Line,
    intersectLine2Polygon,
    intersectSegment2Line,
    intersectPolygon2Polygon,
    intersectShape2Polygon,
    intersectCircle2Circle
} from "./intersection";
import {Multiline} from "../classes/multiline";
import {ray_shoot} from "./ray_shooting";
import * as BooleanOperations from "./boolean_op";

let {vector,ray,segment,arc,polygon,multiline} = Flatten;

/**
 * Returns true if shapes are topologically equal:  their interiors intersect and
 * no part of the interior or boundary of one geometry intersects the exterior of the other
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function equal(shape1, shape2) {
    return relate(shape1, shape2).equal();
}

/**
 * Returns true if shapes have at least one point in common, same as "not disjoint"
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function intersect(shape1, shape2) {
    return relate(shape1, shape2).intersect();
}

/**
 * Returns true if shapes have at least one point in common, but their interiors do not intersect
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function touch(shape1, shape2) {
    return relate(shape1, shape2).touch();
}

/**
 * Returns true if shapes have no points in common neither in interior nor in boundary
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function disjoint(shape1, shape2) {
    return !intersect(shape1, shape2);
}

/**
 * Returns true shape1 lies in the interior of shape2
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function inside(shape1, shape2) {
    return relate(shape1, shape2).inside();
}

/**
 * Returns true if every point in shape1 lies in the interior or on the boundary of shape2
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function covered(shape1, shape2) {
    return  relate(shape1, shape2).covered();
}

/**
 * Returns true shape1's interior contains shape2 <br/>
 * Same as inside(shape2, shape1)
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function contain(shape1, shape2) {
    return inside(shape2, shape1);
}

/**
 * Returns true shape1's cover shape2, same as shape2 covered by shape1
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function cover(shape1, shape2) {
    return covered(shape2, shape1);
}

/**
 * Returns relation between two shapes as intersection 3x3 matrix, where each
 * element contains relevant intersection as array of shapes.
 * If there is no intersection, element contains empty array
 * If intersection is irrelevant it left undefined. (For example, intersection
 * between two exteriors is usually irrelevant)
 * @param shape1
 * @param shape2
 * @returns {DE9IM}
 */
export function relate(shape1, shape2) {
    if (shape1 instanceof Flatten.Line && shape2 instanceof Flatten.Line) {
        return relateLine2Line(shape1,  shape2);
    }
    else if (shape1 instanceof Flatten.Line && shape2 instanceof Flatten.Circle) {
        return relateLine2Circle(shape1, shape2);
    }
    else if (shape1 instanceof Flatten.Line && shape2 instanceof Flatten.Box) {
        return relateLine2Box(shape1, shape2);
    }
    else if ( shape1 instanceof Flatten.Line  && shape2 instanceof Flatten.Polygon) {
        return relateLine2Polygon(shape1, shape2);
    }
    else if ( (shape1 instanceof Flatten.Segment || shape1 instanceof Flatten.Arc)  && shape2 instanceof Flatten.Polygon) {
        return relateShape2Polygon(shape1, shape2);
    }
    else if ( (shape1 instanceof Flatten.Segment || shape1 instanceof Flatten.Arc)  &&
        (shape2 instanceof Flatten.Circle || shape2 instanceof Flatten.Box) ) {
        return relateShape2Polygon(shape1, new Flatten.Polygon(shape2));
    }
    else if (shape1 instanceof Flatten.Polygon && shape2 instanceof Flatten.Polygon) {
        return relatePolygon2Polygon(shape1, shape2);
    }
    else if ((shape1 instanceof Flatten.Circle || shape1 instanceof Flatten.Box) &&
        (shape2 instanceof  Flatten.Circle || shape2 instanceof Flatten.Box)) {
        return relatePolygon2Polygon(new Flatten.Polygon(shape1), new Flatten.Polygon(shape2));
    }
    else if ((shape1 instanceof Flatten.Circle || shape1 instanceof Flatten.Box) && shape2 instanceof Flatten.Polygon) {
        return relatePolygon2Polygon(new Flatten.Polygon(shape1), shape2);
    }
    else if (shape1 instanceof Flatten.Polygon && (shape2 instanceof Flatten.Circle || shape2 instanceof Flatten.Box)) {
        return relatePolygon2Polygon(shape1, new Flatten.Polygon(shape2));
    }
}

function relateLine2Line(line1, line2) {
    let denim = new DE9IM();
    let ip = intersectLine2Line(line1, line2);
    if (ip.length === 0) {       // parallel or equal ?
        if (line1.contains(line2.pt) && line2.contains(line1.pt)) {
            denim.I2I = [line1];   // equal  'T.F...F..'  - no boundary
            denim.I2E = [];
            denim.E2I = [];
        }
        else {                     // parallel - disjoint 'FFTFF*T**'
            denim.I2I = [];
            denim.I2E = [line1];
            denim.E2I = [line2];
        }
    }
    else {                       // intersect   'T********'
        denim.I2I = ip;
        denim.I2E = line1.split(ip);
        denim.E2I = line2.split(ip);
    }
    return denim;
}

function relateLine2Circle(line,circle) {
    let denim = new DE9IM();
    let ip = intersectLine2Circle(line, circle);
    if (ip.length === 0) {
        denim.I2I = [];
        denim.I2B = [];
        denim.I2E = [line];
        denim.E2I = [circle];
    }
    else if (ip.length === 1) {
        denim.I2I = [];
        denim.I2B = ip;
        denim.I2E = line.split(ip);

        denim.E2I = [circle];
    }
    else {       // ip.length == 2
        let multiline = new Multiline([line]);
        let ip_sorted = line.sortPoints(ip);
        multiline.split(ip_sorted);
        let splitShapes = multiline.toShapes();

        denim.I2I = [splitShapes[1]];
        denim.I2B = ip_sorted;
        denim.I2E = [splitShapes[0], splitShapes[2]];

        denim.E2I = new Flatten.Polygon([circle.toArc()]).cut(multiline);
    }

    return denim;
}

function relateLine2Box(line, box) {
    let denim = new DE9IM();
    let ip = intersectLine2Box(line, box);
    if (ip.length === 0) {
        denim.I2I = [];
        denim.I2B = [];
        denim.I2E = [line];

        denim.E2I = [box];
    }
    else if (ip.length === 1) {
        denim.I2I = [];
        denim.I2B = ip;
        denim.I2E = line.split(ip);

        denim.E2I = [box];
    }
    else {                     // ip.length == 2
        let multiline = new Multiline([line]);
        let ip_sorted = line.sortPoints(ip);
        multiline.split(ip_sorted);
        let splitShapes = multiline.toShapes();

        /* Are two intersection points on the same segment of the box boundary ? */
        if (box.toSegments().some( segment => segment.contains(ip[0]) && segment.contains(ip[1]) )) {
            denim.I2I = [];                         // case of touching
            denim.I2B = [splitShapes[1]];
            denim.I2E = [splitShapes[0], splitShapes[2]];

            denim.E2I = [box];
        }
        else {                                       // case of intersection
            denim.I2I = [splitShapes[1]];            // [segment(ip[0], ip[1])];
            denim.I2B = ip_sorted;
            denim.I2E = [splitShapes[0], splitShapes[2]];

            denim.E2I = new Flatten.Polygon(box.toSegments()).cut(multiline);
        }
    }
    return denim;
}

function relateLine2Polygon(line, polygon) {
    let denim = new DE9IM();
    let ip = intersectLine2Polygon(line, polygon);
    let multiline = new Multiline([line]);
    let ip_sorted = ip.length > 0 ? ip.slice() : line.sortPoints(ip);

    multiline.split(ip_sorted);

    [...multiline].forEach(edge => edge.setInclusion(polygon));

    denim.I2I = [...multiline].filter(edge => edge.bv === Flatten.INSIDE).map(edge => edge.shape);
    denim.I2B = [...multiline].slice(1).map( (edge) => edge.bv === Flatten.BOUNDARY ? edge.shape : edge.shape.start );
    denim.I2E = [...multiline].filter(edge => edge.bv === Flatten.OUTSIDE).map(edge => edge.shape);

    denim.E2I = polygon.cut(multiline);

    return denim;
}

function relateShape2Polygon(shape, polygon) {
    let denim = new DE9IM();
    let ip = intersectShape2Polygon(shape, polygon);
    let ip_sorted = ip.length > 0 ? ip.slice() : shape.sortPoints(ip);

    let multiline = new Multiline([shape]);
    multiline.split(ip_sorted);

    [...multiline].forEach(edge => edge.setInclusion(polygon));

    denim.I2I = [...multiline].filter(edge => edge.bv === Flatten.INSIDE).map(edge => edge.shape);
    denim.I2B = [...multiline].slice(1).map( (edge) => edge.bv === Flatten.BOUNDARY ? edge.shape : edge.shape.start );
    denim.I2E = [...multiline].filter(edge => edge.bv === Flatten.OUTSIDE).map(edge => edge.shape);


    denim.B2I = [];
    denim.B2B = [];
    denim.B2E = [];
    for (let pt of [shape.start, shape.end]) {
        switch (ray_shoot(polygon, pt)) {
            case Flatten.INSIDE:
                denim.B2I.push(pt);
                break;
            case Flatten.BOUNDARY:
                denim.B2B.push(pt);
                break;
            case Flatten.OUTSIDE:
                denim.B2E.push(pt);
                break;
            default:
                break;
        }
    }

    // denim.E2I  TODO: calculate, not clear what is expected result

    return denim;
}

function relatePolygon2Polygon(polygon1, polygon2) {
    let denim = new DE9IM();

    let [ip_sorted1, ip_sorted2] = BooleanOperations.calculateIntersections(polygon1, polygon2);
    let boolean_intersection = BooleanOperations.intersect(polygon1, polygon2);
    let boolean_difference1 = BooleanOperations.subtract(polygon1, polygon2);
    let boolean_difference2 = BooleanOperations.subtract(polygon2, polygon1);
    let [inner_clip_shapes1, inner_clip_shapes2] = BooleanOperations.innerClip(polygon1, polygon2);
    let outer_clip_shapes1 = BooleanOperations.outerClip(polygon1, polygon2);
    let outer_clip_shapes2 = BooleanOperations.outerClip(polygon2, polygon1);

    denim.I2I = boolean_intersection.isEmpty() ? [] : [boolean_intersection];
    denim.I2B = inner_clip_shapes2;
    denim.I2E = boolean_difference1.isEmpty() ? [] : [boolean_difference1];

    denim.B2I = inner_clip_shapes1;
    denim.B2B = ip_sorted1;
    denim.B2E = outer_clip_shapes1;

    denim.E2I = boolean_difference2.isEmpty() ? [] : [boolean_difference2];
    denim.E2B = outer_clip_shapes2;
    // denim.E2E    not relevant meanwhile

    return denim;
}
