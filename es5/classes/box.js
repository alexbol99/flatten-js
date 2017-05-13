/**
 * Created by Alex Bol on 3/7/2017.
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function (Flatten) {
    /**
     * Class Box represent bounding box of the shape
     * @type {Box}
     */
    Flatten.Box = function () {
        /**
         *
         * @param {number} xmin - minimal x coordinate
         * @param {number} ymin - minimal y coordinate
         * @param {number} xmax - maximal x coordinate
         * @param {number} ymax - maximal y coordinate
         */
        function Box() {
            var xmin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
            var ymin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
            var xmax = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
            var ymax = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

            _classCallCheck(this, Box);

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
         * Clones and returns new instance of box
         * @returns {Box}
         */


        _createClass(Box, [{
            key: "clone",
            value: function clone() {
                return new Box(this.xmin, this.ymin, this.xmax, this.ymax);
            }

            /**
             * Property low need for interval tree interface
             * @returns {Point}
             */

        }, {
            key: "notIntersect",


            /**
             * Returns true if not intersected with other box
             * @param {Box} other_box - other box to test
             * @returns {boolean}
             */
            value: function notIntersect(other_box) {
                return this.xmax < other_box.xmin || this.xmin > other_box.xmax || this.ymax < other_box.ymin || this.ymin > other_box.ymax;
            }

            /**
             * Returns true if intersected with other box
             * @param {Box} other_box - other box to test
             * @returns {boolean}
             */

        }, {
            key: "intersect",
            value: function intersect(other_box) {
                return !this.notIntersect(other_box);
            }

            /**
             * Returns new box merged with other box
             * @param {Box} other_box - other box to merge with
             * @returns {Box}
             */

        }, {
            key: "merge",
            value: function merge(other_box) {
                return new Box(this.xmin === undefined ? other_box.xmin : Math.min(this.xmin, other_box.xmin), this.ymin === undefined ? other_box.ymin : Math.min(this.ymin, other_box.ymin), this.xmax === undefined ? other_box.xmax : Math.max(this.xmax, other_box.xmax), this.ymax === undefined ? other_box.ymax : Math.max(this.ymax, other_box.ymax));
            }

            /**
             * Defines predicate "less than" between two boxes. Need for interval index
             * @param other_box - other box
             * @returns {boolean} - true if this box less than other box, false otherwise
             */

        }, {
            key: "less_than",
            value: function less_than(other_box) {
                if (this.low.lessThan(other_box.low)) return true;
                if (this.low.equalTo(other_box.low) && this.high.lessThan(other_box.high)) return true;
                return false;
            }

            /**
             * Returns true if this box equal to other box
             * @param other_box - other box
             * @returns {boolean} - true if equal, false otherwise
             */

        }, {
            key: "equal_to",
            value: function equal_to(other_box) {
                return this.low.equalTo(other_box.low) && this.high.equalTo(other_box.high);
            }
        }, {
            key: "output",
            value: function output() {
                return this.clone();
            }
        }, {
            key: "maximal_val",
            value: function maximal_val(box1, box2) {
                // return pt1.lessThan(pt2) ? pt2.clone() : pt1.clone();
                return box1.merge(box2);
            }
        }, {
            key: "val_less_than",
            value: function val_less_than(pt1, pt2) {
                return pt1.lessThan(pt2);
            }
        }, {
            key: "set",
            value: function set(xmin, ymin, xmax, ymax) {
                this.xmin = xmin;
                this.ymin = ymin;
                this.xmax = xmax;
                this.ymax = ymax;
            }
        }, {
            key: "low",
            get: function get() {
                return new Flatten.Point(this.xmin, this.ymin);
            }

            /**
             * Property high need for interval tree interface
             * @returns {Point}
             */

        }, {
            key: "high",
            get: function get() {
                return new Flatten.Point(this.xmax, this.ymax);
            }

            /**
             * Property max returns the box itself !
             * @returns {Box}
             */

        }, {
            key: "max",
            get: function get() {
                return this.clone();
            }
        }]);

        return Box;
    }();
};