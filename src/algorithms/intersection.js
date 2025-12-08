/**
 * Intersection
 *
 * */


"use strict";

import Flatten from "../flatten";
import {Errors} from "../utils/errors";

export function intersectLine2Line(line1, line2) {
    let ip = [];

    let [A1, B1, C1] = line1.standard;
    let [A2, B2, C2] = line2.standard;

    /* Cramer's rule */
    let det = A1 * B2 - B1 * A2;
    let detX = C1 * B2 - B1 * C2;
    let detY = A1 * C2 - C1 * A2;

    if (!Flatten.Utils.EQ_0(det)) {
        let x, y;

        if (B1 === 0) {        // vertical line x  = C1/A1, where A1 == +1 or -1
            x = C1/A1;
            y = detY / det;
        }
        else if (B2 === 0) {   // vertical line x = C2/A2, where A2 = +1 or -1
            x = C2/A2;
            y = detY / det;
        }
        else if (A1 === 0) {   // horizontal line y = C1/B1, where B1 = +1 or -1
            x = detX / det;
            y = C1/B1;
        }
        else if (A2 === 0) {   // horizontal line y = C2/B2, where B2 = +1 or -1
            x = detX / det;
            y = C2/B2;
        }
        else {
            x = detX / det;
            y = detY / det;
        }

        ip.push(new Flatten.Point(x, y));
    }

    return ip;
}

export function intersectLine2Circle(line, circle) {
    let ip = [];
    let prj = circle.pc.projectionOn(line);            // projection of circle center on a line
    let dist = circle.pc.distanceTo(prj)[0];           // distance from circle center to projection

    if (Flatten.Utils.EQ(dist, circle.r)) {            // line tangent to circle - return single intersection point
        ip.push(prj);
    } else if (Flatten.Utils.LT(dist, circle.r)) {       // return two intersection points
        let delta = Math.sqrt(circle.r * circle.r - dist * dist);
        let v_trans, pt;

        v_trans = line.norm.rotate90CCW().multiply(delta);
        pt = prj.translate(v_trans);
        ip.push(pt);

        v_trans = line.norm.rotate90CW().multiply(delta);
        pt = prj.translate(v_trans);
        ip.push(pt);
    }
    return ip;
}

export function intersectLine2Box(line, box) {
    let ips = [];
    for (let seg of box.toSegments()) {
        let ips_tmp = intersectSegment2Line(seg, line);
        for (let pt of ips_tmp) {
            if (!ptInIntPoints(pt, ips)) {
                ips.push(pt);
            }
        }
    }
    return ips;
}

export function intersectLine2Arc(line, arc) {
    let ip = [];

    if (intersectLine2Box(line, arc.box).length === 0) {
        return ip;
    }

    let circle = new Flatten.Circle(arc.pc, arc.r);
    let ip_tmp = intersectLine2Circle(line, circle);
    for (let pt of ip_tmp) {
        if (pt.on(arc)) {
            ip.push(pt);
        }
    }

    return ip;
}

export function intersectSegment2Line(seg, line) {
    let ip = [];

    // Boundary cases
    if (seg.ps.on(line)) {
        ip.push(seg.ps);
    }
    // If both ends lay on line, return two intersection points
    if (seg.pe.on(line) && !seg.isZeroLength()) {
        ip.push(seg.pe);
    }

    if (ip.length > 0) {
        return ip;          // done, intersection found
    }

    // If zero-length segment and nothing found, return no intersections
    if (seg.isZeroLength()) {
        return ip;
    }

    // Not a boundary case, check if both points are on the same side and
    // hence there is no intersection
    if (seg.ps.leftTo(line) && seg.pe.leftTo(line) ||
        !seg.ps.leftTo(line) && !seg.pe.leftTo(line)) {
        return ip;
    }

    // Calculate intersection between lines
    let line1 = new Flatten.Line(seg.ps, seg.pe);
    return intersectLine2Line(line1, line);
}

