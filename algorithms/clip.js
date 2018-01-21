"use strict";

module.exports = function(Flatten) {
    let {Polygon, Point, Segment, Arc, Face, Edge} = Flatten;

    const NOT_VERTEX = 0;
    const START_VERTEX = 1;
    const END_VERTEX = 2;

    /**
     * Clip segment or arc by polygon
     * @param shape - segment or arc
     * @param polygon
     * @param clip_inside_polygon - if true, remove part of shape inside polygon,
     * otherwise remove part of shape outside polygon
     */
    Flatten.clip = function (shape, polygon, clip_inside_flag) {
        let dummyPolygon = new Polygon();
        dummyPolygon.addFace([shape]);

        // get intersection points
        let intersections = getIntersections(dummyPolygon, polygon);

        // sort intersection points
        sortIntersections(intersections);

        // split by intersection points
        splitByIntersections(dummyPolygon, intersections.int_points1_sorted);
        splitByIntersections(polygon, intersections.int_points2_sorted);

        // filter duplicated intersection points
        filterDuplicatedIntersections(intersections);

        // initialize inclusion flags for edges incident to intersections
        initializeInclusionFlags(intersections.int_points1);
        initializeInclusionFlags(intersections.int_points2);

        // Calculate inclusion flags only for edges incident to intersections
        calculateInclusionFlags(intersections.int_points1, polygon);

        // TODO: fix bondary conflicts

        // TODO: set overlaping flags

        // remove not relevant chains between intersection points
        removeNotRelevantChains(dummyPolygon, clip_inside_flag, intersections.int_points1_sorted);

        let resp = [];
        for (let face of dummyPolygon.faces) {
            for (let edge of face) {
                resp.push(edge.shape);
            }
        }
        return resp;
    };

    function getIntersections(polygon1, polygon2) {
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
                    addToIntPoints(edge1, pt, intersections.int_points1);
                    addToIntPoints(edge2, pt, intersections.int_points2);
                }
            }
        }

        return intersections;
    }

    function addToIntPoints(edge, pt, int_points) {
        let id = int_points.num;
        let split = edge.shape.split(pt);
        let len = split.length === 0 ? 0 : split[0].length;
        let is_vertex = NOT_VERTEX;
        if (Flatten.Utils.EQ(len,0)) {
            is_vertex |= START_VERTEX;
        }
        if (Flatten.Utils.EQ(len, edge.shape.length)) {
            is_vertex |= END_VERTEX;
        }
        // Fix intersection point which is end point of the last edge
        let arc_length =  (is_vertex & END_VERTEX) && edge.next.arc_length === 0 ? 0 : edge.arc_length + len;

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

    function sortIntersections(intersections) {
        if (intersections.int_points1.length === 0) return;
        // augment intersections with new sorted arrays
        intersections.int_points1_sorted = intersections.int_points1.slice().sort(compareFn);
        intersections.int_points2_sorted = intersections.int_points2.slice().sort(compareFn);
    }

    function compareFn(ip1, ip2) {
        // TODO: sort by chain id
        if (Flatten.Utils.LT(ip1.arc_length, ip2.arc_length)) {
            return -1;
        }
        if (Flatten.Utils.GT(ip1.arc_length, ip2.arc_length)) {
            return 1;
        }
        return 0;
    }

    function splitByIntersections(polygon, int_points) {
        for (let int_point of int_points) {
            let edge = int_point.edge_before;

            // TODO: recalculate vertex flag: it may be changed after previous split

            if (int_point.is_vertex & START_VERTEX) {  // nothing to split
                int_point.edge_before = edge.prev;
                int_point.is_vertex = END_VERTEX;
                return;
            }
            if (int_point.is_vertex & END_VERTEX) {    // nothing to split
                return;
            }

            let newEdge = polygon.addVertex(int_point.pt, edge);
            int_point.edge_before = newEdge;
        }

        for (let int_point of int_points) {
            int_point.edge_after = int_point.edge_before.next;
        }
    }

    function filterDuplicatedIntersections(intersections) {
        if (intersections.int_points1.length < 2) return;

        let do_squeeze = false;

        let int_point_ref1 = intersections.int_points1_sorted[0];
        let int_point_ref2 = intersections.int_points2[int_point_ref1.id];
        for (let i=1; i < intersections.int_points1_sorted.length; i++) {
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
                int_point_cur1.id = -1;       /* to be deleted */
                int_point_cur2.id = -1;       /* to be deleted */
                do_squeeze = true;
            }
        }

        int_point_ref2 = intersections.int_points2_sorted[0];
        int_point_ref1 = intersections.int_points1[int_point_ref2.id];
        for (let i=1; i < intersections.int_points2_sorted.legth; i++) {
            let int_point_cur2 = intersections.int_points2_sorted[i];

            if (int_point_cur2.id == -1) continue;     /* already deleted */

            if ( int_point_ref2.id == -1 ||            /* can't be reference if already deleted */
                    !(Flatten.Utils.EQ(int_point_cur2.arc_length, int_point_ref2.arc_length)) ) {
                int_point_ref2 = int_point_cur2;
                int_point_ref1 = intersections.int_points1[int_point_ref2.id];
                continue;
            }

            let int_point_cur1 = intersections.int_points1[int_point_cur2.id];
            if (int_point_cur1.edge_before === int_point_ref1.edge_before &&
            int_point_cur1.edge_after === int_point_ref1.edge_after &&
            int_point_cur2.edge_before === int_point_ref2.edge_before &&
            int_point_cur2.edge_after === int_point_ref2.edge_after) {
                int_point_cur1.id = -1;       /* to be deleted */
                int_point_cur2.id = -1;       /* to be deleted */
                do_squeeze = true;
            }
        }

        if (do_squeeze) {
            intersections.int_points1.filter( (int_point) => int_point.id >= 0 );
            intersections.int_points2.filter( (int_point) => int_point.id >= 0 );

            // update id's
            intersections.int_points1.forEach( (int_point, index) => int_point.id = index );
            intersections.int_points2.forEach( (int_point, index) => int_point.id = index );

            // re-create sorted
            intersections.int_points1_sorted = [];
            intersections.int_points2_sorted = [];
            sortIntersections(intersections);
        }
    }

    function initializeInclusionFlags(int_points) {
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

    function calculateInclusionFlags(int_points, polygon) {
        for (let int_point of int_points) {
            int_point.edge_before.setInclusion(polygon);
            int_point.edge_after.setInclusion(polygon);
        }
    }

    function removeNotRelevantChains(polygon, op, int_points) {
        for (let i=0; i < int_points.length; i++) {
            // TODO: Support duplicated points with same <x,y> came from different faces
            let int_point_current = int_points[i];
            let int_point_next = int_points[ (i+1) % int_points.length];

            let edge_from = int_point_current.edge_after;
            let edge_to = int_point_next.edge_before;

            let face = int_point_current.face;

            if ( (edge_from.bv === Flatten.INSIDE && edge_to.bv === Flatten.INSIDE &&
                    op === Flatten.CLIP_INSIDE) ||
                (edge_from.bv === Flatten.OUTSIDE && edge_to.bv === Flatten.OUTSIDE &&
                    op === Flatten.CLIP_OUTSIDE)) {

                polygon.removeChain(face, edge_from, edge_to);

                int_point_current.edge_after === undefined;
                int_point_next.edge_before === undefined;
            }
        }
    }
}