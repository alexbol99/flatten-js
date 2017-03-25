/**
 * Created by Alex Bol on 3/7/2017.
 */
"use strict";

module.exports = function(Flatten) {
    /**
     * Class Box represent bounding box of the shape
     * @type {Box}
     */
    Flatten.Box = class Box {
        /**
         *
         * @param {number} xmin - minimal x coordinate
         * @param {number} ymin - minimal y coordinate
         * @param {number} xmax - maximal x coordinate
         * @param {number} ymax - maximal y coordinate
         */
        constructor(xmin=undefined, ymin=undefined, xmax=undefined, ymax=undefined) {
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
         * Returns true if not intersected with other box
         * @param {Box} other_box - other box to test
         * @returns {boolean}
         */
        notIntersect(other_box) {
            return (
                this.xmax < other_box.xmin ||
                this.xmin > other_box.xmax ||
                this.ymax < other_box.ymin ||
                this.ymin > other_box.ymax
            );
        }

        /**
         * Returns true if intersected with other box
         * @param {Box} other_box - other box to test
         * @returns {boolean}
         */
        intersect(other_box) {
            return !this.notIntersect(other_box);
        }

        /**
         * Returns new box merged with other box
         * @param {Box} other_box - other box to merge with
         * @returns {Box}
         */
        merge(other_box) {
            return new Box(
                this.xmin === undefined ? other_box.xmin : Math.min(this.xmin, other_box.xmin),
                this.ymin === undefined ? other_box.ymin : Math.min(this.ymin, other_box.ymin),
                this.xmax === undefined ? other_box.xmax : Math.max(this.xmax, other_box.xmax),
                this.ymax === undefined ? other_box.ymax : Math.max(this.ymax, other_box.ymax)
            );
        }

        set(xmin, ymin, xmax, ymax) {
            this.xmin = xmin;
            this.ymin = ymin;
            this.xmax = xmax;
            this.ymax = ymax;
        }
    };
};