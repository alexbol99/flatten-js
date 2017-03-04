/**
 * Created by Alex Bol on 2/19/2017.
 */
/**
 *
 * @param Flatten
 */
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
         * Method clone returns new instance of Vector
         * @returns {Vector}
         */
        clone() {
            return new Vector(this.x, this.y);
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
         * Returns length of vector
         * @returns {number}
         */
        len() {
            return Math.sqrt(this.dot(this));
        }

        /**
         * Returns slope of the vector in radians
         * @returns {number}
         */
        slope() {
            return Math.atan2(this.y, this.x);
        }

        /**
         * Returns unit vector.<br/>
         * Throw error if given vector has zero length
         * @returns {Vector}
         */
        normalize() {
            let length = this.len();
            if (!Flatten.Utils.EQ_0(length)) {
                return ( new Vector(this.x / length, this.y / length) );
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
    };
};
