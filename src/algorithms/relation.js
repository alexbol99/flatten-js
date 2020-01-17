/*
    Calculate relationship between two shapes and return result in the form of
    Dimensionally Extended nine-Intersection Matrix (https://en.wikipedia.org/wiki/DE-9IM)
 */
"use strict";

import Flatten from "../flatten";
import DE9IM from "../data_structures/de9im";
import {intersectLine2Line} from "./intersection";

let {ray} = Flatten;

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
}

export function relateLine2Line(line1, line2) {
    let denim = new DE9IM();
    let ip = intersectLine2Line(line1, line2);
    if (ip.num === 0) {       // parallel or equal ?
        if (line1.contains(line2.pt) && line2.contains(line1.pt)) {
            denim.I2I = [line1];   // equal  'T*F**FFF*'
            denim.I2E = denim.E2I = [];
            denim.B2E = denim.E2B = [];
        }
        else {                     // parallel - disjoint 'FFTFF*T**'
            denim.I2I = denim.I2B = denim.B2I = denim.B2B = [];
            denim.I2E = [line1];
            denim.E2I = [line2];
        }
    }
    else {                       // intersected   'T********'
        denim.I2I = ip;
        denim.I2E = [ray(line1.pt, line1.norm), ray(line1.pt, line1.norm.invert())];
        denim.E2I = [ray(line2.pt, line2.norm), ray(line2.pt, line2.norm.invert())];
    }
    return denim;
}