export function intersectSegment2Segment(seg1, seg2) {
    let ip = [];

    // Special case of seg1 zero length
    if (seg1.isZeroLength()) {
        if (seg1.ps.on(seg2)) {
            ip.push(seg1.ps);
        }
        return ip;
    }

    // Special case of seg2 zero length
    if (seg2.isZeroLength()) {
        if (seg2.ps.on(seg1)) {
            ip.push(seg2.ps);
        }
        return ip;
    }

    // Neither seg1 nor seg2 is zero length
    let line1 = new Flatten.Line(seg1.ps, seg1.pe);
    let line2 = new Flatten.Line(seg2.ps, seg2.pe);

    // Check overlapping between segments in case of incidence
    // If segments touching, add one point. If overlapping, add two points
    if (line1.incidentTo(line2)) {
        if (seg1.ps.on(seg2)) {
            ip.push(seg1.ps);
        }
        if (seg1.pe.on(seg2)) {
            ip.push(seg1.pe);
        }
        if (seg2.ps.on(seg1) && !seg2.ps.equalTo(seg1.ps) && !seg2.ps.equalTo(seg1.pe)) {
            ip.push(seg2.ps);
        }
        if (seg2.pe.on(seg1) && !seg2.pe.equalTo(seg1.ps) && !seg2.pe.equalTo(seg1.pe)) {
            ip.push(seg2.pe);
        }
    } else {                /* not incident - parallel or intersect */
        // Calculate intersection between lines
        let new_ip = intersectLine2Line(line1, line2);
        if (new_ip.length > 0) {
            if (isPointInSegmentBox(new_ip[0], seg1) && isPointInSegmentBox(new_ip[0], seg2)) {
                ip.push(new_ip[0]);
            }
        }
    }
    return ip;
}

function isPointInSegmentBox(point, segment) {
    const box = segment.box;
    return Flatten.Utils.LE(point.x, box.xmax) && Flatten.Utils.GE(point.x, box.xmin) &&
        Flatten.Utils.LE(point.y, box.ymax) && Flatten.Utils.GE(point.y, box.ymin)
}

export function intersectSegment2Circle(segment, circle) {
    let ips = [];

    // Special case of zero length segment
    if (segment.isZeroLength()) {
        let [dist, _] = segment.ps.distanceTo(circle.pc);
        if (Flatten.Utils.EQ(dist, circle.r)) {
            ips.push(segment.ps);
        }
        return ips;
    }

    // Non zero-length segment
    let line = new Flatten.Line(segment.ps, segment.pe);

    let ips_tmp = intersectLine2Circle(line, circle);

    for (let ip of ips_tmp) {
        if (ip.on(segment)) {
            ips.push(ip);
        }
    }

    return ips;
}

export function intersectSegment2Arc(segment, arc) {
    let ip = [];

    // Special case of zero-length segment
    if (segment.isZeroLength()) {
        if (segment.ps.on(arc)) {
            ip.push(segment.ps);
        }
        return ip;
    }

    // Non-zero length segment
    let line = new Flatten.Line(segment.ps, segment.pe);
    let circle = new Flatten.Circle(arc.pc, arc.r);

    let ip_tmp = intersectLine2Circle(line, circle);

    for (let pt of ip_tmp) {
        if (pt.on(segment) && pt.on(arc)) {
            ip.push(pt);
        }
    }
    return ip;

}

export function intersectSegment2Box(segment, box) {
    let ips = [];
    for (let seg of box.toSegments()) {
        let ips_tmp = intersectSegment2Segment(seg, segment);
        for (let ip of ips_tmp) {
            ips.push(ip);
        }
    }
    return ips;
}

export function intersectCircle2Circle(circle1, circle2) {
    let ip = [];

    let vec = new Flatten.Vector(circle1.pc, circle2.pc);

    let r1 = circle1.r;
    let r2 = circle2.r;

    // Degenerated circle
    if (Flatten.Utils.EQ_0(r1) || Flatten.Utils.EQ_0(r2))
        return ip;

    // In case of equal circles return one leftmost point
    if (Flatten.Utils.EQ_0(vec.x) && Flatten.Utils.EQ_0(vec.y) && Flatten.Utils.EQ(r1, r2)) {
        ip.push(circle1.pc.translate(-r1, 0));
        return ip;
    }

    let dist = circle1.pc.distanceTo(circle2.pc)[0];

    if (Flatten.Utils.GT(dist, r1 + r2))               // circles too far, no intersections
        return ip;

    if (Flatten.Utils.LT(dist, Math.abs(r1 - r2)))     // one circle is contained within another, no intersections
        return ip;

    // Normalize vector.
    vec.x /= dist;
    vec.y /= dist;

    let pt;

    // Case of touching from outside or from inside - single intersection point
    // TODO: check this specifically not sure if correct
    if (Flatten.Utils.EQ(dist, r1 + r2) || Flatten.Utils.EQ(dist, Math.abs(r1 - r2))) {
        pt = circle1.pc.translate(r1 * vec.x, r1 * vec.y);
        ip.push(pt);
        return ip;
    }

    // Case of two intersection points

    // Distance from first center to center of common chord:
    //   a = (r1^2 - r2^2 + d^2) / 2d
    // Separate for better accuracy
    let a = (r1 * r1) / (2 * dist) - (r2 * r2) / (2 * dist) + dist / 2;

    let mid_pt = circle1.pc.translate(a * vec.x, a * vec.y);
    let h = Math.sqrt(r1 * r1 - a * a);
    // let norm;

    // norm = vec.rotate90CCW().multiply(h);
    pt = mid_pt.translate(vec.rotate90CCW().multiply(h));
    ip.push(pt);

    // norm = vec.rotate90CW();
    pt = mid_pt.translate(vec.rotate90CW().multiply(h));
    ip.push(pt);

    return ip;
}

