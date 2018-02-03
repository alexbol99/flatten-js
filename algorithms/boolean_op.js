/**
 * Created by Alex Bol on 3/10/2017.
 */

"use strict";

module.exports = function (Flatten) {
    let {Point, Segment, Arc, Circle, Line, Ray, Vector} = Flatten;
    let {Polygon, Face, Edge} = Flatten;

    const NOT_VERTEX = 0;
    const START_VERTEX = 1;
    const END_VERTEX = 2;

    Flatten.BooleanOp = class BooleanOp {
        static booleanOp(operands) {
            let res_poly = new Polygon();
            for (let [wrk_poly, op] of operands) {
                BooleanOp.booleanOpBinary(res_poly, wrk_poly, op);
            }
            return res_poly;
        }

        static booleanOpBinary(res_poly, wrk_poly, op) {
            BooleanOp.clip(res_poly, wrk_poly, op);
        }

        static union(polygon1, polygon2) {
            let res_poly = polygon1.clone();
            BooleanOp.booleanOpBinary(res_poly, polygon2, Flatten.BOOLEAN_UNION);
            return res_poly;
        }

        static subtract(polygon1, polygon2) {
            let res_poly = polygon1.clone();
            BooleanOp.booleanOpBinary(res_poly, polygon2, Flatten.BOOLEAN_SUBTRACT);
            return res_poly;
        }

        static intersect(polygon1, polygon2) {
            let res_poly = polygon1.clone();
            BooleanOp.booleanOpBinary(res_poly, polygon2, Flatten.BOOLEAN_INTERSECT);
            return res_poly;
        }

        static arrange(polygon1, polygon2) {
            // get intersection points
            let intersections = BooleanOp.getIntersections(polygon1, polygon2);

            // sort intersection points
            BooleanOp.sortIntersections(intersections);

            // split by intersection points
            BooleanOp.splitByIntersections(polygon1, intersections.int_points1_sorted);
            BooleanOp.splitByIntersections(polygon2, intersections.int_points2_sorted);
        }

        static clip(res_poly, wrk_poly, op) {
            // get intersection points
            let intersections = BooleanOp.getIntersections(res_poly, wrk_poly);

            // sort intersection points
            BooleanOp.sortIntersections(intersections);

            // split by intersection points
            BooleanOp.splitByIntersections(res_poly, intersections.int_points1_sorted);
            BooleanOp.splitByIntersections(wrk_poly, intersections.int_points2_sorted);

            // filter duplicated intersection points
            BooleanOp.filterDuplicatedIntersections(intersections);

            // remove not relevant not intersected faces from res_polygon
            // if op == UNION, remove faces that are included in wrk_polygon without intersection
            // if op == INTERSECT, remove faces that are not included into wrk_polygon
            BooleanOp.removeNotRelevantNotIntersectedFaces(res_poly, wrk_poly, op, intersections.int_points1);
            BooleanOp.removeNotRelevantNotIntersectedFaces(wrk_poly, res_poly, op, intersections.int_points2);

            // initialize inclusion flags for edges incident to intersections
            BooleanOp.initializeInclusionFlags(intersections.int_points1);
            BooleanOp.initializeInclusionFlags(intersections.int_points2);

            // calculate inclusion flags only for edges incident to intersections
            BooleanOp.calculateInclusionFlags(intersections.int_points1, wrk_poly);
            BooleanOp.calculateInclusionFlags(intersections.int_points2, res_poly);

            // TODO: fix bondary conflicts

            // Set overlapping flags for boundary chains: SAME or OPPOSITE
            BooleanOp.setOverlappingFlags(intersections);

            // remove not relevant chains between intersection points
            BooleanOp.removeNotRelevantChains(res_poly, op, intersections.int_points1_sorted, true);
            BooleanOp.removeNotRelevantChains(wrk_poly, op, intersections.int_points2_sorted, false);

            // add edges of wrk_poly into the edge container of res_poly
            BooleanOp.copyWrkToRes(res_poly, wrk_poly, op, intersections.int_points2);

            // swap links from res_poly to wrk_poly and vice versa
            BooleanOp.swapLinks(res_poly, wrk_poly, intersections);

            // remove old faces
            BooleanOp.removeOldFaces(res_poly, intersections.int_points1);
            BooleanOp.removeOldFaces(wrk_poly, intersections.int_points2);

            // restore faces
            BooleanOp.restoreFaces(res_poly, intersections.int_points1, intersections.int_points2);
            BooleanOp.restoreFaces(res_poly, intersections.int_points2, intersections.int_points1);
        }

        static getIntersections(polygon1, polygon2) {
            let intersections = {
                int_points1: [],
                int_points2: []
            };

            // calculate intersections
            for (let edge1 of polygon1.edges) {

                // request edges of polygon2 in the box of edge1
                let resp = polygon2.edges.search(edge1.box);

                // for each edge2 in response
                for (let edge2 of resp) {

                    // calculate intersections between edge1 and edge2
                    let ip = edge1.shape.intersect(edge2.shape);

                    // for each intersection point
                    for (let pt of ip) {
                        BooleanOp.addToIntPoints(edge1, pt, intersections.int_points1);
                        BooleanOp.addToIntPoints(edge2, pt, intersections.int_points2);
                    }
                }
            }
            return intersections;
        }

        static addToIntPoints(edge, pt, int_points) {
            let id = int_points.length;
            let split = edge.shape.split(pt);
            if (split.length === 0) return;     // Means point does not belong to edge
            let len = 0;
            if (split.length === 1) {           // Edge was not split
                if (edge.shape.start.equalTo(pt)) {
                    len = 0;
                }
                else if (edge.shape.end.equalTo(pt)) {
                    len = edge.shape.length;
                }
            }
            else {                             // Edge was split into to edges
                len = split[0].length;
            }
            let is_vertex = NOT_VERTEX;
            if (Flatten.Utils.EQ(len, 0)) {
                is_vertex |= START_VERTEX;
            }
            if (Flatten.Utils.EQ(len, edge.shape.length)) {
                is_vertex |= END_VERTEX;
            }
            // Fix intersection point which is end point of the last edge
            let arc_length = (is_vertex & END_VERTEX) && edge.next.arc_length === 0 ? 0 : edge.arc_length + len;

            int_points.push({
                id: id,
                pt: pt,
                arc_length: arc_length,
                edge_before: edge,
                edge_after: undefined,
                face: edge.face,
                is_vertex: is_vertex
            });
        }

        static sortIntersections(intersections) {
            if (intersections.int_points1.length === 0) return;
            // augment intersections with new sorted arrays
            intersections.int_points1_sorted = intersections.int_points1.slice().sort(BooleanOp.compareFn);
            intersections.int_points2_sorted = intersections.int_points2.slice().sort(BooleanOp.compareFn);
        }

        static compareFn(ip1, ip2) {
            // TODO: sort by chain id
            if (Flatten.Utils.LT(ip1.arc_length, ip2.arc_length)) {
                return -1;
            }
            if (Flatten.Utils.GT(ip1.arc_length, ip2.arc_length)) {
                return 1;
            }
            return 0;
        }

        static splitByIntersections(polygon, int_points) {
            if (!int_points) return;
            for (let int_point of int_points) {
                let edge = int_point.edge_before;

                // recalculate vertex flag: it may be changed after previous split
                if (edge.shape.start.equalTo(int_point.pt)) {
                    int_point.is_vertex |= START_VERTEX;
                }
                if (edge.shape.end.equalTo(int_point.pt)) {
                    int_point.is_vertex |= END_VERTEX;
                }

                if (int_point.is_vertex & START_VERTEX) {  // nothing to split
                    int_point.edge_before = edge.prev;
                    int_point.is_vertex = END_VERTEX;
                    continue;
                }
                if (int_point.is_vertex & END_VERTEX) {    // nothing to split
                    continue;
                }

                let newEdge = polygon.addVertex(int_point.pt, edge);
                int_point.edge_before = newEdge;
            }

            for (let int_point of int_points) {
                int_point.edge_after = int_point.edge_before.next;
            }
        }

        static filterDuplicatedIntersections(intersections) {
            if (intersections.int_points1.length < 2) return;

            let do_squeeze = false;

            let int_point_ref1 = intersections.int_points1_sorted[0];
            let int_point_ref2 = intersections.int_points2[int_point_ref1.id];
            for (let i = 1; i < intersections.int_points1_sorted.length; i++) {
                let int_point_cur1 = intersections.int_points1_sorted[i];

                if (!Flatten.Utils.EQ(int_point_cur1.arc_length, int_point_ref1.arc_length)) {
                    int_point_ref1 = int_point_cur1;
                    int_point_ref2 = intersections.int_points2[int_point_ref1.id];
                    continue;
                }

                /* Same length: int_point_cur1->arc_len == int_point_ref1->arc_len */
                /* Ensure this is intersection between same edges from the same face */
                let int_point_cur2 = intersections.int_points2[int_point_cur1.id];
                if (int_point_cur1.edge_before === int_point_ref1.edge_before &&
                    int_point_cur1.edge_after === int_point_ref1.edge_after &&
                    int_point_cur2.edge_before === int_point_ref2.edge_before &&
                    int_point_cur2.edge_after === int_point_ref2.edge_after) {
                    int_point_cur1.id = -1;
                    /* to be deleted */
                    int_point_cur2.id = -1;
                    /* to be deleted */
                    do_squeeze = true;
                }
            }

            int_point_ref2 = intersections.int_points2_sorted[0];
            int_point_ref1 = intersections.int_points1[int_point_ref2.id];
            for (let i = 1; i < intersections.int_points2_sorted.length; i++) {
                let int_point_cur2 = intersections.int_points2_sorted[i];

                if (int_point_cur2.id == -1) continue;
                /* already deleted */

                if (int_point_ref2.id == -1 || /* can't be reference if already deleted */
                    !(Flatten.Utils.EQ(int_point_cur2.arc_length, int_point_ref2.arc_length))) {
                    int_point_ref2 = int_point_cur2;
                    int_point_ref1 = intersections.int_points1[int_point_ref2.id];
                    continue;
                }

                let int_point_cur1 = intersections.int_points1[int_point_cur2.id];
                if (int_point_cur1.edge_before === int_point_ref1.edge_before &&
                    int_point_cur1.edge_after === int_point_ref1.edge_after &&
                    int_point_cur2.edge_before === int_point_ref2.edge_before &&
                    int_point_cur2.edge_after === int_point_ref2.edge_after) {
                    int_point_cur1.id = -1;
                    /* to be deleted */
                    int_point_cur2.id = -1;
                    /* to be deleted */
                    do_squeeze = true;
                }
            }

            if (do_squeeze) {
                intersections.int_points1 = intersections.int_points1.filter((int_point) => int_point.id >= 0);
                intersections.int_points2 = intersections.int_points2.filter((int_point) => int_point.id >= 0);

                // update id's
                intersections.int_points1.forEach((int_point, index) => int_point.id = index);
                intersections.int_points2.forEach((int_point, index) => int_point.id = index);

                // re-create sorted
                intersections.int_points1_sorted = [];
                intersections.int_points2_sorted = [];
                BooleanOp.sortIntersections(intersections);
            }
        }

        static removeNotRelevantNotIntersectedFaces(poly1, poly2, op, int_points1) {
            let toBeDeleted = [];
            for (let face of poly1.faces) {
                if (!int_points1.find((ip) => ip.face === face)) {
                    let rel = face.getRelation(poly2);
                    if (op === Flatten.BOOLEAN_UNION && rel === Flatten.INSIDE) {
                        toBeDeleted.push(face);
                    }
                    else if (op === Flatten.BOOLEAN_INTERSECT && rel === Flatten.OUTSIDE) {
                        toBeDeleted.push(face);
                    }
                }
            }
            for (let i = 0; i < toBeDeleted.length; i++) {
                poly1.deleteFace(toBeDeleted[i]);
            }
        }

        static initializeInclusionFlags(int_points) {
            for (let int_point of int_points) {
                int_point.edge_before.bvStart = undefined;
                int_point.edge_before.bvEnd = undefined;
                int_point.edge_before.bv = undefined;
                int_point.edge_before.overlap = undefined;

                int_point.edge_after.bvStart = undefined;
                int_point.edge_after.bvEnd = undefined;
                int_point.edge_after.bv = undefined;
                int_point.edge_after.overlap = undefined;
            }

            for (let int_point of int_points) {
                int_point.edge_before.bvEnd = Flatten.BOUNDARY;
                int_point.edge_after.bvStart = Flatten.BOUNDARY;
            }
        }

        static calculateInclusionFlags(int_points, polygon) {
            for (let int_point of int_points) {
                int_point.edge_before.setInclusion(polygon);
                int_point.edge_after.setInclusion(polygon);
            }
        }

        static setOverlappingFlags(intersections) {
            let cur_face = undefined;
            let first_int_point_in_face = undefined;
            let next_int_point1 = undefined;
            let num_int_points = intersections.int_points1.length;

            for (let i = 0; i < num_int_points; i++) {
                let cur_int_point1 = intersections.int_points1_sorted[i];

                // Find boundary chain in the polygon1
                if (cur_int_point1.face !== cur_face) {                               // next chain started
                    first_int_point_in_face = i;
                    cur_face = cur_int_point1.face;
                }

                if (i + 1 === num_int_points) {                                         // last int point in array
                    next_int_point1 = first_int_point_in_face;
                }
                else if (intersections.int_points1_sorted[i + 1].face !== cur_face) {   // last int point in chain
                    next_int_point1 = first_int_point_in_face;
                }
                else {                                                                // not a last point in chain
                    next_int_point1 = intersections.int_points1_sorted[i + 1];
                }

                let edge_from1 = cur_int_point1.edge_after;
                let edge_to1 = next_int_point1.edge_before;

                if (!(edge_from1.bv === Flatten.BOUNDARY && edge_to1.bv === Flatten.BOUNDARY))      // not a boundary chain - skip
                    continue;

                if (edge_from1 !== edge_to1)                    //  one edge chain    TODO: support complex case
                    continue;


                /* Find boundary chain in polygon2 between same intersection points */
                let cur_int_point2 = intersections.int_points2[cur_int_point1.id];
                let next_int_point2 = intersections.int_points2[next_int_point1.id];

                let edge_from2 = cur_int_point2.edge_after;
                let edge_to2 = next_int_point2.edge_before;

                /* if [edge_from2..edge_to2] is not a boundary chain, invert it */
                /* check also that chain consist of one or two edges */
                if (!(edge_from2.bv === Flatten.BOUNDARY && edge_to2.bv === Flatten.BOUNDARY && edge_from2 === edge_to2)) {
                    cur_int_point2 = intersections.int_points2[next_int_point1.id];
                    next_int_point2 = intersections.int_points2[cur_int_point1.id];

                    edge_from2 = cur_int_point2.edge_after;
                    edge_to2 = next_int_point2.edge_before;
                }

                if (!(edge_from2.bv === Flatten.BOUNDARY && edge_to2.bv === Flatten.BOUNDARY && edge_from2 === edge_to2))
                    continue;                           // not an overlapping chain - skip   TODO: fix boundary conflict

                // Set overlapping flag - one-to-one case
                let flag = BooleanOp.edge2edgeOverlappingFlag(edge_from1.shape, edge_from2.shape);
                /* Do not update overlap flag if already set on previous chain */
                if (edge_from1.overlap === undefined) edge_from1.overlap = flag;
                if (edge_from2.overlap === undefined) edge_from2.overlap = flag;
            }
        }

        static edge2edgeOverlappingFlag(shape1, shape2) {
            let flag = undefined;
            if (shape1 instanceof Flatten.Segment && shape2 instanceof Flatten.Segment) {
                if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end)) {
                    flag = Flatten.OVERLAP_SAME;
                }
                else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start)) {
                    flag = Flatten.OVERLAP_OPPOSITE;
                }
            }
            else if (shape1 instanceof Flatten.Arc && shape2 instanceof Flatten.Arc) {
                if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end) && shape1.counterClockwise === shape2.counterClockwise &&
                    shape1.middle().equalTo(shape2.middle()) ) {
                    flag = Flatten.OVERLAP_SAME;
                }
                else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start) && shape1.counterClockwise !== shape2.counterClockwise &&
                    shape1.middle().equalTo(shape2.middle()) ) {
                    flag = Flatten.OVERLAP_OPPOSITE;
                }
            }
            else if (shape1 instanceof Flatten.Segment && shape2 instanceof Flatten.Arc ||
                shape1 instanceof Flatten.Arc && shape2 instanceof Flatten.Segment) {
                if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end) && shape1.middle().equalTo(shape2.middle()) ) {
                    flag = Flatten.OVERLAP_SAME;
                }
                else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start) && shape1.middle().equalTo(shape2.middle()) ) {
                    flag = Flatten.OVERLAP_OPPOSITE;
                }
            }
            return flag;
        }

        static removeNotRelevantChains(polygon, op, int_points, is_res_polygon) {
            if (!int_points) return;
            for (let i = 0; i < int_points.length; i++) {
                // TODO: Support claster of duplicated points with same <x,y> came from different faces

                let int_point_current = int_points[i];
                let int_point_next = int_points[(i + 1) % int_points.length];

                let edge_from = int_point_current.edge_after;
                let edge_to = int_point_next.edge_before;

                let face = int_point_current.face;

                if ((edge_from.bv === Flatten.INSIDE && edge_to.bv === Flatten.INSIDE && op === Flatten.BOOLEAN_UNION) ||
                    (edge_from.bv === Flatten.OUTSIDE && edge_to.bv === Flatten.OUTSIDE && op === Flatten.BOOLEAN_INTERSECT) ||
                    ((edge_from.bv === Flatten.OUTSIDE || edge_to.bv === Flatten.OUTSIDE) && op === Flatten.BOOLEAN_SUBTRACT && !is_res_polygon) ||
                    ((edge_from.bv === Flatten.INSIDE || edge_to.bv === Flatten.INSIDE) && op === Flatten.BOOLEAN_SUBTRACT && is_res_polygon) ||
                    (edge_from.bv === Flatten.BOUNDARY && edge_to.bv === Flatten.BOUNDARY && (edge_from.overlap & Flatten.OVERLAP_SAME) && is_res_polygon) ||
                    (edge_from.bv === Flatten.BOUNDARY && edge_to.bve === Flatten.BOUNDARY && (edge_from.overlap & Flatten.OPPOSITE) )) {

                    polygon.removeChain(face, edge_from, edge_to);

                    int_point_current.edge_after = undefined;
                    int_point_next.edge_before = undefined;
                }
            }
        };

        static copyWrkToRes(res_polygon, wrk_polygon, op, int_points) {
            for (let face of wrk_polygon.faces) {
                for (let edge of face) {
                    res_polygon.edges.add(edge);
                }
                // If union - add face from wrk_polygon that is not intersected with res_polygon
                if (op === Flatten.BOOLEAN_UNION &&
                    int_points && int_points.find((ip) => (ip.face === face)) === undefined) {
                    res_polygon.addFace(face.first, face.last);
                }
            }
        }

        static swapLinks(res_polygon, wrk_polygon, intersections) {
            if (intersections.int_points1.length === 0) return;

            for (let i = 0; i < intersections.int_points1.length; i++) {
                let int_point1 = intersections.int_points1[i];
                let int_point2 = intersections.int_points2[i];

                // Simple case - find continuation on the other polygon

                // Process edge from res_polygon
                if (int_point1.edge_before !== undefined && int_point1.edge_after === undefined) {    // swap need
                    if (int_point2.edge_before === undefined && int_point2.edge_after !== undefined) {  // simple case
                        // Connect edges
                        int_point1.edge_before.next = int_point2.edge_after;
                        int_point2.edge_after.prev = int_point1.edge_before;

                        // Fill in missed links in intersection points
                        int_point1.edge_after = int_point2.edge_after;
                        int_point2.edge_before = int_point1.edge_before;
                    }
                }
                // Process edge from wrk_polygon
                if (int_point2.edge_before !== undefined && int_point2.edge_after === undefined) {    // swap need
                    if (int_point1.edge_before === undefined && int_point1.edge_after !== undefined) {  // simple case
                        // Connect edges
                        int_point2.edge_before.next = int_point1.edge_after;
                        int_point1.edge_after.prev = int_point2.edge_before;

                        // Complete missed links
                        int_point2.edge_after = int_point1.edge_after;
                        int_point1.edge_before = int_point2.edge_before;
                    }
                }

                // Continuation not found - complex case
                // Continuation will be found on the same polygon.
                // It happens when intersection point is actually touching point
                // Polygon1
                if (int_point1.edge_before !== undefined && int_point1.edge_after === undefined) {    // still swap need
                    for (let int_point of intersections.int_points1_sorted) {
                        if (int_point === int_point1) continue;     // skip same
                        if (int_point.edge_before === undefined && int_point.edge_after !== undefined) {
                            if (int_point.pt.equalTo(int_point1.pt)) {
                                // Connect edges
                                int_point1.edge_before.next = int_point.edge_after;
                                int_point.edge_after.prev = int_point1.edge_before;

                                // Complete missed links
                                int_point1.edge_after = int_point.edge_after;
                                int_point.edge_before = int_point1.edge_before;
                            }
                        }
                    }
                }
                // Polygon2
                if (int_point2.edge_before !== undefined && int_point2.edge_after === undefined) {    // still swap need
                    for (let int_point of intersections.int_points2_sorted) {
                        if (int_point === int_point2) continue;     // skip same
                        if (int_point.edge_before === undefined && int_point.edge_after !== undefined) {
                            if (int_point.pt.equalTo(int_point2.pt)) {
                                // Connect edges
                                int_point2.edge_before.next = int_point.edge_after;
                                int_point.edge_after.prev = int_point2.edge_before;

                                // Complete missed links
                                int_point2.edge_after = int_point.edge_after;
                                int_point.edge_before = int_point2.edge_before;
                            }
                        }
                    }
                }
            }
            // Sanity check that no dead ends left
        }

        static removeOldFaces(polygon, int_points) {
            for (let int_point of int_points) {
                polygon.faces.delete(int_point.face);
                int_point.face = undefined;
                if (int_point.edge_before)
                    int_point.edge_before.face = undefined;
                if (int_point.edge_after)
                    int_point.edge_after.face = undefined;
            }
        }

        static restoreFaces(polygon, int_points, other_int_points) {
            // For each intersection point - create new chain
            for (let int_point of int_points) {
                if (int_point.edge_before === undefined || int_point.edge_after === undefined)  // completely deleted
                    continue;
                if (int_point.face)            // already restored
                    continue;

                if (int_point.edge_after.face || int_point.edge_before.face)        // Chain already created. Possible case in duplicated intersection points
                    continue;

                let first = int_point.edge_after;      // face start
                let last = int_point.edge_before;      // face end;

                let face = polygon.addFace(first, last);

                // Mark intersection points from the newly create face
                // to avoid multiple creation of the same face
                // Chain number was assigned to each edge of new face in addFace function
                for (let int_point_tmp of int_points) {
                    if (int_point_tmp.edge_before && int_point_tmp.edge_after &&
                        int_point_tmp.edge_before.face === face && int_point_tmp.edge_after.face === face) {
                        int_point_tmp.face = face;
                    }
                }
                // Mark other intersection points as well
                for (let int_point_tmp of other_int_points) {
                    if (int_point_tmp.edge_before && int_point_tmp.edge_after &&
                        int_point_tmp.edge_before.face === face && int_point_tmp.edge_after.face === face) {
                        int_point_tmp.face = face;
                    }
                }
            }
        }
    };
}