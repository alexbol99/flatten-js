/**
 * Created by Alex Bol on 3/17/2017.
 */

"use strict";

module.exports = function(Flatten) {
    let {Point, Segment, Arc, Box, Edge} = Flatten;
    /**
     * Class representing a face (closed loop) of polygon.
     * New face object should not be created directly, use polygon.addFace() method instead
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
            if (args.length == 2 && args[0] instanceof Edge && args[1] instanceof Edge) {
                this.first = args[0];                          // first edge in face or undefined
                this.last = args[1];                           // last edge in face or undefined
                this.last.next = this.first;
                this.first.prev = this.last;
                this.box = this.getBox();
                this.orientation = this.getOrientation();      // face direction cw or ccw
            }
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
            let edge = this.first;
            do {
                sArea += edge.shape.definiteIntegral(this.box.ymin);
                edge = edge.next;
            } while(edge != this.first);
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

        getBox() {
            let box = new Flatten.Box();

            let edge = this.first;
            do {
                box = box.merge(edge.shape.box);
                edge = edge.next;
            } while(edge != this.first);

            return box;
        }

        visit(callback) {
            let edge = this.first;
            do {
                callback(edge);
                edge = edge.next;
            } while(edge != this.first);
        }

        svg() {
            let edge = this.first;
            let svgStr = `\nM${edge.start.x},${edge.start.y}`;

            do {
                svgStr += edge.svg();
                edge = edge.next;
            } while(edge !== this.first);

            svgStr += ` z`;
            return svgStr;
        }
    };
};