export function intersectCircle2Box(circle, box) {
    let ips = [];
    for (let seg of box.toSegments()) {
        let ips_tmp = intersectSegment2Circle(seg, circle);
        for (let ip of ips_tmp) {
            ips.push(ip);
        }
    }
    return ips;
}

export function intersectArc2Arc(arc1, arc2) {
    let ip = [];

    // Special case: overlapping arcs
    // May return up to 4 intersection points
    if (arc1.pc.equalTo(arc2.pc) && Flatten.Utils.EQ(arc1.r, arc2.r)) {
        let pt;

        pt = arc1.start;
        if (pt.on(arc2))
            ip.push(pt);

        pt = arc1.end;
        if (pt.on(arc2))
            ip.push(pt);

        pt = arc2.start;
        if (pt.on(arc1)) ip.push(pt);

        pt = arc2.end;
        if (pt.on(arc1)) ip.push(pt);

        return ip;
    }

    // Common case
    let circle1 = new Flatten.Circle(arc1.pc, arc1.r);
    let circle2 = new Flatten.Circle(arc2.pc, arc2.r);
    let ip_tmp = circle1.intersect(circle2);
    for (let pt of ip_tmp) {
        if (pt.on(arc1) && pt.on(arc2)) {
            ip.push(pt);
        }
    }
    return ip;
}

export function intersectArc2Circle(arc, circle) {
    let ip = [];

    // Case when arc center incident to circle center
    // Return arc's end points as 2 intersection points
    if (circle.pc.equalTo(arc.pc) && Flatten.Utils.EQ(circle.r, arc.r)) {
        ip.push(arc.start);
        ip.push(arc.end);
        return ip;
    }

    // Common case
    let circle1 = circle;
    let circle2 = new Flatten.Circle(arc.pc, arc.r);
    let ip_tmp = intersectCircle2Circle(circle1, circle2);
    for (let pt of ip_tmp) {
        if (pt.on(arc)) {
            ip.push(pt);
        }
    }
    return ip;
}

export function intersectArc2Box(arc, box) {
    let ips = [];
    for (let seg of box.toSegments()) {
        let ips_tmp = intersectSegment2Arc(seg, arc);
        for (let ip of ips_tmp) {
            ips.push(ip);
        }
    }
    return ips;
}

export function intersectEdge2Segment(edge, segment) {
    return edge.isSegment ? intersectSegment2Segment(edge.shape, segment) : intersectSegment2Arc(segment, edge.shape);
}

export function intersectEdge2Arc(edge, arc) {
    return edge.isSegment ? intersectSegment2Arc(edge.shape, arc) : intersectArc2Arc(edge.shape, arc);
}

export function intersectEdge2Line(edge, line) {
    return edge.isSegment ? intersectSegment2Line(edge.shape, line) : intersectLine2Arc(line, edge.shape);
}

export function intersectEdge2Ray(edge, ray) {
    return edge.isSegment ? intersectRay2Segment(ray, edge.shape) : intersectRay2Arc(ray, edge.shape);
}

export function intersectEdge2Circle(edge, circle) {
    return edge.isSegment ? intersectSegment2Circle(edge.shape, circle) : intersectArc2Circle(edge.shape, circle);
}

export function intersectSegment2Polygon(segment, polygon) {
    let ip = [];

    for (let edge of polygon.edges) {
        for (let pt of intersectEdge2Segment(edge, segment)) {
            ip.push(pt);
        }
    }

    return ip;
}

export function intersectArc2Polygon(arc, polygon) {
    let ip = [];

    for (let edge of polygon.edges) {
        for (let pt of intersectEdge2Arc(edge, arc)) {
            ip.push(pt);
        }
    }

    return ip;
}

export function intersectLine2Polygon(line, polygon) {
    let ip = [];

    if (polygon.isEmpty()) {
        return ip;
    }

    for (let edge of polygon.edges) {
        for (let pt of intersectEdge2Line(edge, line)) {
            if (!ptInIntPoints(pt, ip)) {
                ip.push(pt);
            }
        }
    }

    return line.sortPoints(ip);
}

export function intersectCircle2Polygon(circle, polygon) {
    let ip = [];

    if (polygon.isEmpty()) {
        return ip;
    }

    for (let edge of polygon.edges) {
        for (let pt of intersectEdge2Circle(edge, circle)) {
            ip.push(pt);
        }
    }

    return ip;
}

