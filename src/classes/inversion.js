"use strict";

import Flatten  from '../flatten';
const {Circle, Line, Point, Vector, Utils} = Flatten;
/**
 * Class Inversion represent operator of inversion in circle
 * Inversion is a transformation of the Euclidean plane that maps generalized circles
 * (where line is considered as a circle with infinite radius) into generalized circles
 * See also https://en.wikipedia.org/wiki/Inversive_geometry and
 * http://mathworld.wolfram.com/Inversion.html <br/>
 * @type {Inversion}
 */
export class Inversion {
    /**
     * Inversion constructor
     * @param {Circle} inversion_circle inversion circle
     */
    constructor(inversion_circle) {
        this.circle = inversion_circle;
    }


    get inversion_circle() {
        return this.circle;
    }

    static inversePoint(inversion_circle, point) {
        const v = new Vector(inversion_circle.pc, point);
        const k2 = inversion_circle.r * inversion_circle.r;
        const len2 = v.dot(v);
        const reflected_point = Utils.EQ_0(len2) ?
            new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY) :
            inversion_circle.pc.translate(v.multiply(k2 / len2));
        return reflected_point;
    }

    static inverseCircle(inversion_circle, circle) {
        const dist = inversion_circle.pc.distanceTo(circle.pc)[0];
        if (Utils.EQ(dist, circle.r)) {     // Circle passing through inversion center mapped into line
            let d = (inversion_circle.r * inversion_circle.r) / (2 * circle.r);
            let v = new Vector(inversion_circle.pc, circle.pc);
            v = v.normalize();
            let pt = inversion_circle.pc.translate(v.multiply(d));

            return new Line(pt, v);
        } else {                           // Circle not passing through inversion center - map into another circle */
            /* Taken from http://mathworld.wolfram.com */
            let v = new Vector(inversion_circle.pc, circle.pc);
            let s = inversion_circle.r * inversion_circle.r / (v.dot(v) - circle.r * circle.r);
            let pc = inversion_circle.pc.translate(v.multiply(s));
            let r = Math.abs(s) * circle.r;

            return new Circle(pc, r);
        }
    }

    static inverseLine(inversion_circle, line) {
        const [dist, shortest_segment] = inversion_circle.pc.distanceTo(line);
        if (Utils.EQ_0(dist)) {            // Line passing through inversion center, is mapping to itself
            return line.clone();
        } else {                           // Line not passing through inversion center is mapping into circle
            let r = inversion_circle.r * inversion_circle.r / (2 * dist);
            let v = new Vector(inversion_circle.pc, shortest_segment.end);
            v = v.multiply(r / dist);
            return new Circle(inversion_circle.pc.translate(v), r);
        }
    }

    inverse(shape) {
        if (shape instanceof Point) {
            return Inversion.inversePoint(this.circle, shape);
        }
        else if (shape instanceof Circle) {
            return Inversion.inverseCircle(this.circle, shape);
        }
        else if (shape instanceof Line) {
            return Inversion.inverseLine(this.circle, shape);
        }
    }
};

Flatten.Inversion = Inversion;

/**
 * Shortcut to create inversion operator
 * @param circle
 * @returns {Inversion}
 */
export const inversion = (circle) => new Flatten.Inversion(circle);
Flatten.inversion = inversion;
