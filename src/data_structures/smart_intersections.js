/*
    Smart intersections describe intersection points that refers to the edges they intersect
    This function are supposed for internal usage by morphing and relation methods between
 */
import * as Utils from "../utils/utils";
import * as Constants from '../utils/constants';
import {Multiline} from "../classes/multiline";
import {Edge} from "../classes/edge";

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
    let arc_length
    if (len === Infinity) {
        arc_length = shapes[0].coord(pt)
    }
    else {
        arc_length = (is_vertex & Constants.END_VERTEX) && edge.next && edge.next.arc_length === 0 ?
            0 :
            edge.arc_length + len;
    }

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
    // augment intersections with new sorted arrays
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

        if (int_point_cur2.id === -1) continue;
        /* already deleted */

        if (int_point_ref2.id === -1 || /* can't be reference if already deleted */
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
        if (int_point.edge_before) {
            int_point.edge_before.bvStart = undefined;
            int_point.edge_before.bvEnd = undefined;
            int_point.edge_before.bv = undefined;
            int_point.edge_before.overlap = undefined;
        }

        if (int_point.edge_after) {
            int_point.edge_after.bvStart = undefined;
            int_point.edge_after.bvEnd = undefined;
            int_point.edge_after.bv = undefined;
            int_point.edge_after.overlap = undefined;
        }
    }

    for (let int_point of int_points) {
        if (int_point.edge_before) int_point.edge_before.bvEnd = Constants.BOUNDARY;
        if (int_point.edge_after) int_point.edge_after.bvStart = Constants.BOUNDARY;
    }
}

export function calculateInclusionFlags(int_points, polygon)
{
    for (let int_point of int_points) {
        if (int_point.edge_before) int_point.edge_before.setInclusion(polygon);
        if (int_point.edge_after) int_point.edge_after.setInclusion(polygon);
    }
}

export function setOverlappingFlags(intersections)
{
    // Keep the order along polygon1, but consider each pair of faces separately.
    // A contact with another face must not interrupt an overlapping boundary.
    const facePairs = new Map();
    const matches = [];
    for (const ip1 of intersections.int_points1_sorted) {
        const ip2 = intersections.int_points2[ip1.id];
        if (!facePairs.has(ip1.face)) facePairs.set(ip1.face, new Map());
        const otherFaces = facePairs.get(ip1.face);
        if (!otherFaces.has(ip2.face)) otherFaces.set(ip2.face, []);
        otherFaces.get(ip2.face).push([ip1, ip2]);
    }

    for (const otherFaces of facePairs.values()) {
        for (const points of otherFaces.values()) {
            const pools = [];
            for (const pair of points) {
                const previous = pools[pools.length - 1];
                if (previous && previous[0][0].edge_before === pair[0].edge_before &&
                    previous[0][0].edge_after === pair[0].edge_after) {
                    previous.push(pair);
                } else {
                    pools.push([pair]);
                }
            }
            for (let i = 0; i < pools.length; i++) {
                for (const [from1, from2] of pools[i]) {
                    for (const [to1, to2] of pools[(i + 1) % pools.length]) {
                        const chain1 = boundaryChain(from1.edge_after, to1.edge_before);
                        if (!chain1) continue;

                        const same = boundaryChain(from2.edge_after, to2.edge_before, chain1[0].shape);
                        if (same && matchingBoundaryChains(chain1, same, false)) {
                            matches.push({chain1, chain2: same, flag: Constants.OVERLAP_SAME});
                            continue;
                        }
                        const opposite = boundaryChain(to2.edge_after, from2.edge_before, chain1[0].shape, true);
                        if (opposite && matchingBoundaryChains(chain1, opposite, true)) {
                            matches.push({chain1, chain2: opposite, flag: Constants.OVERLAP_OPPOSITE});
                        }
                    }
                }
            }
        }
    }

    // A boundary shared by several faces can match in both directions. The
    // single overlap flag cannot represent that topology. Preserve one-to-one
    // handling on those faces rather than introducing additional chain removals.
    const edgeFlags = new Map();
    for (const {chain1, chain2, flag} of matches) {
        for (const edge of [...chain1, ...chain2]) {
            edgeFlags.set(edge, (edgeFlags.get(edge) || 0) | flag);
        }
    }
    const ambiguousFaces = new Set();
    for (const [edge, flags] of edgeFlags) {
        if (flags === (Constants.OVERLAP_SAME | Constants.OVERLAP_OPPOSITE)) {
            ambiguousFaces.add(edge.face);
        }
    }
    for (const {chain1, chain2, flag} of matches) {
        if ((chain1.length > 1 || chain2.length > 1) &&
            (ambiguousFaces.has(chain1[0].face) || ambiguousFaces.has(chain2[0].face))) continue;
        markOverlappingChains(chain1, chain2, flag);
    }
}

