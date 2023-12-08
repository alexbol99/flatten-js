/**
 * Created by Alex Bol on 2/18/2017.
 */

import Flatten from '../flatten';
import {convertToString} from "../utils/attributes";
import {Matrix} from "./matrix";
import {Shape} from "./shape";
import {Errors} from "../utils/errors";

/**
 *
 * Class representing a point
 * @type {Point}
 */
export class Point extends Shape {
    /**
     * Point may be constructed by two numbers, or by array of two numbers
     * @param {number} x - x-coordinate (float number)
     * @param {number} y - y-coordinate (float number)
     */
    constructor(...args) {
        super()
        /**
         * x-coordinate (float number)
         * @type {number}
         */
        this.x = 0;
        /**
         * y-coordinate (float number)
         * @type {number}
         */
        this.y = 0;

        if (args.length === 0) {
            return;
        }

        if (args.length === 1 && args[0] instanceof Array && args[0].length === 2) {
            let arr = args[0];
            if (typeof (arr[0]) == "number" && typeof (arr[1]) == "number") {
                this.x = arr[0];
                this.y = arr[1];
                return;
            }
        }

        if (args.length === 1 && args[0] instanceof Object && args[0].name === "point") {
            let {x, y} = args[0];
            this.x = x;
            this.y = y;
            return;
        }

        if (args.length === 2) {
            if (typeof (args[0]) == "number" && typeof (args[1]) == "number") {
                this.x = args[0];
                this.y = args[1];
                return;
            }
        }
        throw Errors.ILLEGAL_PARAMETERS;
    }

    /**
     * Returns bounding box of a point
     * @returns {Box}
     */
    get box() {
        return new Flatten.Box(this.x, this.y, this.x, this.y);
    }

    /**
     * Return new cloned instance of point
     * @returns {Point}
     */
    clone() {
        return new Flatten.Point(this.x, this.y);
    }

    get vertices() {
        return [this.clone()];
    }

    /**
     * Returns true if points are equal up to [Flatten.Utils.DP_TOL]{@link DP_TOL} tolerance
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    equalTo(pt) {
        return Flatten.Utils.EQ(this.x, pt.x) && Flatten.Utils.EQ(this.y, pt.y);
    }

    /**
     * Defines predicate "less than" between points. Returns true if the point is less than query points, false otherwise <br/>
     * By definition point1 < point2 if {point1.y < point2.y || point1.y == point2.y && point1.x < point2.x <br/>
     * Numeric values compared with [Flatten.Utils.DP_TOL]{@link DP_TOL} tolerance
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    lessThan(pt) {
        if (Flatten.Utils.LT(this.y, pt.y))
            return true;
        if (Flatten.Utils.EQ(this.y, pt.y) && Flatten.Utils.LT(this.x, pt.x))
            return true;
        return false;
    }

    /**
     * Return new point transformed by affine transformation matrix
     * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
     * @returns {Point}
     */
    transform(m) {
        return new Flatten.Point(m.transform([this.x, this.y]))
    }

    /**
     * Returns projection point on given line
     * @param {Line} line Line this point be projected on
     * @returns {Point}
     */
    projectionOn(line) {
        if (this.equalTo(line.pt))                   // this point equal to line anchor point
            return this.clone();

        let vec = new Flatten.Vector(this, line.pt);
        if (Flatten.Utils.EQ_0(vec.cross(line.norm)))    // vector to point from anchor point collinear to normal vector
            return line.pt.clone();

        let dist = vec.dot(line.norm);             // signed distance
        let proj_vec = line.norm.multiply(dist);
        return this.translate(proj_vec);
    }

    /**
     * Returns true if point belongs to the "left" semi-plane, which means, point belongs to the same semi plane where line normal vector points to
     * Return false if point belongs to the "right" semi-plane or to the line itself
     * @param {Line} line Query line
     * @returns {boolean}
     */
    leftTo(line) {
        let vec = new Flatten.Vector(line.pt, this);
        let onLeftSemiPlane = Flatten.Utils.GT(vec.dot(line.norm), 0);
        return onLeftSemiPlane;
    }

    /**
     * Calculate distance and shortest segment from point to shape and return as array [distance, shortest segment]
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
     * @returns {number} distance from point to shape
     * @returns {Segment} shortest segment between point and shape (started at point, ended at shape)
     */
    distanceTo(shape) {
        if (shape instanceof Point) {
            let dx = shape.x - this.x;
            let dy = shape.y - this.y;
            return [Math.sqrt(dx * dx + dy * dy), new Flatten.Segment(this, shape)];
        }

        if (shape instanceof Flatten.Line) {
            return Flatten.Distance.point2line(this, shape);
        }

        if (shape instanceof Flatten.Circle) {
            return Flatten.Distance.point2circle(this, shape);
        }

        if (shape instanceof Flatten.Segment) {
            return Flatten.Distance.point2segment(this, shape);
        }

        if (shape instanceof Flatten.Arc) {
            return Flatten.Distance.point2arc(this, shape);
        }

        if (shape instanceof Flatten.Polygon) {
            return Flatten.Distance.point2polygon(this, shape);
        }

        if (shape instanceof Flatten.PlanarSet) {
            return Flatten.Distance.shape2planarSet(this, shape);
        }
    }

    /**
     * Returns true if point is on a shape, false otherwise
     * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon
     * @returns {boolean}
     */
    on(shape) {
        if (shape instanceof Flatten.Point) {
            return this.equalTo(shape);
        }

        if (shape instanceof Flatten.Line) {
            return shape.contains(this);
        }

        if (shape instanceof Flatten.Ray) {
            return shape.contains(this)
        }

        if (shape instanceof Flatten.Circle) {
            return shape.contains(this);
        }

        if (shape instanceof Flatten.Segment) {
            return shape.contains(this);
        }

        if (shape instanceof Flatten.Arc) {
            return shape.contains(this);
        }

        if (shape instanceof Flatten.Polygon) {
            return shape.contains(this);
        }
    }

    get name() {
        return "point"
    }

    /**
     * Return string to draw point in svg as circle with radius "r" <br/>
     * Accept any valid attributes of svg elements as svg object
     * Defaults attribues are: <br/>
     * {
     *    r:"3",
     *    stroke:"black",
     *    strokeWidth:"1",
     *    fill:"red"
     * }
     * @param {Object} attrs - Any valid attributes of svg circle element, like "r", "stroke", "strokeWidth", "fill"
     * @returns {String}
     */
    svg(attrs = {}) {
        const r = attrs.r ?? 3            // default radius - 3
        return `\n<circle cx="${this.x}" cy="${this.y}" r="${r}"
            ${convertToString({fill: "red", ...attrs})} />`;
    }
}

Flatten.Point = Point;
/**
 * Function to create point equivalent to "new" constructor
 * @param args
 */
export const point = (...args) => new Flatten.Point(...args);
Flatten.point = point;

// export {Point};
