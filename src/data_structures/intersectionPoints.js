/*
    Intersection points is a supplement structure for calculation
    of arrangements in polygon. It connects intersection points to the
    edges and faces of the polygon and helps to perform clip and split of the polygon
 */
import * as Utils from "../utils/utils";

const NOT_VERTEX = 0;
const START_VERTEX = 1;
const END_VERTEX = 2;

class IntersectionPoint {
    constructor(id, pt, edge_before, edge_after, face, arc_length = 0., is_vertex) {
        this.id = id;
        this.pt = pt;
        this.arc_length = arc_length;
        this.edge_before = edge_before;
        this.edge_after = undefined;
        this.face = face;
        this.faceId = undefined;
        this.is_vertex = is_vertex;
    }

}

class IntersectionPoints {
    constructor() {
        this.int_points = [];
    }

    get length() {
        return this.int_points.length;
    }

    add(edge, pt) {
        let id = this.int_points.length;
        let split = edge.shape.split(pt);
        if (split.length === 0) return;     // Means point does not belong to edge
        let len = 0;
        if (split.length === 1) {           // Edge was not split
            if (edge.shape.start.equalTo(pt)) {
                len = 0;
            } else if (edge.shape.end.equalTo(pt)) {
                len = edge.shape.length;
            }
        } else {                             // Edge was split into to edges
            len = split[0].length;
        }
        let is_vertex = NOT_VERTEX;
        if (Utils.EQ(len, 0)) {
            is_vertex |= START_VERTEX;
        }
        if (Utils.EQ(len, edge.shape.length)) {
            is_vertex |= END_VERTEX;
        }
        // Fix intersection point which is end point of the last edge
        let arc_length = (is_vertex & END_VERTEX) && edge.next.arc_length === 0 ? 0 : edge.arc_length + len;


        let intPoint = new IntersectionPoint(id, pt, edge, undefined, edge.face, arc_length, is_vertex);
        this.int_points.push(intPoint);
    }

    sort() {
        let faceMap = new Map();
        let id = 0;
        // Create ordinal number for faces
        for (let ip of this.int_points) {
            if (!faceMap.has(ip.face)) {
                faceMap.set(ip.face, id);
                id++;
            }
        }
        // Augment intersection points with face id's
        for (let ip of this.int_points) {
            ip.faceId = faceMap.get(ip.face);
        }
        // Clone and sort
        let int_points_sorted = this.int_points.slice().sort(this.compareFn);
        return int_points_sorted;
    }

    compareFn(ip1, ip2)
    {
        // compare face id's
        if (ip1.faceId < ip2.faceId) {
            return -1;
        }
        if (ip1.faceId > ip2.faceId) {
            return 1;
        }
        // same face - compare arc_length
        if (Utils.LT(ip1.arc_length, ip2.arc_length)) {
            return -1;
        }
        if (Utils.GT(ip1.arc_length, ip2.arc_length)) {
            return 1;
        }
        return 0;
    }

    filterDuplicated()
    {
        if (this.int_points.length < 2) return;

        let int_point_ref = this.int_points[0];
        for (let i = 1; i < this.int_points.length; i++) {
            let int_point_cur = this.int_points[i];

            if (!Utils.EQ(int_point_cur.arc_length, int_point_ref.arc_length)) {
                int_point_ref = int_point_cur;
                continue;
            }

            /* Same length: int_point_cur->arc_len == int_point_ref->arc_len */
            if (int_point_cur.edge_before === int_point_ref.edge_before &&
                int_point_cur.edge_after === int_point_ref.edge_after) {
                int_point_cur.id = -1;
            }
        }

        let int_points_filtered = this.int_points.filter((int_point) => int_point.id >= 0);
        int_points_filtered.forEach((int_point, index) => int_point.id = index);
        int_points_filtered = int_points_filtered.sort();

        return int_points_filtered;
    }

    splitPolygon(polygon)
    {
        for (let int_point of this.int_points) {
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

        for (let int_point of this.int_points) {
            int_point.edge_after = int_point.edge_before.next;
        }
    }

}

export default IntersectionPoints;