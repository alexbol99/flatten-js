/**
 * Created by Alex Bol on 3/17/2017.
 */

import {ray_shoot} from "../algorithms/ray_shooting";

import {EQ} from '../utils/utils'

import {
  BOUNDARY,
  INSIDE,
  OUTSIDE,
  OVERLAP_OPPOSITE,
  OVERLAP_SAME,
} from '../utils/constants';

import {Arc} from './arc';
import {Segment} from './segment';
import {Line} from './line';
import {Ray} from './ray';

/**
 * Class representing an edge of polygon. Edge shape may be Segment or Arc.
 * Each edge contains references to the next and previous edges in the face of the polygon.
 *
 * @type {Edge}
 */
export class Edge {
    /**
     * Construct new instance of edge
     * @param {Shape} shape Shape of type Segment or Arc
     */
    constructor(shape) {
        /**
         * Shape of the edge: Segment or Arc
         * @type {Segment|Arc}
         */
        this.shape = shape;
        /**
         * Pointer to the next edge in the face
         * @type {Edge}
         */
        this.next = undefined;
        /**
         * Pointer to the previous edge in the face
         * @type {Edge}
         */
        this.prev = undefined;
        /**
         * Pointer to the face containing this edge
         * @type {Face}
         */
        this.face = undefined;
        /**
         * "Arc distance" from the face start
         * @type {number}
         */
        this.arc_length = 0;
        /**
         * Start inclusion flag (inside/outside/boundary)
         * @type {*}
         */
        this.bvStart = undefined;
        /**
         * End inclusion flag (inside/outside/boundary)
         * @type {*}
         */
        this.bvEnd = undefined;
        /**
         * Edge inclusion flag (Flatten.INSIDE, Flatten.OUTSIDE, Flatten.BOUNDARY)
         * @type {*}
         */
        this.bv = undefined;
        /**
         * Overlap flag for boundary edge (Flatten.OVERLAP_SAME/Flatten.OVERLAP_OPPOSITE)
         * @type {*}
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
     * @returns {Box}
     */
    get box() {
        return this.shape.box;
    }

    isSegment() {
        return this.shape instanceof Segment;
    }

    isArc() {
        return this.shape instanceof Arc;
    }

    /**
     * Get middle point of the edge
     * @returns {Point}
     */
    middle() {
        return this.shape.middle();
    }

    /**
     * Returns true if point belongs to the edge, false otherwise
     * @param {Point} pt - test point
     */
    contains(pt) {
        return this.shape.contains(pt);
    }

    /**
     * Set inclusion flag of the edge with respect to another polygon
     * Inclusion flag is one of Flatten.INSIDE, Flatten.OUTSIDE, Flatten.BOUNDARY
     * @param polygon
     */
    setInclusion(polygon) {
        if (this.bv !== undefined) return this.bv;

        if (this.shape instanceof Line || this.shape instanceof Ray) {
            this.bv = OUTSIDE;
            return this.bv;
        }

        if (this.bvStart === undefined) {
            this.bvStart = ray_shoot(polygon, this.start);
        }
        if (this.bvEnd === undefined) {
            this.bvEnd = ray_shoot(polygon, this.end);
        }
        /* At least one end outside - the whole edge outside */
        if (this.bvStart === OUTSIDE || this.bvEnd == OUTSIDE) {
            this.bv = OUTSIDE;
        }
        /* At least one end inside - the whole edge inside */
        else if (this.bvStart === INSIDE || this.bvEnd == INSIDE) {
            this.bv = INSIDE;
        }
        /* Both are boundary - check the middle point */
        else {
            let bvMiddle = ray_shoot(polygon, this.middle());
            // let boundary = this.middle().distanceTo(polygon)[0] < 10*Flatten.DP_TOL;
            // let bvMiddle = boundary ? BOUNDARY : ray_shoot(polygon, this.middle());
            this.bv = bvMiddle;
        }
        return this.bv;
    }

    /**
     * Set overlapping between two coincident boundary edges
     * Overlapping flag is one of Flatten.OVERLAP_SAME or Flatten.OVERLAP_OPPOSITE
     * @param edge
     */
    setOverlap(edge) {
        let flag = undefined;
        let shape1 = this.shape;
        let shape2 = edge.shape;

        if (shape1 instanceof Segment && shape2 instanceof Segment) {
            if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end)) {
                flag = OVERLAP_SAME;
            } else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start)) {
                flag = OVERLAP_OPPOSITE;
            }
        } else if (shape1 instanceof Arc && shape2 instanceof Arc) {
            if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end) && /*shape1.counterClockwise === shape2.counterClockwise &&*/
                shape1.middle().equalTo(shape2.middle())) {
                flag = OVERLAP_SAME;
            } else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start) && /*shape1.counterClockwise !== shape2.counterClockwise &&*/
                shape1.middle().equalTo(shape2.middle())) {
                flag = OVERLAP_OPPOSITE;
            }
        } else if (shape1 instanceof Segment && shape2 instanceof Arc ||
            shape1 instanceof Arc && shape2 instanceof Segment) {
            if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end) && shape1.middle().equalTo(shape2.middle())) {
                flag = OVERLAP_SAME;
            } else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start) && shape1.middle().equalTo(shape2.middle())) {
                flag = OVERLAP_OPPOSITE;
            }
        }

        /* Do not update overlap flag if already set on previous chain */
        if (this.overlap === undefined) this.overlap = flag;
        if (edge.overlap === undefined) edge.overlap = flag;
    }

    svg() {
        if (this.shape instanceof Segment) {
            return ` L${this.shape.end.x},${this.shape.end.y}`;
        } else if (this.shape instanceof Arc) {
            let arc = this.shape;
            let largeArcFlag;
            let sweepFlag = arc.counterClockwise ? "1" : "0";

            // Draw full circe arc as special case: split it into two half-circles
            if (EQ(arc.sweep, 2 * Math.PI)) {
                let sign = arc.counterClockwise ? 1 : -1;
                let halfArc1 = new Arc(arc.pc, arc.r, arc.startAngle, arc.startAngle + sign * Math.PI, arc.counterClockwise);
                let halfArc2 = new Arc(arc.pc, arc.r, arc.startAngle + sign * Math.PI, arc.endAngle, arc.counterClockwise);

                largeArcFlag = "0";

                return ` A${halfArc1.r},${halfArc1.r} 0 ${largeArcFlag},${sweepFlag} ${halfArc1.end.x},${halfArc1.end.y}
                    A${halfArc2.r},${halfArc2.r} 0 ${largeArcFlag},${sweepFlag} ${halfArc2.end.x},${halfArc2.end.y}`
            } else {
                largeArcFlag = arc.sweep <= Math.PI ? "0" : "1";

                return ` A${arc.r},${arc.r} 0 ${largeArcFlag},${sweepFlag} ${arc.end.x},${arc.end.y}`;
            }
        }
    }

    toJSON() {
        return this.shape.toJSON();
    }
};
