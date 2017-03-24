/**
 * Created by Alex Bol on 3/17/2017.
 */

"use strict";

module.exports = function(Flatten) {
    let {Point, Segment, Arc, Box, Edge} = Flatten;
    Flatten.Face = class Face {
        constructor(polygon, ...args) {
            this.first;                             // first edge in face or undefined
            this.last;                              // last edge in face or undefined
            this.orientation = undefined;           // face orientation cw or ccw or not-orientable
            this.box = new Box();                   // bounding box;

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
                    let segments = this.points2segments(shapes);
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
                this.setOrientation();              // face direction cw or ccw
                this.setBox();
            }
        }

        points2segments(points) {
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
                this.box.merge(shape.box);
                edges.add(edge)
            }
            this.setOrientation();              // face direction cw or ccw
        }

        setOrientation() {

        }

        setBox() {

        }

        svg() {
            // todo: draw circular face as spacial case?
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