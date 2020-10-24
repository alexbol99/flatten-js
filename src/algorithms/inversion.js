/**
 * Created by Alex Bol on 3/7/2017.
 */
"use strict";

import {EQ, EQ_0} from '../utils/utils';

import {Line} from '../classes/line'
import {Circle} from '../classes/circle'
import {Vector} from '../classes/vector'
import {Point} from '../classes/point'

/**
 * Inversion is a transformation of the Euclidean plane that maps generalized circles
 * (where line is considered as a circle with infinite radius) into generalized circles
 * See also https://en.wikipedia.org/wiki/Inversive_geometry and
 * http://mathworld.wolfram.com/Inversion.html <br/>
 * Inversion also may be considered as a reflection of the point in the plane with respect
 * to inversion circle so that R^2 = OP * OP',
 * where <br/>
 * O - center of inversion circle <br/>
 * R - radius of inversion circle <br/>
 * P - point of plane <br/>
 * P' - inversion of the point P
 *
 * @param {Line | Circle} shape - shape to be transformed
 * @param {Circle} inversion_circle - inversion circle
 * @returns {Line | Circle} - result of transformation
 */
export function inverse(shape, inversion_circle) {
    let dist, shortest_segment;
    let dx, dy;
    let s;
    let v;
    let r;
    let d;
    let pt;

    if (shape instanceof Line) {
        [dist, shortest_segment] = inversion_circle.pc.distanceTo(shape);
        if (EQ_0(dist)) {            // Line passing through inversion center, is mapping to itself
            return shape.clone();
        } else {                           // Line not passing through inversion center is mapping into circle
            r = inversion_circle.r * inversion_circle.r / (2 * dist);
            v = new Vector(inversion_circle.pc, shortest_segment.end);
            v = v.multiply(r / dist);
            return new Circle(inversion_circle.pc.translate(v), r);
        }
    } else if (shape instanceof Circle) {
        [dist, shortest_segment] = inversion_circle.pc.distanceTo(shape.pc);
        if (EQ(dist, shape.r)) {     // Circle passing through inversion center mapped into line
            d = inversion_circle.r * inversion_circle.r / (2 * shape.r);
            v = new Vector(shape.pc, inversion_circle.pc);
            v = v.normalize();
            pt = inversion_circle.pc.translate(v.multiply(d));
            return new Line(pt, v);
        } else {                           // Circle not passing through inversion center - map into another circle */
            /* Taken from http://mathworld.wolfram.com */

            dx = shape.pc.x - inversion_circle.pc.x;
            dy = shape.pc.y - inversion_circle.pc.y;

            s = inversion_circle.r * inversion_circle.r / (dx * dx + dy * dy - shape.r * shape.r);

            let pc = new Point(inversion_circle.pc.x + s * dx, inversion_circle.pc.y + s * dy);

            return new Circle(pc, Math.abs(s) * shape.r);
        }
    }
};
