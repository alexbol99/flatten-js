/**
 * Created by Alex Bol on 3/17/2017.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function (Flatten) {
    var Point = Flatten.Point,
        Segment = Flatten.Segment,
        Arc = Flatten.Arc,
        Box = Flatten.Box,
        Edge = Flatten.Edge;
    /**
     * Class representing a face (closed loop) of polygon.
     * New face object should not be created directly, use polygon.addFace() method instead
     * @type {Face}
     */

    Flatten.Face = function () {
        function Face(polygon) {
            _classCallCheck(this, Face);

            /**
             * Reference to the first edge in face
             */
            this.first;
            /**
             * Reference to the last edge in face
             */
            this.last;
            /**
             * Face orientation: clockwise, counterclockwise or not-orientable
             * @type {Flatten.ORIENTATION}
             */
            this.orientation = undefined;
            /**
             * Bounding box of the face
             */
            this.box = new Box();

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            if (args.length == 0) {
                return;
            }

            /* If passed an array it supposed to be:
             1) array of shapes that performs close loop or
             2) array of points that performs set of vertices
             */
            if (args.length == 1 && args[0] instanceof Array) {
                var shapes = args[0][0];
                if (shapes.length == 0) return;

                if (shapes.every(function (shape) {
                    return shape instanceof Point;
                })) {
                    var segments = Face.points2segments(shapes);
                    this.shapes2face(polygon.edges, segments);
                } else if (shapes.every(function (shape) {
                    return shape instanceof Segment || shape instanceof Arc;
                })) {
                    this.shapes2face(polygon.edges, shapes);
                }
            }

            /* If passed two edges, consider them as start and end of the face loop */
            if (args.length == 2 && args[0] instanceof Edge && args[1] instanceof Edge) {
                this.first = args[0]; // first edge in face or undefined
                this.last = args[1]; // last edge in face or undefined
                this.last.next = this.first;
                this.first.prev = this.last;
                this.box = this.getBox();
                this.orientation = this.getOrientation(); // face direction cw or ccw
            }
        }

        _createClass(Face, [{
            key: "append",
            value: function append(edge) {
                if (this.first === undefined) {
                    edge.prev = edge;
                    edge.next = edge;
                    this.first = edge;
                    this.last = edge;
                } else {
                    // append to end
                    edge.prev = this.last;
                    this.last.next = edge;

                    // update edge to be last
                    this.last = edge;

                    // restore circlar links
                    this.last.next = this.first;
                    this.first.prev = this.last;
                }
            }
        }, {
            key: "shapes2face",
            value: function shapes2face(edges, shapes) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = shapes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var shape = _step.value;

                        var edge = new Edge(shape);
                        this.append(edge);
                        this.box = this.box.merge(shape.box);
                        edges.add(edge);
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

                this.orientation = this.getOrientation(); // face direction cw or ccw
            }

            /**
             * Return the area of the polygon
             * @returns {number}
             */

        }, {
            key: "area",
            value: function area() {
                return Math.abs(this.signedArea());
            }
        }, {
            key: "signedArea",
            value: function signedArea() {
                var sArea = 0;
                var edge = this.first;
                do {
                    sArea += edge.shape.definiteIntegral(this.box.ymin);
                    edge = edge.next;
                } while (edge != this.first);
                return sArea;
            }

            /* According to Green theorem the area of a closed curve may be calculated as double integral,
            and the sign of the integral will be defined by the direction of the curve.
            When the integral ("signed area") will be negative, direction is counter clockwise,
            when positive - clockwise and when it is zero, polygon is not orientable.
            See http://mathinsight.org/greens_theorem_find_area
             */

        }, {
            key: "getOrientation",
            value: function getOrientation() {
                var area = this.signedArea();
                if (Flatten.Utils.EQ_0(area)) {
                    return Flatten.ORIENTATION.NOT_ORIENTABLE;
                }
                if (Flatten.Utils.LT(area, 0)) {
                    return Flatten.ORIENTATION.CCW;
                } else {
                    return Flatten.ORIENTATION.CW;
                }
            }
        }, {
            key: "getBox",
            value: function getBox() {
                var box = new Flatten.Box();

                var edge = this.first;
                do {
                    box = box.merge(edge.shape.box);
                    edge = edge.next;
                } while (edge != this.first);

                return box;
            }
        }, {
            key: "visit",
            value: function visit(callback) {
                var edge = this.first;
                do {
                    callback(edge);
                    edge = edge.next;
                } while (edge != this.first);
            }
        }, {
            key: "svg",
            value: function svg() {
                var edge = this.first;
                var svgStr = "\nM" + edge.start.x + "," + edge.start.y;

                do {
                    svgStr += edge.svg();
                    edge = edge.next;
                } while (edge !== this.first);

                svgStr += " z";
                return svgStr;
            }
        }], [{
            key: "points2segments",
            value: function points2segments(points) {
                var segments = [];
                for (var i = 0; i < points.length; i++) {
                    segments.push(new Segment(points[i], points[(i + 1) % points.length]));
                }
                return segments;
            }
        }]);

        return Face;
    }();
};