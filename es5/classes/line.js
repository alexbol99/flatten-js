/**
 * Created by Alex Bol on 2/20/2017.
 */
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function (Flatten) {
    /**
     * Class representing a line
     * @type {Line}
     */
    Flatten.Line = function () {
        /**
         * Line may be constructed by point and normal vector or by two points that a line passes through
         * @param {Point} pt - point that a line passes through
         * @param {Vector|Point} norm - normal vector to a line or second point a line passes through
         */
        function Line() {
            _classCallCheck(this, Line);

            /**
             * Point a line passes through
             * @type {Point}
             */
            this.pt = new Flatten.Point();
            /**
             * Normal unit vector to a line
             * @type {Vector}
             */
            this.norm = new Flatten.Vector(0, 1);

            if (arguments.length == 0) {
                return;
            }

            if (arguments.length == 2) {
                var a1 = arguments.length <= 0 ? undefined : arguments[0];
                var a2 = arguments.length <= 1 ? undefined : arguments[1];

                if (a1 instanceof Flatten.Point && a2 instanceof Flatten.Point) {
                    this.pt = a1;
                    this.norm = Line.points2norm(a1, a2);
                    return;
                }

                if (a1 instanceof Flatten.Point && a2 instanceof Flatten.Vector) {
                    if (Flatten.Utils.EQ_0(a2.x) && Flatten.Utils.EQ_0(a2.y)) {
                        throw Flatten.Errors.ILLEGAL_PARAMETERS;
                    }
                    this.pt = a1.clone();
                    this.norm = a2.clone();
                    return;
                }

                if (a1 instanceof Flatten.Vector && a2 instanceof Flatten.Point) {
                    if (Flatten.Utils.EQ_0(a1.x) && Flatten.Utils.EQ_0(a1.y)) {
                        throw Flatten.Errors.ILLEGAL_PARAMETERS;
                    }
                    this.pt = a2.clone();
                    this.norm = a1.clone();
                    return;
                }
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Method clone returns new instance of Line
         * @returns {Line}
         */


        _createClass(Line, [{
            key: "clone",
            value: function clone() {
                return new Flatten.Line(this.pt, this.norm);
            }

            /**
             * Slope of the line - angle in radians between line and axe x from 0 to 2PI
             * @returns {number} - slope of the line
             */

        }, {
            key: "parallelTo",


            /**
             * Return true if parallel or incident to other line
             * @param {Line} other_line - line to check
             * @returns {boolean}
             */
            value: function parallelTo(other_line) {
                return this.norm.equalTo(other_line.norm);
            }

            /**
             * Returns true if incident to other line
             * @param {Line} other_line - line to check
             * @returns {boolean}
             */

        }, {
            key: "incidentTo",
            value: function incidentTo(other_line) {
                return (this.norm.equalTo(other_line.norm) || this.norm.equalTo(other_line.norm.invert())) && this.pt.on(other_line);
            }

            /**
             * Returns true if point belongs to line
             * @param {Point} pt
             * @returns {boolean}
             */

        }, {
            key: "contains",
            value: function contains(pt) {
                if (this.pt.equalTo(pt)) {
                    return true;
                }
                /* Line contains point if vector to point is orthogonal to the line normal vector */
                var vec = new Flatten.Vector(this.pt, pt);
                return Flatten.Utils.EQ_0(this.norm.dot(vec));
            }

            /**
             * Returns array of intersection points if intersection exists or zero-length array otherwise
             * @param {Shape} shape - shape to intersect with
             * @returns {Point[]}
             */

        }, {
            key: "intersect",
            value: function intersect(shape) {
                if (shape instanceof Flatten.Line) {
                    return Line.intersectLine2Line(this, shape);
                }

                if (shape instanceof Flatten.Circle) {
                    return Line.intersectLine2Circle(this, shape);
                }

                if (shape instanceof Flatten.Segment) {
                    return shape.intersect(this);
                }

                if (shape instanceof Flatten.Arc) {
                    return Line.intersectLine2Arc(this, shape);
                }
            }
        }, {
            key: "slope",
            get: function get() {
                var vec = new Flatten.Vector(this.norm.y, -this.norm.x);
                return vec.slope;
            }

            /**
             * Standard line equation in the form Ax + By = C, get coefficients using es6 destructuring assignment:
             * @code [A, B, C] = line.standard
             * @returns {number[]} - array of coefficients
             */

        }, {
            key: "standard",
            get: function get() {
                var A = this.norm.x;
                var B = this.norm.y;
                var C = this.norm.dot(this.pt);

                return [A, B, C];
            }
        }], [{
            key: "points2norm",
            value: function points2norm(pt1, pt2) {
                if (pt1.equalTo(pt2)) {
                    throw Flatten.Errors.ILLEGAL_PARAMETERS;
                }
                var vec = new Flatten.Vector(pt1, pt2);
                var unit = vec.normalize();
                return unit.rotate90CCW();
            }
        }, {
            key: "intersectLine2Line",
            value: function intersectLine2Line(line1, line2) {
                var ip = [];

                var _line1$standard = _slicedToArray(line1.standard, 3),
                    A1 = _line1$standard[0],
                    B1 = _line1$standard[1],
                    C1 = _line1$standard[2];

                var _line2$standard = _slicedToArray(line2.standard, 3),
                    A2 = _line2$standard[0],
                    B2 = _line2$standard[1],
                    C2 = _line2$standard[2];

                /* Cramer's rule */


                var det = A1 * B2 - B1 * A2;
                var detX = C1 * B2 - B1 * C2;
                var detY = A1 * C2 - C1 * A2;

                if (!Flatten.Utils.EQ_0(det)) {
                    var new_ip = new Flatten.Point(detX / det, detY / det);
                    ip.push(new_ip);
                }
                return ip;
            }
        }, {
            key: "intersectLine2Circle",
            value: function intersectLine2Circle(line, circle) {
                var ip = [];
                var prj = circle.pc.projectionOn(line); // projection of circle center on line
                var dist = circle.pc.distanceTo(prj); // distance from circle center to projection

                if (Flatten.Utils.EQ(dist, circle.r)) {
                    // line tangent to circle - return single intersection point
                    ip.push(prj);
                } else if (Flatten.Utils.LT(dist, circle.r)) {
                    // return two intersection points
                    var delta = Math.sqrt(circle.r * circle.r - dist * dist);
                    var v_trans, pt;

                    v_trans = line.norm.rotate90CCW().multiply(delta);
                    pt = prj.translate(v_trans);
                    ip.push(pt);

                    v_trans = line.norm.rotate90CW().multiply(delta);
                    pt = prj.translate(v_trans);
                    ip.push(pt);
                }
                return ip;
            }
        }, {
            key: "intersectLine2Box",
            value: function intersectLine2Box(line, box) {
                var pts = [new Flatten.Point(box.xmin, box.ymin), new Flatten.Point(box.xmax, box.ymin), new Flatten.Point(box.xmax, box.ymax), new Flatten.Point(box.xmin, box.ymax)];
                var segs = [new Flatten.Segment(pts[0], pts[1]), new Flatten.Segment(pts[1], pts[2]), new Flatten.Segment(pts[2], pts[3]), new Flatten.Segment(pts[3], pts[0])];

                var ips = [];

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = segs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var seg = _step.value;

                        var ips_tmp = seg.intersect(line);
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = ips_tmp[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var ip = _step2.value;

                                ips.push(ip);
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

                ;
                return ips;
            }
        }, {
            key: "intersectLine2Arc",
            value: function intersectLine2Arc(line, arc) {
                var ip = [];

                if (line.box.notIntersect(arc.box)) {
                    return ip;
                }

                var circle = new Flatten.Circle(arc.pc, arc.r);
                var ip_tmp = line.intersect(circle);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = ip_tmp[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var pt = _step3.value;

                        if (pt.on(arc)) {
                            ip.push(pt);
                        }
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                return ip;
            }
        }]);

        return Line;
    }();

    /**
     * Function to create line equivalent to "new" constructor
     * @param args
     */
    Flatten.line = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return new (Function.prototype.bind.apply(Flatten.Line, [null].concat(args)))();
    };
};