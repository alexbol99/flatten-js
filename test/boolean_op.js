/**
 * Created by alexbol on 1/21/2018.
 */

'use strict';

let expect = require('chai').expect;
let Flatten = require('../index');
// let now = require("performance-now");

let {Polygon} = Flatten;
let {point, segment, arc, circle} = Flatten;
let {BooleanOp} = Flatten;
let {union, subtract, intersect, boolean_op, arrange} = BooleanOp;

describe('#Algorithms.Boolean Operations', function() {
    it('Function union defined', function () {
        expect(union).to.exist;
        expect(union).to.be.a('function');
    });
    it('Function arrange defined', function () {
        expect(arrange).to.exist;
        expect(arrange).to.be.a('function');
    });
    it('Can arrange two polygons and add vertices', function () {
        "use strict";
        let poly1 = new Polygon();
        poly1.addFace([point(0,0), point(150, 0), point(150,30), point(0, 30)]);
        let poly2 = new Polygon();
        poly2.addFace([point(100, 20), point(200, 20), point(200, 40), point(100, 40)]);
        arrange(poly1, poly2);
        expect(poly1.edges.size).to.equal(6);
        expect(poly2.edges.size).to.equal(6);
        for (let face of poly1.faces) {
            expect(face.size).to.equal(6);
        }
        for (let face of poly2.faces) {
            expect(face.size).to.equal(6);
        }
    });
    it('Can perform union. 2 polygons, intersect', function () {
        "use strict";
        let poly1 = new Polygon();
        poly1.addFace([point(0,0), point(150, 0), point(150,30), point(0, 30)]);
        let poly2 = new Polygon();
        poly2.addFace([point(100, 20), point(200, 20), point(200, 40), point(100, 40)]);
        let poly = union(poly1, poly2);
        expect(poly.faces.size).to.equal(1);
        for (let face of poly.faces) {
            expect(face.size).to.equal(8);
        }
        let vertices = poly.vertices;
        expect(vertices.find((pt) => pt.equalTo(point(0,0)))).to.be.defined;
        expect(vertices.find((pt) => pt.equalTo(point(150,0)))).to.be.defined;
        expect(vertices.find((pt) => pt.equalTo(point(150,30)))).to.be.undefined;
        expect(vertices.find((pt) => pt.equalTo(point(0,30)))).to.be.defined;
        expect(vertices.find((pt) => pt.equalTo(point(100,20)))).to.be.undefined;
        expect(vertices.find((pt) => pt.equalTo(point(200,20)))).to.be.defined;
        expect(vertices.find((pt) => pt.equalTo(point(200,40)))).to.be.defined;
        expect(vertices.find((pt) => pt.equalTo(point(100,40)))).to.be.defined;
    });
    it('Can perform union. 2 polygons, disjoint', function () {
        "use strict";
        let poly1 = new Polygon();
        poly1.addFace([point(0,0), point(50, 0), point(50,30), point(0, 30)]);
        let poly2 = new Polygon();
        poly2.addFace([point(100, 50), point(200, 50), point(200, 100), point(100, 100)]);
        let poly = union(poly1, poly2);
        expect(poly.faces.size).to.equal(2);
        for (let face of poly.faces) {
            expect(face.size).to.equal(4);
        }
    });
    it('Can perform union. 2 polygons, 1 in 2', function () {
        "use strict";
        let poly1 = new Polygon();
        poly1.addFace([point(0,0), point(50, 0), point(50,30), point(0, 30)]);
        let poly2 = new Polygon();
        poly2.addFace([point(-100, -50), point(200, -50), point(200, 100), point(-100, 100)]);
        let poly = union(poly1, poly2);
        expect(poly.faces.size).to.equal(1);
        for (let face of poly.faces) {
            expect(face.size).to.equal(4);
        }
    });
    it('Can perform union. 2 polygons, 2 in 1', function () {
        "use strict";
        let poly1 = new Polygon();
        poly1.addFace([point(0,0), point(50, 0), point(50,30), point(0, 30)]);
        let poly2 = new Polygon();
        poly2.addFace([point(-100, -50), point(200, -50), point(200, 100), point(-100, 100)]);
        let poly = union(poly2, poly1);
        expect(poly.faces.size).to.equal(1);
        expect(poly.edges.size).to.equal(4);
        for (let face of poly.faces) {
            expect(face.size).to.equal(4);
        }
    });
    it('Can perform union. 2 polygons, 2 in 1 touching from inside, overlapping same', function () {
        "use strict";
        let poly1 = new Polygon();
        poly1.addFace([point(0,0), point(50, 0), point(50,30), point(0, 30)]);
        let poly2 = new Polygon();
        poly2.addFace([point(25,0), point(50, 0), point(50,15), point(25, 15)]);
        let poly = union(poly1, poly2);
        expect(poly.faces.size).to.equal(1);
        expect(poly.edges.size).to.equal(6);
    });
    it('Can perform union. 2 polygons, 2 in 1 touching from outside, overlapping opposite', function () {
        "use strict";

        let polygon1 = new Polygon();
        polygon1.addFace([
            segment(-50, -50, 50, -50),
            segment(50, -50, 50, 50),
            segment(50, 50, -50, 50),
            segment(-50, 50, -50, -50)
        ]);

        let polygon2 = new Polygon();
        polygon2.addFace([
            segment(0, 50, 100, 50),
            segment(100, 50, 100, 100),
            segment(100, 100, 0, 100),
            segment(0, 100, 0, 50)
        ]);

        let poly = union(polygon1, polygon2);
        expect(poly.faces.size).to.equal(1);
        expect(poly.edges.size).to.equal(8);
    });
    it('Can perform union. 2 polygons form cross-shape', function () {
        "use strict";

        let polygon1 = new Polygon();
        polygon1.addFace( [
            point(-10,0),
            point(10, 0),
            point(10, 80),
            point(-10, 80)
        ]);
        let polygon2 = new Polygon();
        polygon2.addFace( [
            point(-40,30),
            point(40,30),
            point(40,50),
            point(-40,50)
        ]);

        let poly = union(polygon1, polygon2);
        expect(poly.faces.size).to.equal(1);
        expect(poly.edges.size).to.equal(12);
    });
    it('Can perform union. 2 disjoint polygons', function () {
        "use strict";

        let polygon1 = new Polygon();
        polygon1.addFace( [
            point(-10,0),
            point(10, 0),
            point(10, 20),
            point(-10, 20)
        ]);
        let polygon2 = new Polygon();
        polygon2.addFace( [
            point(-40,30),
            point(40,30),
            point(40,50),
            point(-40,50)
        ]);

        let poly = union(polygon1, polygon2);
        expect(poly.faces.size).to.equal(2);
        expect(poly.edges.size).to.equal(8);
    });
    it('Can perform union. 1st polygon with one round hole, 2nd polygon partially intersect hole ', function () {
        "use strict";

        let polygon1 = new Polygon();
        polygon1.addFace( [
            point(-10,0),
            point(-10, 20),
            point(10, 20),
            point(10, 0)
        ]);
        polygon1.addFace(
            [circle(point(0,10),5).toArc(true)]
        );
        let polygon2 = new Polygon();
        polygon2.addFace( [
            point(-40,13),
            point(-40,50),
            point(40,50),
            point(40,13)
        ]);

        let poly = union(polygon1, polygon2);
        expect(poly.faces.size).to.equal(2);
        let faces = [...poly.faces];
        expect(faces[0].size).to.equal(8);
        expect(faces[1].size).to.equal(3);
        expect(poly.edges.size).to.equal(11);
    });
    it('Can perform union. 1st polygon with one round hole, 2nd polygon fully cover hole ', function () {
        "use strict";

        let polygon1 = new Polygon();
        polygon1.addFace( [
            point(-10,0),
            point(-10, 20),
            point(10, 20),
            point(10, 0)
        ]);
        polygon1.addFace(
            [circle(point(0,10),5).toArc(true)]
        );

        let polygon2 = new Polygon();
        polygon2.addFace( [
            point(-8,2),
            point(-8,18),
            point(8,18),
            point(8,2)
        ]);

        let poly = union(polygon1, polygon2);
        expect(poly.faces.size).to.equal(1);
        expect(poly.edges.size).to.equal(4);
    });
    it('Can perform subtract. 2 intersecting polygons', function () {
        "use strict";

        let polygon1 = new Polygon();
        polygon1.addFace( [
            point(-10,0),
            point(-10, 20),
            point(10, 20),
            point(10, 0)
        ]);
        let polygon2 = new Polygon();
        polygon2.addFace( [
            point(5,10),
            point(5,30),
            point(15,30),
            point(15,10)
        ]);

        let poly = subtract(polygon1, polygon2);
        expect(poly.faces.size).to.equal(1);
        expect(poly.edges.size).to.equal(6);
    });
    it('Can perform (boolean) intersection. 2 intersecting polygons', function () {
        "use strict";

        let polygon1 = new Polygon();
        polygon1.addFace( [
            point(-10,0),
            point(-10, 20),
            point(10, 20),
            point(10, 0)
        ]);

        let polygon2 = new Polygon();
        polygon2.addFace( [
            point(5,10),
            point(5,30),
            point(15,30),
            point(15,10)
        ]);

        let poly = intersect(polygon1, polygon2);
        expect(poly.faces.size).to.equal(1);
        expect(poly.edges.size).to.equal(4);
        expect([...poly.faces][0].size).to.equal(4);
    });
});
