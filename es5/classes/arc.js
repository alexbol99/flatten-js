/**
 * Created by Alex Bol on 3/10/2017.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function (Flatten) {
    /**
     * Class representing a circlular arc
     * @type {Arc}
     */
    Flatten.Arc = function () {
        /**
         *
         * @param {Point} pc - arc center
         * @param {number} r - arc radius
         * @param {number} startAngle - start angle in radians from 0 to 2*PI
         * @param {number} endAngle - end angle in radians from 0 to 2*PI
         * @param counterClockwise - arc direction, true - clockwise, false - counter clockwise
         */
        function Arc() {
            var pc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Flatten.Point();
            var r = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var startAngle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var endAngle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2 * Math.PI;
            var counterClockwise = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

            _classCallCheck(this, Arc);

            this.pc = pc.clone();
            this.r = r;
            this.startAngle = startAngle;
            this.endAngle = endAngle;
            this.counterClockwise = counterClockwise;
        }

        /**
         * Return new instance of arc
         * @returns {Arc}
         */


        _createClass(Arc, [{
            key: "clone",
            value: function clone() {
                return new Flatten.Arc(this.pc.clone(), this.r, this.startAngle, this.endAngle, this.counterClockwise);
            }

            /**
             * Get sweep angle in radians. Sweep angle is non-negative number from 0 to 2*PI
             * @returns {number}
             */

        }, {
            key: "contains",


            /**
             * Returns true if arc contains point
             * @param {Point} pt - point to test
             * @returns {boolean}
             */
            value: function contains(pt) {
                // first check if  point on circle (pc,r)
                if (!Flatten.Utils.EQ(this.pc.distanceTo(pt), this.r)) return false;

                // point on circle

                if (pt.equalTo(this.start)) return true;

                var angle = new Flatten.Vector(this.pc, pt).slope;
                var test_arc = new Flatten.Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise);
                return Flatten.Utils.LE(test_arc.length, this.length);
            }

            /**
             * Returns array of intersection points between arc and other shape
             * @param shape
             * @returns {*}
             */

        }, {
            key: "intersect",
            value: function intersect(shape) {
                if (shape instanceof Flatten.Line) {
                    return shape.intersect(this);
                }
                if (shape instanceof Flatten.Circle) {
                    return Arc.intersectArc2Circle(this, shape);
                }
                if (shape instanceof Flatten.Segment) {
                    return shape.intersect(this);
                }
                if (shape instanceof Flatten.Arc) {
                    return Arc.intersectArc2Arc(this, shape);
                }
            }
        }, {
            key: "distanceToPoint",
            value: function distanceToPoint(pt) {
                var circle = new Flatten.Circle(this.pc, this.r);
                var distToCircle = pt.distanceTo(circle);
                var distToStart = pt.distanceTo(this.start);
                var distToEnd = pt.distanceTo(this.end);
                return Math.min(distToCircle, Math.min(distToStart, distToEnd));
            }

            /**
             * Returns array of sub-arcs broken in extreme point 0, pi/2, pi, 3*pi/2
             * @returns {Array}
             */

        }, {
            key: "breakToFunctional",
            value: function breakToFunctional() {
                var func_arcs_array = [];
                var angles = [0, Math.PI / 2, 2 * Math.PI / 2, 3 * Math.PI / 2];
                var pts = [this.pc.translate(this.r, 0), this.pc.translate(0, this.r), this.pc.translate(-this.r, 0), this.pc.translate(0, -this.r)];

                // If arc contains extreme point,
                // create test arc started at start point and ended at this extreme point
                var test_arcs = [];
                for (var i = 0; i < 4; i++) {
                    if (pts[i].on(this)) {
                        test_arcs.push(new Flatten.Arc(this.pc, this.r, this.startAngle, angles[i], this.counterClockwise));
                    }
                }

                if (test_arcs.length == 0) {
                    // arc does contain any extreme point
                    func_arcs_array.push(this.clone());
                } else {
                    // arc passes extreme point
                    // sort these arcs by length
                    test_arcs.sort(function (arc1, arc2) {
                        return arc1.length - arc2.length;
                    });

                    for (var _i = 0; _i < test_arcs.length; _i++) {
                        var _prev_arc = func_arcs_array.length > 0 ? func_arcs_array[func_arcs_array.length - 1] : undefined;
                        var _new_arc = void 0;
                        if (_prev_arc) {
                            _new_arc = new Flatten.Arc(this.pc, this.r, _prev_arc.endAngle, test_arcs[_i].endAngle, this.counterClockwise);
                        } else {
                            _new_arc = new Flatten.Arc(this.pc, this.r, this.startAngle, test_arcs[_i].endAngle, this.counterClockwise);
                        }
                        if (!Flatten.Utils.EQ_0(_new_arc.length)) {
                            func_arcs_array.push(_new_arc.clone());
                        }
                    }

                    // add last sub arc
                    var prev_arc = func_arcs_array.length > 0 ? func_arcs_array[func_arcs_array.length - 1] : undefined;
                    var new_arc = void 0;
                    if (prev_arc) {
                        new_arc = new Flatten.Arc(this.pc, this.r, prev_arc.endAngle, this.endAngle, this.counterClockwise);
                    } else {
                        new_arc = new Flatten.Arc(this.pc, this.r, this.startAngle, this.endAngle, this.counterClockwise);
                    }
                    if (!Flatten.Utils.EQ_0(new_arc.length)) {
                        func_arcs_array.push(new_arc.clone());
                    }
                }
                return func_arcs_array;
            }
        }, {
            key: "definiteIntegral",
            value: function definiteIntegral() {
                var ymin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

                var f_arcs = this.breakToFunctional();
                var area = f_arcs.reduce(function (acc, arc) {
                    return acc + arc.circularSegmentDefiniteIntegral(ymin);
                }, 0.0);
                return area;
            }
        }, {
            key: "circularSegmentDefiniteIntegral",
            value: function circularSegmentDefiniteIntegral(ymin) {
                var line = new Flatten.Line(this.start, this.end);
                var onLeftSide = this.pc.leftTo(line);
                var segment = new Flatten.Segment(this.start, this.end);
                var areaTrapez = segment.definiteIntegral(ymin);
                var areaCircularSegment = this.circularSegmentArea();
                var area = onLeftSide ? areaTrapez - areaCircularSegment : areaTrapez + areaCircularSegment;
                return area;
            }
        }, {
            key: "circularSegmentArea",
            value: function circularSegmentArea() {
                return 0.5 * this.r * this.r * (this.sweep - Math.sin(this.sweep));
            }

            /**
             * Return string to draw arc in svg
             * @param attrs - json structure with any attributes allowed to svg path element,
             * like "stroke", "strokeWidth", "fill"
             * Defaults are stroke:"black", strokeWidth:"3", fill:"none"
             * @returns {string}
             */

        }, {
            key: "svg",
            value: function svg() {
                var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { stroke: "black", strokeWidth: "3", fill: "none" };

                var largeArcFlag = this.sweep <= Math.PI ? "0" : "1";
                var sweepFlag = this.counterClockwise ? "1" : "0";
                var stroke = attrs.stroke,
                    strokeWidth = attrs.strokeWidth,
                    fill = attrs.fill;


                if (Flatten.Utils.EQ(this.sweep, 2 * Math.PI)) {
                    var circle = new Flatten.Circle(this.pc, this.r);
                    return circle.svg(attrs);
                } else {
                    return "\n<path d=\"M" + this.start.x + "," + this.start.y + "\n                             A" + this.r + "," + this.r + " 0 " + largeArcFlag + "," + sweepFlag + " " + this.end.x + "," + this.end.y + "\"\n                    stroke=\"" + stroke + "\" stroke-width=\"" + strokeWidth + "\" fill=\"" + fill + "\"/>";
                }
            }
        }, {
            key: "sweep",
            get: function get() {
                if (Flatten.Utils.EQ(this.startAngle, this.endAngle)) return 0.0; // or Flatten.PIx2 ? - no zero arcs
                if (Flatten.Utils.EQ(Math.abs(this.startAngle - this.endAngle), Flatten.PIx2)) {
                    return Flatten.PIx2;
                }
                var sweep = void 0;
                if (this.counterClockwise) {
                    sweep = Flatten.Utils.GT(this.endAngle, this.startAngle) ? this.endAngle - this.startAngle : this.endAngle - this.startAngle + Flatten.PIx2;
                } else {
                    sweep = Flatten.Utils.GT(this.startAngle, this.endAngle) ? this.startAngle - this.endAngle : this.startAngle - this.endAngle + Flatten.PIx2;
                }

                if (Flatten.Utils.GT(sweep, Flatten.PIx2)) {
                    sweep -= Flatten.PIx2;
                }
                if (Flatten.Utils.LT(sweep, 0)) {
                    sweep += Flatten.PIx2;
                }
                return sweep;
            }

            /**
             * Get start point of arc
             * @returns {Point}
             */

        }, {
            key: "start",
            get: function get() {
                var p0 = new Flatten.Point(this.pc.x + this.r, this.pc.y);
                return p0.rotate(this.startAngle, this.pc);
            }

            /**
             * Get end point of arc
             * @returns {Point}
             */

        }, {
            key: "end",
            get: function get() {
                var p0 = new Flatten.Point(this.pc.x + this.r, this.pc.y);
                return p0.rotate(this.endAngle, this.pc);
            }

            /**
             * Get arc length
             * @returns {number}
             */

        }, {
            key: "length",
            get: function get() {
                return Math.abs(this.sweep * this.r);
            }

            /**
             * Get bounding box of arc
             * @returns {Box}
             */

        }, {
            key: "box",
            get: function get() {
                var xs = void 0,
                    ys = void 0,
                    xe = void 0,
                    ye = void 0;
                var dxs = void 0,
                    dys = void 0,
                    dxe = void 0,
                    dye = void 0;
                var xmin = void 0,
                    ymin = void 0,
                    xmax = void 0,
                    ymax = void 0;
                var quads = void 0,
                    quade = void 0,
                    quad = void 0;
                var xc = this.pc.x;
                var yc = this.pc.y;
                var r = this.r;

                var ps = this.start;
                var pe = this.end;

                var box = new Flatten.Box();

                /* order (xs, xe) and (ys, ye) always clockwise */
                if (this.counterClockwise) {
                    xs = pe.x;ys = pe.y;
                    xe = ps.x;ye = ps.y;
                } else {
                    xs = ps.x;ys = ps.y;
                    xe = pe.x;ye = pe.y;
                }
                dxs = xs - xc;dys = ys - yc;
                dxe = xe - xc;dye = ye - yc;

                xmin = xc - r;ymin = yc - r;
                xmax = xc + r;ymax = yc + r;

                xmin = Math.min(xmin, xs);xmin = Math.min(xmin, xe);
                xmax = Math.max(xmax, xs);xmax = Math.max(xmax, xe);
                ymin = Math.min(ymin, ys);ymin = Math.min(ymin, ye);
                ymax = Math.max(ymax, ys);ymax = Math.max(ymax, ye);

                /* Calculate the quadrant for each point */
                /*
                 *           |
                 *         1 | 0
                 *       ----------
                 *         2 | 3
                 *           |
                 */
                quads = dxs >= 0 ? dys >= 0 ? 0 : 3 : dys >= 0 ? 1 : 2;
                quade = dxe >= 0 ? dye >= 0 ? 0 : 3 : dye >= 0 ? 1 : 2;

                /* There are 16 combinations of start-end configurations */
                /* The more complex ones are when both points are in the
                 * same quadrant (They require additional conditions).
                 * Remember that we converted everything to clockwise !
                 */

                quad = (quads << 2) + quade;

                switch (quad) {
                    case 0:
                        /* From quadrant 0 to 0 */
                        if (xs < xe || ys > ye) {
                            box.set(xs, ye, xe, ys);
                        } else {
                            box.set(xmin, ymin, xmax, ymax);
                        }
                        break;
                    case 1:
                        /* From quadrant 0 to 1 */
                        box.set(xmin, ymin, xmax, Math.max(ys, ye));
                        break;
                    case 2:
                        /* From quadrant 0 to 2 */
                        box.set(xe, ymin, xmax, ys);
                        break;
                    case 3:
                        /* From quadrant 0 to 3 */
                        box.set(Math.min(xs, xe), ye, xmax, ys);
                        break;
                    case 4:
                        /* From quadrant 1 to 0 */
                        box.set(xs, Math.min(ys, ye), xe, ymax);
                        break;
                    case 5:
                        /* From quadrant 1 to 1 */
                        if (xs < xe || ys < ye) {
                            box.set(xs, ys, xe, ye);
                        } else {
                            box.set(xmin, ymin, xmax, ymax);
                        }
                        break;
                    case 6:
                        /* From quadrant 1 to 2 */
                        box.set(Math.min(xs, xe), ymin, xmax, ymax);
                        break;
                    case 7:
                        /* From quadrant 1 to 3 */
                        box.set(xs, ye, xmax, ymax);
                        break;
                    case 8:
                        /* From quadrant 2 to 0 */
                        box.set(xmin, ys, xe, ymax);
                        break;
                    case 9:
                        /* From quadrant 2 to 1 */
                        box.set(xmin, ys, Math.max(xs, xe), ye);
                        break;
                    case 10:
                        /* From quadrant 2 to 2 */
                        if (xs > xe || ys < ye) {
                            box.set(xe, ys, xs, ye);
                        } else {
                            box.set(xmin, ymin, xmax, ymax);
                        }
                        break;
                    case 11:
                        /* From quadrant 2 to 3 */
                        box.set(xmin, Math.min(ys, ye), xmax, ymax);
                        break;
                    case 12:
                        /* From quadrant 3 to 0 */
                        box.set(xmin, ymin, Math.max(xs, xe), ymax);
                        break;
                    case 13:
                        /* From quadrant 3 to 1 */
                        box.set(xmin, ymin, xs, ye);
                        break;
                    case 14:
                        /* From quadrant 3 to 2 */
                        box.set(xe, ymin, xs, Math.max(ys, ye));
                        break;
                    case 15:
                        /* From quadrant 3 to 3 */
                        if (xs > xe || ys > ye) {
                            box.set(xe, ye, xs, ys);
                        } else {
                            box.set(xmin, ymin, xmax, ymax);
                        }
                        break;
                }
                return box;
            }
        }], [{
            key: "intersectArc2Arc",
            value: function intersectArc2Arc(arc1, arc2) {
                var ip = [];

                if (arc1.box.notIntersect(arc2.box)) {
                    return ip;
                }

                // Special case: overlapping arcs
                // May return up to 4 intersection points
                if (arc1.pc.equalTo(arc2.pc) && Flatten.Utils.EQ(arc1.r, arc2.r)) {
                    var pt = void 0;

                    pt = arc1.start;
                    if (pt.on(arc2)) ip.push(pt);

                    pt = arc1.end;
                    if (pt.on(arc2)) ip.push(pt);

                    pt = arc2.start;
                    if (pt.on(arc1)) ip.push(pt);

                    pt = arc2.end;
                    if (pt.on(arc1)) ip.push(pt);

                    return ip;
                }

                // Common case
                var circle1 = new Flatten.Circle(arc1.pc, arc1.r);
                var circle2 = new Flatten.Circle(arc2.pc, arc2.r);
                var ip_tmp = circle1.intersect(circle2);
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = ip_tmp[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _pt = _step.value;

                        if (_pt.on(arc1) && _pt.on(arc2)) {
                            ip.push(_pt);
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

                return ip;
            }
        }, {
            key: "intersectArc2Circle",
            value: function intersectArc2Circle(arc, circle) {
                var ip = [];

                if (arc.box.notIntersect(circle.box)) {
                    return ip;
                }

                // Case when arc center incident to circle center
                // Return arc's end points as 2 intersection points
                if (circle.pc.equalTo(arc.pc) && Flatten.Utils.EQ(circle.r, arc.r)) {
                    ip.push(arc.start);
                    ip.push(arc.end);
                    return ip;
                }

                // Common case
                var circle1 = circle;
                var circle2 = new Flatten.Circle(arc.pc, arc.r);
                var ip_tmp = circle1.intersect(circle2);
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = ip_tmp[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var pt = _step2.value;

                        if (pt.on(arc)) {
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

        return Arc;
    }();

    /**
     * Function to create arc equivalent to "new" constructor
     * @param args
     */
    Flatten.arc = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return new (Function.prototype.bind.apply(Flatten.Arc, [null].concat(args)))();
    };
};