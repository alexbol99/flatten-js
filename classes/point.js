/**
 * Created by Alex Bol on 2/18/2017.
 */

/**
 *
 * @param Flatten
 */
module.exports = function(Flatten) {
    /**
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
            this.x = x;
            this.y = y;
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
         * Returns distance between two points
         * @param {Point} pt
         * @returns {number}
         */
        distanceTo(pt) {
            let vec = new Flatten.Vector(this,pt);
            return vec.len();
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

    };

};

// module.exports = RegisterPoint;