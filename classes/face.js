/**
 * Created by Alex Bol on 3/17/2017.
 */

"use strict";

module.exports = function (Flatten) {
    let {Point, Segment, Arc, Box, Edge} = Flatten;
    /**
     * Class representing a face (closed loop) in a [polygon]{@link Flatten.Polygon} object.
     * Face is a circular bidirectional linked list of [edges]{@link Flatten.Edge}.
     * Face object cannot be instantiated with a constructor.
     * Instead, use [polygon.addFace()]{@link Flatten.Polygon#addFace} method.
     * <br/>
     * Note, that face only set entry point to the linked list of edges but does not contain edges by itself.
     * Container of edges is a property of the polygon object. <br/>
     *
     * @example
     * // Face implements "next" iterator which enables to iterate edges in for loop:
     * for (let edge of face) {
     *      console.log(edge.shape.length)     // do something
     * }
     *
     * // Instead, it is possible to iterate edges as linked list, starting from face.first:
     * let edge = face.first;
     * do {
     *   console.log(edge.shape.length);   // do something
     *   edge = edge.next;
     * } while (edge != face.first)
     */
    Flatten.Face = class Face {
        constructor(polygon, ...args) {
            /**
             * Reference to the first edge in face
             */
            this.first;
            /**
             * Reference to the last edge in face
             */
            this.last;

            this._box = undefined;  // new Box();
            this._orientation = undefined;

            if (args.length == 0) {
                return;
            }

            /* If passed an array it supposed to be:
             1) array of shapes that performs close loop or
             2) array of points that performs set of vertices
             */
            if (args.length == 1) {
                if (args[0] instanceof Array) {
                    // let argsArray = args[0];
                    let shapes =  args[0];  // argsArray[0];
                    if (shapes.length == 0)
                        return;

                    if (shapes.every((shape) => {
                            return shape instanceof Point
                        })) {
                        let segments = Face.points2segments(shapes);
                        this.shapes2face(polygon.edges, segments);
                    }
                    else if (shapes.every((shape) => {
                            return (shape instanceof Segment || shape instanceof Arc)
                        })) {
                        this.shapes2face(polygon.edges, shapes);
                    }
                }
                /* Create new face and copy edges into polygon.edges set */
                else if (args[0] instanceof Face) {
                    let face = args[0];
                    this.first = face.first;
                    this.last = face.last;
                    for (let edge of face) {
                        polygon.edges.add(edge);
                    }
                }
            }
            /* If passed two edges, consider them as start and end of the face loop */
            /* THIS METHOD WILL BE USED BY BOOLEAN OPERATIONS */
            /* Assume that edges already copied to polygon.edges set in the clip algorithm !!! */
            if (args.length == 2 && args[0] instanceof Edge && args[1] instanceof Edge) {
                this.first = args[0];                          // first edge in face or undefined
                this.last = args[1];                           // last edge in face or undefined
                this.last.next = this.first;
                this.first.prev = this.last;

                // set arc length
                this.setArcLength();
                /*
                 let edge = this.first;
                 edge.arc_length = 0;
                 edge = edge.next;
                 while (edge !== this.first) {
                 edge.arc_length = edge.prev.arc_length + edge.prev.length;
                 edge = edge.next;
                 }
                 */

                // this.box = this.getBox();
                // this.orientation = this.getOrientation();      // face direction cw or ccw
            }
        }

        [Symbol.iterator]() {
            let edge = undefined;
            return {
                next: () => {
                    let value = edge ? edge : this.first;
                    let done = this.first ? (edge ? edge === this.first : false) : true;
                    edge = value ? value.next : undefined;
                    return {value: value, done: done};
                }
            };
        };

        /**
         * Return array of edges from first to last
         * @returns {Array}
         */
        get edges() {
            let face_edges = [];
            for (let edge of this) {
                face_edges.push(edge);
            }
            return face_edges;
        }

        /**
         * Return number of edges in the face
         * @returns {number}
         */
        get size() {
            let counter = 0;
            for (let edge of this) {
                counter++;
            }
            return counter;
        }

        static points2segments(points) {
            let segments = [];
            for (let i = 0; i < points.length; i++) {
                segments.push(new Segment(points[i], points[(i + 1) % points.length]));
            }
            return segments;
        }

        shapes2face(edges, shapes) {
            for (let shape of shapes) {
                let edge = new Edge(shape);
                this.append(edges, edge);
                // this.box = this.box.merge(shape.box);
                // edges.add(edge);
            }
            // this.orientation = this.getOrientation();              // face direction cw or ccw
        }

        /**
         * Returns true if face is empty, false otherwise
         * @returns {boolean}
         */
        isEmpty() {
            return (this.first === undefined && this.last === undefined)
        }

        /**
         * Append given edge after the last edge (and before the first edge). <br/>
         * This method mutates current object and does not return any value
         * @param {PlanarSet} edges - Container of edges
         * @param {Edge} edge - Edge to be appended to the linked list
         */
        append(edges, edge) {
            if (this.first === undefined) {
                edge.prev = edge;
                edge.next = edge;
                this.first = edge;
                this.last = edge;
                edge.arc_length = 0;
            }
            else {
                // append to end
                edge.prev = this.last;
                this.last.next = edge;

                // update edge to be last
                this.last = edge;

                // restore circular links
                this.last.next = this.first;
                this.first.prev = this.last;

                // set arc length
                edge.arc_length = edge.prev.arc_length + edge.prev.length;
            }
            edge.face = this;

            edges.add(edge);      // Add new edges into edges container
        }

        /**
         * Insert edge newEdge into the linked list after the edge edgeBefore <br/>
         * This method mutates current object and does not return any value
         * @param {PlanarSet} edges - Container of edges
         * @param {Edge} newEdge - Edge to be inserted into linked list
         * @param {Edge} edgeBefore - Edge to insert newEdge after it
         */
        insert(edges, newEdge, edgeBefore) {
            if (this.first === undefined) {
                edge.prev = newEdge;
                edge.next = newEdge;
                this.first = newEdge;
                this.last = newEdge;
            }
            else {
                /* set links to new edge */
                let edgeAfter = edgeBefore.next;
                edgeBefore.next = newEdge;
                edgeAfter.prev = newEdge;

                /* set links from new edge */
                newEdge.prev = edgeBefore;
                newEdge.next = edgeAfter;

                /* extend chain if new edge added after last edge */
                if (this.last === edgeBefore)
                    this.first = newEdge;
            }
            newEdge.face = this;

            edges.add(newEdge);      // Add new edges into edges container
        }

        /**
         * Remove the given edge from the linked list of the face <br/>
         * This method mutates current object and does not return any value
         * @param {PlanarSet} edges - Container of edges
         * @param {Edge} edge - Edge to be removed
         */
        remove(edges, edge) {
            // special case if last edge removed
            if (edge === this.first && edge === this.last) {
                this.first = undefined;
                this.last = undefined;
            }
            else {
                // update linked list
                edge.prev.next = edge.next;
                edge.next.prev = edge.prev;
                // update first if need
                if (edge === this.first) {
                    this.first = edge.next;
                }
                // update last if need
                if (edge === this.last) {
                    this.last = edge.prev;
                }
            }
            edges.delete(edge);      // delete from PlanarSet of edges and update index
        }

        /**
         * Set arc_length property for each of the edges in the face.
         * Arc_length of the edge it the arc length from the first edge of the face
         */
        setArcLength() {
            for (let edge of this) {
                if (edge === this.first) {
                    edge.arc_length = 0.0;
                }
                else {
                    edge.arc_length = edge.prev.arc_length + edge.prev.length;
                }
                edge.face = this;
            }
        }

        /**
         * Returns the absolute value of the area of the face
         * @returns {number}
         */
        area() {
            return Math.abs(this.signedArea());
        }

        /**
         * Returns signed area of the simple face.
         * Face is simple if it has no self intersections that change its orientation.
         * Then the area will be positive if the orientation of the face is clockwise,
         * and negative if orientation is counterclockwise.
         * It may be zero if polygon is degenerated.
         * @returns {number}
         */
        signedArea() {
            let sArea = 0;
            for (let edge of this) {
                sArea += edge.shape.definiteIntegral(this.box.ymin);
            }
            return sArea;
        }

        /**
         * Return face orientation: one of Flatten.ORIENTATION.CCW, Flatten.ORIENTATION.CW, Flatten.ORIENTATION.NOT_ORIENTABLE <br/>
         * According to Green theorem the area of a closed curve may be calculated as double integral,
         * and the sign of the integral will be defined by the direction of the curve.
         * When the integral ("signed area") will be negative, direction is counter clockwise,
         * when positive - clockwise and when it is zero, polygon is not orientable.
         * See {@link https://mathinsight.org/greens_theorem_find_area}
         * @returns {number}
         */
        orientation() {
            if (this._orientation === undefined) {
                let area = this.signedArea();
                if (Flatten.Utils.EQ_0(area)) {
                    this._orientation = Flatten.ORIENTATION.NOT_ORIENTABLE;
                }
                else if (Flatten.Utils.LT(area, 0)) {
                    this._orientation = Flatten.ORIENTATION.CCW;
                }
                else {
                    this._orientation = Flatten.ORIENTATION.CW;
                }
            }
            return this._orientation;
        }

        /**
         * Return bounding box of the face
         * @returns {Box}
         */
        get box() {
            if (this._box === undefined) {
                let box = new Flatten.Box();
                for (let edge of this) {
                    box = box.merge(edge.box);
                }
                this._box = box;
            }
            return this._box;
        }

        /**
         * Check relation between face and other polygon
         * on strong assumption that they are NOT INTERSECTED <br/>
         * Then there are 4 options: <br/>
         * face disjoint to polygon - Flatten.OUTSIDE <br/>
         * face inside polygon - Flatten.INSIDE <br/>
         * face contains polygon - Flatten.CONTAIN <br/>
         * face interlaced with polygon: inside some face and contains other face - Flatten.INTERLACE <br/>
         * @param {Polygon} polygon - Polygon to check relation
         */
        getRelation(polygon) {
            this.first.bv = this.first.bvStart = this.first.bvEnd = undefined;
            let bvThisInOther = this.first.setInclusion(polygon);
            let resp = polygon.faces.search(this.box);
            if (resp.length === 0) {
                return bvThisInOther;        // OUTSIDE or INSIDE
            }
            else {                           // possible INTERLACE
                let polyTmp = new Flatten.Polygon();
                polyTmp.addFace(this);

                let numInsideThis = 0;
                for (let face of resp) {
                    face.first.bv = face.first.bvStart = face.first.bvEnd = undefined;
                    let bvOtherInThis = face.first.setInclusion(polyTmp);
                    if (bvOtherInThis === Flatten.INSIDE) {
                        numInsideThis++;
                    }
                }
                if (bvThisInOther === Flatten.OUTSIDE) {
                    if (numInsideThis === 0) {                   // none inside this - outside
                        return Flatten.OUTSIDE;
                    }
                    else if (numInsideThis === resp.length) {      // all from resp inside this - contains or interlace
                        if (resp.length === polygon.faces.size) {
                            return Flatten.CONTAINS;               // all faces from polygon are in response - contains
                        }
                        else {
                            return Flatten.INTERLACE;              // some faces inside - interlace
                        }
                    }
                    else {
                        return Flatten.INTERLACE;                  // some faces inside - interlace
                    }
                }
                else if (bvThisInOther === Flatten.INSIDE) {
                    return numInsideThis === 0 ? Flatten.INSIDE : Flatten.INTERLACE;
                }
            }
        }

        svg() {
            let svgStr = `\nM${this.first.start.x},${this.first.start.y}`;

            for (let edge of this) {
                svgStr += edge.svg();
            }

            svgStr += ` z`;
            return svgStr;
        }
    };
};