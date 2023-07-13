/**
 * Created by Alex Bol on 3/6/2017.
 */

"use strict";

import Flatten from '../flatten';
import * as Intersection from '../algorithms/intersection';
import {convertToString} from "../utils/attributes";
import {Shape} from "./shape";
import {Matrix} from "./matrix";

/**
 * Class representing a circle
 * @type {Circle}
 */
export class Circle extends Shape {
    /**
     *
     * @param {Point} pc - circle center point
     * @param {number} r - circle radius
     */
    constructor(...args) {
        super()
        /**
         * Circle center
         * @type {Point}
         */
        this.pc = new Flatten.Point();
        /**
         * Circle radius
         * @type {number}
         */
        this.r = 1;

        if (args.length == 1 && args[0] instanceof Object && args[0].name === "circle") {
            let {pc, r} = args[0];
            this.pc = new Flatten.Point(pc);
            this.r = r;
            return;
        } else {
            let [pc, r] = [...args];
            if (pc && pc instanceof Flatten.Point) this.pc = pc.clone();
            if (r !== undefined) this.r = r;
            return;
        }

        throw Flatten.Errors.ILLEGAL_PARAMETERS;
    }

    /**
     * Return new cloned instance of circle
     * @returns {Circle}
     */
    clone() {
        return new Flatten.Circle(this.pc.clone(), this.r);
    }

    /**
     * Circle center
     * @returns {Point}
     */
    get center() {
        return this.pc;
    }

    /**
     * Circle bounding box
     * @returns {Box}
     */
    get box() {
        return new Flatten.Box(
            this.pc.x - this.r,
            this.pc.y - this.r,
            this.pc.x + this.r,
            this.pc.y + this.r
        );
    }

    /**
     * Return true if circle contains shape: no point of shape lies outside of the circle
     * @param {Shape} shape - test shape
     * @returns {boolean}
     */
    contains(shape) {
        if (shape instanceof Flatten.Point) {
            return Flatten.Utils.LE(shape.distanceTo(this.center)[0], this.r);
        }

        if (shape instanceof Flatten.Segment) {
            return Flatten.Utils.LE(shape.start.distanceTo(this.center)[0], this.r) &&
                Flatten.Utils.LE(shape.end.distanceTo(this.center)[0], this.r);
        }

        if (shape instanceof Flatten.Arc) {
            return this.intersect(shape).length === 0 &&
                Flatten.Utils.LE(shape.start.distanceTo(this.center)[0], this.r) &&
                Flatten.Utils.LE(shape.end.distanceTo(this.center)[0], this.r);
        }

        if (shape instanceof Flatten.Circle) {
            return this.intersect(shape).length === 0 &&
                Flatten.Utils.LE(shape.r, this.r) &&
                Flatten.Utils.LE(shape.center.distanceTo(this.center)[0], this.r);
        }

        /* TODO: box, polygon */
    }

    /**
     * Transform circle to closed arc
     * @param {boolean} counterclockwise
     * @returns {Arc}
     */
    toArc(counterclockwise = true) {
        return new Flatten.Arc(this.center, this.r, Math.PI, -Math.PI, counterclockwise);
    }

    /**
     * Method scale is supported only for uniform scaling of the circle with (0,0) center
     * @param {number} sx
     * @param {number} sy
     * @returns {Circle}
     */
    scale(sx, sy) {
        if (sx !== sy)
            throw Flatten.Errors.OPERATION_IS_NOT_SUPPORTED
        if (!(this.pc.x === 0.0 && this.pc.y === 0.0))
            throw Flatten.Errors.OPERATION_IS_NOT_SUPPORTED
        return new Flatten.Circle(this.pc, this.r*sx)
    }

    /**
     * Return new circle transformed using affine transformation matrix
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Circle}
     */
    transform(m = new Flatten.Matrix()) {
        return new Flatten.Circle(m.transform([this.pc.x, this.pc.y], this.r))
    }

    /**
     * Returns array of intersection points between circle and other shape
     * @param {Shape} shape Shape of the one of supported types
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof Flatten.Point) {
            return this.contains(shape) ? [shape] : [];
        }
        if (shape instanceof Flatten.Line) {
            return Intersection.intersectLine2Circle(shape, this);
        }

        if (shape instanceof Flatten.Segment) {
            return Intersection.intersectSegment2Circle(shape, this);
        }

        if (shape instanceof Flatten.Circle) {
            return Intersection.intersectCircle2Circle(shape, this);
        }

        if (shape instanceof Flatten.Box) {
            return Intersection.intersectCircle2Box(this, shape);
        }

        if (shape instanceof Flatten.Arc) {
            return Intersection.intersectArc2Circle(shape, this);
        }
        if (shape instanceof Flatten.Polygon) {
            return Intersection.intersectCircle2Polygon(this, shape);
        }
    }

    /**
     * Calculate distance and shortest segment from circle to shape and return array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from circle to shape
     * @returns {Segment} shortest segment between circle and shape (started at circle, ended at shape)

     */
    distanceTo(shape) {
        if (shape instanceof Flatten.Point) {
            let [distance, shortest_segment] = Flatten.Distance.point2circle(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.Circle) {
            let [distance, shortest_segment] = Flatten.Distance.circle2circle(this, shape);
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.Line) {
            let [distance, shortest_segment] = Flatten.Distance.circle2line(this, shape);
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.Segment) {
            let [distance, shortest_segment] = Flatten.Distance.segment2circle(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.Arc) {
            let [distance, shortest_segment] = Flatten.Distance.arc2circle(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.Polygon) {
            let [distance, shortest_segment] = Flatten.Distance.shape2polygon(this, shape);
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.PlanarSet) {
            let [dist, shortest_segment] = Flatten.Distance.shape2planarSet(this, shape);
            return [dist, shortest_segment];
        }
    }

    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON() {
        return Object.assign({}, this, {name: "circle"});
    }

    /**
     * Return string to draw circle in svg
     * @param {Object} attrs - an object with attributes of svg circle element
     * @returns {string}
     */
    svg(attrs = {}) {
        return `\n<circle cx="${this.pc.x}" cy="${this.pc.y}" r="${this.r}"
                ${convertToString({fill: "none", ...attrs})} />`;
    }

}

Flatten.Circle = Circle;
/**
 * Shortcut to create new circle
 * @param args
 */
export const circle = (...args) => new Flatten.Circle(...args);
Flatten.circle = circle;

