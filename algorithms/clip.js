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
    Flatten.clip = function (shape, polygon, clip_inside_polygon) {
        let dummyPolygon = new Polygon();
        dummyPolygon.addFace([shape]);

        // get intersection points
        let intersections = getIntersections(dummyPolygon, polygon);

        // sort intersection points
        sortIntersections(intersections);

        // split by interection points
        splitByIntersections(dummyPolygon, intersections.int_points1_sorted);

        // filter duplicated intersection points
        filterDuplicatedIntersections(intersections);

        // set boundary values
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
                    let id = intersections.int_points1.num;  // same as intersections.int_points2.num

                    // Add to the list of int_points2 for the polygon1
                    let split = edge1.shape.split(pt);
                    let len = split.length === 0 ? 0 : split[0].length;
                    let is_vertex = NOT_VERTEX;
                    if (Flatten.Utils.EQ(len,0)) {
                        is_vertex |= START_VERTEX;
                    }
                    if (Flatten.Utils.EQ(len, edge1.shape.length)) {
                        is_vertex |= END_VERTEX;
                    }
                    // Fix intersection point which is end point of the last edge
                    let arc_length =  (is_vertex & END_VERTEX) && edge1.next.arc_length === 0 ? 0 : edge1.arc_length + len;
                    intersections.int_points1.push({
                        id: id,
                        pt: pt,
                        arc_length: arc_length,
                        edge_before: edge1,
                        edge_after: undefined,
                        face: edge1.face,
                        is_vertex: is_vertex
                    });

                    // Add to the list of int_points2 for the polygon2
                    let split = edge2.shape.split(pt);
                    let len = split.length === 0 ? 0 : split[0].length;
                    let is_vertex = NOT_VERTEX;
                    if (Flatten.Utils.EQ(len,0)) {
                        is_vertex |= START_VERTEX;
                    }
                    if (Flatten.Utils.EQ(len, edge2.shape.length)) {
                        is_vertex |= END_VERTEX;
                    }
                    // Fix intersection point which is end point of the last edge
                    let arc_length =  (is_vertex & END_VERTEX) && edge2.next.arc_length === 0 ? 0 : edge2.arc_length + len;
                    intersections.int_points2.push({
                        id: id,
                        pt: pt,
                        arc_length: arc_length,
                        edge_before: edge2,
                        edge_after: undefined,
                        face: edge2.face,
                        is_vertex: is_vertex
                    });
                }
            }
        }

        return intersections;
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
            let edge = ip.edge_before;

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
}