"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Alex Bol on 3/17/2017.
 */

module.exports = function (Flatten) {
    Flatten.Edge = function () {
        function Edge(shape) {
            _classCallCheck(this, Edge);

            this.shape = shape;
            this.next;
            this.prev;
        }

        _createClass(Edge, [{
            key: "svg",
            value: function svg() {
                if (this.shape instanceof Flatten.Segment) {
                    return " L" + this.shape.end.x + "," + this.shape.end.y;
                } else if (this.shape instanceof Flatten.Arc) {
                    var arc = this.shape;
                    var largeArcFlag = void 0;
                    var sweepFlag = arc.counterClockwise ? "1" : "0";

                    // Draw full circe arc as special case: split it into two half-circles
                    if (Flatten.Utils.EQ(arc.sweep, 2 * Math.PI)) {
                        var sign = arc.counterClockwise ? 1 : -1;
                        var halfArc1 = new Flatten.Arc(arc.pc, arc.r, arc.startAngle, arc.startAngle + sign * Math.PI, arc.counterClockwise);
                        var halfArc2 = new Flatten.Arc(arc.pc, arc.r, arc.startAngle + sign * Math.PI, arc.endAngle, arc.counterClockwise);

                        largeArcFlag = "0";

                        return " A" + halfArc1.r + "," + halfArc1.r + " 0 " + largeArcFlag + "," + sweepFlag + " " + halfArc1.end.x + "," + halfArc1.end.y + "\n                    A" + halfArc2.r + "," + halfArc2.r + " 0 " + largeArcFlag + "," + sweepFlag + " " + halfArc2.end.x + "," + halfArc2.end.y;
                    } else {
                        largeArcFlag = arc.sweep <= Math.PI ? "0" : "1";

                        return " A" + arc.r + "," + arc.r + " 0 " + largeArcFlag + "," + sweepFlag + " " + arc.end.x + "," + arc.end.y;
                    }
                }
            }
        }, {
            key: "start",
            get: function get() {
                return this.shape.start;
            }
        }, {
            key: "end",
            get: function get() {
                return this.shape.end;
            }
        }, {
            key: "length",
            get: function get() {
                return this.shape.length;
            }
        }]);

        return Edge;
    }();
};