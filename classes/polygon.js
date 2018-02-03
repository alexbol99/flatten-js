/**
 * Created by Alex Bol on 3/15/2017.
 */

"use strict";

module.exports = function(Flatten) {
    let {Edge, Face, PlanarSet, Box} = Flatten;
    let {ray_shoot} = Flatten;
    /**
     * Class representing a polygon.<br/>
     * Polygon in FlattenJS is a multipolygon comprised from a set of faces<br/>
     * Face, in turn, is a closed loop of edges, which can be a segment or a circular arc<br/>
     * @type {Polygon}
     */
    Flatten.Polygon = class Polygon {
        /**
         * Constructor creates new instance of polygon.<br/>
         * New polygon is empty. Add new face to the polygon using method <br/>
         * <code>
         *     polygon.addFace(Points|Segments|Arcs[])
         * </code>
         */
        constructor() {
            /**
             * Set of faces (closed loops), may be empty
             * @type {PlanarSet}
             */
            this.faces = new PlanarSet();
            /**
             * Set of edges. Usually is not used directly. Better access edges via faces
             * @type {PlanarSet}
             */
            this.edges = new PlanarSet();
        }

        /**
         * Get bounding box of the polygon
         * @returns {Box}
         */
        get box() {
            return [...this.faces].reduce( (acc, face) => acc.merge(face.box), new Box() );
        }

        /**
         * Return array of vertices
         * @returns {Array}
         */
        get vertices() {
            return [...this.edges].map( edge => edge.start);
        }

        /**
         * Add new face to polygon
         * @param {Points[]|Segments|Arcs[]} args - list of points or list of shapes (segments and arcs)
         * which comprise a closed loop
         * @returns {Face}
         */
        addFace(...args) {
            let face = new Face(this, ...args);
            this.faces.add(face);
            return face;
        }

        /**
         * Delete existing face from polygon
         * @param {Face}
         * @returns {boolean|*}
         */
        deleteFace(face) {
            for (let edge of face) {
                let deleted = this.edges.delete(edge);
            }
            let deleted = this.faces.delete(face);
            return deleted;
        }

        removeChain(face, edgeFrom, edgeTo) {
            // Special case: all edges removed
            if (edgeTo.next === edgeFrom) {
                this.deleteFace(face);
                return;
            }
            for (let edge = edgeFrom; edge !== edgeTo.next; edge = edge.next ) {
                face.remove(edge);
                this.edges.delete(edge);      // delete from PlanarSet of edges and update index
                if (face.isEmpty()) {
                    this.deleteFace(face);    // delete from PlanarSet of faces and update index
                    break;
                }
            }
        }

        /**
         * Add point as new vertex and split edge. Point supposed to belong to an edge
         * @param edge
         * @param pt
         * @returns {Edge}
         */
        addVertex(pt, edge) {
            let shapes = edge.shape.split(pt);
            if (shapes.length < 2) return;
            let newEdge = new Flatten.Edge(shapes[0]);
            let edgeBefore = edge.prev;

            /* Insert first split edge into linked list after edgeBefore */
            edge.face.insert(newEdge, edgeBefore);
            /* Update edge shape with second split edge keeping links */
            let oldBox = edge.box;
            edge.shape = shapes[1];

            /* Update set of edges and 2d index */
            this.edges.add(newEdge);
            this.edges.update(edge);

            return newEdge;
        }

        /**
         * Create new copied instance of the polygon
         * @returns {Polygon}
         */
        clone() {
            let polygon = new Polygon();
            for (let face of this.faces) {
                let shapes = [];
                for (let edge of face) {
                    shapes.push(edge.shape.clone());
                }
                polygon.addFace(shapes);
            }
            return polygon;
        }

        /**
         * Returns area of the polygon. Area of an island will be added, area of a hole will be subtracted
         * @returns {number}
         */
        area() {
            let signedArea = [...this.faces].reduce((acc,face) => acc + face.signedArea(), 0);
            return Math.abs(signedArea);
        }

        /**
         * Point in contour test based on ray shooting (tracing) algorithm
         * Returns true if point inside contour or lays on boundary,
         * otherwise returns false
         * @param point - test point
         * @returns {boolean} - true if inside or on boundary, false otherwise
         */
        contains(point) {
            let rel = ray_shoot(this, point);
            return (rel == Flatten.INSIDE || rel == Flatten.BOUNDARY) ? true : false;
        }

        /**
         * Return distance and shortest segment between polygon and other shape
         * @param shape
         * @returns {Number | Segment}
         */
        distanceTo(shape) {
            let {Distance} = Flatten;

            if (shape instanceof Flatten.Point) {
                let [dist, shortest_segment] = Distance.point2polygon(shape, this);
                shortest_segment = shortest_segment.swap();
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Circle ||
            shape instanceof Flatten.Line ||
            shape instanceof Flatten.Segment ||
            shape instanceof Flatten.Arc) {
                let [dist, shortest_segment] = Distance.shape2polygon(shape, this);
                shortest_segment = shortest_segment.swap();
                return [dist, shortest_segment];
            }

            /* this method is bit faster */
            if (shape instanceof  Flatten.Polygon) {
                let min_dist_and_segment = [Number.POSITIVE_INFINITY, new Flatten.Segment()];
                let dist, shortest_segment;

                for (let edge of this.edges) {
                    // let [dist, shortest_segment] = Distance.shape2polygon(edge.shape, shape);
                    let min_stop = min_dist_and_segment[0];
                    [dist, shortest_segment] = Distance.shape2planarSet(edge.shape, shape.edges, min_stop);
                    if (Flatten.Utils.LT(dist, min_stop)) {
                        min_dist_and_segment = [dist, shortest_segment];
                    }
                }
                return min_dist_and_segment;
            }
        }

        /**
         * Return string to draw polygon in svg
         * @param attrs  - json structure with any attributes allowed to svg path element,
         * like "stroke", "strokeWidth", "fill", "fillRule"
         * Defaults are stroke:"black", strokeWidth:"3", fill:"lightcyan", fillRule:"evenodd"
         * @returns {string}
         */
        svg(attrs = {stroke:"black", strokeWidth:"3", fill:"lightcyan", fillRule:"evenodd"}) {
            let {stroke, strokeWidth, fill, fillRule} = attrs;
            let svgStr = `\n<path stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" fill-rule="${fillRule}" d="`;
            for (let face of this.faces) {
                svgStr += face.svg();
            }
            svgStr += `">\n</path>`;

            return svgStr;
        }
    }
};