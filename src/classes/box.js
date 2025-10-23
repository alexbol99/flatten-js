/**
 * Created by Alex Bol on 3/7/2017.
 */
"use strict";

import Flatten from '../flatten';
import {convertToString} from "../utils/attributes";
import {Shape} from "./shape";
import {Errors} from "../utils/errors";
import {intersectSegment2Arc} from "../algorithms/intersection";

/**
 * Class Box represents bounding box of the shape.
 * It may also represent axis-aligned rectangle
 * @type {Box}
 */
export class Box extends Shape {
    /**
     *
     * @param {number} xmin - minimal x coordinate
     * @param {number} ymin - minimal y coordinate
     * @param {number} xmax - maximal x coordinate
     * @param {number} ymax - maximal y coordinate
     */
    constructor(xmin = undefined, ymin = undefined, xmax = undefined, ymax = undefined) {
        super()
        /**
         * Minimal x coordinate
         * @type {number}
         */
        this.xmin = xmin;
        /**
         * Minimal y coordinate
         * @type {number}
         */
        this.ymin = ymin;
        /**
         * Maximal x coordinate
         * @type {number}
         */
        this.xmax = xmax;
        /**
         * Maximal y coordinate
         * @type {number}
         */
        this.ymax = ymax;
    }

    /**
     * Return new cloned instance of box
     * @returns {Box}
     */
    clone() {
        return new Box(this.xmin, this.ymin, this.xmax, this.ymax);
    }

    /**
     * Property low need for interval tree interface
     * @returns {Point}
     */
    get low() {
        return new Flatten.Point(this.xmin, this.ymin);
    }

    /**
     * Property high need for interval tree interface
     * @returns {Point}
     */
    get high() {
        return new Flatten.Point(this.xmax, this.ymax);
    }

    /**
     * Property max returns the box itself !
     * @returns {Box}
     */
    get max() {
        return this.clone();
    }
    
