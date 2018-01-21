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
    it('Can perform boolean op. Case 1 - 2 polygons, union', function () {
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
    });
    // it('Can clip segment case 2 - 1 intersections, clip till end', function () {
    //     "use strict";
    //     let points = [point(100, 20), point(200, 20), point(200, 40), point(100, 40)];
    //     let poly = new Polygon();
    //     poly.addFace(points);
    //     let seg = segment(point(0,30), point(150, 30));
    //     let clipped = clip(seg, poly, Flatten.CLIP_INSIDE);
    //     expect(clipped.length).to.equal(1);
    //     expect(clipped[0]).to.deep.equal(segment(point(0,30),point(100,30)));
    // });

});
