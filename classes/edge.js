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
             * @type {Face}
             */
            this.face;
            /**
             * "Arc distance" from the face start
             * @type {number}
             */
            this.arc_length = 0;
            /**
             * Start inclusion flag (inside/outside/boundary)
             * @type {Boolean}
             */
            this.bvStart = undefined;
            /**
             * End inclusion flag (inside/outside/boundary)
             * @type {Boolean}
             */
            this.bvEnd = undefined;
            /**
             * Edge inclusion flag (inside/outside/boundary)
             * @type {Boolean}
             */
            this.bv = undefined;
            /**
             * Overlap flag for boundary edge (same/opposite)
             * @type {undefined}
             */
            this.overlap = undefined;
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
         * Get middle point of the edge
         * @returns {Point}
         */
        middle() {
            return this.shape.middle();
        }

        /**
         * Returns true if point lays on the edge, false otherwise
         * @param pt - test point
         */
        contains(pt) {
            return this.shape.contains(pt);
        }

        /**
         * Set inclusion flag of the edge with respect to another polygon
         * @param polygon
         */
        setInclusion(polygon) {
            if (this.bv !== undefined) return this.bv;

            if (this.bvStart === undefined) {
                this.bvStart = Flatten.ray_shoot(polygon, this.start);
            }
            if (this.bvEnd === undefined) {
                this.bvEnd = Flatten.ray_shoot(polygon, this.end);
            }
            /* At least one end outside - the whole edge outside */
            if (this.bvStart === Flatten.OUTSIDE || this.bvEnd == Flatten.OUTSIDE) {
                this.bv = Flatten.OUTSIDE;
            }
            /* At least one end inside - the whole edge inside */
            else if (this.bvStart === Flatten.INSIDE || this.bvEnd == Flatten.INSIDE) {
                this.bv = Flatten.INSIDE;
            }
            /* Both are boundary - check the middle point */
            else {
                let bvMiddle = Flatten.ray_shoot(polygon, this.middle());
                this.bv = bvMiddle;
            }
            return this.bv;
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