export function intersectEdge2Edge(edge1, edge2) {
    if (edge1.isSegment) {
        return intersectEdge2Segment(edge2, edge1.shape)
    }
    else if (edge1.isArc) {
        return intersectEdge2Arc(edge2, edge1.shape)
    }
    else if (edge1.isLine) {
        return intersectEdge2Line(edge2, edge1.shape)
    }
    else if (edge1.isRay) {
        return intersectEdge2Ray(edge2, edge1.shape)
    }
    return []
}

export function intersectEdge2Polygon(edge, polygon) {
    let ip = [];

    if (polygon.isEmpty() || edge.shape.box.not_intersect(polygon.box)) {
        return ip;
    }

    let resp_edges = polygon.edges.search(edge.shape.box);

    for (let resp_edge of resp_edges) {
        ip = [...ip, ...intersectEdge2Edge(edge, resp_edge)]
    }

    return ip;
}

export function intersectMultiline2Polygon(multiline, polygon) {
    let ip = [];

    if (polygon.isEmpty() || multiline.size === 0) {
        return ip;
    }

    for (let edge of multiline) {
        ip = [...ip, ...intersectEdge2Polygon(edge, polygon)];
    }

    return ip;
}

export function intersectPolygon2Polygon(polygon1, polygon2) {
    let ip = [];

    if (polygon1.isEmpty() || polygon2.isEmpty()) {
        return ip;
    }

    if (polygon1.box.not_intersect(polygon2.box)) {
        return ip;
    }

    for (let edge1 of polygon1.edges) {
        ip = [...ip, ...intersectEdge2Polygon(edge1, polygon2)]
    }

    return ip;
}

export function intersectBox2Box(box1, box2) {
    let ip = [];
    for (let segment1 of box1.toSegments()) {
        for (let segment2 of box2.toSegments()) {
            for (let pt of intersectSegment2Segment(segment1, segment2)) {
                ip.push(pt)
            }
        }
    }
    return ip;
}

export function intersectShape2Polygon(shape, polygon) {
    if (shape instanceof Flatten.Line) {
        return intersectLine2Polygon(shape, polygon);
    }
    else if (shape instanceof Flatten.Segment) {
        return intersectSegment2Polygon(shape, polygon);
    }
    else if (shape instanceof Flatten.Arc) {
        return intersectArc2Polygon(shape, polygon);
    }
    else {
        return [];
    }
}

function ptInIntPoints(new_pt, ip) {
    return ip.some( pt => pt.equalTo(new_pt) )
}

function createLineFromRay(ray) {
    return new Flatten.Line(ray.start, ray.norm)
}
export function intersectRay2Segment(ray, segment) {
    return intersectSegment2Line(segment, createLineFromRay(ray))
        .filter(pt => ray.contains(pt));
}

export function intersectRay2Arc(ray, arc) {
    return intersectLine2Arc(createLineFromRay(ray), arc)
        .filter(pt => ray.contains(pt))
}

export function intersectRay2Circle(ray, circle) {
    return intersectLine2Circle(createLineFromRay(ray), circle)
        .filter(pt => ray.contains(pt))
}

export function intersectRay2Box(ray, box) {
    return intersectLine2Box(createLineFromRay(ray), box)
        .filter(pt => ray.contains(pt))
}

export function intersectRay2Line(ray, line) {
    return intersectLine2Line(createLineFromRay(ray), line)
        .filter(pt => ray.contains(pt))
}

export function intersectRay2Ray(ray1, ray2) {
    return intersectLine2Line(createLineFromRay(ray1), createLineFromRay(ray2))
        .filter(pt => ray1.contains(pt))
        .filter(pt => ray2.contains(pt))
}

export function intersectRay2Polygon(ray, polygon) {
    return intersectLine2Polygon(createLineFromRay(ray), polygon)
        .filter(pt => ray.contains(pt))
}

export function intersectShape2Shape(shape1, shape2) {
    if (shape1.intersect && shape1.intersect instanceof Function) {
        return shape1.intersect(shape2)
    }
    throw Errors.UNSUPPORTED_SHAPE_TYPE
}

export function intersectShape2Multiline(shape, multiline) {
    let ip = [];
    for (let edge of multiline) {
        ip = [...ip, ...intersectShape2Shape(shape, edge.shape)];
    }
    return ip;
}

export function intersectMultiline2Multiline(multiline1, multiline2) {
    let ip = [];
    for (let edge1 of multiline1) {
        for (let edge2 of multiline2) {
            ip = [...ip, ...intersectShape2Shape(edge1.shape, edge2.shape)];
        }
    }
    return ip;
}
