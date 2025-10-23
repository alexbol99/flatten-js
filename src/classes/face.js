/**
 * Created by Alex Bol on 3/17/2017.
 */

"use strict";

import Flatten from '../flatten';
import CircularLinkedList from '../data_structures/circular_linked_list';
import {CCW, ORIENTATION} from '../utils/constants';

/**
 * Class representing a face (closed loop) in a [polygon]{@link Flatten.Polygon} object.
 * Face is a circular bidirectionally linked list of [edges]{@link Flatten.Edge}.
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
export class Face extends CircularLinkedList {
    constructor(polygon, ...args) {
        super();            // construct empty list of edges
        /**
         * Reference to the first edge in face
         */
        // this.first;
        /**
         * Reference to the last edge in face
         */
        // this.last;

        this._box = undefined;  // new Box();
        this._orientation = undefined;

        if (args.length === 0) {
            return;
        }

        /* If passed an array it supposed to be:
         1) array of shapes that performs close loop or
         2) array of points that performs set of vertices
         */
        if (args.length === 1) {
            if (args[0] instanceof Array) {
                // let argsArray = args[0];
                let shapes = args[0];  // argsArray[0];
                if (shapes.length === 0)
                    return;

                /* array of Flatten.Points */
                if (shapes.every((shape) => {return shape instanceof Flatten.Point})) {
                    let segments = Face.points2segments(shapes);
                    this.shapes2face(polygon.edges, segments);
                }
                /* array of points as pairs of numbers */
                else if (shapes.every((shape) => {return shape instanceof Array && shape.length === 2})) {
                    let points = shapes.map((shape) => new Flatten.Point(shape[0],shape[1]));
                    let segments = Face.points2segments(points);
                    this.shapes2face(polygon.edges, segments);
                }
                /* array of segments ot arcs */
                else if (shapes.every((shape) => {
                    return (shape instanceof Flatten.Segment || shape instanceof Flatten.Arc)
                })) {
                    this.shapes2face(polygon.edges, shapes);
                }
                // this is from JSON.parse object
                else if (shapes.every((shape) => {
                    return (shape.name === "segment" || shape.name === "arc")
                })) {
                    let flattenShapes = [];
                    for (let shape of shapes) {
                        let flattenShape;
                        if (shape.name === "segment") {
                            flattenShape = new Flatten.Segment(shape);
                        } else {
                            flattenShape = new Flatten.Arc(shape);
                        }
                        flattenShapes.push(flattenShape);
                    }
                    this.shapes2face(polygon.edges, flattenShapes);
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
            /* Instantiate face from a circle in CCW orientation */
            else if (args[0] instanceof Flatten.Circle) {
                this.shapes2face(polygon.edges, [args[0].toArc(CCW)]);
            }
            /* Instantiate face from a box in CCW orientation */
            else if (args[0] instanceof Flatten.Box) {
                let box = args[0];
                this.shapes2face(polygon.edges, [
                    new Flatten.Segment(new Flatten.Point(box.xmin, box.ymin), new Flatten.Point(box.xmax, box.ymin)),
                    new Flatten.Segment(new Flatten.Point(box.xmax, box.ymin), new Flatten.Point(box.xmax, box.ymax)),
                    new Flatten.Segment(new Flatten.Point(box.xmax, box.ymax), new Flatten.Point(box.xmin, box.ymax)),
                    new Flatten.Segment(new Flatten.Point(box.xmin, box.ymax), new Flatten.Point(box.xmin, box.ymin))
                ]);
            }
        }
        /* If passed two edges, consider them as start and end of the face loop */
        /* THIS METHOD WILL BE USED BY BOOLEAN OPERATIONS */
        /* Assume that edges already copied to polygon.edges set in the clip algorithm !!! */
        if (args.length === 2 && args[0] instanceof Flatten.Edge && args[1] instanceof Flatten.Edge) {
            this.first = args[0];                          // first edge in face or undefined
            this.last = args[1];                           // last edge in face or undefined
            this.last.next = this.first;
            this.first.prev = this.last;

            // set arc length
            this.setArcLength();

            // this.box = this.getBox();
            // this.orientation = this.getOrientation();      // face direction cw or ccw
        }
    }

    /**
     * Return array of edges from first to last
     * @returns {PolygonEdge[]}
     */
    get edges() {
        return this.toArray();
    }

    /**
     * Return array of vertices from first to last
     * @returns {Point[]}
     */
    get vertices() {
        return this.edges.map(edge => edge.shape.start.clone());
    }

    /**
     * Return array of shapes which comprise the face
     * @returns {Array<Segment | Arc>}
     */
    get shapes() {
        return this.edges.map(edge => edge.shape.clone());
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
     * Get all edges length
     * @returns {number}
     */
    get perimeter() {
        return this.last.arc_length + this.last.length
    }

    /**
     * Get point on face boundary at given length
     * @param {number} length - The length along the face boundary
     * @returns {Point}
     */
    pointAtLength(length) {
        if (length > this.perimeter || length < 0) return null;
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

    static points2segments(points) {
        let segments = [];
        for (let i = 0; i < points.length; i++) {
            // skip zero length segment
            if (points[i].equalTo(points[(i + 1) % points.length]))
                continue;
            segments.push(new Flatten.Segment(points[i], points[(i + 1) % points.length]));
        }
        return segments;
    }

    shapes2face(edges, shapes) {
        for (let shape of shapes) {
            let edge = new Flatten.Edge(shape);
            this.append(edge);
            // this.box = this.box.merge(shape.box);
            edges.add(edge);
        }
        // this.orientation = this.getOrientation();              // face direction cw or ccw
    }

    /**
     * Append edge after the last edge of the face (and before the first edge). <br/>
     * @param {Edge} edge - Edge to be appended to the linked list
     * @returns {Face}
     */
    append(edge) {
        super.append(edge);
        // set arc length
        this.setOneEdgeArcLength(edge);
        edge.face = this;
        // edges.add(edge);      // Add new edges into edges container
        return this;
    }

    /**
     * Insert edge newEdge into the linked list after the edge edgeBefore <br/>
     * @param {Edge} newEdge - Edge to be inserted into linked list
     * @param {Edge} edgeBefore - Edge to insert newEdge after it
     * @returns {Face}
     */
    insert(newEdge, edgeBefore) {
        super.insert(newEdge, edgeBefore);
        // set arc length
        this.setOneEdgeArcLength(newEdge);
        newEdge.face = this;
        return this;
    }

    /**
     * Remove the given edge from the linked list of the face <br/>
     * @param {Edge} edge - Edge to be removed
     * @returns {Face}
     */
    remove(edge) {
        super.remove(edge);
        // Recalculate arc length
        this.setArcLength();
        return this;
    }

    /**
     * Merge current edge with the next edge. Given edge will be extended,
     * next edge after it will be removed. The distortion of the polygon
     * is on the responsibility of the user of this method
     * @param {Edge} edge - edge to be extended
     * @returns {Face}
     */
    merge_with_next_edge(edge) {
        edge.shape.end.x = edge.next.shape.end.x
        edge.shape.end.y = edge.next.shape.end.y
        this.remove(edge.next)
        return this;
    }

    /**
     * Reverse orientation of the face: first edge become last and vice a verse,
     * all edges starts and ends swapped, direction of arcs inverted. If face was oriented
     * clockwise, it becomes counterclockwise and vice versa
     */
    reverse() {
        // collect edges in revert order with reverted shapes
        let edges = [];
        let edge_tmp = this.last;
        do {
            // reverse shape
            edge_tmp.shape = edge_tmp.shape.reverse();
            edges.push(edge_tmp);
            edge_tmp = edge_tmp.prev;
        } while (edge_tmp !== this.last);

        // restore linked list
        this.first = undefined;
        this.last = undefined;
        for (let edge of edges) {
            if (this.first === undefined) {
                edge.prev = edge;
                edge.next = edge;
                this.first = edge;
                this.last = edge;
            } else {
                // append to end
                edge.prev = this.last;
                this.last.next = edge;

                // update edge to be last
                this.last = edge;

                // restore circular links
                this.last.next = this.first;
                this.first.prev = this.last;

            }
            // set arc length
            this.setOneEdgeArcLength(edge);
        }

        // Recalculate orientation, if set
        if (this._orientation !== undefined) {
            this._orientation = undefined;
            this._orientation = this.orientation();
        }
    }


    /**
     * Set arc_length property for each of the edges in the face.
     * Arc_length of the edge it the arc length from the first edge of the face
     */
    setArcLength() {
        for (let edge of this) {
            this.setOneEdgeArcLength(edge);
            edge.face = this;
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
        let ymin = this.box.ymin;
        for (let edge of this) {
            sArea += edge.shape.definiteIntegral(ymin);
        }
        return sArea;
    }

    /**
     * Return face orientation: one of Flatten.ORIENTATION.CCW, Flatten.ORIENTATION.CW, Flatten.ORIENTATION.NOT_ORIENTABLE <br/>
     * According to Green theorem the area of a closed curve may be calculated as double integral,
     * and the sign of the integral will be defined by the direction of the curve.
     * When the integral ("signed area") will be negative, direction is counterclockwise,
     * when positive - clockwise and when it is zero, polygon is not orientable.
     * See {@link https://mathinsight.org/greens_theorem_find_area}
     * @returns {number}
     */
    orientation() {
        if (this._orientation === undefined) {
            let area = this.signedArea();
            if (Flatten.Utils.EQ_0(area)) {
                this._orientation = ORIENTATION.NOT_ORIENTABLE;
            } else if (Flatten.Utils.LT(area, 0)) {
                this._orientation = ORIENTATION.CCW;
            } else {
                this._orientation = ORIENTATION.CW;
            }
        }
        return this._orientation;
    }

    /**
     * Returns true if face of the polygon is simple (no self-intersection points found)
     * NOTE: this method is incomplete because it does not exclude touching points.
     * Self intersection test should check if polygon change orientation in the test point.
     * @param {PlanarSet} edges - reference to polygon edges to provide search index
     * @returns {boolean}
     */
    isSimple(edges) {
        let ip = Face.getSelfIntersections(this, edges, true);
        return ip.length === 0;
    }

    static getSelfIntersections(face, edges, exitOnFirst = false) {
        let int_points = [];

        // calculate intersections
        for (let edge1 of face) {

            // request edges of polygon in the box of edge1
            let resp = edges.search(edge1.box);

            // for each edge2 in response
            for (let edge2 of resp) {

                // Skip itself
                if (edge1 === edge2)
                    continue;

                // Skip is edge2 belongs to another face
                if (edge2.face !== face)
                    continue;

                // Skip next and previous edge if both are segment (if one of them arc - calc intersection)
                if (edge1.shape instanceof Flatten.Segment && edge2.shape instanceof Flatten.Segment &&
                    (edge1.next === edge2 || edge1.prev === edge2))
                    continue;

                // calculate intersections between edge1 and edge2
                let ip = edge1.shape.intersect(edge2.shape);

                // for each intersection point
                for (let pt of ip) {

                    // skip start-end connections
                    if (pt.equalTo(edge1.start) && pt.equalTo(edge2.end) && edge2 === edge1.prev)
                        continue;
                    if (pt.equalTo(edge1.end) && pt.equalTo(edge2.start) && edge2 === edge1.next)
                        continue;

                    int_points.push(pt);

                    if (exitOnFirst)
                        break;
                }

                if (int_points.length > 0 && exitOnFirst)
                    break;
            }

            if (int_points.length > 0 && exitOnFirst)
                break;

        }
        return int_points;
    }

    /**
     * Returns edge which contains given point
     * @param {Point} pt - test point
     * @returns {Edge}
     */
    findEdgeByPoint(pt) {
        let edgeFound;
        for (let edge of this) {
            if (pt.equalTo(edge.shape.start)) continue
            if (pt.equalTo(edge.shape.end) || edge.shape.contains(pt)) {
                edgeFound = edge;
                break;
            }
        }
        return edgeFound;
    }

    /**
     * Returns new polygon created from one face
     * @returns {Polygon}
     */
    toPolygon() {
        return new Flatten.Polygon(this.shapes);
    }

    toJSON() {
        return this.edges.map(edge => edge.toJSON());
    }

    /**
     * Returns string to be assigned to "d" attribute inside defined "path"
     * @returns {string}
     */
    svg() {
        let svgStr = `M${this.first.start.x},${this.first.start.y}`;
        for (let edge of this) {
            svgStr += edge.svg();
        }
        svgStr += ` z`;
        return svgStr;
    }

}

Flatten.Face = Face;
