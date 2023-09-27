/**
 * Created by Alex Bol on 9/8/2017.
 */
import { expect } from 'chai';
import Flatten from '../../index';
import {ray_shoot} from "../../src/algorithms/ray_shooting";

import {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, PlanarSet} from '../../index';
import {point, vector, circle, line, segment, arc} from '../../index';

describe('#Flatten.Face', function() {
    "use strict";
    it('Can iterate edges as iterable', function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,2), point(1,2)];
        let face = polygon.addFace(points);
        expect([...face]).to.be.an.instanceof(Array);
        for (let edge of face) {
            expect(edge).to.be.an.instanceof(Edge);
        }
        expect(face.size).to.equal(4);
    });
    it('Can create iterator of edges and iterate them one by one', function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,2), point(1,2)];
        let face = polygon.addFace(points);
        expect(face.size).to.equal(4);
        let edges = [...face.edges];
        let iterator = face[Symbol.iterator]();
        expect(iterator.next().value).to.equal(edges[0]);
        expect(iterator.next().value).to.equal(edges[1]);
        expect(iterator.next().value).to.equal(edges[2]);
        expect(iterator.next().value).to.equal(edges[3]);
        expect(iterator.next().done).to.be.true;
    });
    it('Can get array of edges for the given face', function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,2), point(1,2)];
        let face = polygon.addFace(points);
        let edges = face.edges;
        let vertices = edges.map(edge => edge.start);
        expect(edges.length).to.equal(4);
        expect(vertices.length).to.equal(4);
        expect(vertices).to.deep.equal(points);
    });
    it('Can count edges in face',function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,2), point(1,2)];
        let face = polygon.addFace(points);
        expect(face.size).to.equal(4);
    });
    it('Can set orientation of face to CCW', function() {
        let polygon = new Polygon();
        let face = polygon.addFace([
            point(1,1), point(3,1), point(3,2), point(1,2)
        ]);
        expect(face.signedArea()).to.equal(-2);
        expect(face.orientation()).to.equal(Flatten.ORIENTATION.CCW);
    });
    it('Can set orientation of face to CW', function() {
        let polygon = new Polygon();
        let face = polygon.addFace([
            arc(point(1,1), 1, 0, 2*Math.PI, false)
        ]);
        expect(Flatten.Utils.EQ(face.signedArea(), Math.PI)).to.equal(true);
        expect(face.orientation()).to.equal(Flatten.ORIENTATION.CW);
    });
    it('Can set orientation of degenerated face to not-orientable', function() {
        let polygon = new Polygon();
        let face = polygon.addFace([
            point(1,1), point(3,1), point(1,1)
        ]);
        expect(face.area()).to.equal(0);
        expect(face.orientation()).to.equal(Flatten.ORIENTATION.NOT_ORIENTABLE);
    });
    it('Can remove edge from face', function () {
        "use strict";
        let points = [
            point(100, 20),
            point(200, 20),
            point(200, 40),
            point(100, 40)
        ];

        let poly = new Polygon();
        let face = poly.addFace(points);

        expect(face.size).to.equal(4);
        let edge = face.first;
        let edgeNext = edge.next;
        face.remove(edge);
        poly.edges.delete(edge);
        expect(face.size).to.equal(3);
        expect(face.first).to.equal(edgeNext);
        expect(face.last.next).to.equal(face.first);
        expect(face.first.prev).to.equal(face.last);
    });
    it('Can remove all edges from face', function () {
        "use strict";
        let points = [
            point(100, 20),
            point(200, 20),
            point(200, 40),
            point(100, 40)
        ];

        let poly = new Polygon();
        let face = poly.addFace(points);
        expect(face.size).to.equal(4);

        // remove all edges except the last
        for (let edge = face.first; edge !== face.last; edge = edge.next ) {
            face.remove(edge);
            poly.edges.delete(edge);
        }
        expect(face.size).to.equal(1);
        expect(face.first).to.equal(face.last);

        // remove the last edge
        let edge = face.first;
        face.remove(edge);
        poly.edges.delete(edge);

        expect(face.isEmpty()).to.be.true;
        expect(face.size).to.equal(0);
    });
    it('Can reverse face', function () {
        "use strict";
        let points = [
            point(100, 20),
            point(200, 20),
            point(200, 40),
            point(100, 40)
        ];

        let poly = new Polygon();
        let face = poly.addFace(points);
        expect(face.size).to.equal(4);
        expect(face.orientation()).to.equal(Flatten.ORIENTATION.CCW);

        let reversed_poly = poly.reverse();
        expect(reversed_poly.faces.size).to.equal(1);
        expect(reversed_poly.edges.size).to.equal(4);

        expect([...reversed_poly.faces][0].size).to.equal(4);
        let orientation = [...reversed_poly.faces][0].orientation();
        expect(orientation).to.equal(Flatten.ORIENTATION.CW);
    });
    it('Method svg can return string to be used to generate svg path', function () {
        "use strict";

        let {segment, point, circle, box, Polygon} = Flatten

        // Define model
        let shapes = [point(200, 100), point(200, 300), point(440, 300), point(300, 200), point(440, 150),
            point(500, 150), point(640, 200), point(500, 300), point(740, 300), point(740, 100)]
        let polygon = new Polygon();
        polygon.addFace(shapes);
        polygon.addFace([circle(point(250, 150),30).toArc()])
        polygon.addFace([circle(point(650, 250),30).toArc()])

        let svg = ""
        let faces = [...polygon.faces]
        svg += faces[0].svg({stroke:"yellow"})
        svg += faces[1].svg({fill:"lightgreen"})
        svg += faces[2].svg({fill:"lightblue"})

        expect(svg.length).not.to.equal(0);
    });
    it('Can find points at specific lengths', function () {
        let points = [
            point(100, 20),
            point(200, 20),
            point(200, 40),
            point(100, 40)
        ];

        let poly = new Polygon();
        let face = poly.addFace(points);
        let length = face.perimeter;
        expect(length).to.equal(240)
        for (let i = 0; i < 33; i++) {
            let point = face.pointAtLength(i / 33 * length);
            expect(point).is.not.null;
            let rel = ray_shoot(poly, point);
            expect(rel).to.equal(Flatten.BOUNDARY);
        }

    });
});
