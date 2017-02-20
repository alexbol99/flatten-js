/**
 * Created by Alex Bol on 2/19/2017.
 */

const RegisterVector = function(Flatten) {
    /**
     * @class Vector
     */
    Flatten.Vector = class Vector {
        /**
         * @constructor Vector
         * @param {Number} x
         * @param {Number} y
         * or
         * @param {Point} ps
         * @param {Point} pe
         */
        constructor(...args) {
            this.x = 0;
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
         * Clone vector and create new instance
         * @returns {Vector}
         */
        clone() {
            return new Vector(this.x, this.y);
        }

        /**
         * Returns true if two vectors are equal up to float point tolerance
         * @param {Vector} v
         * @returns {*|boolean}
         */
        equalTo(v) {
            return Flatten.Utils.EQ(this.x, v.x) && Flatten.Utils.EQ(this.y, v.y);
        }

        /**
         * Multiply vector by scalar
         * @param {Number} scalar
         * @returns {Vector}
         */
        multiply(scalar) {
            return ( new Vector(scalar * this.x, scalar * this.y) );
        }

        /**
         * Returns scalar (dot) product between two vectors
         * @param {Vector} v
         * @returns {number}
         */
        dot(v) {
            return ( this.x * v.x + this.y * v.y );
        }

        /**
         * Returns vector (cross) product between two vectors (magnitude)
         * @param {Vector} v
         * @returns {number}
         */
        cross(v) {
            return ( this.x * v.y - this.y * v.x );
        }

        /**
         * Returns length of the vector
         * @returns {number}
         */
        len() {
            return Math.sqrt(this.dot(this));
        }

        /**
         * Returns unit vector
         * @returns {Vector}
         */
        normalize() {
            let length = this.len();
            if (!Flatten.Utils.EQ_0(length)) {
                return ( new Vector(this.x / length, this.y / length) );
            }
            throw Flatten.Errors.ZERO_DIVISION;
        }
    };
};
module.exports = RegisterVector;