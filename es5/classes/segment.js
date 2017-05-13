/**
 * Created by Alex Bol on 3/10/2017.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function (Flatten) {
    /**
     * Class representing a segment
     * @type {Segment}
     */
    Flatten.Segment = function () {
        /**
         *
         * @param {Point} ps - start point
         * @param {Point} pe - end point
         */
        function Segment() {
            _classCallCheck(this, Segment);

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

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            if (args.length == 0) {
                return;
            }

            if (args.length == 1 && args[0] instanceof Array && args[0].length == 4) {
                var coords = args[0];
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


        _createClass(Segment, [{
            key: "clone",
            value: function clone() {
                return new Flatten.Segment(this.start, this.end);
            }

            /**
             * Start point
             * @returns {Point}
             */

        }, {
            key: "contains",


            /**
             * Function contains returns true if point belongs to segment
             * @param {Point} pt
             * @returns {boolean}
             */
            value: function contains(pt) {
                return Flatten.Utils.EQ_0(this.distanceToPoint(pt));
            }

            /**
             * Returns array of intersection points between segment and other shape
             * @param shape - shape to intersect with
             * @returns {Point[]}
             */

        }, {
            key: "intersect",
            value: function intersect(shape) {
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
        }, {
            key: "distanceToPoint",
            value: function distanceToPoint(pt) {
                /* Degenerated case of zero-length segment */
                if (this.start.equalTo(this.end)) {
                    return pt.distanceTo(this.start);
                }

                var v_seg = new Flatten.Vector(this.start, this.end);
                var v_ps2pt = new Flatten.Vector(this.start, pt);
                var v_pe2pt = new Flatten.Vector(this.end, pt);
                var start_sp = v_seg.dot(v_ps2pt); /* dot product v_seg * v_ps2pt */
                var end_sp = -v_seg.dot(v_pe2pt); /* minus dot product v_seg * v_pe2pt */

                var dist = void 0;
                if (Flatten.Utils.GE(start_sp, 0) && Flatten.Utils.GE(end_sp, 0)) {
                    /* point inside segment scope */
                    var v_unit = new Flatten.Vector(v_seg.x / this.length, v_seg.y / this.length);
                    /* unit vector ||v_unit|| = 1 */
                    dist = Math.abs(v_unit.cross(v_ps2pt));
                    /* dist = abs(v_unit x v_ps2pt) */
                } else if (start_sp < 0) {
                    /* point is out of scope closer to ps */
                    dist = pt.distanceTo(this.start);
                } else {
                    /* point is out of scope closer to pe */
                    dist = pt.distanceTo(this.end);
                }
                return dist;
            }
        }, {
            key: "definiteIntegral",
            value: function definiteIntegral() {
                var ymin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.0;

                var dx = this.end.x - this.start.x;
                var dy1 = this.start.y - ymin;
                var dy2 = this.end.y - ymin;
                return dx * (dy1 + dy2) / 2;
            }
        }, {
            key: "svg",


            /**
             * Return string to draw segment in svg
             * @param attrs - json structure with any attributes allowed to svg path element,
             * like "stroke", "strokeWidth"
             * Defaults are stroke:"black", strokeWidth:"3"
             * @returns {string}
             */
            value: function svg() {
                var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { stroke: "black", strokeWidth: "3" };
                var stroke = attrs.stroke,
                    strokeWidth = attrs.strokeWidth;

                return "\n<line x1=\"" + this.start.x + "\" y1=\"" + this.start.y + "\" x2=\"" + this.end.x + "\" y2=\"" + this.end.y + "\" stroke=\"" + stroke + "\" stroke-width=\"" + strokeWidth + "\" />";
            }
        }, {
            key: "start",
            get: function get() {
                return this.ps;
            }

            /**
             * Set start point
             * @param {Point} pt
             */
            ,
            set: function set(pt) {
                this.ps = pt;
            }

            /**
             * End point
             * @returns {Point}
             */

        }, {
            key: "end",
            get: function get() {
                return this.pe;
            }

            /**
             * Set end point
             * @param {Point} pt
             */
            ,
            set: function set(pt) {
                this.pe = pt;
            }

            /**
             * Length of a segment
             * @returns {number}
             */

        }, {
            key: "length",
            get: function get() {
                return this.start.distanceTo(this.end);
            }

            /**
             * Slope of the line - angle to axe x in radians from 0 to 2PI
             * @returns {number}
             */

        }, {
            key: "slope",
            get: function get() {
                var vec = new Flatten.Vector(this.start, this.end);
                return vec.slope;
            }

            /**
             * Bounding box
             * @returns {Box}
             */

        }, {
            key: "box",
            get: function get() {
                return new Flatten.Box(Math.min(this.start.x, this.end.x), Math.min(this.start.y, this.end.y), Math.max(this.start.x, this.end.x), Math.max(this.start.y, this.end.y));
            }
        }], [{
            key: "intersectSegment2Line",
            value: function intersectSegment2Line(seg, line) {
                var ip = [];
                var zero_segment = Flatten.Utils.EQ_0(seg.length);

                // Boundary cases
                if (seg.ps.on(line)) {
                    ip.push(seg.ps);
                }
                // If both ends lay on line, return two intersection points
                if (seg.pe.on(line) && !zero_segment) {
                    ip.push(seg.pe);
                }

                if (ip.length > 0) {
                    return ip; // done, intersection found
                }

                // Not a boundary case, check if both points are on the same side and
                // hence there is no intersection
                if (seg.ps.leftTo(line) && seg.pe.leftTo(line) || !seg.ps.leftTo(line) && !seg.pe.leftTo(line)) {
                    return ip;
                }

                // Calculate intersection between lines
                var line1 = new Flatten.Line(seg.ps, seg.pe);
                return line1.intersect(line);
            }
        }, {
            key: "intersectSegment2Segment",
            value: function intersectSegment2Segment(seg1, seg2) {
                var ip = [];

                // quick reject
                if (seg1.box.notIntersect(seg2.box)) {
                    return ip;
                }

                var line1 = new Flatten.Line(seg1.ps, seg1.pe);
                var line2 = new Flatten.Line(seg2.ps, seg2.pe);

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
                } else {
                    /* not incident - parallel or intersect */
                    // Calculate intersection between lines
                    var new_ip = line1.intersect(line2);
                    if (new_ip.length > 0 && new_ip[0].on(seg1) && new_ip[0].on(seg2)) {
                        ip.push(new_ip[0]);
                    }
                }

                return ip;
            }
        }, {
            key: "intersectSegment2Circle",
            value: function intersectSegment2Circle(segment, circle) {
                var ips = [];

                if (segment.box.notIntersect(circle.box)) {
                    return ips;
                }

                var line = new Flatten.Line(segment.ps, segment.pe);

                var ips_tmp = line.intersect(circle);

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = ips_tmp[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var ip = _step.value;

                        if (ip.on(segment)) {
                            ips.push(ip);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return ips;
            }
        }, {
            key: "intersectSegment2Arc",
            value: function intersectSegment2Arc(segment, arc) {
                var ip = [];

                if (segment.box.notIntersect(arc.box)) {
                    return ip;
                }

                var line = new Flatten.Line(segment.ps, segment.pe);
                var circle = new Flatten.Circle(arc.pc, arc.r);

                var ip_tmp = line.intersect(circle);

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = ip_tmp[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var pt = _step2.value;

                        if (pt.on(segment) && pt.on(arc)) {
                            ip.push(pt);
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                return ip;
            }
        }]);

        return Segment;
    }();

    Flatten.segment = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return new (Function.prototype.bind.apply(Flatten.Segment, [null].concat(args)))();
    };
};