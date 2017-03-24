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
         * Method clone returns new instance of Point
         * @returns {Point}
         */
        clone() {
            return new Flatten.Point(this.x, this.y);
        }

        /**
         * Returns true if points are equal up to DP_TOL tolerance
         * @param {Point} pt
         * @returns {boolean}
         */
        equalTo(pt) {
            return Flatten.Utils.EQ(this.x, pt.x) && Flatten.Utils.EQ(this.y, pt.y);
        }

        /**
         * Returns new point rotated by given angle around given center point.
         * If center point is omitted, rotates around zero point (0,0).
         * @param {number} angle - angle in radians, positive value defines rotation
         * in counter clockwise direction, negative - clockwise
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
         * Translation vector may by also defined by a pair of numbers dx, dy
         * @param {Vector} vector - translation vector
         * @returns {Point}
         */
        translate(...args) {
            if (args.length == 0) {
                return this.clone();
            }

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
         * @param {Line} line - line this point be projected on
         * @returns {Point}
         */
        projectionOn(line) {
            if (this.equalTo(line.pt))                   // this point equal to line anchor point
                return this.clone();

            let vec = new Flatten.Vector(this, line.pt);
            if (Flatten.Utils.EQ_0(vec.cross(line.norm)))    // vector to point from anchor point collinear to normal vector
                return this.clone();

            let dist = vec.dot(line.norm);             // signed distance
            let proj_vec = line.norm.multiply(dist);
            return this.translate(proj_vec);
        }

        /**
         * Returns true if point is on "left" semi plane. Left semi plane is where line normal vector points to
         * @param line
         * @returns {boolean}
         */
        leftTo(line) {
            let vec = new Flatten.Vector(line.pt, this);
            let onLeftSemiPlane = Flatten.Utils.GT(vec.dot(line.norm), 0);
            return onLeftSemiPlane;
        }

        /**
         * Returns distance between point and other shape
         * @param {Shape} shape
         * @returns {number}
         */
        distanceTo(shape) {
            if (shape instanceof Point) {
                let vec = new Flatten.Vector(this, shape);
                return vec.length;
            }

            if (shape instanceof Flatten.Line) {
                let vec = new Flatten.Vector(this, this.projectionOn(shape));
                return vec.length;
            }

            if (shape instanceof Flatten.Circle) {
                let dist2pc = this.distanceTo(shape.pc);
                return Math.abs(dist2pc - shape.r);
            }

            if (shape instanceof Flatten.Segment) {
                return shape.distanceToPoint(this);
            }

            if (shape instanceof Flatten.Arc) {
                return shape.distanceToPoint(this);
            }
        }

        /**
         * Returns true if point is on shape
         * @param {Shape} shape
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
        }

        /**
         * Return string to draw point in svg as circle with radius "r", default is r:"5"
         * @param attrs - json structure with any attributes allowed to svg circle element,
         * like "r", "stroke", "strokeWidth", "fill"
         * Defaults are r:"5", stroke:"black", strokeWidth:"1", fill:"red"
         * @returns {string}
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
