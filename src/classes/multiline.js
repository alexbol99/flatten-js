"use strict";

import Flatten from '../flatten';
import LinkedList from '../data_structures/linked_list';
import {END_VERTEX, NOT_VERTEX, START_VERTEX} from "../utils/constants";

/**
 * Class Multiline represent connected path of [edges]{@link Flatten.Edge}, where each edge may be
 * [segment]{@link Flatten.Segment}, [arc]{@link Flatten.Arc}, [line]{@link Flatten.Line} or [ray]{@link Flatten.Ray}
 */
export class Multiline extends LinkedList {
    constructor(...args) {
        super();

        if (args.length === 0) {
            return;
        }

        if (args.length == 1) {
            if (args[0] instanceof Array) {
                let shapes = args[0];
                if (shapes.length == 0)
                    return;

                // TODO: more strict validation:
                // there may be only one line
                // only first and last may be rays
                let validShapes = shapes.every((shape) => {
                    return shape instanceof Flatten.Segment ||
                        shape instanceof Flatten.Arc ||
                        shape instanceof Flatten.Ray ||
                        shape instanceof Flatten.Line
                });

                for (let shape of shapes) {
                    let edge = new Flatten.Edge(shape);
                    this.append(edge);
                }
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
        return this.edges.reduce( (acc,edge) => acc = acc.merge(edge.box), new Flatten.Box() );
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
     * Return new cloned instance of Multiline
     * @returns {Multiline}
     */
    clone() {
        return new Multiline(this.toShapes());
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
     * Positive value of angle defines rotation counter clockwise, negative - clockwise
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
     * Return string to draw multiline in svg
     * @param attrs  - an object with attributes for svg path element,
     * like "stroke", "strokeWidth", "fill", "fillRule", "fillOpacity"
     * Defaults are stroke:"black", strokeWidth:"1", fill:"lightcyan", fillRule:"evenodd", fillOpacity: "1"
     * TODO: support semi-infinite Ray and infinite Line
     * @returns {string}
     */
    svg(attrs = {}) {
        let {stroke, strokeWidth, fill, fillRule, fillOpacity, id, className} = attrs;
        let id_str = (id && id.length > 0) ? `id="${id}"` : "";
        let class_str = (className && className.length > 0) ? `class="${className}"` : "";

        let svgStr = `\n<path stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "none"}" fill-opacity="${fillOpacity || 1.0}" ${id_str} ${class_str} d="`;
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
