/**
 * Created by Alex Bol on 3/17/2017.
 */

module.exports = function(Flatten) {
    /**
     * Class representing an edge of polygon. Edge shape may be Segment or Arc
     * Each edge points to the next and previous edges in the face (loop)
     *
     * @type {Edge}
     */
    Flatten.Edge = class Edge {
        constructor(shape) {
            /**
             * Shape of the edge: Segment or Arc
             */
            this.shape = shape;
            /**
             * Pointer to the next edge in the face
             */
            this.next;
            /**
             * Pointer to the previous edge in the face
             */
            this.prev;
            /**
             * Pointer to the face containing this edge
             */
            this.face;
        }

        /**
         * Get edge start point
         */
        get start() {
            return this.shape.start;
        }

        /**
         * Get edge end point
         */
        get end() {
            return this.shape.end;
        }

        /**
         * Get edge length
         */
        get length() {
            return this.shape.length;
        }

        /**
         * Get bounding box of the edge
         * @returns {*|Box}
         */
        get box() {
            return this.shape.box;
        }

        /**
         * Returns true if point lays on the edge, false otherwise
         * @param pt - test point
         */
        contains(pt) {
            return this.shape.contains(pt);
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