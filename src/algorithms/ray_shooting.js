/**
 * @module RayShoot
 */
"use strict";
import Flatten from '../flatten';
import * as Utils from '../utils/utils';
import * as Constants from '../utils/constants';
/**
 * Implements ray shooting algorithm. Returns relation between point and polygon: inside, outside or boundary
 * @param {Polygon} polygon - polygon to test
 * @param {Point} point - point to test
 * @returns {INSIDE|OUTSIDE|BOUNDARY}
 */
export function ray_shoot(polygon, point) {
    let contains = undefined;

    // 1. Quick reject
    // if (polygon.box.not_intersect(point.box)) {
    //     return Flatten.OUTSIDE;
    // }

    let ray = new Flatten.Ray(point);
    let line = new Flatten.Line(ray.pt, ray.norm);

    // 2. Locate relevant edges of the polygon
    const searchBox = new Flatten.Box(
        ray.box.xmin-Flatten.DP_TOL, ray.box.ymin-Flatten.DP_TOL,
        ray.box.xmax, ray.box.ymax+Flatten.DP_TOL
    );

    if (polygon.box.not_intersect(searchBox)) {
        return Flatten.OUTSIDE;
    }

    let resp_edges = polygon.edges.search(searchBox);

    if (resp_edges.length == 0) {
        return Flatten.OUTSIDE;
    }

    // 2.5 Check if boundary
    for (let edge of resp_edges) {
        if (edge.shape.contains(point)) {
            return Flatten.BOUNDARY;
        }
    }

    let faces = [...polygon.faces];

    // 3. Calculate intersections
    let intersections = [];
    for (let edge of resp_edges) {
        for (let ip of ray.intersect(edge.shape)) {

            // If intersection is equal to query point then point lays on boundary
            if (ip.equalTo(point)) {
                return Flatten.BOUNDARY;
            }

            intersections.push({
                pt: ip,
                edge: edge,
                face_index: faces.indexOf(edge.face)
            });
        }
    }

    // 4. Sort intersection in x-ascending order
    intersections.sort((i1, i2) => {
        if (Utils.LT(i1.pt.x, i2.pt.x)) {
            return -1;
        }
        if (Utils.GT(i1.pt.x, i2.pt.x)) {
            return 1;
        }
        return 0;
    });

    // 5. Count real intersections, exclude touching
    let counter = 0;

    for (let i = 0; i < intersections.length; i++) {
        let intersection = intersections[i];

        if (intersection.pt.equalTo(intersection.edge.shape.start)) {
            /* skip same point between same edges if already counted */
            if (i > 0) {
                let j = i - 1;
                let alreadyCounted = false;
                /* same point may appear more than twice in case of touching faces/self-touching face */
                while (j >= 0 && intersection.pt.equalTo(intersections[j].pt)) {
                    if (intersection.edge.prev === intersections[j].edge) {
                        alreadyCounted = true;
                        break;
                    }
                    j--;
                }
                if (alreadyCounted) {
                    continue;
                }
            }
            let prev_edge = intersection.edge.prev;
            while (Utils.EQ_0(prev_edge.length)) {
                prev_edge = prev_edge.prev;
            }
            let prev_tangent = prev_edge.shape.tangentInEnd();
            let prev_point = intersection.pt.translate(prev_tangent);

            let cur_tangent = intersection.edge.shape.tangentInStart();
            let cur_point = intersection.pt.translate(cur_tangent);

            let prev_on_the_left = prev_point.leftTo(line);
            let cur_on_the_left = cur_point.leftTo(line);

            if ((prev_on_the_left && !cur_on_the_left) || (!prev_on_the_left && cur_on_the_left)) {
                counter++;
            }
        } else if (intersection.pt.equalTo(intersection.edge.shape.end)) {
            /* skip same point between same edges if already counted */
            if (i > 0) {
                let j = i - 1;
                let alreadyCounted = false;
                /* same point may appear more than twice in case of touching faces/self-touching face */
                while (j >= 0 && intersection.pt.equalTo(intersections[j].pt)) {
                    if (intersection.edge.next === intersections[j].edge) {
                        alreadyCounted = true;
                        break;
                    }
                    j--;
                }
                if (alreadyCounted) {
                    continue;
                }
            }
            let next_edge = intersection.edge.next;
            while (Utils.EQ_0(next_edge.length)) {
                next_edge = next_edge.next;
            }
            let next_tangent = next_edge.shape.tangentInStart();
            let next_point = intersection.pt.translate(next_tangent);

            let cur_tangent = intersection.edge.shape.tangentInEnd();
            let cur_point = intersection.pt.translate(cur_tangent);

            let next_on_the_left = next_point.leftTo(line);
            let cur_on_the_left = cur_point.leftTo(line);

            if ((next_on_the_left && !cur_on_the_left) || (!next_on_the_left && cur_on_the_left)) {
                counter++;
            }
        } else {        /* intersection point is not a coincident with a vertex */
            if (intersection.edge.shape instanceof Flatten.Segment) {
                counter++;
            } else {
                /* Check if ray does not touch the curve in the extremal (top or bottom) point */
                let box = intersection.edge.shape.box;
                if (!(Utils.EQ(intersection.pt.y, box.ymin) ||
                    Utils.EQ(intersection.pt.y, box.ymax))) {
                    counter++;
                }
            }
        }
    }

    // 6. Odd or even?
    contains = counter % 2 == 1 ? Constants.INSIDE : Constants.OUTSIDE;

    return contains;
};
