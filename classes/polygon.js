/**
 * Created by Alex Bol on 3/15/2017.
 */

"use strict";

module.exports = function(Flatten) {
    let {Edge, Face, PlanarSet, Box} = Flatten;
    let {ray_shoot} = Flatten;
    /**
     * Class representing a polygon.<br/>
     * Polygon in FlattenJS is a multipolygon comprised from a set of [faces]{@link Flatten.Face}. <br/>
     * Face, in turn, is a closed loop of [edges]{@link Flatten.Edge}, where edge may be segment or circular arc<br/>
     * @type {Polygon}
     */
    Flatten.Polygon = class Polygon {
        /**
         * Constructor creates new instance of polygon.<br/>
         * New polygon is empty. Add face to the polygon using method <br/>
         * <code>
         *     polygon.addFace(Points[]|Segments[]|Arcs[])
         * </code>
         */
        constructor() {
            /**
             * Container of faces (closed loops), may be empty
             * @type {PlanarSet}
             */
            this.faces = new PlanarSet();
            /**
             * Container of edges
             * @type {PlanarSet}
             */
            this.edges = new PlanarSet();
        }

        /**
         * (Getter) Returns bounding box of the polygon
         * @returns {Box}
         */
        get box() {
            return [...this.faces].reduce( (acc, face) => acc.merge(face.box), new Box() );
        }

        /**
         * (Getter) Returns array of vertices
         * @returns {Array}
         */
        get vertices() {
            return [...this.edges].map( edge => edge.start);
        }

        /**
         * Add new face to polygon. Returns added face
         * @param {Points[]|Segments[]|Arcs[]} args - list of points or list of shapes (segments and arcs)
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
         * @param {Face} face Face to be deleted
         * @returns {boolean}
         */
        deleteFace(face) {
            for (let edge of face) {
                let deleted = this.edges.delete(edge);
            }
            let deleted = this.faces.delete(face);
            return deleted;
        }

        /**
         * Delete chain of edges from the face.
         * @param {Face} face Face to remove chain
         * @param {Edge} edgeFrom Start of the chain of edges to be removed
         * @param {Edge} edgeTo End of the chain of edges to be removed
         */
        removeChain(face, edgeFrom, edgeTo) {
            // Special case: all edges removed
            if (edgeTo.next === edgeFrom) {
                this.deleteFace(face);
                return;
            }
            for (let edge = edgeFrom; edge !== edgeTo.next; edge = edge.next ) {
                face.remove(this.edges, edge);
                // this.edges.delete(edge);      // delete from PlanarSet of edges and update index
                if (face.isEmpty()) {
                    this.deleteFace(face);    // delete from PlanarSet of faces and update index
                    break;
                }
            }
        }

        /**
         * Add point as a new vertex and split edge. Point supposed to belong to an edge.
         * When edge is split, new edge created from the start of the edge to the new vertex
         * and inserted before current edge.
         * Current edge is trimmed and updated. Method returns new edge added.
         * @param {Edge} edge Edge to be split with new vertex and then trimmed from start
         * @param {Point} pt Point to be added as a new vertex
         * @returns {Edge}
         */
        addVertex(pt, edge) {
            let shapes = edge.shape.split(pt);
            if (shapes.length < 2) return;
            let newEdge = new Flatten.Edge(shapes[0]);
            let edgeBefore = edge.prev;

            /* Insert first split edge into linked list after edgeBefore */
            edge.face.insert(this.edges, newEdge, edgeBefore);

            // Remove old edge from edges container and 2d index
            this.edges.delete(edge);

            // Update edge shape with second split edge keeping links
            edge.shape = shapes[1];

            // Add updated edge to the edges container and 2d index
            this.edges.add(edge);

            return newEdge;
        }

        reverse() {
            for (let face of this.faces) {
                face.reverse();
            }
            return this;
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
         * Returns true if polygon contains point, including polygon boundary, false otherwise
         * Point in polygon test based on ray shooting algorithm
         * @param {Point} point - test point
         * @returns {boolean}
         */
        contains(point) {
            let rel = ray_shoot(this, point);
            return (rel == Flatten.INSIDE || rel == Flatten.BOUNDARY) ? true : false;
        }

        /**
         * Return distance and shortest segment between polygon and other shape as array [distance, shortest_segment]
         * @param {Shape} shape Shape of one of the types Point, Circle, Line, Segment, Arc or Polygon
         * @returns {Number | Segment}
         */
        distanceTo(shape) {
            let {Distance} = Flatten;

            if (shape instanceof Flatten.Point) {
                let [dist, shortest_segment] = Distance.point2polygon(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Circle ||
            shape instanceof Flatten.Line ||
            shape instanceof Flatten.Segment ||
            shape instanceof Flatten.Arc) {
                let [dist, shortest_segment] = Distance.shape2polygon(shape, this);
                shortest_segment = shortest_segment.reverse();
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
         * Return true if polygon is valid for boolean operations
         * Polygon is valid if <br/>
         * 1. All faces are simple polygons (there are no self-intersected polygons) <br/>
         * 2. All faces are orientable and there is no island inside island or hole inside hole - TODO <br/>
         * 3. There is no intersections between faces (excluding touching) - TODO <br/>
         * @returns {boolean}
         */
        isValid() {
            let valid = true;
            // 1. Polygon is invalid if at least one face is not simple
            for (let face of this.faces) {
                if (!face.isSimple(this.edges)) {
                    valid = false;
                    break;
                }
            }
            // 2. TODO: check if no island inside island and no hole inside hole
            // 3. TODO: check the there is no intersection between faces
            return valid;
        }

        /**
         * Returns new polygon translated by vector vec
         * @param {Vector} vec
         * @returns {Polygon}
         */
        translate(vec) {
            let newPolygon = new Polygon();
            for (let face of this.faces) {
                let shapes = new Array(face.size);
                for (let edge of face) {
                    shapes.push(edge.shape.translate(vec));
                }
                newPolygon.addFace(shapes);
            }
            return newPolygon;
        }

        /**
         * Return new polygon rotated by given angle around given point
         * If point omitted, rotate around origin (0,0)
         * Positive value of angle defines rotation counter clockwise, negative - clockwise
         * @param {number} angle - rotation angle in radians
         * @param {Point} center - rotation center, default is (0,0)
         * @returns {Polygon} - new rotated polygon
         */
        rotate(angle=0, center=new Flatten.Point()) {
            let newPolygon = new Polygon();
            for (let face of this.faces) {
                let shapes = new Array(face.size);
                for (let edge of face) {
                    shapes.push(edge.shape.rotate(angle, center));
                }
                newPolygon.addFace(shapes);
            }
            return newPolygon;
        }

        /**
         * Return new polygon transformed using affine transformation matrix
         * @param {Matrix} matrix - affine transformation matrix
         * @returns {Polygon} - new polygon
         */
        transform(matrix = new Flatten.Matrix()) {
            let newPolygon = new Polygon();
            for (let face of this.faces) {
                let shapes = new Array(face.size);
                for (let edge of face) {
                    shapes.push(edge.shape.transform(matrix));
                }
                newPolygon.addFace(shapes);
            }
            return newPolygon;
        }

        /**
         * Return string to draw polygon in svg
         * @param attrs  - json structure with attributes for svg path element,
         * like "stroke", "strokeWidth", "fill", "fillRule"
         * Defaults are stroke:"black", strokeWidth:"1", fill:"lightcyan", fillRule:"evenodd"
         * @returns {string}
         */
        svg(attrs = {}) {
            let {stroke, strokeWidth, fill, fillRule, fillOpacity, id, className} = attrs;
            // let restStr = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
            let id_str = (id && id.length > 0) ? `id="${id}"` : "";
            let class_str = (className && className.length > 0) ? `class="${className}"` : "";

            let svgStr = `\n<path stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "lightcyan"}" fill-rule="${fillRule || "evenodd"}" fill-opacity="${fillOpacity || 1.0}" ${id_str} ${class_str} d="`;
            for (let face of this.faces) {
                svgStr += face.svg();
            }
            svgStr += `" >\n</path>`;

            return svgStr;
        }

        toJSON() {
            return [...this.faces].map(face => face.toJSON());
        }
    }
};