/**
 * Created by Alex Bol on 3/6/2017.
 */

"use strict";

import Flatten from '../flatten';


let {Arc, vector} = Flatten;

/**
 * Class representing a circle
 * @type {Circle}
 */
class Circle {
    /**
     *
     * @param {Point} pc - circle center point
     * @param {number} r - circle radius
     */
    constructor(...args) {
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
     * Method clone returns new instance of a Circle
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
     * Return true if circle contains point
     * @param {Point} pt - test point
     * @returns {boolean}
     */
    contains(pt) {
        return Flatten.Utils.LE(pt.distanceTo(this.center)[0], this.r);
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
     * Returns array of intersection points between circle and other shape
     * @param {Shape} shape Shape of the one of supported types
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof Flatten.Point) {
            return this.contains(shape) ? [shape] : [];
        }
        if (shape instanceof Flatten.Line) {
            return shape.intersect(this);
        }

        if (shape instanceof Flatten.Segment) {
            return shape.intersect(this);
        }

        if (shape instanceof Flatten.Circle) {
            return Circle.intersectCirle2Circle(this, shape);
        }

        if (shape instanceof Flatten.Arc) {
            return shape.intersect(this);
        }
        if (shape instanceof Flatten.Polygon) {
            return Flatten.Polygon.intersectShape2Polygon(this, shape);
        }
    }

    /**
     * Calculate distance and shortest segment from circle to shape and return array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from circle to shape
     * @returns {Segment} shortest segment between circle and shape (started at circle, ended at shape)

     */
    distanceTo(shape) {
        let {Distance} = Flatten;
        let {point2circle, circle2circle, circle2line, segment2circle, arc2circle} = Distance;

        if (shape instanceof Flatten.Point) {
            let [distance, shortest_segment] = point2circle(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.Circle) {
            let [distance, shortest_segment] = circle2circle(this, shape);
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.Line) {
            let [distance, shortest_segment] = circle2line(this, shape);
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.Segment) {
            let [distance, shortest_segment] = segment2circle(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.Arc) {
            let [distance, shortest_segment] = arc2circle(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.Polygon) {
            let [distance, shortest_segment] = Distance.shape2polygon(this, shape);
            return [distance, shortest_segment];
        }

        if (shape instanceof Flatten.PlanarSet) {
            let [dist, shortest_segment] = Distance.shape2planarSet(this, shape);
            return [dist, shortest_segment];
        }
    }

    static intersectCirle2Circle(circle1, circle2) {
        let ip = [];

        if (circle1.box.not_intersect(circle2.box)) {
            return ip;
        }

        let vec = new Flatten.Vector(circle1.pc, circle2.pc);

        let r1 = circle1.r;
        let r2 = circle2.r;

        // Degenerated circle
        if (Flatten.Utils.EQ_0(r1) || Flatten.Utils.EQ_0(r2))
            return ip;

        // In case of equal circles return one leftmost point
        if (Flatten.Utils.EQ_0(vec.x) && Flatten.Utils.EQ_0(vec.y) && Flatten.Utils.EQ(r1, r2)) {
            ip.push(circle1.pc.translate(-r1, 0));
            return ip;
        }

        let dist = circle1.pc.distanceTo(circle2.pc)[0];

        if (Flatten.Utils.GT(dist, r1 + r2))               // circles too far, no intersections
            return ip;

        if (Flatten.Utils.LT(dist, Math.abs(r1 - r2)))     // one circle is contained within another, no intersections
            return ip;

        // Normalize vector.
        vec.x /= dist;
        vec.y /= dist;

        let pt;

        // Case of touching from outside or from inside - single intersection point
        // TODO: check this specifically not sure if correct
        if (Flatten.Utils.EQ(dist, r1 + r2) || Flatten.Utils.EQ(dist, Math.abs(r1 - r2))) {
            pt = circle1.pc.translate(r1 * vec.x, r1 * vec.y);
            ip.push(pt);
            return ip;
        }

        // Case of two intersection points

        // Distance from first center to center of common chord:
        //   a = (r1^2 - r2^2 + d^2) / 2d
        // Separate for better accuracy
        let a = (r1 * r1) / (2 * dist) - (r2 * r2) / (2 * dist) + dist / 2;

        let mid_pt = circle1.pc.translate(a * vec.x, a * vec.y);
        let h = Math.sqrt(r1 * r1 - a * a);
        // let norm;

        // norm = vec.rotate90CCW().multiply(h);
        pt = mid_pt.translate(vec.rotate90CCW().multiply(h));
        ip.push(pt);

        // norm = vec.rotate90CW();
        pt = mid_pt.translate(vec.rotate90CW().multiply(h));
        ip.push(pt);

        return ip;
    }

    /**
     * Return string to draw circle in svg
     * @param {Object} attrs - an object with attributes of svg circle element,
     * like "stroke", "strokeWidth", "fill" <br/>
     * Defaults are stroke:"black", strokeWidth:"1", fill:"none"
     * @returns {string}
     */
    svg(attrs = {}) {
        let {stroke, strokeWidth, fill, fillOpacity, id, className} = attrs;
        // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
        let id_str = (id && id.length > 0) ? `id="${id}"` : "";
        let class_str = (className && className.length > 0) ? `class="${className}"` : "";

        return `\n<circle cx="${this.pc.x}" cy="${this.pc.y}" r="${this.r}" stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "none"}" fill-opacity="${fillOpacity || 1.0}" ${id_str} ${class_str} />`;
    }

    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON() {
        return Object.assign({}, this, {name: "circle"});
    }
};

Flatten.Circle = Circle;
/**
 * Shortcut to create new circle
 * @param args
 */
Flatten.circle = (...args) => new Flatten.Circle(...args);
