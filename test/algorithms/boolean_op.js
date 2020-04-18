/**
 * Created by alexbol on 1/21/2018.
 */

'use strict';

import {expect} from 'chai';
//import Flatten from 'https://unpkg.com/@flatten-js/core';
//import {Polygon} from 'https://unpkg.com/@flatten-js/core';
//import {point, segment, arc, circle} from 'https://unpkg.com/@flatten-js/core';

import Flatten from '../../index';

import {Polygon} from '../../index';
import {point, circle, segment, arc} from '../../index';


import * as BooleanOp from "../../src/algorithms/boolean_op";
let {unify, subtract, intersect} = BooleanOp;

describe('#Algorithms.Boolean Operations', function () {
    describe('#Algorithms.Boolean Union', function () {
        it('Function unify defined', function () {
            expect(unify).to.exist;
            expect(unify).to.be.a('function');
        });
        // it('Function arrange defined', function () {
        //     expect(arrange).to.exist;
        //     expect(arrange).to.be.a('function');
        // });
        // it('Can arrange two polygons and add vertices', function () {
        //     "use strict";
        //     let poly1 = new Polygon();
        //     poly1.addFace([point(0, 0), point(150, 0), point(150, 30), point(0, 30)]);
        //     let poly2 = new Polygon();
        //     poly2.addFace([point(100, 20), point(200, 20), point(200, 40), point(100, 40)]);
        //     arrange(poly1, poly2);
        //     expect(poly1.edges.size).to.equal(6);
        //     expect(poly2.edges.size).to.equal(6);
        //     for (let face of poly1.faces) {
        //         expect(face.size).to.equal(6);
        //     }
        //     for (let face of poly2.faces) {
        //         expect(face.size).to.equal(6);
        //     }
        // });
        it('Can perform unify. 2 polygons, intersect', function () {
            "use strict";
            let poly1 = new Polygon();
            poly1.addFace([point(0, 0), point(150, 0), point(150, 30), point(0, 30)]);
            let poly2 = new Polygon();
            poly2.addFace([point(100, 20), point(200, 20), point(200, 40), point(100, 40)]);
            let poly = unify(poly1, poly2);
            expect(poly.faces.size).to.equal(1);
            for (let face of poly.faces) {
                expect(face.size).to.equal(8);
            }
            let vertices = poly.vertices;
            expect(vertices.find((pt) => pt.equalTo(point(0, 0)))).not.to.be.undefined;
            expect(vertices.find((pt) => pt.equalTo(point(150, 0)))).not.to.be.undefined;
            expect(vertices.find((pt) => pt.equalTo(point(150, 30)))).to.be.undefined;
            expect(vertices.find((pt) => pt.equalTo(point(0, 30)))).not.to.be.undefined;
            expect(vertices.find((pt) => pt.equalTo(point(100, 20)))).to.be.undefined;
            expect(vertices.find((pt) => pt.equalTo(point(200, 20)))).not.to.be.undefined;
            expect(vertices.find((pt) => pt.equalTo(point(200, 40)))).not.to.be.undefined;
            expect(vertices.find((pt) => pt.equalTo(point(100, 40)))).not.to.be.undefined;
        });
        it('Can perform unify. 2 polygons, disjoint', function () {
            "use strict";
            let poly1 = new Polygon();
            poly1.addFace([point(0, 0), point(50, 0), point(50, 30), point(0, 30)]);
            let poly2 = new Polygon();
            poly2.addFace([point(100, 50), point(200, 50), point(200, 100), point(100, 100)]);
            let poly = unify(poly1, poly2);
            expect(poly.faces.size).to.equal(2);
            for (let face of poly.faces) {
                expect(face.size).to.equal(4);
            }
        });
        it('Can perform unify. 2 polygons, 1 in 2', function () {
            "use strict";
            let poly1 = new Polygon();
            poly1.addFace([point(0, 0), point(50, 0), point(50, 30), point(0, 30)]);
            let poly2 = new Polygon();
            poly2.addFace([point(-100, -50), point(200, -50), point(200, 100), point(-100, 100)]);
            let poly = unify(poly1, poly2);
            expect(poly.faces.size).to.equal(1);
            for (let face of poly.faces) {
                expect(face.size).to.equal(4);
            }
        });
        it('Can perform unify. 2 polygons, 2 in 1', function () {
            "use strict";
            let poly1 = new Polygon();
            poly1.addFace([point(0, 0), point(50, 0), point(50, 30), point(0, 30)]);
            let poly2 = new Polygon();
            poly2.addFace([point(-100, -50), point(200, -50), point(200, 100), point(-100, 100)]);
            let poly = unify(poly2, poly1);
            expect(poly.faces.size).to.equal(1);
            expect(poly.edges.size).to.equal(4);
            for (let face of poly.faces) {
                expect(face.size).to.equal(4);
            }
        });
        it('Can perform unify. 2 polygons, 2 in 1 touching from inside, overlapping same', function () {
            "use strict";
            let poly1 = new Polygon();
            poly1.addFace([point(0, 0), point(50, 0), point(50, 30), point(0, 30)]);
            expect([...poly1.edges][0].shape instanceof Flatten.Segment).to.be.true;
            let poly2 = new Polygon();
            poly2.addFace([point(25, 0), point(50, 0), point(50, 15), point(25, 15)]);
            let poly = unify(poly1, poly2);
            expect(poly.faces.size).to.equal(1);
            expect(poly.edges.size).to.equal(6);
        });
        it('Can perform unify. 2 polygons, 2 in 1 touching from outside, overlapping opposite', function () {
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

            let poly = unify(polygon1, polygon2);
            expect(poly.faces.size).to.equal(1);
            expect(poly.edges.size).to.equal(8);
        });
        it('Can perform unify. 2 polygons form cross-shape', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([
                point(-10, 0),
                point(10, 0),
                point(10, 80),
                point(-10, 80)
            ]);
            let polygon2 = new Polygon();
            polygon2.addFace([
                point(-40, 30),
                point(40, 30),
                point(40, 50),
                point(-40, 50)
            ]);

            let poly = unify(polygon1, polygon2);
            expect(poly.faces.size).to.equal(1);
            expect(poly.edges.size).to.equal(12);
        });
        it('Can perform unify. 2 disjoint polygons', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([
                point(-10, 0),
                point(10, 0),
                point(10, 20),
                point(-10, 20)
            ]);
            let polygon2 = new Polygon();
            polygon2.addFace([
                point(-40, 30),
                point(40, 30),
                point(40, 50),
                point(-40, 50)
            ]);

            let poly = unify(polygon1, polygon2);
            expect(poly.faces.size).to.equal(2);
            expect(poly.edges.size).to.equal(8);
        });
        it('Can perform unify. 1st polygon with one round hole, 2nd polygon partially intersect hole ', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([
                point(-10, 0),
                point(-10, 20),
                point(10, 20),
                point(10, 0)
            ]);
            polygon1.addFace(
                [circle(point(0, 10), 5).toArc(true)]
            );
            let polygon2 = new Polygon();
            polygon2.addFace([
                point(-40, 13),
                point(-40, 50),
                point(40, 50),
                point(40, 13)
            ]);

            let poly = unify(polygon1, polygon2);
            expect(poly.faces.size).to.equal(2);
            let faces = [...poly.faces];
            expect(faces[0].size).to.equal(8);
            expect(faces[1].size).to.equal(3);
            expect(poly.edges.size).to.equal(11);
        });
        it('Can perform unify. 1st polygon with one round hole, 2nd polygon fully cover hole ', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([
                point(-10, 0),
                point(-10, 20),
                point(10, 20),
                point(10, 0)
            ]);
            polygon1.addFace(
                [circle(point(0, 10), 5).toArc(true)]
            );

            let polygon2 = new Polygon();
            polygon2.addFace([
                point(-8, 2),
                point(-8, 18),
                point(8, 18),
                point(8, 2)
            ]);

            let poly = unify(polygon1, polygon2);
            expect(poly.faces.size).to.equal(1);
            expect(poly.edges.size).to.equal(4);
        });
        it('Can perform unify. 2 polygons create one triangular hole after unify', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([point(100,10), point(100, 300), point(350, 300),point(150, 150), point(350, 10)]);

            let polygon2 = new Polygon();
            polygon2.addFace([point(400, 10), point(300, 10), point(300,300), point(400, 300)]);


            let poly = unify(polygon1, polygon2);
            expect(poly.faces.size).to.equal(2);
            expect([...poly.faces][0].size).to.equal(8);
            expect([...poly.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CW);
            expect([...poly.faces][1].size).to.equal(3);
            expect([...poly.faces][1].orientation()).to.equal(Flatten.ORIENTATION.CCW);
            expect(poly.edges.size).to.equal(11);
        });
    });
    describe('#Algorithms.Boolean Subtraction', function () {
        it('Can perform subtract. 2 intersecting polygons', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([
                point(-10, 0),
                point(-10, 20),
                point(10, 20),
                point(10, 0)
            ]);
            let polygon2 = new Polygon();
            polygon2.addFace([
                point(5, 10),
                point(5, 30),
                point(15, 30),
                point(15, 10)
            ]);

            let poly = subtract(polygon1, polygon2);
            expect(poly.faces.size).to.equal(1);
            expect(poly.edges.size).to.equal(6);
        });
        it('Can perform subtract. 1-face polygon split with 2nd to 2-faced polygon and vice a verse', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([
                point(-20, 0),
                point(-20, 20),
                point(20, 20),
                point(20, 0)
            ]);
            let polygon2 = new Polygon();
            polygon2.addFace([
                point(-5, -10),
                point(-5, 30),
                point(5, 30),
                point(5, -10)
            ]);

            expect([...polygon1.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CW);
            expect([...polygon2.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CW);

            let poly = subtract(polygon1, polygon2);

            expect(poly.faces.size).to.equal(2);
            expect(poly.edges.size).to.equal(8);

            poly = subtract(polygon2, polygon1);

            expect(poly.faces.size).to.equal(2);
            expect(poly.edges.size).to.equal(8);
        });
        it('Can perform subtract. 2 intersecting polygons produce 2-island result', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([point(100, 10), point(100, 300), point(400, 150), point(250, 10)]);

            let polygon2 = new Polygon();
            polygon2.addFace([point(450, 10), point(0, 150), point(300, 300), point(600, 300)]);

            let poly;
            poly = subtract(polygon1, polygon2);
            expect(poly.faces.size).to.equal(2);
            expect(poly.edges.size).to.equal(7);

            poly = subtract(polygon2, polygon1);
            expect(poly.faces.size).to.equal(2);
            expect(poly.edges.size).to.equal(9);
        });
        // it('Can perform (boolean) subtraction. First polygon inside the second', function () {
        //     "use strict";
        //
        //     let {Polygon, point} = Flatten;
        //
        //     let polygon1 = new Polygon();
        //     polygon1.addFace([point(100, 10), point(100, 300), point(400, 150), point(250, 10)]);
        //
        //     let polygon2 = new Polygon();
        //     polygon2.addFace([point(50, 0), point(50, 400), point(500, 400), point(500, 0)]);
        //
        //     let poly = subtract(polygon2, polygon1);
        //     expect(poly.faces.size).to.equal(2);
        //     expect(poly.edges.size).to.equal(8);
        //
        // });

        it('Can perform subtract big polygon from smaller polygon and get empty result (Issue #4)', function() {
            let polygon1 = new Polygon();
            polygon1.addFace([point(0,0), point(100, 0), point(100, 100), point(0, 100)]);

            let polygon2 = new Polygon();
            polygon2.addFace([point(10, 10), point(90, 10), point(90,90), point(10, 90)]);

            // polygon2 is completely inside polygon1, I expect the result polygon to be empty
            let polygon = subtract(polygon2, polygon1);

            expect(polygon.isEmpty()).to.be.true;
            expect(polygon.faces.size).to.equal(0);
            expect(polygon.edges.size).to.equal(0);
        });
        it("Can subtract one polygon from another and create a hole (Issue #7)", function() {
            const baseZ0Surface = [[[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]]];
            const z0Surface = [[[1, 1, 0], [9, 1, 0], [9, 9, 0], [1, 9, 0]]]; // where is the hole?
// const z0Surface = [[[1, 1, 0], [9, 1, 0], [9, 9, 0], [1, 11, 0]]]; // subtraction works when not producing holes

            const a = new Polygon();
            for (const polygon of baseZ0Surface) {
                let face = a.addFace(polygon.map(([x, y]) => point(x, y)));
                if (face.orientation() !== Flatten.ORIENTATION.CCW) {
                    face.reverse();
                }
            }

            const b = new Polygon();
            for (const polygon of z0Surface) {
                let face = b.addFace(polygon.map(([x, y]) => point(x, y)));
                if (face.orientation() !== Flatten.ORIENTATION.CCW) {
                    face.reverse();
                }
            }

            const myPoly = subtract(a, b);

            expect(myPoly.faces.size).to.equal(2);
            expect(myPoly.edges.size).to.equal(8);
            expect([...myPoly.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CCW);
            expect([...myPoly.faces][1].orientation()).to.equal(Flatten.ORIENTATION.CW);
        });
    });
    describe('#Algorithms.Boolean Intersection', function () {
        it('Can perform (boolean) intersection. 2 intersecting polygons', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([
                point(-10, 0),
                point(-10, 20),
                point(10, 20),
                point(10, 0)
            ]);

            let polygon2 = new Polygon();
            polygon2.addFace([
                point(5, 10),
                point(5, 30),
                point(15, 30),
                point(15, 10)
            ]);

            let poly = intersect(polygon1, polygon2);
            expect(poly.faces.size).to.equal(1);
            expect(poly.edges.size).to.equal(4);
            expect([...poly.faces][0].size).to.equal(4);
        });
        it('Can perform (boolean) intersection. Other 2 intersecting polygons', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([point(100, 10), point(100, 300), point(400, 150), point(250, 10)]);

            let polygon2 = new Polygon();
            polygon2.addFace([point(450, 10), point(0, 150), point(300, 300), point(600, 300)]);

            let poly = intersect(polygon1, polygon2);
            expect(poly.faces.size).to.equal(1);
            expect(poly.edges.size).to.equal(5);
            expect([...poly.faces][0].size).to.equal(5);
        });
        it('Can perform (boolean) intersection. First polygon inside the second', function () {
            "use strict";

            let polygon1 = new Polygon();
            polygon1.addFace([point(100, 10), point(100, 300), point(400, 150), point(250, 10)]);

            let polygon2 = new Polygon();
            polygon2.addFace([point(50, 0), point(50, 400), point(500, 400), point(500, 0)]);

            let poly = intersect(polygon1, polygon2);
            expect(poly.faces.size).to.equal(1);
            expect(poly.edges.size).to.equal(4);
            expect([...poly.faces][0].size).to.equal(4);
        });
        it("Issue #2 with intersection of circle and box", function() {
            "use strict"

            let myPoly = new Polygon();
            myPoly.addFace([point(50, 50), point(50,950), point(950, 950), point(950, 50)]);
            // myPoly.addFace([point(50, 50), point(950, 50), point(950, 950), point(50,950)]);

            let myCircle = new Polygon();
            myCircle.addFace([arc(point(0,1000),980, 0, 2*Math.PI, Flatten.CW)]);

            myPoly = intersect(myPoly, myCircle);

            myCircle = new Polygon();
            myCircle.addFace([arc(point(0,1000),780, 0, 2*Math.PI, Flatten.CW)]);
            myPoly = subtract(myPoly, myCircle);

            myCircle = new Polygon();
            myCircle.addFace([arc(point(1000,1000),1330, 0, 2*Math.PI, Flatten.CW)]);
            myPoly = intersect(myPoly,myCircle);

            myCircle = new Polygon();
            myCircle.addFace([arc(point(1000,1000),1130, 0, 2*Math.PI, Flatten.CW)]);
            myPoly = subtract(myPoly,myCircle);

            myCircle = new Polygon();
            myCircle.addFace([arc(point(1000,0),980, 0, 2*Math.PI, Flatten.CW)]);

            myPoly = intersect(myPoly, myCircle);

            expect(myPoly.faces.size).to.equal(1);
            expect(myPoly.edges.size).to.equal(6);
            expect([...myPoly.faces][0].size).to.equal(6);
            expect([...myPoly.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CW);
        });
        it("Issue #3", function() {
            "use strict";

            let myPoly = new Polygon();
            myPoly.addFace([point(6, 6), point(6,114), point(114, 114), point(114, 6)]);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myPoly);  // 0

            let myCircle = new Polygon();
            myCircle.addFace([arc(point(0,0),84.5779281026111, 0, 2*Math.PI, Flatten.CW)]);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myCircle);  // 1

            myPoly = intersect(myPoly,myCircle);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myPoly);   // 2

            myCircle = new Polygon();
            myCircle.addFace([arc(point(0,0),84.49938828627135, 0, 2*Math.PI, Flatten.CW)]);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myCircle);  // 3

            myPoly = subtract(myPoly,myCircle);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myPoly);   // 4

            myCircle = new Polygon();
            myCircle.addFace([arc(point(0,120),84.8710637077582, 0, 2*Math.PI, Flatten.CW)]);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myCircle);  // 5

            myPoly = intersect(myPoly,myCircle);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myPoly);   // 6

            myCircle = new Polygon();
            myCircle.addFace([arc(point(0,120),84.79252389141845, 0, 2*Math.PI, Flatten.CW)]);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myCircle);  // 7

            myPoly = subtract(myPoly,myCircle);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myPoly);   // 8

            myCircle = new Polygon();
            myCircle.addFace([arc(point(120,120),85.20624291591454, 0, 2*Math.PI, Flatten.CW)]);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myCircle);  // 9

            myPoly = intersect(myPoly,myCircle);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myPoly);   // 10

            myCircle = new Polygon();
            myCircle.addFace([arc(point(120,120), 85.1277030995748, 0, 2*Math.PI, Flatten.CW)]);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myCircle);  // 11

            myPoly = subtract(myPoly,myCircle);
            // state.layers[state.layers.length] = Layers.newLayer(stage, layers).add(myPoly);   // 12

            expect(myPoly.faces.size).to.equal(1);
            expect(myPoly.edges.size).to.equal(7);
            expect([...myPoly.faces][0].size).to.equal(7);
            expect([...myPoly.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CW);

        });
        it("Issue #8", function() {
            const a = [[[0.0038566398538067426,-0.05711818784841144,-1.1102230246251565e-16],[0.027451566277452343,0.010121095260507057,-1.1102230246251565e-16],[-0.007578939370510268,0.028567406105599685,0],[-0.007578939370510268,-0.05203184177985917,-1.1102230246251565e-16]],
                [[-0.030046587894975794,-0.042038623815088355,-4.440892098500626e-16],[-0.007578939370510268,-0.05203184177985917,-1.1102230246251565e-16],[-0.007578939370510268,0.028567406105599685,0],[-0.01714635591203731,0.033605401882281144,0]]];
            const b = [[[-0.007578939370510268,0.028567406105599685,0],[0.027451566277452343,0.010121095260507057,-1.1102230246251565e-16],[0.04688704952527964,0.0655070683716446,-3.3306690738754696e-16],[0.016656535759185374,0.08343556096136145,0],[-0.007578939370510275,0.08970655600740696,1.1102230246251565e-16]],
                [[-0.007578939370510268,0.028567406105599685,0],[-0.007578939370510275,0.08970655600740696,1.1102230246251565e-16],[-0.01714635591203731,0.033605401882281144,0]]];

            const fromSurface = (surface) => {
                const flattenPolygon = new Polygon();
                for (const polygon of surface) {
                    flattenPolygon.addFace(polygon.map(([x, y]) => point(x, y)));
                }
                return flattenPolygon;
            };

            const p1 = fromSurface(a);
            const p2 = fromSurface(b);

            const valid1 = p1.isValid()
            // const p = unify(p1, p2)

        });
    });
});
