/**
 * Created by Alex Bol on 3/7/2017.
 */
"use strict";

import Flatten from '../flatten';

/**
 * Class Box represent bounding box of the shape
 * @type {Box}
 */
export class Box {
    /**
     *
     * @param {number} xmin - minimal x coordinate
     * @param {number} ymin - minimal y coordinate
     * @param {number} xmax - maximal x coordinate
     * @param {number} ymax - maximal y coordinate
     */
    constructor(xmin = undefined, ymin = undefined, xmax = undefined, ymax = undefined) {
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

    static comparable_max(box1, box2) {
        // return pt1.lessThan(pt2) ? pt2.clone() : pt1.clone();
        return box1.merge(box2);
    }

    static comparable_less_than(pt1, pt2) {
        return pt1.lessThan(pt2);
    }

    /**
     * Set new values to the box object
     * @param {number} xmin - miminal x coordinate
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
     * Transform box into array of points from low left corner in counter clockwise
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
     * Transform box into array of segments from low left corner in counter clockwise
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
     * Return string to draw circle in svg
     * @param {Object} attrs - an object with attributes of svg rectangle element,
     * like "stroke", "strokeWidth", "fill" <br/>
     * Defaults are stroke:"black", strokeWidth:"1", fill:"none"
     * @returns {string}
     */
    svg(attrs = {}) {
        let {stroke, strokeWidth, fill, id, className} = attrs;
        // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
        let id_str = (id && id.length > 0) ? `id="${id}"` : "";
        let class_str = (className && className.length > 0) ? `class="${className}"` : "";
        let width = this.xmax - this.xmin;
        let height = this.ymax - this.ymin;

        return `\n<rect x="${this.xmin}" y="${this.ymin}" width=${width} height=${height} stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "none"}" ${id_str} ${class_str} />`;
    };
};

Flatten.Box = Box;
/**
 * Shortcut to create new box
 * @param args
 * @returns {Box}
 */
export const box = (...args) => new Flatten.Box(...args);
Flatten.box = box;
