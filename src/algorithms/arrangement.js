/**
 * Arrangement
 */


"use strict";

import Flatten from "../flatten";
import * as Utils from '../utils/utils';
import LinkedList from "../data_structures/linked_list";

const NOT_VERTEX = 0;
const START_VERTEX = 1;
const END_VERTEX = 2;

export function arrangeShape2Polygon(shape, polygon) {
    let queryEdge = new Flatten.Edge(shape);
    let arrangedEdges = new LinkedList();
    arrangedEdges.append(queryEdge);
    let int_points = calculateIntersections(queryEdge, polygon);
    int_points = sortIntPointsArray(int_points);
    splitByIntersections(arrangedEdges, queryEdge, int_points);
    for (let edge of arrangedEdges) {
        edge.setInclusion(polygon)
    }
    return arrangedEdges.toArray();
}

function calculateIntersections(queryEdge, polygon) {
    let int_points = [];
    // request edges of polygon in the box of edge1
    let resp = polygon.edges.search(queryEdge.box);
    // for each edge in response calculate intersections with query edge
    for (let edge of resp) {
        queryEdge.shape.intersect(edge.shape)
            .map(pt => addToIntPoints(queryEdge, pt, int_points));
    }
    return sortIntPointsArray(int_points);
}

function addToIntPoints(edge, pt, int_points)
{
    let id = int_points.length;
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

function sortIntPointsArray(int_points)
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
    if (Utils.LT(ip1.arc_length, ip2.arc_length)) {
        return -1;
    }
    if (Utils.GT(ip1.arc_length, ip2.arc_length)) {
        return 1;
    }
    return 0;
}

function splitByIntersections(arrangedEdges, queryEdge, int_points)
{
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

        let newEdge = addVertex(arrangedEdges, int_point.pt, edge);
        int_point.edge_before = newEdge;
    }

    for (let int_point of int_points) {
        if (int_point.edge_before) int_point.edge_after = int_point.edge_before.next;
    }
}

function addVertex(arrangedEdges, pt, edge) {
    let shapes = edge.shape.split(pt);
    if (shapes.length < 2) return;
    let newEdge = new Flatten.Edge(shapes[0]);
    let edgeBefore = edge.prev;

    /* Insert first split edge into linked list after edgeBefore */
    arrangedEdges.insert(newEdge, edgeBefore);

    // Update edge shape with second split edge keeping links
    edge.shape = shapes[1];

    return newEdge;
}

function filterDuplicatedIntersections(int_points)
{
    if (int_points.length < 2) return;

    let int_point_ref = int_points[0];
    for (let i = 1; i < int_points.length; i++) {
        let int_point_cur = int_points[i];

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

    let int_points_filtered = int_points.filter((int_point) => int_point.id >= 0);
    int_points_filtered.forEach((int_point, index) => int_point.id = index);
    int_points_filtered = sortIntPointsArray(int_points_filtered);

    return int_points_filtered;
}

