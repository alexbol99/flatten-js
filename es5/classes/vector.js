/**
 * Created by Alex Bol on 2/19/2017.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function (Flatten) {
    /**
     * Class representing a vector
     * @type {Vector}
     */
    Flatten.Vector = function () {
        /**
         * Vector may be constructed by two points, or by two float numbers
         * @param {Point} ps - start point
         * @param {Point} pe - end point
         */
        function Vector() {
            _classCallCheck(this, Vector);

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
            if (arguments.length == 0) {
                return;
            }

            if (arguments.length == 2) {
                var a1 = arguments.length <= 0 ? undefined : arguments[0];
                var a2 = arguments.length <= 1 ? undefined : arguments[1];

                if (typeof a1 == "number" && typeof a2 == "number") {
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


        _createClass(Vector, [{
            key: "clone",
            value: function clone() {
                return new Vector(this.x, this.y);
            }

            /**
             * Slope of the vector in radians from 0 to 2PI
             * @returns {number}
             */

        }, {
            key: "equalTo",


            /**
             * Returns true if vectors are equal up to DP_TOL tolerance
             * @param {Vector} v
             * @returns {boolean}
             */
            value: function equalTo(v) {
                return Flatten.Utils.EQ(this.x, v.x) && Flatten.Utils.EQ(this.y, v.y);
            }

            /**
             * Returns new vector multiplied by scalar
             * @param {number} scalar
             * @returns {Vector}
             */

        }, {
            key: "multiply",
            value: function multiply(scalar) {
                return new Vector(scalar * this.x, scalar * this.y);
            }

            /**
             * Returns scalar product between two vectors
             * @param {Vector} v
             * @returns {number}
             */

        }, {
            key: "dot",
            value: function dot(v) {
                return this.x * v.x + this.y * v.y;
            }

            /**
             * Returns vector product (magnitude) between two vectors
             * @param {Vector} v
             * @returns {number}
             */

        }, {
            key: "cross",
            value: function cross(v) {
                return this.x * v.y - this.y * v.x;
            }

            /**
             * Returns unit vector.<br/>
             * Throw error if given vector has zero length
             * @returns {Vector}
             */

        }, {
            key: "normalize",
            value: function normalize() {
                if (!Flatten.Utils.EQ_0(this.length)) {
                    return new Vector(this.x / this.length, this.y / this.length);
                }
                throw Flatten.Errors.ZERO_DIVISION;
            }

            /**
             * Returns new vector rotated by given angle, positive angle defines rotation in counter clockwise direction
             * @param {number} angle - angle in radians
             * @returns {Vector}
             */

        }, {
            key: "rotate",
            value: function rotate(angle) {
                var point = new Flatten.Point(this.x, this.y);
                var rpoint = point.rotate(angle);
                return new Flatten.Vector(rpoint.x, rpoint.y);
            }

            /**
             * Special fast version of rotate. Returns vector rotated 90 degrees counter clockwise
             * @returns {Vector}
             */

        }, {
            key: "rotate90CCW",
            value: function rotate90CCW() {
                return new Flatten.Vector(-this.y, this.x);
            }
        }, {
            key: "rotate90CW",


            /**
             * Special fast version of rotate. Returns vector rotated 90 degrees clockwise
             * @returns {Vector}
             */
            value: function rotate90CW() {
                return new Flatten.Vector(this.y, -this.x);
            }
        }, {
            key: "invert",


            /**
             * Return inverted vector
             * @returns {Vector}
             */
            value: function invert() {
                return new Flatten.Vector(-this.x, -this.y);
            }
        }, {
            key: "slope",
            get: function get() {
                var angle = Math.atan2(this.y, this.x);
                if (angle < 0) angle = 2 * Math.PI + angle;
                return angle;
            }

            /**
             * Length of vector
             * @returns {number}
             */

        }, {
            key: "length",
            get: function get() {
                return Math.sqrt(this.dot(this));
            }
        }]);

        return Vector;
    }();

    /**
     * Function to create vector equivalent to "new" constructor
     * @param args
     */
    Flatten.vector = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return new (Function.prototype.bind.apply(Flatten.Vector, [null].concat(args)))();
    };
};