/**
 * Created by Alex Bol on 2/18/2017.
 */

let RegisterPoint = function(Flatten) {
    /**
     * @class Point
     */
    Flatten.Point = class Point {
        /**
         * @constructor Point(x,y)
         * @param {Number} {x}
         * @param {Number} {y}
         */
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        /**
         * Clone point and return new instance
         * @returns {Point}
         */
        clone() {
            return new Flatten.Point(this.x, this.y);
        }

        /**
         * Returns true if points are equal up to float point tolerance
         * @param {Point} pt
         * @returns {*|boolean}
         */
        equalTo(pt) {
            return Flatten.Utils.EQ(this.x, pt.x) && Flatten.Utils.EQ(this.y, pt.y);
        }

        /**
         * Returns distance between two points
         * @param {Point} pt
         * @returns {*}
         */
        distanceTo(pt) {
            let v = new Flatten.Vector(this, pt);
            return v.len();
        }

        /**
         * Rotate point by given angle (in radians) around anchor point
         * If parameter anchor omitted, rotate around zero point (0,0)
         * @param {Number} angle
         * @param {Point} {anchor}
         * @returns {Point}
         */
        rotate(angle, anchor = {x:0, y:0}) {
            var x_rot = anchor.x + (this.x - anchor.x) * Math.cos(angle) - (this.y - anchor.y) * Math.sin(angle);
            var y_rot = anchor.y + (this.x - anchor.x) * Math.sin(angle) + (this.y - anchor.y) * Math.cos(angle);

            return new Flatten.Point(x_rot, y_rot);
        }

        /**
         * Translate point by vector
         * @param {Vector} v | {Number} dx
         * @param {Number} dy
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

module.exports = RegisterPoint;