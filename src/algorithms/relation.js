/*
    Calculate relationship between two shapes and return result in the form of
    Dimensionally Extended nine-Intersection Matrix (https://en.wikipedia.org/wiki/DE-9IM)
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
    intersectPolygon2Polygon
} from "./intersection";
import {Multiline} from "../classes/multiline";

let {vector,ray,segment,arc,polygon,multiline} = Flatten;

const DISJOINT = RegExp('FF.FF....');
const EQUALS = RegExp('T.F..FFF.');
const INTERSECTS = RegExp('T........|.T.......|...T.....|....T....');
const TOUCHES = RegExp('FT.......|F..T.....|F...T....');

/**
 * Returns true if shapes have no points in common neither in interior nor in boundary
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function disjoint(shape1, shape2) {
    let denim = relate(shape1, shape2);
    return DISJOINT.test(denim.toString());
}

/**
 * Returns true is shapes topologically equal:  their interiors intersect and
 * no part of the interior or boundary of one geometry intersects the exterior of the other
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function equals(shape1, shape2) {
    let denim = relate(shape1, shape2);
    return EQUALS.test(denim.toString());
}

/**
 * Returns true is shapes have at least one point in common, same as "not disjoint"
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function intersects(shape1, shape2) {
    let denim = relate(shape1, shape2);
    return INTERSECTS.test(denim.toString());
}

/**
 * Returns true if shapes have at least one point in common, but their interiors do not intersect
 * @param shape1
 * @param shape2
 * @returns {boolean}
 */
export function touches(shape1, shape2) {
    let denim = relate(shape1, shape2);
    return TOUCHES.test(shape1, shape2);
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
}

/**
 * Return intersection between 2 lines as intersection matrix <br/>
 * Note, the lines has no boundary so intersection between boundaries is irrelevant <br/>
 * @param {Line} line1
 * @param {Line} line2
 * @returns {DE9IM}
 */
export function relateLine2Line(line1, line2) {
    let denim = new DE9IM();
    let ip = intersectLine2Line(line1, line2);
    if (ip.length === 0) {       // parallel or equal ?
        if (line1.contains(line2.pt) && line2.contains(line1.pt)) {
            denim.I2I = [line1];   // equal  'T*F**FFF*'
            denim.I2E = denim.E2I = [];
        }
        else {                     // parallel - disjoint 'FFTFF*T**'
            denim.I2I = [];
            denim.I2E = [line1];
            denim.E2I = [line2];
        }
    }
    else {                       // intersected   'T********'
        denim.I2I = ip;
        // denim.I2E = [ray(line1.pt, line1.norm), ray(line1.pt, line1.norm.invert())];
        // denim.E2I = [ray(line2.pt, line2.norm), ray(line2.pt, line2.norm.invert())];
        denim.I2E = multiline([line1]).split(ip).toShapes();
        denim.E2I = multiline([line2]).split(ip).toShapes();
    }
    return denim;
}

/**
 * Return intersection between lines and circle as intersection matrix <br/>
 * Intersection between line interior abd circle boundary are one or two intersection points
 * Intersection between line interior and circle interior is a line segment inside circle
 * Intersection between line interior and circle exterior are two rays outside circle
 * Intersection between line exterior and circle interior are two circle segments cut by lines
 * Other relations are irrelevant
 * @param {Line} line
 * @param {Circle} circle
 * @returns {DE9IM}
 */
export function relateLine2Circle(line,circle) {
    let denim = new DE9IM();
    let ip = intersectLine2Circle(line, circle);
    if (ip.length === 0) {
        denim.I2I = denim.I2B = [];
        denim.I2E = [line];
        denim.E2I = [circle];
    }
    else if (ip.length === 1) {
        denim.I2I = [];
        denim.I2B = ip;
        /* I2E are two rays from intersection point */
        // let ray0 = ray(ip[0], line.norm.invert());
        // let ray1 = ray(ip[1], line.norm);
        // denim.I2E = [ray0, ray1];

        denim.I2E = multiline([line]).split(ip).toShapes();
        denim.E2I = [circle];
    }
    else {       // ip.length == 2
        sortPointsOnLine(line, ip);          // sort points on line

        // split line to array of [ray,segment,ray]
        let splitShapes = multiline([line]).split(ip).toShapes();

        denim.I2I = [splitShapes[1]];   // segment(ip[0], ip[1]);
        denim.I2B = ip;
        /* I2E are two rays from intersection points outside of the circle */
        // let ray0 = ray(ip[0], line.norm.invert());
        // let ray1 = ray(ip[1], line.norm.invert());
        // denim.I2E = [ray0, ray1];
        denim.I2E = [splitShapes[0],splitShapes[2]];

        /* E2I are two circular segments. Choose the ccw orientation of the arcs */
        let angle0 = vector(circle.pc, ip[0]).slope;
        let angle1 = vector(circle.pc, ip[1].slope);
        let poly1 = polygon([
            arc(circle.pc, circle.r, angle0, angle1, Flatten.CCW),
            segment(ip[1], ip[0])
        ]);
        let poly2 = polygon([
            arc(circle.pc, circle.r, angle1, angle0, Flatten.CCW),
            segment(ip[0], ip[1])
        ]);
        denim.E2I = [poly1, poly2];
    }

    return denim;
}

