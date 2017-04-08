/**
 * Created by Alex Bol on 2/19/2017.
 */

"use strict";

module.exports = function(Flatten) {
    /**
     * Class representing a vector
     * @type {Vector}
     */
    Flatten.Vector = class Vector {
        /**
         * Vector may be constructed by two points, or by two float numbers
         * @param {Point} ps - start point
         * @param {Point} pe - end point
         */
        constructor(...args) {
            /**
             * x-coordinate of a vector (float number)
             * @type {number}
             */
            this.x = 0;
            /**
             * y-coordinate of a vector (float number)
             * @type {number}
             */
            this.y = 0;

            /* return zero vector */
            if (args.length == 0) {
                return;
            }

            if (args.length == 2) {
                let a1 = args[0];
                let a2 = args[1];

                if (typeof(a1) == "number" && typeof(a2) == "number") {
                    this.x = a1;
                    this.y = a2;
                    return;
                }

                if (a1 instanceof Flatten.Point && a2 instanceof Flatten.Point) {
                    this.x = a2.x - a1.x;
                    this.y = a2.y - a1.y;
                    return;
                }

            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Method clone returns new instance of Vector
         * @returns {Vector}
         */
        clone() {
            return new Vector(this.x, this.y);
        }

        /**
         * Slope of the vector in radians from 0 to 2PI
         * @returns {number}
         */
        get slope() {
            let angle = Math.atan2(this.y, this.x);
            if (angle<0) angle = 2*Math.PI + angle;
            return angle;
        }

        /**
         * Length of vector
         * @returns {number}
         */
        get length() {
            return Math.sqrt(this.dot(this));
        }

        /**
         * Returns true if vectors are equal up to DP_TOL tolerance
         * @param {Vector} v
         * @returns {boolean}
         */
        equalTo(v) {
            return Flatten.Utils.EQ(this.x, v.x) && Flatten.Utils.EQ(this.y, v.y);
        }

        /**
         * Returns new vector multiplied by scalar
         * @param {number} scalar
         * @returns {Vector}
         */
        multiply(scalar) {
            return ( new Vector(scalar * this.x, scalar * this.y) );
        }

        /**
         * Returns scalar product between two vectors
         * @param {Vector} v
         * @returns {number}
         */
        dot(v) {
            return ( this.x * v.x + this.y * v.y );
        }

        /**
         * Returns vector product (magnitude) between two vectors
         * @param {Vector} v
         * @returns {number}
         */
        cross(v) {
            return ( this.x * v.y - this.y * v.x );
        }

        /**
         * Returns unit vector.<br/>
         * Throw error if given vector has zero length
         * @returns {Vector}
         */
        normalize() {
            if (!Flatten.Utils.EQ_0(this.length)) {
                return ( new Vector(this.x / this.length, this.y / this.length) );
            }
            throw Flatten.Errors.ZERO_DIVISION;
        }

        /**
         * Returns new vector rotated by given angle, positive angle defines rotation in counter clockwise direction
         * @param {number} angle - angle in radians
         * @returns {Vector}
         */
        rotate(angle) {
            let point = new Flatten.Point(this.x, this.y);
            let rpoint = point.rotate(angle);
            return new Flatten.Vector(rpoint.x, rpoint.y);
        }

        /**
         * Special fast version of rotate. Returns vector rotated 90 degrees counter clockwise
         * @returns {Vector}
         */
        rotate90CCW() {
            return new Flatten.Vector(-this.y, this.x);
        };

        /**
         * Special fast version of rotate. Returns vector rotated 90 degrees clockwise
         * @returns {Vector}
         */
        rotate90CW() {
            return new Flatten.Vector(this.y, -this.x);
        };

        /**
         * Return inverted vector
         * @returns {Vector}
         */
        invert() {
            return new Flatten.Vector(-this.x, -this.y);
        }
    };

    /**
     * Function to create vector equivalent to "new" constructor
     * @param args
     */
    Flatten.vector = (...args) => new Flatten.Vector(...args);
};
