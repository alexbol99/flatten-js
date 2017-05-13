/**
 * Created by Alex Bol on 3/6/2017.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function (Flatten) {
    /**
     * Class representing a circle
     * @type {Circle}
     */
    Flatten.Circle = function () {
        /**
         *
         * @param {Point} pc - circle center point
         * @param {number} r - circle radius
         */
        function Circle(pc, r) {
            _classCallCheck(this, Circle);

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


        _createClass(Circle, [{
            key: "clone",
            value: function clone() {
                return new Flatten.Circle(this.pc.clone(), this.r);
            }

            /**
             * Circle center
             * @returns {Point}
             */

        }, {
            key: "contains",


            /**
             * Return true if circle contains point
             * @param {Point} pt - test point
             * @returns {boolean}
             */
            value: function contains(pt) {
                return Flatten.Utils.LE(pt.distanceTo(this.center), this.r);
            }

            /**
             * Returns array of intersection points between circle and other shape
             * @param shape
             * @returns {Point[]}
             */

        }, {
            key: "intersect",
            value: function intersect(shape) {
                if (shape instanceof Flatten.Line) {
                    return shape.intersect(this);
                }

                if (shape instanceof Flatten.Segment) {
                    return shape.intersect(this);
                }

                if (shape instanceof Flatten.Circle) {
                    return Circle.intersectCirle2Circle(this, shape);
                }

                if (shape instanceof Flatten.Arc) {
                    return shape.intersect(this);
                }
            }
        }, {
            key: "svg",


            /**
             * Return string to draw circle in svg
             * @param attrs - json structure with any attributes allowed to svg circle element,
             * like "stroke", "strokeWidth", "fill"
             * Defaults are stroke:"black", strokeWidth:"3", fill:"none"
             * @returns {string}
             */
            value: function svg() {
                var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { stroke: "black", strokeWidth: "3", fill: "none" };
                var stroke = attrs.stroke,
                    strokeWidth = attrs.strokeWidth,
                    fill = attrs.fill;

                return "\n<circle cx=\"" + this.pc.x + "\" cy=\"" + this.pc.y + "\" r=\"" + this.r + "\" stroke=\"" + stroke + "\" stroke-width=\"" + strokeWidth + "\" fill=\"" + fill + "\" />";
            }
        }, {
            key: "center",
            get: function get() {
                return this.pc;
            }

            /**
             * Circle bounding box
             * @returns {Box}
             */

        }, {
            key: "box",
            get: function get() {
                return new Flatten.Box(this.pc.x - this.r, this.pc.y - this.r, this.pc.x + this.r, this.pc.y + this.r);
            }
        }], [{
            key: "intersectCirle2Circle",
            value: function intersectCirle2Circle(circle1, circle2) {
                var ip = [];

                if (circle1.box.notIntersect(circle2.box)) {
                    return ip;
                }

                var vec = new Flatten.Vector(circle1.pc, circle2.pc);

                var r1 = circle1.r;
                var r2 = circle2.r;

                // Degenerated circle
                if (Flatten.Utils.EQ_0(r1) || Flatten.Utils.EQ_0(r2)) return ip;

                // In case of equal circles return one most left intersection points
                if (Flatten.Utils.EQ_0(vec.x) && Flatten.Utils.EQ_0(vec.y) && Flatten.Utils.EQ(r1, r2)) {
                    ip.push(new Flatten.Point(circle1.x - r1, circle1.y));
                    return ip;
                }

                var dist = circle1.pc.distanceTo(circle2.pc);

                if (Flatten.Utils.GT(dist, r1 + r2)) // circles too far, no intersections
                    return ip;

                if (Flatten.Utils.LT(dist, Math.abs(r1 - r2))) // one circle is contained within another, no intersections
                    return ip;

                // Normalize vector.
                vec.x /= dist;
                vec.y /= dist;

                var pt = void 0;

                // Case of touching from outside or from inside - single intersection point
                // TODO: check this specifically not sure if correct
                if (Flatten.Utils.EQ(dist, r1 + r2) || Flatten.Utils.EQ(dist, Math.abs(r1 - r2))) {
                    pt = circle1.pc.translate(r1 * vec.x, r1 * vec.y);
                    ip.push(pt);
                    return ip;
                }

                // Case of two intersection points

                // Distance from first center to center of common chord:
                //   a = (r1^2 - r2^2 + d^2) / 2d
                // Separate for better accuracy
                var a = r1 * r1 / (2 * dist) - r2 * r2 / (2 * dist) + dist / 2;

                var mid_pt = circle1.pc.translate(a * vec.x, a * vec.y);
                var h = Math.sqrt(r1 * r1 - a * a);
                // let norm;

                // norm = vec.rotate90CCW().multiply(h);
                pt = mid_pt.translate(vec.rotate90CCW().multiply(h));
                ip.push(pt);

                // norm = vec.rotate90CW();
                pt = mid_pt.translate(vec.rotate90CW().multiply(h));
                ip.push(pt);

                return ip;
            }
        }]);

        return Circle;
    }();

    /**
     * Function to create circle equivalent to "new" constructor
     * @param args
     */
    Flatten.circle = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return new (Function.prototype.bind.apply(Flatten.Circle, [null].concat(args)))();
    };
};