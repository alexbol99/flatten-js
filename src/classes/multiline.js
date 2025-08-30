"use strict";

import Flatten from '../flatten';
import LinkedList from '../data_structures/linked_list';
import {convertToString} from "../utils/attributes";
import * as Intersection from "../algorithms/intersection";

/**
 * Class Multiline represent connected path of [edges]{@link Flatten.Edge}, where each edge may be
 * [segment]{@link Flatten.Segment}, [arc]{@link Flatten.Arc}, [line]{@link Flatten.Line} or [ray]{@link Flatten.Ray}
 */
export class Multiline extends LinkedList {
    constructor(...args) {
        super();
        this.isInfinite = false;

        if (args.length === 1 && args[0] instanceof Array && args[0].length > 0) {
            // there may be only one line and
            // only first and last may be rays
            let validShapes = false
            const shapes = args[0]
            const L = shapes.length
            const anyShape = (s) =>
                s instanceof Flatten.Segment || s instanceof Flatten.Arc ||
                s instanceof Flatten.Ray || s instanceof Flatten.Line;
            const anyShapeExceptLine = (s) =>
                s instanceof Flatten.Segment || s instanceof Flatten.Arc || s instanceof Flatten.Ray;
            const shapeSegmentOrArc = (s) => s instanceof Flatten.Segment || s instanceof Flatten.Arc;
            validShapes =
                L === 1 && anyShape(shapes[0]) ||
                L > 1 && anyShapeExceptLine(shapes[0]) && anyShapeExceptLine(shapes[L - 1]) &&
                shapes.slice(1, L - 1).every(shapeSegmentOrArc)

            if (validShapes) {
                this.isInfinite = shapes.some(shape =>
                    shape instanceof Flatten.Ray ||
                    shape instanceof Flatten.Line
                );

                for (let shape of shapes) {
                    let edge = new Flatten.Edge(shape);
                    this.append(edge);
                }

                this.setArcLength()
            } else {
                throw Flatten.Errors.ILLEGAL_PARAMETERS;
            }
        }
    }

    /**
     * (Getter) Return array of edges
     * @returns {Edge[]}
     */
    get edges() {
        return [...this];
    }

    /**
     * (Getter) Return bounding box of the multiline
     * @returns {Box}
     */
    get box() {
        return this.edges.reduce( (acc,edge) => acc.merge(edge.box), new Flatten.Box() );
    }

    /**
     * (Getter) Returns array of vertices
     * @returns {Point[]}
     */
    get vertices() {
        let v = this.edges.map(edge => edge.start);
        v.push(this.last.end);
        return v;
    }

    /**
     * (Getter) Returns length of the multiline, return POSITIVE_INFINITY if multiline is infinite
     * @returns {number}
     */
    get length() {
        if (this.isEmpty()) return 0;
        if (this.isInfinite) return Number.POSITIVE_INFINITY;

        let len = 0
        for (let edge of this) {
            len += edge.length;
        }
        return len
    }

    /**
     * Return new cloned instance of Multiline
     * @returns {Multiline}
     */
    clone() {
        return new Multiline(this.toShapes());
    }

    /**
     * Set arc_length property for each of the edges in the multiline.
     * Arc_length of the edge is the arc length from the multiline start vertex to the edge start vertex
     */
    setArcLength() {
        for (let edge of this) {
            this.setOneEdgeArcLength(edge);
        }
    }

    setOneEdgeArcLength(edge) {
        if (edge === this.first) {
            edge.arc_length = 0.0;
        } else {
            edge.arc_length = edge.prev.arc_length + edge.prev.length;
        }
    }

    /**
     * Return point on multiline at given length from the start of the multiline
     * @param length
     * @returns {Point | null}
     */
    pointAtLength(length) {
        if (length > this.length || length < 0) return null;
        if (this.isInfinite) return null

        let point = null;
        for (let edge of this) {
            if (length >= edge.arc_length &&
                (edge === this.last || length < edge.next.arc_length)) {
                point = edge.pointAtLength(length - edge.arc_length);
                break;
            }
        }
        return point;
    }

    /**
     * Split edge and add new vertex, return new edge inserted
     * @param {Point} pt - point on edge that will be added as new vertex
     * @param {Edge} edge - edge to split
     * @returns {Edge}
     */
    addVertex(pt, edge) {
        let shapes = edge.shape.split(pt);
        // if (shapes.length < 2) return;

        if (shapes[0] === null)   // point incident to edge start vertex, return previous edge
           return edge.prev;

        if (shapes[1] === null)   // point incident to edge end vertex, return edge itself
           return edge;

        let newEdge = new Flatten.Edge(shapes[0]);
        let edgeBefore = edge.prev;

        /* Insert first split edge into linked list after edgeBefore */
        this.insert(newEdge, edgeBefore);     // edge.face ?

        // Update edge shape with second split edge keeping links
        edge.shape = shapes[1];

        return newEdge;
    }

    getChain(edgeFrom, edgeTo) {
        let edges = []
        for (let edge = edgeFrom; edge !== edgeTo.next; edge = edge.next) {
            edges.push(edge)
        }
        return edges
    }

