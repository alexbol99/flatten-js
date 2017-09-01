/**
 * Created by Alex Bol on 3/17/2017.
 */

"use strict";

module.exports = function(Flatten) {
    let {Point, Segment, Arc, Box, Edge} = Flatten;
    /**
     * Class representing a face (closed loop) of polygon.
     * New face object should not be created directly, use polygon.addFace() method instead.
     * Face implemented as a circular bidirectional linked list of edges.
     * @type {Face}
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
            /**
             * Face orientation: clockwise, counterclockwise or not-orientable
             * @type {Flatten.ORIENTATION}
             */
            this.orientation = undefined;
            /**
             * Bounding box of the face
             */
            this.box = new Box();

            if (args.length == 0) {
                return;
            }

            /* If passed an array it supposed to be:
             1) array of shapes that performs close loop or
             2) array of points that performs set of vertices
             */
            if (args.length == 1 && args[0] instanceof Array) {
                let shapes = args[0][0];
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

            /* If passed two edges, consider them as start and end of the face loop */
            /* THIS METHOD WILL BE USED BY BOOLEAN OPERATIONS */
            if (args.length == 2 && args[0] instanceof Edge && args[1] instanceof Edge) {
                this.first = args[0];                          // first edge in face or undefined
                this.last = args[1];                           // last edge in face or undefined
                this.last.next = this.first;
                this.first.prev = this.last;
                this.box = this.getBox();
                this.orientation = this.getOrientation();      // face direction cw or ccw
            }
        }

        [Symbol.iterator]() {
            let edge = undefined;
            return {
                next: () => {
                    let value = edge ? edge : this.first;
                    let done = edge ? edge === this.first : false;
                    edge = value.next;
                    return {value: value, done: done};
                }
            };
        };

        /**
         * Return array of edges of the given face in the order from first to last
         * @returns {Array} - Array of edges
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
         * @returns {number} - number of edges
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

        append(edge) {
            if (this.first === undefined) {
                edge.prev = edge;
                edge.next = edge;
                this.first = edge;
                this.last = edge;
            }
            else {
                // append to end
                edge.prev = this.last;
                this.last.next = edge;

                // update edge to be last
                this.last = edge;

                // restore circlar links
                this.last.next = this.first;
                this.first.prev = this.last;
            }
        }

        shapes2face(edges, shapes) {
            for (let shape of shapes) {
                let edge = new Edge(shape);
                this.append(edge);
                this.box = this.box.merge(shape.box);
                edges.add(edge);
            }
            this.orientation = this.getOrientation();              // face direction cw or ccw
        }

        /**
         * Return the area of the polygon
         * @returns {number}
         */
        area() {
            return Math.abs(this.signedArea());
        }

        signedArea() {
            let sArea = 0;
            for (let edge of this) {
                sArea += edge.shape.definiteIntegral(this.box.ymin);
            }
            return sArea;
        }

        /* According to Green theorem the area of a closed curve may be calculated as double integral,
        and the sign of the integral will be defined by the direction of the curve.
        When the integral ("signed area") will be negative, direction is counter clockwise,
        when positive - clockwise and when it is zero, polygon is not orientable.
        See http://mathinsight.org/greens_theorem_find_area
         */
        getOrientation() {
            let area = this.signedArea();
            if (Flatten.Utils.EQ_0(area)) {
                return Flatten.ORIENTATION.NOT_ORIENTABLE;
            }
            if (Flatten.Utils.LT(area, 0)) {
                return Flatten.ORIENTATION.CCW;
            }
            else {
                return Flatten.ORIENTATION.CW;
            }
        }

        /**
         * Return bounding box of the face
         * @returns {Box}
         */
        getBox() {
            let box = new Flatten.Box();
            for (let edge of this) {
                box = box.merge(edge.box);
            }
            return box;
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