/**
 * Created by Alex Bol on 3/10/2017.
 */


"use strict";
import Flatten from '../flatten';
import * as Intersection from '../algorithms/intersection';

/**
 * Class representing a segment
 * @type {Segment}
 */
export class Segment {
    /**
     *
     * @param {Point} ps - start point
     * @param {Point} pe - end point
     */
    constructor(...args) {
        /**
         * Start point
         * @type {Point}
         */
        this.ps = new Flatten.Point();
        /**
         * End Point
         * @type {Point}
         */
        this.pe = new Flatten.Point();

        if (args.length === 0) {
            return;
        }

        if (args.length === 1 && args[0] instanceof Array && args[0].length === 4) {
            let coords = args[0];
            this.ps = new Flatten.Point(coords[0], coords[1]);
            this.pe = new Flatten.Point(coords[2], coords[3]);
            return;
        }

        if (args.length === 1 && args[0] instanceof Object && args[0].name === "segment") {
            let {ps, pe} = args[0];
            this.ps = new Flatten.Point(ps.x, ps.y);
            this.pe = new Flatten.Point(pe.x, pe.y);
            return;
        }

        // second point omitted issue #84
        if (args.length === 1 && args[0] instanceof Flatten.Point) {
            this.ps = args[0].clone();
            return;
        }

        if (args.length === 2 && args[0] instanceof Flatten.Point && args[1] instanceof Flatten.Point) {
            this.ps = args[0].clone();
            this.pe = args[1].clone();
            return;
        }

        if (args.length === 4) {
            this.ps = new Flatten.Point(args[0], args[1]);
            this.pe = new Flatten.Point(args[2], args[3]);
            return;
        }

        throw Flatten.Errors.ILLEGAL_PARAMETERS;
    }

    /**
     * Return new cloned instance of segment
     * @returns {Segment}
     */
    clone() {
        return new Flatten.Segment(this.start, this.end);
    }

    /**
     * Start point
     * @returns {Point}
     */
    get start() {
        return this.ps;
    }

    /**
     * End point
     * @returns {Point}
     */
    get end() {
        return this.pe;
    }


    /**
     * Returns array of start and end point
     * @returns [Point,Point]
     */
    get vertices() {
        return [this.ps.clone(), this.pe.clone()];
    }

    /**
     * Length of a segment
     * @returns {number}
     */
    get length() {
        return this.start.distanceTo(this.end)[0];
    }

    /**
     * Slope of the line - angle to axe x in radians from 0 to 2PI
     * @returns {number}
     */
    get slope() {
        let vec = new Flatten.Vector(this.start, this.end);
        return vec.slope;
    }

    /**
     * Bounding box
     * @returns {Box}
     */
    get box() {
        return new Flatten.Box(
            Math.min(this.start.x, this.end.x),
            Math.min(this.start.y, this.end.y),
            Math.max(this.start.x, this.end.x),
            Math.max(this.start.y, this.end.y)
        )
    }

    /**
     * Returns true if equals to query segment, false otherwise
     * @param {Seg} seg - query segment
     * @returns {boolean}
     */
    equalTo(seg) {
        return this.ps.equalTo(seg.ps) && this.pe.equalTo(seg.pe);
    }