/**
 * Return intersection between lines and box as intersection matrix <br/>
 * Intersection between line interior and box interior is a segment
 * Intersection between line interior and box boundary may be one point, two points or segment
 * Intersection between line interior and box exterior are two rays
 * Intersection between line exterior and box interior are two polygons
 * Other relations are irrelevant
 * @param {Line} line
 * @param {Box} box
 * @returns {DE9IM}
 */
export function relateLine2Box(line, box) {
    let denim = new DE9IM();
    let ip = intersectLine2Box(line, box);
    if (ip.length === 0) {
        denim.I2I = denim.I2B = [];
        denim.I2E = [line];
        denim.E2I = [box];
    }
    else if (ip.length === 1) {
        denim.I2I = [];
        denim.I2B = ip;
        /* I2E are two rays from intersection point */
        // let ray0 = ray(ip[0], line.norm.invert());
        // let ray1 = ray(ip[1], line.norm);
        // denim.I2E = [ray0, ray1];
        denim.I2E = multiline([line]).split(ip).toShapes();
        denim.E2I = [box];
    }
    else {                     // ip.length == 2
        sortPointsOnLine(line, ip);

        // split line to array of [ray,segment,ray]
        let splitShapes = multiline([line]).split(ip).toShapes();

        /* Are two intersection points on the same segment of the box boundary ? */
        if (box.toSegments().any( (segment) => segment.contains(ip[0]) && segment.contains(ip[1]) )) {
            denim.I2I = [];                         // case of touching
            denim.I2B = [segment(ip[0], ip[1])];

            denim.E2I = [box];
        }
        else {                                       // case of intersection
            denim.I2I = [splitShapes[1]];     // [segment(ip[0], ip[1])];
            denim.I2B = ip;

            // Intersection between exterior of the line and interior of the box is array of two polygons

            // Create polygon from the box
            let poly = polygon(box.toSegments());

            // Cut polygon with segment between two points
            let [face0, face1] = poly.cutFace(ip[0], ip[1]);

            // Create two polygons from two faces
            denim.E2I = [face0.toPolygon(), face1.toPolygon()];
        }

        // let ray0 = ray(ip[0], line.norm.invert());
        // let ray1 = ray(ip[1], line.norm);
        // denim.I2E = [ray0, ray1];
        denim.I2E = [splitShapes[0], splitShapes[2]];
    }
    return denim;
}

export function relateLine2Polygon(line, polygon) {
    let denim = new DE9IM();
    let ip = intersectLine2Polygon(line, polygon);

    if (ip.length === 0) {
        denim.I2I = denim.I2B = [];
        denim.I2E = [line];
        denim.E2I = [polygon];
    }
    else {
        let multiline = new Multiline([line]);
        multiline.split(ip);
        for (let edge of multiline) {
            edge.setInclusion(polygon);
        }
        let edges = multiline.toArray();
        denim.I2I = edges.filter(edge => edge.bv === Flatten.INSIDE).map(edge => edge.shape);
        denim.I2B = [];
        for (let edge of edges) {
            if (edge.bv === Flatten.BOUNDARY) {
                denim.I2B.push(edge.shape)
            }
            else {
                denim.I2B.push(edge.shape.start);
                denim.I2B.push(edge.shape.end);
            }
        }
        denim.I2E = edges.filter(edge => edge.bv === Flatten.OUTSIDE).map(edge => edge.shape);

        denim.E2I = [];
        for (let edge of denim.I2I) {
            let [face1, face2] = polygon.cutFace(edge.shape.start, edge.shape.end);
            denim.E2I.push(face1);
            denim.E2I.push(face2);
        }
    }
    return denim;
}

/**
 * Sort given array of points that lay on line with respect to coordinate on a line
 * The method assumes that points lay on the line and does not check this
 * @param {Point[]} pointsArray
 */
function sortPointsOnLine(line, pointsArray) {
    pointsArray.sort( (pt1, pt2) => {
        if (line.coord(pt1) < line.coord(pt2)) {
            return -1;
        }
        if (line.coord(pt1) > line.coord(pt2)) {
            return 1;
        }
        return 0;
    })
}