/**
 * Created by Alex Bol on 2/18/2017.
 */

/**
 *
 * @param Flatten
 */
module.exports = function(Flatten) {
    /**
     *
     * Class representing a point
     * @type {Point}
     */
    Flatten.Point = class Point {
        /**
         *
         * @param {number} x - x-coordinate (float number)
         * @param {number} y - y-coordinate (float number)
         */
        constructor(x = 0, y = 0) {
            /**
             * x-coordinate (float number)
             * @type {number}
             */
            this.x = Number.isNaN(x) ? 0 : x;
            /**
             * y-coordinate (float number)
             * @type {number}
             */
            this.y = Number.isNaN(y) ? 0: y;
        }

        /**
         * Returns bounding box of a point
         * @returns {Box}
         */
        get box() {
            return new Flatten.Box(this.x, this.y, this.x, this.y);
        }

        /**
         * Method clone returns new copied instance of point
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
         * By definition point1 < point2 if {point1.y < point2.y || point1.y == point2.y && point1.x < point2.y <br/>
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
         * Returns new point rotated by given angle around given center point.
         * If center point is omitted, rotates around zero point (0,0).
         * Positive value of angle defines rotation in counter clockwise direction,
         * negative angle defines rotation in clockwise clockwise direction
         * @param {Number} angle - angle in radians
         * @param {Point} [center=(0,0)] center
         * @returns {Point}
         */
        rotate(angle, center = {x:0, y:0}) {
            var x_rot = center.x + (this.x - center.x) * Math.cos(angle) - (this.y - center.y) * Math.sin(angle);
            var y_rot = center.y + (this.x - center.x) * Math.sin(angle) + (this.y - center.y) * Math.cos(angle);

            return new Flatten.Point(x_rot, y_rot);
        }

        /**
         * Returns new point translated by given vector.
         * Translation vector may by also defined by a pair of numbers.
         * @param {Vector} vector - Translation vector defined as Flatten.Vector or
         * @param {Number|Number} - Translation vector defined as pair of numbers
         * @returns {Point}
         */
        translate(...args) {
            if (args.length == 1 && (args[0] instanceof Flatten.Vector)) {
                return new Flatten.Point(this.x + args[0].x, this.y + args[0].y);
            }

            if (args.length == 2 && typeof(args[0]) == "number" && typeof(args[1]) == "number") {
                return new Flatten.Point(this.x + args[0], this.y + args[1]);
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
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
         * @returns {Number} distance from point to shape
         * @returns {Segment} shortest segment between point and shape (started at point, ended at shape)
         */
        distanceTo(shape) {
            let {Distance} = Flatten;

            if (shape instanceof Point) {
                let dx = shape.x - this.x;
                let dy = shape.y - this.y;
                return [Math.sqrt(dx*dx + dy*dy), new Flatten.Segment(this, shape)];
            }

            if (shape instanceof Flatten.Line) {
                return Distance.point2line(this, shape);
            }

            if (shape instanceof Flatten.Circle) {
                return Distance.point2circle(this, shape);
            }

            if (shape instanceof Flatten.Segment) {
                return Distance.point2segment(this, shape);
            }

            if (shape instanceof Flatten.Arc) {
                // let [dist, ...rest] = Distance.point2arc(this, shape);
                // return dist;
                return Distance.point2arc(this, shape);
            }

            if (shape instanceof Flatten.Polygon) {
                // let [dist, ...rest] = Distance.point2polygon(this, shape);
                // return dist;
                return Distance.point2polygon(this, shape);
            }

            if (shape instanceof Flatten.PlanarSet) {
                return Distance.shape2planarSet(this, shape);
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

            if (shape instanceof Flatten.Circle) {
                return shape.contains(this);
            }

            if (shape instanceof  Flatten.Segment) {
                return shape.contains(this);
            }

            if (shape instanceof Flatten.Arc) {
                return shape.contains(this);
            }

            if (shape instanceof Flatten.Polygon) {
                return shape.contains(this);
            }
        }

        /**
         * Return string to draw point in svg as circle with radius "r" <br/>
         * Defaults attrs is an object:
         * {
         *    r:"5",
         *    stroke:"black",
         *    strokeWidth:"1",
         *    fill:"red"
         * }
         * @param {Object} attrs - Attributes of svg circle element: "r", "stroke", "strokeWidth", "fill"
         * @returns {String}
         */
        svg(attrs = {r:"5",stroke:"black",strokeWidth:"1",fill:"red"}) {
            let {r, stroke, strokeWidth, fill} = attrs;
            return `\n<circle cx="${this.x}" cy="${this.y}" r="${r}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" />`;
        }

    };

    /**
     * Function to create point equivalent to "new" constructor
     * @param args
     */
    Flatten.point = (...args) => new Flatten.Point(...args);
};
