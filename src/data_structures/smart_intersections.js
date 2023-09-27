/*
    Smart intersections describe intersection points that refers to the edges they intersect
    This function are supposed for internal usage by morphing and relation methods between
 */
import * as Utils from "../utils/utils";
import * as Constants from '../utils/constants';

export function addToIntPoints(edge, pt, int_points)
{
    let id = int_points.length;
    let shapes = edge.shape.split(pt);

    // if (shapes.length < 2) return;
    if (shapes.length === 0) return;     // Point does not belong to edge ?

    let len = 0;
    if (shapes[0] === null) {   // point incident to edge start vertex
        len = 0;
    }
    else if (shapes[1] === null) {   // point incident to edge end vertex
        len = edge.shape.length;
    }
    else {                             // Edge was split into to edges
        len = shapes[0].length;
    }

    let is_vertex = Constants.NOT_VERTEX;
    if (Utils.EQ(len, 0)) {
        is_vertex |= Constants.START_VERTEX;
    }
    if (Utils.EQ(len, edge.shape.length)) {
        is_vertex |= Constants.END_VERTEX;
    }
    // Fix intersection point which is end point of the last edge
    let arc_length = (is_vertex & Constants.END_VERTEX) && edge.next.arc_length === 0 ? 0 : edge.arc_length + len;

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

export function sortIntersections(intersections)
{
    // if (intersections.int_points1.length === 0) return;

    // augment intersections with new sorted arrays
    // intersections.int_points1_sorted = intersections.int_points1.slice().sort(compareFn);
    // intersections.int_points2_sorted = intersections.int_points2.slice().sort(compareFn);
    intersections.int_points1_sorted = getSortedArray(intersections.int_points1);
    intersections.int_points2_sorted = getSortedArray(intersections.int_points2);
}

export function getSortedArray(int_points)
{
    let faceMap = new Map;
    let id = 0;
    // Create integer id's for faces
    for (let ip of int_points) {
        if (!faceMap.has(ip.face)) {
            faceMap.set(ip.face, id);
            id++;
        }
    }
    // Augment intersection points with face id's
    for (let ip of int_points) {
        ip.faceId = faceMap.get(ip.face);
    }
    // Clone and sort
    let int_points_sorted = int_points.slice().sort(compareFn);
    return int_points_sorted;
}

function compareFn(ip1, ip2)
{
    // compare face id's
    if (ip1.faceId < ip2.faceId) {
        return -1;
    }
    if (ip1.faceId > ip2.faceId) {
        return 1;
    }
    // same face - compare arc_length
    if (ip1.arc_length < ip2.arc_length) {
        return -1;
    }
    if (ip1.arc_length > ip2.arc_length) {
        return 1;
    }
    return 0;
}

export function getSortedArrayOnLine(line, int_points) {
    return int_points.slice().sort( (int_point1, int_point2) => {
        if (line.coord(int_point1.pt) < line.coord(int_point2.pt)) {
            return -1;
        }
        if (line.coord(int_point1.pt) > line.coord(int_point2.pt)) {
            return 1;
        }
        return 0;
    })
}

export function filterDuplicatedIntersections(intersections)
{
    if (intersections.int_points1.length < 2) return;

    let do_squeeze = false;

    let int_point_ref1;
    let int_point_ref2;
    let int_point_cur1;
    let int_point_cur2;
    for (let i = 0; i < intersections.int_points1_sorted.length; i++) {

        if (intersections.int_points1_sorted[i].id === -1)
            continue;

        int_point_ref1 = intersections.int_points1_sorted[i];
        int_point_ref2 = intersections.int_points2[int_point_ref1.id];

        for (let j=i+1; j < intersections.int_points1_sorted.length; j++) {
            int_point_cur1 = intersections.int_points1_sorted[j];
            if (!Utils.EQ(int_point_cur1.arc_length, int_point_ref1.arc_length)) {
                break;
            }
            if (int_point_cur1.id === -1)
                continue;
            int_point_cur2 = intersections.int_points2[int_point_cur1.id];
            if (int_point_cur2.id === -1)
                continue;
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
    }

    int_point_ref2 = intersections.int_points2_sorted[0];
    int_point_ref1 = intersections.int_points1[int_point_ref2.id];
    for (let i = 1; i < intersections.int_points2_sorted.length; i++) {
        let int_point_cur2 = intersections.int_points2_sorted[i];

        if (int_point_cur2.id == -1) continue;
        /* already deleted */

        if (int_point_ref2.id == -1 || /* can't be reference if already deleted */
            !(Utils.EQ(int_point_cur2.arc_length, int_point_ref2.arc_length))) {
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
    }
}

export function initializeInclusionFlags(int_points)
{
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
        int_point.edge_before.bvEnd = Constants.BOUNDARY;
        int_point.edge_after.bvStart = Constants.BOUNDARY;
    }
}

export function calculateInclusionFlags(int_points, polygon)
{
    for (let int_point of int_points) {
        int_point.edge_before.setInclusion(polygon);
        int_point.edge_after.setInclusion(polygon);
    }
}

export function setOverlappingFlags(intersections)
{
    let cur_face = undefined;
    let first_int_point_in_face_id = undefined;
    let next_int_point1 = undefined;
    let num_int_points = intersections.int_points1.length;

    for (let i = 0; i < num_int_points; i++) {
        let cur_int_point1 = intersections.int_points1_sorted[i];

        // Find boundary chain in the polygon1
        if (cur_int_point1.face !== cur_face) {                               // next chain started
            first_int_point_in_face_id = i; // cur_int_point1;
            cur_face = cur_int_point1.face;
        }

        // Skip duplicated points with same <x,y> in "cur_int_point1" pool
        let int_points_cur_pool_start = i;
        let int_points_cur_pool_num = intPointsPoolCount(intersections.int_points1_sorted, i, cur_face);
        let next_int_point_id;
        if (int_points_cur_pool_start + int_points_cur_pool_num < num_int_points &&
            intersections.int_points1_sorted[int_points_cur_pool_start + int_points_cur_pool_num].face === cur_face) {
            next_int_point_id = int_points_cur_pool_start + int_points_cur_pool_num;
        } else {                                         // get first point from the same face
            next_int_point_id = first_int_point_in_face_id;
        }

        // From all points with same ,x,y. in 'next_int_point1' pool choose one that
        // has same face both in res_poly and in wrk_poly
        let int_points_next_pool_num = intPointsPoolCount(intersections.int_points1_sorted, next_int_point_id, cur_face);
        next_int_point1 = null;
        for (let j=next_int_point_id; j < next_int_point_id + int_points_next_pool_num; j++) {
            let next_int_point1_tmp = intersections.int_points1_sorted[j];
            if (next_int_point1_tmp.face === cur_face &&
                intersections.int_points2[next_int_point1_tmp.id].face === intersections.int_points2[cur_int_point1.id].face) {
                next_int_point1 = next_int_point1_tmp;
                break;
            }
        }
        if (next_int_point1 === null)
            continue;

        let edge_from1 = cur_int_point1.edge_after;
        let edge_to1 = next_int_point1.edge_before;

        if (!(edge_from1.bv === Constants.BOUNDARY && edge_to1.bv === Constants.BOUNDARY))      // not a boundary chain - skip
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
        if (!(edge_from2.bv === Constants.BOUNDARY && edge_to2.bv === Constants.BOUNDARY && edge_from2 === edge_to2)) {
            cur_int_point2 = intersections.int_points2[next_int_point1.id];
            next_int_point2 = intersections.int_points2[cur_int_point1.id];

            edge_from2 = cur_int_point2.edge_after;
            edge_to2 = next_int_point2.edge_before;
        }

        if (!(edge_from2.bv === Constants.BOUNDARY && edge_to2.bv === Constants.BOUNDARY && edge_from2 === edge_to2))
            continue;                           // not an overlapping chain - skip   TODO: fix boundary conflict

        // Set overlapping flag - one-to-one case
        edge_from1.setOverlap(edge_from2);
    }
}

export function intPointsPoolCount(int_points, cur_int_point_num, cur_face)
{
    let int_point_current;
    let int_point_next;

    let int_points_pool_num = 1;

    if (int_points.length == 1) return 1;

    int_point_current = int_points[cur_int_point_num];

    for (let i = cur_int_point_num + 1; i < int_points.length; i++) {
        if (int_point_current.face != cur_face) {      /* next face started */
            break;
        }

        int_point_next = int_points[i];

        if (!(int_point_next.pt.equalTo(int_point_current.pt) &&
            int_point_next.edge_before === int_point_current.edge_before &&
            int_point_next.edge_after === int_point_current.edge_after)) {
            break;         /* next point is different - break and exit */
        }

        int_points_pool_num++;     /* duplicated intersection point - increase counter */
    }
    return int_points_pool_num;
}

export function splitByIntersections(polygon, int_points)
{
    if (!int_points) return;
    for (let int_point of int_points) {
        let edge = int_point.edge_before;

        // recalculate vertex flag: it may be changed after previous split
        int_point.is_vertex = Constants.NOT_VERTEX;
        if (edge.shape.start && edge.shape.start.equalTo(int_point.pt)) {
            int_point.is_vertex |= Constants.START_VERTEX;
        }
        if (edge.shape.end && edge.shape.end.equalTo(int_point.pt)) {
            int_point.is_vertex |= Constants.END_VERTEX;
        }

        if (int_point.is_vertex & Constants.START_VERTEX) {  // nothing to split
            int_point.edge_before = edge.prev;
            int_point.is_vertex = Constants.END_VERTEX;
            continue;
        }
        if (int_point.is_vertex & Constants.END_VERTEX) {    // nothing to split
            continue;
        }

        let newEdge = polygon.addVertex(int_point.pt, edge);
        int_point.edge_before = newEdge;
    }

    for (let int_point of int_points) {
        int_point.edge_after = int_point.edge_before.next;
    }
}

export function insertBetweenIntPoints(int_point1, int_point2, new_edge) {
    let edge_before = int_point1.edge_before;
    let edge_after = int_point2.edge_after;

    edge_before.next = new_edge;
    new_edge.prev = edge_before;

    new_edge.next = edge_after;
    edge_after.prev = new_edge;
}