function boundaryChain(first, last, referenceShape, reverse = false) {
    if (!first || !last || first.bv !== Constants.BOUNDARY || last.bv !== Constants.BOUNDARY) {
        return undefined;
    }
    // Reject a different outgoing path before walking the rest of the face.
    // In particular, opposite overlaps should not scan the complementary chain.
    if (referenceShape) {
        const candidate = reverse ? last.shape.reverse() : first.shape;
        const length = Math.min(referenceShape.length, candidate.length);
        if (length > 0 && (!referenceShape.start.equalTo(candidate.start) ||
            !referenceShape.pointAtLength(length / 2).equalTo(candidate.pointAtLength(length / 2)))) {
            return undefined;
        }
    }
    const edges = [];
    let edge = first;
    do {
        if (edge.bv !== Constants.BOUNDARY) return undefined;
        edges.push(edge);
        if (edge === last) return edges;
        edge = edge.next;
    } while (edge && edge !== first);
    return undefined;
}

function matchingBoundaryChains(chain1, chain2, reverse) {
    const shapes1 = chain1.map(edge => edge.shape).filter(shape => shape.length > 0);
    const shapes2 = (reverse ? chain2.slice().reverse().map(edge => edge.shape.reverse()) :
        chain2.map(edge => edge.shape)).filter(shape => shape.length > 0);
    let i = 0, j = 0;
    let shape1 = shapes1[i], shape2 = shapes2[j];

    // Compare matching portions without changing either polygon's edges. This
    // handles different subdivisions of segments and arcs, including full circles.
    while (shape1 && shape2) {
        // Coordinate-wise equality can hold even when lengths differ by more
        // than the tolerance. Accept that match before attempting a split.
        if (Edge.getOverlap(shape1, shape2) === Constants.OVERLAP_SAME) {
            shape1 = shapes1[++i];
            shape2 = shapes2[++j];
        } else if (Utils.EQ(shape1.length, shape2.length)) {
            return false;
        } else if (shape1.length < shape2.length) {
            if (!shape2.contains(shape1.end)) return false;
            const [prefix, remainder] = shape2.split(shape1.end);
            if (!prefix || !remainder || Edge.getOverlap(shape1, prefix) !== Constants.OVERLAP_SAME) return false;
            shape1 = shapes1[++i];
            shape2 = remainder;
        } else {
            if (!shape1.contains(shape2.end)) return false;
            const [prefix, remainder] = shape1.split(shape2.end);
            if (!prefix || !remainder || Edge.getOverlap(prefix, shape2) !== Constants.OVERLAP_SAME) return false;
            shape1 = remainder;
            shape2 = shapes2[++j];
        }
    }
    return !shape1 && !shape2;
}

function markOverlappingChains(chain1, chain2, flag) {
    if (chain1.length === 1 && chain2.length === 1) {
        chain1[0].setOverlap(chain2[0]);
        return;
    }
    // Removal still operates between all intersection points, so every edge in
    // the matched span needs the flag, including edges at unrelated contacts.
    for (const chain of [chain1, chain2]) {
        for (const edge of chain) {
            if (edge.overlap === undefined) edge.overlap = flag;
        }
    }
}

export function intPointsPoolCount(int_points, cur_int_point_num, cur_face)
{
    let int_point_current;
    let int_point_next;

    let int_points_pool_num = 1;

    if (int_points.length === 1) return 1;

    int_point_current = int_points[cur_int_point_num];

    for (let i = cur_int_point_num + 1; i < int_points.length; i++) {
        if (int_point_current.face !== cur_face) {      /* next face started */
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

        if (int_point.is_vertex & Constants.START_VERTEX) {    // nothing to split
            int_point.edge_before = edge.prev;
            if (edge.prev) {
                int_point.is_vertex = Constants.END_VERTEX;   // polygon
            }
            continue;
        }
        if (int_point.is_vertex & Constants.END_VERTEX) {    // nothing to split
            continue;
        }

        let newEdge = polygon.addVertex(int_point.pt, edge);
        int_point.edge_before = newEdge;
    }

    for (let int_point of int_points) {
        if (int_point.edge_before) {
            int_point.edge_after = int_point.edge_before.next;
        }
        else {
            if (polygon instanceof Multiline && int_point.is_vertex & Constants.START_VERTEX) {
                int_point.edge_after = polygon.first
            }
        }
    }
}

export function insertBetweenIntPoints(int_point1, int_point2, new_edges) {
    const edge_before = int_point1.edge_before;
    const edge_after = int_point2.edge_after;
    const len = new_edges.length
    edge_before.next = new_edges[0];
    new_edges[0].prev = edge_before;

    new_edges[len-1].next = edge_after;
    edge_after.prev = new_edges[len-1];
}