    /**
     * Split edges of multiline with intersection points and return mutated multiline
     * @param {Point[]} ip - array of points to be added as new vertices
     * @returns {Multiline}
     */
    split(ip) {
        for (let pt of ip) {
            let edge = this.findEdgeByPoint(pt);
            this.addVertex(pt, edge);
        }
        return this;
    }

    /**
     * Returns edge which contains given point
     * @param {Point} pt
     * @returns {Edge}
     */
    findEdgeByPoint(pt) {
        let edgeFound;
        for (let edge of this) {
            if (edge.shape.contains(pt)) {
                edgeFound = edge;
                break;
            }
        }
        return edgeFound;
    }

    /**
     * Calculate distance and shortest segment from any shape to multiline
     * @param shape
     * @returns {[number,Flatten.Segment]}
     */
    distanceTo(shape) {
        if (shape instanceof Point) {
            const [dist, shortest_segment] = Flatten.Distance.shape2multiline(shape, this);
            return [dist, shortest_segment.reverse()];
        }

        if (shape instanceof Flatten.Line) {
            const [dist, shortest_segment] = Flatten.Distance.shape2multiline(shape, this);
            return [dist, shortest_segment.reverse()];
        }

        if (shape instanceof Flatten.Circle) {
            const [dist, shortest_segment] = Flatten.Distance.shape2multiline(shape, this);
            return [dist, shortest_segment.reverse()];
        }

        if (shape instanceof Flatten.Segment) {
            const [dist, shortest_segment] = Flatten.Distance.shape2multiline(shape, this);
            return [dist, shortest_segment.reverse()];
        }

        if (shape instanceof Flatten.Arc) {
            const [dist, shortest_segment] = Flatten.Distance.shape2multiline(shape, this);
            return [dist, shortest_segment.reverse()];
        }

        if (shape instanceof Flatten.Multiline) {
            return Flatten.Distance.multiline2multiline(this, shape);
        }

        throw Flatten.Errors.UNSUPPORTED_SHAPE_TYPE;
    }

    /**
     * Calculate intersection of multiline with other shape
     * @param {Shape} shape
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof Flatten.Multiline) {
            return Intersection.intersectMultiline2Multiline(this, shape);
        }
        else {
            return Intersection.intersectShape2Multiline(shape, this);
        }
    }

    /**
     * Return true if multiline contains the shape: no point of shape lies outside
     * @param shape
     * @returns {boolean}
     */
    contains(shape) {
        if (shape instanceof Flatten.Point) {
            return this.edges.some(edge => edge.shape.contains(shape));
        }

        throw Flatten.Errors.UNSUPPORTED_SHAPE_TYPE;
    }

    /**
     * Returns new multiline translated by vector vec
     * @param {Vector} vec
     * @returns {Multiline}
     */
    translate(vec) {
        return new Multiline(this.edges.map( edge => edge.shape.translate(vec)));
    }

    /**
     * Return new multiline rotated by given angle around given point
     * If point omitted, rotate around origin (0,0)
     * Positive value of angle defines rotation counterclockwise, negative - clockwise
     * @param {number} angle - rotation angle in radians
     * @param {Point} center - rotation center, default is (0,0)
     * @returns {Multiline} - new rotated polygon
     */
    rotate(angle = 0, center = new Flatten.Point()) {
        return new Multiline(this.edges.map( edge => edge.shape.rotate(angle, center) ));
    }

    /**
     * Return new multiline transformed using affine transformation matrix
     * Method does not support unbounded shapes
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Multiline} - new multiline
     */
    transform(matrix = new Flatten.Matrix()) {
        return new Multiline(this.edges.map( edge => edge.shape.transform(matrix)));
    }

    /**
     * Transform multiline into array of shapes
     * @returns {Shape[]}
     */
    toShapes() {
        return this.edges.map(edge => edge.shape.clone())
    }

    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON() {
        return this.edges.map(edge => edge.toJSON());
    }

    /**
     * Return string to be inserted into 'points' attribute of <polyline> element
     * @returns {string}
     */
    svgPoints() {
        return this.vertices.map(p => `${p.x},${p.y}`).join(' ')
    }

    /**
     * Return string to be assigned to 'd' attribute of <path> element
     * @returns {string}
     */
    dpath() {
        let dPathStr = `M${this.first.start.x},${this.first.start.y}`;
        for (let edge of this) {
            dPathStr += edge.svg();
        }
        return dPathStr
    }

    /**
     * Return string to draw multiline in svg
     * @param attrs  - an object with attributes for svg path element
     * TODO: support semi-infinite Ray and infinite Line
     * @returns {string}
     */
    svg(attrs = {}) {
        let svgStr = `\n<path ${convertToString({fill: "none", ...attrs})} d="`;
        svgStr += `\nM${this.first.start.x},${this.first.start.y}`;
        for (let edge of this) {
            svgStr += edge.svg();
        }
        svgStr += `" >\n</path>`;
        return svgStr;
    }
}

Flatten.Multiline = Multiline;

/**
 * Shortcut function to create multiline
 * @param args
 */
export const multiline = (...args) => new Flatten.Multiline(...args);
Flatten.multiline = multiline;
