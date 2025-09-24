/**
 * Created by Alex Bol on 3/10/2017.
 */

"use strict";
import Flatten from '../flatten';
import * as Intersection from '../algorithms/intersection';
import {convertToString} from "../utils/attributes";
import {Shape} from "./shape";

/**
 * Class representing a circular arc
 * @type {Arc}
 */
export class Arc extends Shape {
    /**
     *
     * @param {Point} pc - arc center
     * @param {number} r - arc radius
     * @param {number} startAngle - start angle in radians from 0 to 2*PI
     * @param {number} endAngle - end angle in radians from 0 to 2*PI
     * @param {boolean} counterClockwise - arc direction, true - clockwise, false - counterclockwise
     */
    constructor(...args) {
        super()
        /**
         * Arc center
         * @type {Point}
         */
        this.pc = new Flatten.Point();
        /**
         * Arc radius
         * @type {number}
         */
        this.r = 1;
        /**
         * Arc start angle in radians
         * @type {number}
         */
        this.startAngle = 0;
        /**
         * Arc end angle in radians
         * @type {number}
         */
        this.endAngle = 2 * Math.PI;
        /**
         * Arc orientation
         * @type {boolean}
         */
        this.counterClockwise = true;

        if (args.length === 0)
            return;

        if (args.length === 1 && args[0] instanceof Object && args[0].name === "arc") {
            let {pc, r, startAngle, endAngle, counterClockwise} = args[0];
            this.pc = new Flatten.Point(pc.x, pc.y);
            this.r = r;
            this.startAngle = startAngle;
            this.endAngle = endAngle;
            this.counterClockwise = counterClockwise;
        } else {
            let [pc, r, startAngle, endAngle, counterClockwise] = [...args];
            if (pc && pc instanceof Flatten.Point) this.pc = pc.clone();
            if (r !== undefined) this.r = r;
            if (startAngle !== undefined) this.startAngle = startAngle;
            if (endAngle !== undefined) this.endAngle = endAngle;
            if (counterClockwise !== undefined) this.counterClockwise = counterClockwise;
        }

        // throw Flatten.Errors.ILLEGAL_PARAMETERS; unreachable code
    }

    /**
     * Return new cloned instance of arc
     * @returns {Arc}
     */
    clone() {
        return new Flatten.Arc(this.pc.clone(), this.r, this.startAngle, this.endAngle, this.counterClockwise);
    }

    /**
     * Get sweep angle in radians. Sweep angle is non-negative number from 0 to 2*PI
     * @returns {number}
     */
    // get sweep() {
    //     if (Flatten.Utils.EQ(this.startAngle, this.endAngle))
    //         return 0.0;
    //     if (Flatten.Utils.EQ(Math.abs(this.startAngle - this.endAngle), Flatten.PIx2)) {
    //         return Flatten.PIx2;
    //     }
    //     let sweep;
    //     if (this.counterClockwise) {
    //         sweep = Flatten.Utils.GT(this.endAngle, this.startAngle) ?
    //             this.endAngle - this.startAngle : this.endAngle - this.startAngle + Flatten.PIx2;
    //     } else {
    //         sweep = Flatten.Utils.GT(this.startAngle, this.endAngle) ?
    //             this.startAngle - this.endAngle : this.startAngle - this.endAngle + Flatten.PIx2;
    //     }
    //
    //     if (Flatten.Utils.GT(sweep, Flatten.PIx2)) {
    //         sweep -= Flatten.PIx2;
    //     }
    //     if (Flatten.Utils.LT(sweep, 0)) {
    //         sweep += Flatten.PIx2;
    //     }
    //     return sweep;
    // }

    get sweep() {
        let startAngle = this.startAngle;
        let endAngle = this.endAngle;
        let sweep;

        // check full circle before normalizing angles
        if (Flatten.Utils.EQ(Math.abs(startAngle - endAngle), Flatten.PIx2)) {
            sweep = Flatten.PIx2;
            endAngle = startAngle;
        }

        // normalize angles
        if (Math.abs(startAngle) > Flatten.PIx2) {
            startAngle -= Math.trunc(startAngle / Flatten.PIx2) * Flatten.PIx2;
        }
        if (startAngle < 0) {
            startAngle += Flatten.PIx2;
        }
        if (Math.abs(endAngle) > Flatten.PIx2) {
            endAngle -= Math.trunc(endAngle / Flatten.PIx2) * Flatten.PIx2;
        }
        if (endAngle < 0) {
            endAngle += Flatten.PIx2;
        }

        // calculate sweep if it isn't a full circle
        if (sweep === undefined) {
            sweep = this.counterClockwise ? endAngle - startAngle : startAngle - endAngle;
            if (sweep < 0) {
                sweep += Flatten.PIx2;
            }
        }
        return sweep
    }

