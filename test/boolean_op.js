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

});