    /**
     * Returns true if segment contains point
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    contains(pt) {
        return Flatten.Utils.EQ_0(this.distanceToPoint(pt));
    }

    /**
     * Returns array of intersection points between segment and other shape
     * @param {Shape} shape - Shape of the one of supported types <br/>
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof Flatten.Point) {
            return this.contains(shape) ? [shape] : [];
        }

        if (shape instanceof Flatten.Line) {
            return Intersection.intersectSegment2Line(this, shape);
        }

        if (shape instanceof Flatten.Segment) {
            return  Intersection.intersectSegment2Segment(this, shape);
        }

        if (shape instanceof Flatten.Circle) {
            return Intersection.intersectSegment2Circle(this, shape);
        }

        if (shape instanceof Flatten.Box) {
            return Intersection.intersectSegment2Box(this, shape);
        }

        if (shape instanceof Flatten.Arc) {
            return Intersection.intersectSegment2Arc(this, shape);
        }

        if (shape instanceof Flatten.Polygon) {
            return  Intersection.intersectSegment2Polygon(this, shape);
        }
    }

    /**
     * Calculate distance and shortest segment from segment to shape and return as array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from segment to shape
     * @returns {Segment} shortest segment between segment and shape (started at segment, ended at shape)
     */
    distanceTo(shape) {
        if (shape instanceof Flatten.Point) {
            let [dist, shortest_segment] = Flatten.Distance.point2segment(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Circle) {
            let [dist, shortest_segment] = Flatten.Distance.segment2circle(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Line) {
            let [dist, shortest_segment] = Flatten.Distance.segment2line(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Segment) {
            let [dist, shortest_segment] = Flatten.Distance.segment2segment(this, shape);
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Arc) {
            let [dist, shortest_segment] = Flatten.Distance.segment2arc(this, shape);
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
    }

    /**
     * Returns unit vector in the direction from start to end
     * @returns {Vector}
     */
    tangentInStart() {
        let vec = new Flatten.Vector(this.start, this.end);
        return vec.normalize();
    }

    /**
     * Return unit vector in the direction from end to start
     * @returns {Vector}
     */
    tangentInEnd() {
        let vec = new Flatten.Vector(this.end, this.start);
        return vec.normalize();
    }

    /**
     * Returns new segment with swapped start and end points
     * @returns {Segment}
     */
    reverse() {
        return new Segment(this.end, this.start);
    }

    /**
     * When point belongs to segment, return array of two segments split by given point,
     * if point is inside segment. Returns clone of this segment if query point is incident
     * to start or end point of the segment. Returns empty array if point does not belong to segment
     * @param {Point} pt Query point
     * @returns {Segment[]}
     */
    split(pt) {
        if (this.start.equalTo(pt))
            return [null, this.clone()];

        if (this.end.equalTo(pt))
            return [this.clone(), null];

        return [
            new Flatten.Segment(this.start, pt),
            new Flatten.Segment(pt, this.end)
        ]
    }

    /**
     * Return middle point of the segment
     * @returns {Point}
     */
    middle() {
        return new Flatten.Point((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2);
    }

    /**
     * Get point at given length
     * @param {number} length - The length along the segment
     * @returns {Point}
     */
    pointAtLength(length) {
        if (length > this.length || length < 0) return null;
        if (length == 0) return this.start;
        if (length == this.length) return this.end;
        let factor = length / this.length;
        return new Flatten.Point(
            (this.end.x - this.start.x) * factor + this.start.x,
            (this.end.y - this.start.y) * factor + this.start.y
        );
    }

    distanceToPoint(pt) {
        let [dist, ...rest] = Flatten.Distance.point2segment(pt, this);
        return dist;
    };

    definiteIntegral(ymin = 0.0) {
        let dx = this.end.x - this.start.x;
        let dy1 = this.start.y - ymin;
        let dy2 = this.end.y - ymin;
        return (dx * (dy1 + dy2) / 2);
    }

    /**
     * Returns new segment translated by vector vec
     * @param {Vector} vec
     * @returns {Segment}
     */
    translate(...args) {
        return new Segment(this.ps.translate(...args), this.pe.translate(...args));
    }

    /**
     * Return new segment rotated by given angle around given point
     * If point omitted, rotate around origin (0,0)
     * Positive value of angle defines rotation counter clockwise, negative - clockwise
     * @param {number} angle - rotation angle in radians
     * @param {Point} center - center point, default is (0,0)
     * @returns {Segment}
     */
    rotate(angle = 0, center = new Flatten.Point()) {
        let m = new Flatten.Matrix();
        m = m.translate(center.x, center.y).rotate(angle).translate(-center.x, -center.y);
        return this.transform(m);
    }

    /**
     * Return new segment transformed using affine transformation matrix
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Segment} - transformed segment
     */
    transform(matrix = new Flatten.Matrix()) {
        return new Segment(this.ps.transform(matrix), this.pe.transform(matrix))
    }

    /**
     * Returns true if segment start is equal to segment end up to DP_TOL
     * @returns {boolean}
     */
    isZeroLength() {
        return this.ps.equalTo(this.pe)
    }

    /**
     * Sort given array of points from segment start to end, assuming all points lay on the segment
     * @param {Point[]} - array of points
     * @returns {Point[]} new array sorted
     */
    sortPoints(pts) {
        let line = new Flatten.Line(this.start, this.end);
        return line.sortPoints(pts);
    }

    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON() {
        return Object.assign({}, this, {name: "segment"});
    }

    /**
     * Return string to draw segment in svg
     * @param {Object} attrs - an object with attributes for svg path element,
     * like "stroke", "strokeWidth" <br/>
     * Defaults are stroke:"black", strokeWidth:"1"
     * @returns {string}
     */
    svg(attrs = {}) {
        let {stroke, strokeWidth, id, className} = attrs;
        // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
        let id_str = (id && id.length > 0) ? `id="${id}"` : "";
        let class_str = (className && className.length > 0) ? `class="${className}"` : "";

        return `\n<line x1="${this.start.x}" y1="${this.start.y}" x2="${this.end.x}" y2="${this.end.y}" stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" ${id_str} ${class_str} />`;

    }

};

Flatten.Segment = Segment;
/**
 * Shortcut method to create new segment
 */
export const segment = (...args) => new Flatten.Segment(...args);
Flatten.segment = segment
