/**
 * Created by Alex Bol on 3/10/2017.
 */

"use strict";

module.exports = function(Flatten) {
    /**
     * Class representing a segment
     * @type {Segment}
     */
    Flatten.Segment = class Segment {
        /**
         *
         * @param {Point} ps - start point
         * @param {Point} pe - end point
         */
        constructor(ps = new Flatten.Point(), pe = new Flatten.Point()) {
            /**
             * Start point
             * @type {Point}
             */
            this.ps = ps.clone();
            /**
             * End Point
             * @type {Point}
             */
            this.pe = pe.clone();
        }

        /**
         * Method clone returns new instance of a Segment
         * @returns {Segment}
         */
        clone() {
            return new Flatten.Segment(this.start, this.end);
        }

        /**
         * Start point
         * @returns {Point}
         */
        get start() {
            return this.ps;
        }

        /**
         * Set start point
         * @param {Point} pt
         */
        set start(pt) {
            this.ps = pt;
        }

        /**
         * End point
         * @returns {Point}
         */
        get end() {
            return this.pe;
        }

        /**
         * Set end point
         * @param {Point} pt
         */
        set end(pt) {
            this.pe = pt;
        }

        /**
         * Length of a segment
         * @returns {number}
         */
        get length() {
            return this.start.distanceTo(this.end);
        }

        /**
         * Slope of the line - angle to axe x in radians from 0 to 2PI
         * @returns {number}
         */
        get slope() {
            let vec = new Flatten.Vector(this.start, this.end);
            return vec.slope;
        }

        /**
         * Bounding box
         * @returns {Box}
         */
        get box() {
            return new Flatten.Box(
                Math.min(this.start.x, this.end.x),
                Math.min(this.start.y, this.end.y),
                Math.max(this.start.x, this.end.x),
                Math.max(this.start.y, this.end.y)
            )
        }

        /**
         * Function contains returns true if point belongs to segment
         * @param {Point} pt
         * @returns {boolean}
         */
        contains(pt) {
            return Flatten.Utils.EQ_0(this.distanceToPoint(pt));
        }

        distanceToPoint(pt) {
            /* Degenerated case of zero-length segment */
            if (this.start.equalTo(this.end)) {
                return pt.distanceTo(this.start);
            }

            let v_seg = new Flatten.Vector(this.start, this.end);
            let v_ps2pt = new Flatten.Vector(this.start, pt);
            let v_pe2pt = new Flatten.Vector(this.end, pt);
            let start_sp = v_seg.dot(v_ps2pt);    /* dot product v_seg * v_ps2pt */
            let end_sp = -v_seg.dot(v_pe2pt);     /* minus dot product v_seg * v_pe2pt */

            let dist;
            if (Flatten.Utils.GE(start_sp, 0) && Flatten.Utils.GE(end_sp, 0)) {    /* point inside segment scope */
                let v_unit = new Flatten.Vector(v_seg.x / this.length, v_seg.y / this.length);
                /* unit vector ||v_unit|| = 1 */
                dist = Math.abs(v_unit.cross(v_ps2pt));
                /* dist = abs(v_unit x v_ps2pt) */
            }
            else if (start_sp < 0) {                                         /* point is out of scope closer to ps */
                dist = pt.distanceTo(this.start);
            }
            else {                                                           /* point is out of scope closer to pe */
                dist = pt.distanceTo(this.end);
            }
            return dist;
        };
    }
};