    /**
     * Get start point of arc
     * @returns {Point}
     */
    get start() {
        let p0 = new Flatten.Point(this.pc.x + this.r, this.pc.y);
        return p0.rotate(this.startAngle, this.pc);
    }

    /**
     * Get end point of arc
     * @returns {Point}
     */
    get end() {
        let p0 = new Flatten.Point(this.pc.x + this.r, this.pc.y);
        return p0.rotate(this.endAngle, this.pc);
    }

    /**
     * Get center of arc
     * @returns {Point}
     */
    get center() {
        return this.pc.clone();
    }

    get vertices() {
        return [this.start.clone(), this.end.clone()];
    }

    /**
     * Get arc length
     * @returns {number}
     */
    get length() {
        return Math.abs(this.sweep * this.r);
    }

    /**
     * Get bounding box of the arc
     * @returns {Box}
     */
    get box() {
        let func_arcs = this.breakToFunctional();
        let box = func_arcs.reduce((acc, arc) => acc.merge(arc.start.box), new Flatten.Box());
        box = box.merge(this.end.box);
        return box;
    }

    /**
     * Returns true if arc contains point, false otherwise
     * @param {Point} pt - point to test
     * @returns {boolean}
     */
    contains(pt) {
        // first check if  point on circle (pc,r)
        if (!Flatten.Utils.EQ(this.pc.distanceTo(pt)[0], this.r))
            return false;

        // point on circle

        if (pt.equalTo(this.start))
            return true;

        let angle = new Flatten.Vector(this.pc, pt).slope;
        let test_arc = new Flatten.Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise);
        return Flatten.Utils.LE(test_arc.length, this.length);
    }

    /**
     * When given point belongs to arc, return array of two arcs split by this point. If points is incident
     * to start or end point of the arc, return clone of the arc. If point does not belong to the arcs, return
     * empty array.
     * @param {Point} pt Query point
     * @returns {Arc[]}
     */
    split(pt) {
        if (this.start.equalTo(pt))
            return [null, this.clone()];

        if (this.end.equalTo(pt))
            return [this.clone(), null];

        let angle = new Flatten.Vector(this.pc, pt).slope;

        return [
            new Flatten.Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise),
            new Flatten.Arc(this.pc, this.r, angle, this.endAngle, this.counterClockwise)
        ]
    }

    /**
     * Return middle point of the arc
     * @returns {Point}
     */
    middle() {
        let endAngle = this.counterClockwise ? this.startAngle + this.sweep / 2 : this.startAngle - this.sweep / 2;
        let arc = new Flatten.Arc(this.pc, this.r, this.startAngle, endAngle, this.counterClockwise);
        return arc.end;
    }

    /**
     * Get point at given length
     * @param {number} length - The length along the arc
     * @returns {Point}
     */
    pointAtLength(length) {
        if (length > this.length || length < 0) return null;
        if (length === 0) return this.start;
        if (length === this.length) return this.end;
        let factor = length / this.length;
        let endAngle = this.counterClockwise ? this.startAngle + this.sweep * factor : this.startAngle - this.sweep * factor;
        let arc = new Flatten.Arc(this.pc, this.r, this.startAngle, endAngle, this.counterClockwise);
        return arc.end;
    }

    /**
     * Returns chord height ("sagitta") of the arc
     * @returns {number}
     */
    chordHeight() {
        return (1.0 - Math.cos(Math.abs(this.sweep / 2.0))) * this.r;
    }

    /**
     * Returns array of intersection points between arc and other shape
     * @param {Shape} shape Shape of the one of supported types <br/>
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof Flatten.Point) {
            return this.contains(shape) ? [shape] : [];
        }
        if (shape instanceof Flatten.Line) {
            return Intersection.intersectLine2Arc(shape, this);
        }
        if (shape instanceof Flatten.Ray) {
            return Intersection.intersectRay2Arc(shape, this);
        }
        if (shape instanceof Flatten.Circle) {
            return Intersection.intersectArc2Circle(this, shape);
        }
        if (shape instanceof Flatten.Segment) {
            return Intersection.intersectSegment2Arc(shape, this);
        }
        if (shape instanceof Flatten.Box) {
            return Intersection.intersectArc2Box(this, shape);
        }
        if (shape instanceof Flatten.Arc) {
            return Intersection.intersectArc2Arc(this, shape);
        }
        if (shape instanceof Flatten.Polygon) {
            return Intersection.intersectArc2Polygon(this, shape);
        }
        if (shape instanceof Flatten.Multiline) {
            return Intersection.intersectShape2Multiline(this, shape);
        }
    }

    /**
     * Calculate distance and shortest segment from arc to shape and return array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from arc to shape
     * @returns {Segment} shortest segment between arc and shape (started at arc, ended at shape)

     */
    distanceTo(shape) {
        if (shape instanceof Flatten.Point) {
            let [dist, shortest_segment] = Flatten.Distance.point2arc(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Circle) {
            let [dist, shortest_segment] = Flatten.Distance.arc2circle(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Line) {
            let [dist, shortest_segment] = Flatten.Distance.arc2line(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Segment) {
            let [dist, shortest_segment] = Flatten.Distance.segment2arc(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Arc) {
            let [dist, shortest_segment] = Flatten.Distance.arc2arc(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Polygon) {
            let [dist, shortest_segment] = Flatten.Distance.shape2polygon(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.PlanarSet) {
            let [dist, shortest_segment] = Flatten.Distance.shape2planarSet(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Multiline) {
           return Flatten.Distance.shape2multiline(this, shape);
        }
    }

    /**
     * Breaks arc in extreme point 0, pi/2, pi, 3*pi/2 and returns array of sub-arcs
     * @returns {Arc[]}
     */
    breakToFunctional() {
        let func_arcs_array = [];
        let angles = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
        let startAngle = this.startAngle;
        let endAngle = this.endAngle;

        // check full circle before normalizing angles
        if (Flatten.Utils.EQ(Math.abs(startAngle - endAngle), Flatten.PIx2)) {
            endAngle = startAngle;
        }

        // normalize angles
        if (Math.abs(startAngle) > Flatten.PIx2) {
            startAngle -= Math.trunc(startAngle / Flatten.PIx2) * Flatten.PIx2;
        }
        if (startAngle < 0) {
            startAngle += Flatten.PIx2;
        }
        if (Math.abs(endAngle) > Flatten.PIx2) {
            endAngle -= Math.trunc(endAngle / Flatten.PIx2) * Flatten.PIx2;
        }
        if (endAngle < 0) {
            endAngle += Flatten.PIx2;
        }

        // set up the loop
        let prev = startAngle;
        let next;
        let firstj;
        let d;
        if (this.counterClockwise) {
            firstj = Math.ceil(startAngle / (Math.PI / 2)) % 4;
            d = 1;
        } else {
            firstj = Math.floor(startAngle / (Math.PI / 2)) % 4;
            d = -1;
        }

        // loop over crossings while incremental sweep is less than sweep
        for (let i = 0, j = firstj; i < 4; i++, j = (j + d + 4) % 4) {
            next = angles[j];
            if (next === prev) {
                continue;
            }
            let incrementalSweep = this.counterClockwise ? next - startAngle : startAngle - next;
            if (incrementalSweep < 0) {
                incrementalSweep += Flatten.PIx2;
            }
            if (incrementalSweep > this.sweep) {
                break;
            }
            func_arcs_array.push(new Flatten.Arc(this.pc, this.r, prev, next, this.counterClockwise));
            prev = next;
        }

        // return the original arc for no crossings
        if (func_arcs_array.length === 0) {
            func_arcs_array.push(this);
            return func_arcs_array;
        }

        // add the last arc
        next = endAngle;
        if (prev !== next) {
            func_arcs_array.push(new Flatten.Arc(this.pc, this.r, prev, next, this.counterClockwise));
        }

        return func_arcs_array;
    }

    /**
     * Return tangent unit vector in the start point in the direction from start to end
     * @returns {Vector}
     */
    tangentInStart() {
        let vec = new Flatten.Vector(this.pc, this.start);
        let angle = this.counterClockwise ? Math.PI / 2. : -Math.PI / 2.;
        return vec.rotate(angle).normalize();
    }

    /**
     * Return tangent unit vector in the end point in the direction from end to start
     * @returns {Vector}
     */
    tangentInEnd() {
        let vec = new Flatten.Vector(this.pc, this.end);
        let angle = this.counterClockwise ? -Math.PI / 2. : Math.PI / 2.;
        return vec.rotate(angle).normalize();
    }

    /**
     * Returns new arc with swapped start and end angles and reversed direction
     * @returns {Arc}
     */
    reverse() {
        return new Flatten.Arc(this.pc, this.r, this.endAngle, this.startAngle, !this.counterClockwise);
    }

    /**
     * Return new arc transformed using affine transformation matrix <br/>
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Arc}
     */
    transform(matrix = new Flatten.Matrix()) {
        let newStart = this.start.transform(matrix);
        let newEnd = this.end.transform(matrix);
        let newCenter = this.pc.transform(matrix);
        let newDirection = this.counterClockwise;
        if (matrix.a * matrix.d < 0) {
          newDirection = !newDirection;
        }
        return Flatten.Arc.arcSE(newCenter, newStart, newEnd, newDirection);
    }

    static arcSE(center, start, end, counterClockwise) {
        let {vector} = Flatten;
        let startAngle = vector(center, start).slope;
        let endAngle = vector(center, end).slope;
        if (Flatten.Utils.EQ(startAngle, endAngle)) {
            endAngle += 2 * Math.PI;
            counterClockwise = true;
        }
        let r = vector(center, start).length;

        return new Flatten.Arc(center, r, startAngle, endAngle, counterClockwise);
    }

    definiteIntegral(ymin = 0) {
        let f_arcs = this.breakToFunctional();
        let area = f_arcs.reduce((acc, arc) => acc + arc.circularSegmentDefiniteIntegral(ymin), 0.0);
        return area;
    }

    circularSegmentDefiniteIntegral(ymin) {
        let segment = new Flatten.Segment(this.start, this.end);
        let areaTrapez = segment.definiteIntegral(ymin);
        // can't be full circle after breakToFunctional, consider zero-arc
        let areaCircularSegment = Flatten.Utils.EQ(this.sweep, Flatten.PIx2)
            ? 0 : this.circularSegmentArea();
        return this.counterClockwise ? areaTrapez - areaCircularSegment : areaTrapez + areaCircularSegment;
    }

    circularSegmentArea() {
        return (0.5 * this.r * this.r * (this.sweep - Math.sin(this.sweep)))
    }

    /**
     * Sort given array of points from arc start to end, assuming all points lay on the arc
     * @param {Point[]} pts array of points
     * @returns {Point[]} new array sorted
     */
    sortPoints(pts) {
        let {vector} = Flatten;
        return pts.slice().sort( (pt1, pt2) => {
            let slope1 = vector(this.pc, pt1).slope;
            let slope2 = vector(this.pc, pt2).slope;
            if (slope1 < slope2) {
                return -1;
            }
            if (slope1 > slope2) {
                return 1;
            }
            return 0;
        })
    }

    get name() {
        return "arc"
    }

    /**
     * Return string to draw arc in svg
     * @param {Object} attrs - an object with attributes of svg path element
     * @returns {string}
     */
    svg(attrs = {}) {
        let largeArcFlag = this.sweep <= Math.PI ? "0" : "1";
        let sweepFlag = this.counterClockwise ? "1" : "0";

        if (Flatten.Utils.EQ(this.sweep, 2 * Math.PI)) {
            let circle = new Flatten.Circle(this.pc, this.r);
            return circle.svg(attrs);
        } else {
            return `\n<path d="M${this.start.x},${this.start.y}
                             A${this.r},${this.r} 0 ${largeArcFlag},${sweepFlag} ${this.end.x},${this.end.y}"
                    ${convertToString({fill: "none", ...attrs})} />`
        }
    }

}

Flatten.Arc = Arc;
/**
 * Function to create arc equivalent to "new" constructor
 * @param args
 */
export const arc = (...args) => new Flatten.Arc(...args);
Flatten.arc = arc;
