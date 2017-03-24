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
                let largeArcFlag = arc.sweep <= Math.PI ? "0" : "1";
                let sweepFlag = arc.counterClockwise ? "1" : "0";

                if (Flatten.Utils.EQ(arc.sweep, 2*Math.PI)) {  // TODO
                    // let circle = new Flatten.Circle(this.pc, this.r);
                    // return circle.svg(attrs);
                }
                else {
                    return ` A${arc.r},${arc.r} 0 ${largeArcFlag},${sweepFlag} ${arc.end.x},${arc.end.y}`;
                }
            }
        }
    };
};