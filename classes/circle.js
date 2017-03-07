/**
 * Created by Alex Bol on 3/6/2017.
 */

"use strict";

module.exports = function(Flatten) {
    /**
     * Class representing a circle
     * @type {Circle}
     */
    Flatten.Circle = class Circle {
        /**
         *
         * @param {Point} pc - circle center point
         * @param {number} r - circle radius
         */
        constructor(pc, r) {
            /**
             * Circle center
             * @type {Point}
             */
            this.pc = pc;
            /**
             * Circle radius
             * @type {number}
             */
            this.r = r;
        }

        /**
         * Method clone returns new instance of a Circle
         * @returns {Circle}
         */
        clone() {
            return new Flatten.Circle(this.pc.clone(), this.r);
        }

        /**
         * Return true if circle contains point
         * @param {Point} pt - test point
         * @returns {boolean}
         */
        contains(pt) {
            return Flatten.Utils.LE(pt.distanceTo(this), this.r);
        }

        /**
         * Circle bounding box
         * @returns {Box}
         */
        get box() {
            return new Flatten.Box(
                this.pc.x - this.r,
                this.pc.y - this.r,
                this.pc.x + this.r,
                this.pc.y + this.r
            );
        }
    }
};