    /**
     * Return center of the box
     * @returns {Point}
     */
    get center() {
        return new Flatten.Point((this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2);
    }

    /**
     * Return the width of the box
     * @returns {number}
     */
    get width() {
        return Math.abs(this.xmax - this.xmin);
    }

    /**
     * Return the height of the box
     * @returns {number}
     */
    get height() {
        return Math.abs(this.ymax - this.ymin);
    }
    
    /**
     * Return property box like all other shapes
     * @returns {Box}
     */
    get box() {
        return this.clone();
    }

    /**
     * Returns true if not intersected with other box
     * @param {Box} other_box - other box to test
     * @returns {boolean}
     */
    not_intersect(other_box) {
        return (
            this.xmax < other_box.xmin ||
            this.xmin > other_box.xmax ||
            this.ymax < other_box.ymin ||
            this.ymin > other_box.ymax
        );
    }

    /**
     * Returns true if intersected with other box
     * @param {Box} other_box - Query box
     * @returns {boolean}
     */
    intersect(other_box) {
        return !this.not_intersect(other_box);
    }

    /**
     * Returns new box merged with other box
     * @param {Box} other_box - Other box to merge with
     * @returns {Box}
     */
    merge(other_box) {
        return new Box(
            this.xmin === undefined ? other_box.xmin : Math.min(this.xmin, other_box.xmin),
            this.ymin === undefined ? other_box.ymin : Math.min(this.ymin, other_box.ymin),
            this.xmax === undefined ? other_box.xmax : Math.max(this.xmax, other_box.xmax),
            this.ymax === undefined ? other_box.ymax : Math.max(this.ymax, other_box.ymax)
        );
    }

    /**
     * Defines predicate "less than" between two boxes. Need for interval index
     * @param {Box} other_box - other box
     * @returns {boolean} - true if this box less than other box, false otherwise
     */
    less_than(other_box) {
        if (this.low.lessThan(other_box.low))
            return true;
        if (this.low.equalTo(other_box.low) && this.high.lessThan(other_box.high))
            return true;
        return false;
    }

    /**
     * Returns true if this box is equal to other box, false otherwise
     * @param {Box} other_box - query box
     * @returns {boolean}
     */
    equal_to(other_box) {
        return (this.low.equalTo(other_box.low) && this.high.equalTo(other_box.high));
    }

    output() {
        return this.clone();
    }

    comparable_less_than(pt1, pt2) {
        return pt1.lessThan(pt2);
    }

    /**
     * Set new values to the box object
     * @param {number} xmin - mininal x coordinate
     * @param {number} ymin - minimal y coordinate
     * @param {number} xmax - maximal x coordinate
     * @param {number} ymax - maximal y coordinate
     */
    set(xmin, ymin, xmax, ymax) {
        this.xmin = xmin;
        this.ymin = ymin;
        this.xmax = xmax;
        this.ymax = ymax;
    }

    /**
     * Return new extended box
     * @param {number} extension - positive number, how much to extend the box
     * @returns {Box}
     */
    extend(extension) {
        if (extension <= 0) return this.clone();
        return new Box(
            this.xmin - extension,
            this.ymin - extension,
            this.xmax + extension,
            this.ymax + extension
        )
    }

    /**
     * Transform box into array of points from low left corner in counterclockwise
     * @returns {Point[]}
     */
    toPoints() {
        return [
            new Flatten.Point(this.xmin, this.ymin),
            new Flatten.Point(this.xmax, this.ymin),
            new Flatten.Point(this.xmax, this.ymax),
            new Flatten.Point(this.xmin, this.ymax)
        ];
    }

    /**
     * Transform box into array of segments from low left corner in counterclockwise
     * @returns {Segment[]}
     */
    toSegments() {
        let pts = this.toPoints();
        return [
            new Flatten.Segment(pts[0], pts[1]),
            new Flatten.Segment(pts[1], pts[2]),
            new Flatten.Segment(pts[2], pts[3]),
            new Flatten.Segment(pts[3], pts[0])
        ];
    }

    /**
     * Box rotation is not supported
     * Attempt to rotate box throws error
     * @param {number} angle - angle in radians
     * @param {Point} [center=(0,0)] center
     */
    rotate(angle, center = new Flatten.Point()) {
            throw Errors.OPERATION_IS_NOT_SUPPORTED
    }

    /**
     * Return new box transformed using affine transformation matrix
     * New box is a bounding box of transformed corner points
     * @param {Matrix} m - affine transformation matrix
     * @returns {Box}
     */
    transform(m = new Flatten.Matrix()) {
        const transformed_points = this.toPoints().map(pt => pt.transform(m))
        return transformed_points.reduce(
            (new_box, pt) => new_box.merge(pt.box), new Box())
    }

    /**
     * Return true if box contains shape: no point of shape lies outside the box
     * @param {AnyShape} shape - test shape
     * @returns {boolean}
     */
    contains(shape) {
        if (shape instanceof Flatten.Point) {
            return (shape.x >= this.xmin) && (shape.x <= this.xmax) && (shape.y >= this.ymin) && (shape.y <= this.ymax);
        }

        if (shape instanceof Flatten.Segment) {
            return shape.vertices.every(vertex => this.contains(vertex))
        }

        if (shape instanceof Flatten.Box) {
            return shape.toSegments().every(segment => this.contains(segment))
        }

        if (shape instanceof Flatten.Circle) {
            return this.contains(shape.box)
        }

        if (shape instanceof Flatten.Arc) {
            return shape.vertices.every(vertex => this.contains(vertex)) &&
                this.toSegments().every(segment => intersectSegment2Arc(segment, shape).length === 0)
        }

        if (shape instanceof Flatten.Line || shape instanceof Flatten.Ray) {
            return false
        }

        if (shape instanceof Flatten.Multiline) {
            return shape.toShapes().every(shape => this.contains(shape))
        }

        if (shape instanceof Flatten.Polygon) {
            return this.contains(shape.box)
        }
    }

    /**
     * Calculate distance and shortest segment from box to shape and return as array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from box to shape
     * @returns {Segment} shortest segment between box and shape (started at box, ended at shape)
     */
    distanceTo(shape) {
        const distanceInfos = this.toSegments()
          .map(segment => segment.distanceTo(shape));
        let shortestDistanceInfo = [
          Number.MAX_SAFE_INTEGER,
          null,
        ];
        distanceInfos.forEach(distanceInfo => {
          if (distanceInfo[0] < shortestDistanceInfo[0]) {
            shortestDistanceInfo = distanceInfo;
          }
        });
        return shortestDistanceInfo;
    }

    get name() {
        return "box"
    }

    /**
     * Return string to draw box in svg
     * @param {Object} attrs - an object with attributes of svg rectangle element
     * @returns {string}
     */
    svg(attrs = {}) {
        const width = this.xmax - this.xmin;
        const height = this.ymax - this.ymin;
        return `\n<rect x="${this.xmin}" y="${this.ymin}" width="${width}" height="${height}"
                ${convertToString({fill: "none", ...attrs})} />`;
    };
}

Flatten.Box = Box;
/**
 * Shortcut to create new box
 * @param args
 * @returns {Box}
 */
export const box = (...args) => new Flatten.Box(...args);
Flatten.box = box;
