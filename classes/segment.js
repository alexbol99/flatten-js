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
        constructor(...args) {
            /**
             * Start point
             * @type {Point}
             */
            this.ps = new Flatten.Point();
            /**
             * End Point
             * @type {Point}
             */
            this.pe = new Flatten.Point();

            if (args.length == 0) {
                return;
            }

            if (args.length == 1 && args[0] instanceof Array && args[0].length == 4) {
                let coords = args[0];
                this.ps = new Flatten.Point(coords[0], coords[1]);
                this.pe = new Flatten.Point(coords[2], coords[3]);
                return;
            }

            if (args.length == 2 && args[0] instanceof Flatten.Point && args[1] instanceof Flatten.Point) {
                this.ps = args[0].clone();
                this.pe = args[1].clone();
                return;
            }

            if (args.length == 4) {
                this.ps = new Flatten.Point(args[0], args[1]);
                this.pe = new Flatten.Point(args[2], args[3]);
                return;
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
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

        /**
         * Returns array of intersection points between segment and other shape
         * @param shape - shape to intersect with
         * @returns {Point[]}
         */
        intersect(shape) {
            if (shape instanceof Flatten.Line) {
                return Segment.intersectSegment2Line(this, shape);
            }

            if (shape instanceof Flatten.Segment) {
                return Segment.intersectSegment2Segment(this, shape);
            }

            if (shape instanceof Flatten.Circle) {
                return Segment.intersectSegment2Circle(this, shape);
            }

            if (shape instanceof Flatten.Arc) {
                return Segment.intersectSegment2Arc(this, shape);
            }
        }

        /**
         * Return tangent unit vector in the start point in the direction from start to end
         * @returns {Vector} - tangent vector in start point
         */
        tangentInStart() {
            let vec = new Flatten.Vector(this.start, this.end);
            return vec.normalize();
        }

        /**
         * Return tangent unit vector in the end point in the direction from end to start
         * @returns {Vector} - tangent vector in end point
         */
        tangentInEnd() {
            let vec = new Flatten.Vector(this.end, this.start);
            return vec.normalize();
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
            else if (start_sp < 0) {                             /* point is out of scope closer to ps */
                dist = pt.distanceTo(this.start);
            }
            else {                                               /* point is out of scope closer to pe */
                dist = pt.distanceTo(this.end);
            }
            return dist;
        };

        definiteIntegral(ymin=0.0) {
            let dx = this.end.x - this.start.x;
            let dy1 = this.start.y - ymin;
            let dy2 = this.end.y - ymin;
            return ( dx*(dy1 + dy2)/2 );
        }
        
        static intersectSegment2Line(seg, line) {
            let ip = [];
            let zero_segment = Flatten.Utils.EQ_0(seg.length);

            // Boundary cases
            if (seg.ps.on(line)) {
                ip.push(seg.ps);
            }
            // If both ends lay on line, return two intersection points
            if (seg.pe.on(line) && !zero_segment) {
                ip.push(seg.pe);
            }

            if (ip.length > 0) {
                return ip;          // done, intersection found
            }

            // Not a boundary case, check if both points are on the same side and
            // hence there is no intersection
            if (seg.ps.leftTo(line) && seg.pe.leftTo(line) ||
                !seg.ps.leftTo(line) && !seg.pe.leftTo(line)) {
                return ip;
            }

            // Calculate intersection between lines
            let line1 = new Flatten.Line(seg.ps, seg.pe);
            return line1.intersect(line);
        }

        static intersectSegment2Segment(seg1, seg2) {
            let ip = [];

            // quick reject
            if (seg1.box.notIntersect(seg2.box)) {
                return ip;
            }

            let line1 = new Flatten.Line(seg1.ps, seg1.pe);
            let line2 = new Flatten.Line(seg2.ps, seg2.pe);

            // Check overlapping between segments in case of incidence
            // If segments touching, add one point. If overlapping, add two points
            if (line1.incidentTo(line2)) {
                if (seg1.ps.on(seg2)) {
                    ip.push(seg1.ps);
                }
                if (seg1.pe.on(seg2)) {
                    ip.push(seg1.pe);
                }
                if (seg2.ps.on(seg1) && !seg2.ps.equalTo(seg1.ps) && !seg2.ps.equalTo(seg1.pe)) {
                    ip.push(seg2.ps);
                }
                if (seg2.pe.on(seg1) && !seg2.pe.equalTo(seg1.ps) && !seg2.pe.equalTo(seg1.pe)) {
                    ip.push(seg2.pe);
                }
            }
            else {                /* not incident - parallel or intersect */
                // Calculate intersection between lines
                let new_ip = line1.intersect(line2);
                if (new_ip.length > 0 && new_ip[0].on(seg1) && new_ip[0].on(seg2)) {
                    ip.push(new_ip[0]);
                }
            }

            return ip;
        }

        static intersectSegment2Circle(segment, circle) {
            let ips = [];

            if (segment.box.notIntersect(circle.box)) {
                return ips;
            }

            let line = new Flatten.Line(segment.ps, segment.pe);

            let ips_tmp = line.intersect(circle);

            for (let ip of ips_tmp) {
                if (ip.on(segment)) {
                    ips.push(ip);
                }
            }

            return ips;
        }

        static intersectSegment2Arc(segment, arc) {
            let ip = [];

            if (segment.box.notIntersect(arc.box)) {
                return ip;
            }

            let line = new Flatten.Line(segment.ps, segment.pe);
            let circle = new Flatten.Circle(arc.pc, arc.r);

            let ip_tmp = line.intersect(circle);

            for (let pt of ip_tmp) {
                if (pt.on(segment) && pt.on(arc)) {
                    ip.push(pt);
                }
            }
            return ip;

        }

        /**
         * Return string to draw segment in svg
         * @param attrs - json structure with any attributes allowed to svg path element,
         * like "stroke", "strokeWidth"
         * Defaults are stroke:"black", strokeWidth:"3"
         * @returns {string}
         */
        svg(attrs = {stroke:"black",strokeWidth:"3"}) {
            let {stroke, strokeWidth} = attrs;
            return `\n<line x1="${this.start.x}" y1="${this.start.y}" x2="${this.end.x}" y2="${this.end.y}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
        }
    };

    Flatten.segment = (...args) => new Flatten.Segment(...args);
};