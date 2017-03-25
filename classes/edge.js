/**
 * Created by Alex Bol on 3/17/2017.
 */

module.exports = function(Flatten) {
    Flatten.Edge = class Edge {
        constructor(shape) {
            this.shape = shape;
            this.next;
            this.prev;
        }

        get start() {
            return this.shape.start;
        }

        get end() {
            return this.shape.end;
        }

        get length() {
            return this.shape.length;
        }

        svg() {
            if (this.shape instanceof Flatten.Segment) {
                return ` L${this.shape.end.x},${this.shape.end.y}`;
            }
            else if (this.shape instanceof  Flatten.Arc) {
                let arc = this.shape;
                let largeArcFlag;
                let sweepFlag = arc.counterClockwise ? "1" : "0";

                // Draw full circe arc as special case: split it into two half-circles
                if (Flatten.Utils.EQ(arc.sweep, 2*Math.PI)) {
                    let sign = arc.counterClockwise ? 1 : -1;
                    let halfArc1 = new Flatten.Arc(arc.pc, arc.r, arc.startAngle, arc.startAngle + sign*Math.PI, arc.counterClockwise);
                    let halfArc2 = new Flatten.Arc(arc.pc, arc.r, arc.startAngle + sign*Math.PI, arc.endAngle, arc.counterClockwise);

                    largeArcFlag = "0";

                    return ` A${halfArc1.r},${halfArc1.r} 0 ${largeArcFlag},${sweepFlag} ${halfArc1.end.x},${halfArc1.end.y}
                    A${halfArc2.r},${halfArc2.r} 0 ${largeArcFlag},${sweepFlag} ${halfArc2.end.x},${halfArc2.end.y}`
                }
                else {
                    largeArcFlag = arc.sweep <= Math.PI ? "0" : "1";

                    return ` A${arc.r},${arc.r} 0 ${largeArcFlag},${sweepFlag} ${arc.end.x},${arc.end.y}`;
                }
            }
        }
    };
};