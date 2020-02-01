/**
 * Arrangement
 */


"use strict";

import Flatten from "../flatten";
import * as Utils from '../utils/utils';
import LinkedList from "../data_structures/linked_list";
import IntersectionPoints from "../data_structures/intersectionPoints";

const NOT_VERTEX = 0;
const START_VERTEX = 1;
const END_VERTEX = 2;

export function arrangeShape2Polygon(shape, polygon) {
    let queryEdge = new Flatten.Edge(shape);
    let arrangedEdges = new LinkedList();
    arrangedEdges.append(queryEdge);
    let int_points = calculateIntersections(queryEdge, polygon);
    splitByIntersections(arrangedEdges, queryEdge, int_points);
    for (let edge of arrangedEdges) {
        edge.setInclusion(polygon)
    }
    return arrangedEdges.toArray();
}

function calculateIntersections(queryEdge, polygon) {
    let int_points = new IntersectionPoints();
    // request edges of polygon in the box of edge1
    let resp = polygon.edges.search(queryEdge.box);
    // for each edge in response calculate intersections with query edge
    for (let edge of resp) {
        queryEdge.shape.intersect(edge.shape)
            .map(pt => int_points.add(queryEdge, pt));
    }
    return int_points.sort();
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
