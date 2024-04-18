/**
 * Created by alexbol on 1/21/2018.
 */

'use strict';

import {expect} from 'chai';
import Flatten from '../../index';
import {Polygon} from '../../index';
import {point, circle, segment, arc} from '../../index';
import {Errors} from "../../src/utils/errors";

import * as BooleanOperations from "../../src/algorithms/boolean_op";
let {unify, subtract, intersect} = BooleanOperations;

let {equal} = Flatten.Relations;

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
        it('Can perform unify. Fixed: Infinite loop for boolean union over (valid) polygons. Issue #53', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":495.6999999999999,"y":449.6,"name":"point"},"pe":{"x":500.62352941176465,"y":449.6,"name":"point"},"name":"segment"},{"ps":{"x":500.62352941176465,"y":449.6,"name":"point"},"pe":{"x":500.8,"y":449.5,"name":"point"},"name":"segment"},{"ps":{"x":500.8,"y":449.5,"name":"point"},"pe":{"x":501.6222222222222,"y":448.67777777777775,"name":"point"},"name":"segment"},{"ps":{"x":501.6222222222222,"y":448.67777777777775,"name":"point"},"pe":{"x":504.8,"y":448.8,"name":"point"},"name":"segment"},{"ps":{"x":504.8,"y":448.8,"name":"point"},"pe":{"x":507.11999999999995,"y":448.21999999999997,"name":"point"},"name":"segment"},{"ps":{"x":507.11999999999995,"y":448.21999999999997,"name":"point"},"pe":{"x":507.5,"y":448.2,"name":"point"},"name":"segment"},{"ps":{"x":507.5,"y":448.2,"name":"point"},"pe":{"x":510.16305569749636,"y":447.76647930505874,"name":"point"},"name":"segment"},{"ps":{"x":510.16305569749636,"y":447.76647930505874,"name":"point"},"pe":{"x":512.0000000000002,"y":445.64999999999986,"name":"point"},"name":"segment"},{"ps":{"x":512.0000000000002,"y":445.64999999999986,"name":"point"},"pe":{"x":512.2,"y":443.8,"name":"point"},"name":"segment"},{"ps":{"x":512.2,"y":443.8,"name":"point"},"pe":{"x":512.4352941176471,"y":442.9529411764702,"name":"point"},"name":"segment"},{"ps":{"x":512.4352941176471,"y":442.9529411764702,"name":"point"},"pe":{"x":513.3,"y":441.8,"name":"point"},"name":"segment"},{"ps":{"x":513.3,"y":441.8,"name":"point"},"pe":{"x":515.0562499999997,"y":438.2875000000002,"name":"point"},"name":"segment"},{"ps":{"x":515.0562499999997,"y":438.2875000000002,"name":"point"},"pe":{"x":516.5,"y":436.8,"name":"point"},"name":"segment"},{"ps":{"x":516.5,"y":436.8,"name":"point"},"pe":{"x":516.5893617021277,"y":435.22127659574465,"name":"point"},"name":"segment"},{"ps":{"x":516.5893617021277,"y":435.22127659574465,"name":"point"},"pe":{"x":519.8,"y":428.8,"name":"point"},"name":"segment"},{"ps":{"x":519.8,"y":428.8,"name":"point"},"pe":{"x":521.3303326810178,"y":426.90958904109596,"name":"point"},"name":"segment"},{"ps":{"x":521.3303326810178,"y":426.90958904109596,"name":"point"},"pe":{"x":521.8,"y":426.8,"name":"point"},"name":"segment"},{"ps":{"x":521.8,"y":426.8,"name":"point"},"pe":{"x":523.5,"y":426.8,"name":"point"},"name":"segment"},{"ps":{"x":523.5,"y":426.8,"name":"point"},"pe":{"x":524.4297872340426,"y":423.08085106382975,"name":"point"},"name":"segment"},{"ps":{"x":524.4297872340426,"y":423.08085106382975,"name":"point"},"pe":{"x":526.8443113772455,"y":420.0982035928144,"name":"point"},"name":"segment"},{"ps":{"x":526.8443113772455,"y":420.0982035928144,"name":"point"},"pe":{"x":527,"y":419.6,"name":"point"},"name":"segment"},{"ps":{"x":527,"y":419.6,"name":"point"},"pe":{"x":527.254258675079,"y":419.5917981072555,"name":"point"},"name":"segment"},{"ps":{"x":527.254258675079,"y":419.5917981072555,"name":"point"},"pe":{"x":528.3,"y":418.3,"name":"point"},"name":"segment"},{"ps":{"x":528.3,"y":418.3,"name":"point"},"pe":{"x":536.9370833333332,"y":418.7545833333333,"name":"point"},"name":"segment"},{"ps":{"x":536.9370833333332,"y":418.7545833333333,"name":"point"},"pe":{"x":537.4696969696968,"y":419.7437229437229,"name":"point"},"name":"segment"},{"ps":{"x":537.4696969696968,"y":419.7437229437229,"name":"point"},"pe":{"x":536.273933649289,"y":423.1601895734599,"name":"point"},"name":"segment"},{"ps":{"x":536.273933649289,"y":423.1601895734599,"name":"point"},"pe":{"x":536.2,"y":423.2,"name":"point"},"name":"segment"},{"ps":{"x":536.2,"y":423.2,"name":"point"},"pe":{"x":534.5,"y":425.5,"name":"point"},"name":"segment"},{"ps":{"x":534.5,"y":425.5,"name":"point"},"pe":{"x":534.2,"y":428.2,"name":"point"},"name":"segment"},{"ps":{"x":534.2,"y":428.2,"name":"point"},"pe":{"x":534.2,"y":428.94999999999993,"name":"point"},"name":"segment"},{"ps":{"x":534.2,"y":428.94999999999993,"name":"point"},"pe":{"x":533,"y":430.75000000000006,"name":"point"},"name":"segment"},{"ps":{"x":533,"y":430.75000000000006,"name":"point"},"pe":{"x":533,"y":431,"name":"point"},"name":"segment"},{"ps":{"x":533,"y":431,"name":"point"},"pe":{"x":531.7,"y":433.6,"name":"point"},"name":"segment"},{"ps":{"x":531.7,"y":433.6,"name":"point"},"pe":{"x":533.1409937888199,"y":438.10310559006217,"name":"point"},"name":"segment"},{"ps":{"x":533.1409937888199,"y":438.10310559006217,"name":"point"},"pe":{"x":533.9477732793523,"y":438.8202429149798,"name":"point"},"name":"segment"},{"ps":{"x":533.9477732793523,"y":438.8202429149798,"name":"point"},"pe":{"x":534.74578313253,"y":439.0915662650602,"name":"point"},"name":"segment"},{"ps":{"x":534.74578313253,"y":439.0915662650602,"name":"point"},"pe":{"x":534.8,"y":439.2,"name":"point"},"name":"segment"},{"ps":{"x":534.8,"y":439.2,"name":"point"},"pe":{"x":534.9610738255034,"y":439.1647651006711,"name":"point"},"name":"segment"},{"ps":{"x":534.9610738255034,"y":439.1647651006711,"name":"point"},"pe":{"x":538.3,"y":440.3,"name":"point"},"name":"segment"},{"ps":{"x":538.3,"y":440.3,"name":"point"},"pe":{"x":539.5378516624038,"y":440.2015345268543,"name":"point"},"name":"segment"},{"ps":{"x":539.5378516624038,"y":440.2015345268543,"name":"point"},"pe":{"x":540.8,"y":439.3,"name":"point"},"name":"segment"},{"ps":{"x":540.8,"y":439.3,"name":"point"},"pe":{"x":545.4874999999998,"y":437.8,"name":"point"},"name":"segment"},{"ps":{"x":545.4874999999998,"y":437.8,"name":"point"},"pe":{"x":545.5,"y":437.8,"name":"point"},"name":"segment"},{"ps":{"x":545.5,"y":437.8,"name":"point"},"pe":{"x":545.8000000000042,"y":437.69999999999834,"name":"point"},"name":"segment"},{"ps":{"x":545.8000000000042,"y":437.69999999999834,"name":"point"},"pe":{"x":553.3,"y":435.3,"name":"point"},"name":"segment"},{"ps":{"x":553.3,"y":435.3,"name":"point"},"pe":{"x":559.8,"y":432.3,"name":"point"},"name":"segment"},{"ps":{"x":559.8,"y":432.3,"name":"point"},"pe":{"x":560.3625,"y":432.6,"name":"point"},"name":"segment"},{"ps":{"x":560.3625,"y":432.6,"name":"point"},"pe":{"x":561.3,"y":432.6,"name":"point"},"name":"segment"},{"ps":{"x":561.3,"y":432.6,"name":"point"},"pe":{"x":563.7,"y":433.6,"name":"point"},"name":"segment"},{"ps":{"x":563.7,"y":433.6,"name":"point"},"pe":{"x":565.5,"y":434.7,"name":"point"},"name":"segment"},{"ps":{"x":565.5,"y":434.7,"name":"point"},"pe":{"x":566.6864516129033,"y":434.43634408602156,"name":"point"},"name":"segment"},{"ps":{"x":566.6864516129033,"y":434.43634408602156,"name":"point"},"pe":{"x":566.8,"y":434.5,"name":"point"},"name":"segment"},{"ps":{"x":566.8,"y":434.5,"name":"point"},"pe":{"x":566.8888888888888,"y":434.3913580246913,"name":"point"},"name":"segment"},{"ps":{"x":566.8888888888888,"y":434.3913580246913,"name":"point"},"pe":{"x":567.7186046511628,"y":434.2069767441861,"name":"point"},"name":"segment"},{"ps":{"x":567.7186046511628,"y":434.2069767441861,"name":"point"},"pe":{"x":567.9382352941177,"y":433.1088235294116,"name":"point"},"name":"segment"},{"ps":{"x":567.9382352941177,"y":433.1088235294116,"name":"point"},"pe":{"x":569.5,"y":431.2,"name":"point"},"name":"segment"},{"ps":{"x":569.5,"y":431.2,"name":"point"},"pe":{"x":570.2,"y":427.8,"name":"point"},"name":"segment"},{"ps":{"x":570.2,"y":427.8,"name":"point"},"pe":{"x":570.5,"y":423.5,"name":"point"},"name":"segment"},{"ps":{"x":570.5,"y":423.5,"name":"point"},"pe":{"x":570.0223880597015,"y":422.68805970149253,"name":"point"},"name":"segment"},{"ps":{"x":570.0223880597015,"y":422.68805970149253,"name":"point"},"pe":{"x":570.3,"y":421.3,"name":"point"},"name":"segment"},{"ps":{"x":570.3,"y":421.3,"name":"point"},"pe":{"x":571.3015384615386,"y":420.96615384615376,"name":"point"},"name":"segment"},{"ps":{"x":571.3015384615386,"y":420.96615384615376,"name":"point"},"pe":{"x":571.7,"y":419.6,"name":"point"},"name":"segment"},{"ps":{"x":571.7,"y":419.6,"name":"point"},"pe":{"x":574.7,"y":419,"name":"point"},"name":"segment"},{"ps":{"x":574.7,"y":419,"name":"point"},"pe":{"x":575.7,"y":420,"name":"point"},"name":"segment"},{"ps":{"x":575.7,"y":420,"name":"point"},"pe":{"x":578,"y":426.3,"name":"point"},"name":"segment"},{"ps":{"x":578,"y":426.3,"name":"point"},"pe":{"x":579.8,"y":426.3,"name":"point"},"name":"segment"},{"ps":{"x":579.8,"y":426.3,"name":"point"},"pe":{"x":586.8,"y":422.8,"name":"point"},"name":"segment"},{"ps":{"x":586.8,"y":422.8,"name":"point"},"pe":{"x":594.3000000000028,"y":420.2999999999991,"name":"point"},"name":"segment"},{"ps":{"x":594.3000000000028,"y":420.2999999999991,"name":"point"},"pe":{"x":595.8,"y":419.8,"name":"point"},"name":"segment"},{"ps":{"x":595.8,"y":419.8,"name":"point"},"pe":{"x":595.3484804630967,"y":421.5308248914614,"name":"point"},"name":"segment"},{"ps":{"x":595.3484804630967,"y":421.5308248914614,"name":"point"},"pe":{"x":596.6,"y":423,"name":"point"},"name":"segment"},{"ps":{"x":596.6,"y":423,"name":"point"},"pe":{"x":596.7947261663286,"y":423.03245436105476,"name":"point"},"name":"segment"},{"ps":{"x":596.7947261663286,"y":423.03245436105476,"name":"point"},"pe":{"x":593.5,"y":429.8,"name":"point"},"name":"segment"},{"ps":{"x":593.5,"y":429.8,"name":"point"},"pe":{"x":595.5,"y":435.5,"name":"point"},"name":"segment"},{"ps":{"x":595.5,"y":435.5,"name":"point"},"pe":{"x":596.1461538461541,"y":437.9923076923084,"name":"point"},"name":"segment"},{"ps":{"x":596.1461538461541,"y":437.9923076923084,"name":"point"},"pe":{"x":596.2464285714285,"y":438.1928571428571,"name":"point"},"name":"segment"},{"ps":{"x":596.2464285714285,"y":438.1928571428571,"name":"point"},"pe":{"x":598.8,"y":437.8,"name":"point"},"name":"segment"},{"ps":{"x":598.8,"y":437.8,"name":"point"},"pe":{"x":599.8811403508773,"y":436.33728070175425,"name":"point"},"name":"segment"},{"ps":{"x":599.8811403508773,"y":436.33728070175425,"name":"point"},"pe":{"x":602.7764127764127,"y":429.43316953316935,"name":"point"},"name":"segment"},{"ps":{"x":602.7764127764127,"y":429.43316953316935,"name":"point"},"pe":{"x":602.2,"y":427.8,"name":"point"},"name":"segment"},{"ps":{"x":602.2,"y":427.8,"name":"point"},"pe":{"x":602.2,"y":425.5,"name":"point"},"name":"segment"},{"ps":{"x":602.2,"y":425.5,"name":"point"},"pe":{"x":602.7065743944636,"y":424.0647058823528,"name":"point"},"name":"segment"},{"ps":{"x":602.7065743944636,"y":424.0647058823528,"name":"point"},"pe":{"x":605.4,"y":425.7,"name":"point"},"name":"segment"},{"ps":{"x":605.4,"y":425.7,"name":"point"},"pe":{"x":604.8,"y":425.8,"name":"point"},"name":"segment"},{"ps":{"x":604.8,"y":425.8,"name":"point"},"pe":{"x":605.3161290322583,"y":426.02580645161305,"name":"point"},"name":"segment"},{"ps":{"x":605.3161290322583,"y":426.02580645161305,"name":"point"},"pe":{"x":605.8206896551726,"y":426.13793103448296,"name":"point"},"name":"segment"},{"ps":{"x":605.8206896551726,"y":426.13793103448296,"name":"point"},"pe":{"x":605.6,"y":426,"name":"point"},"name":"segment"},{"ps":{"x":605.6,"y":426,"name":"point"},"pe":{"x":607.4349083895853,"y":425.97261330761813,"name":"point"},"name":"segment"},{"ps":{"x":607.4349083895853,"y":425.97261330761813,"name":"point"},"pe":{"x":609.2,"y":426.8,"name":"point"},"name":"segment"},{"ps":{"x":609.2,"y":426.8,"name":"point"},"pe":{"x":609.8233025984912,"y":425.93696563285835,"name":"point"},"name":"segment"},{"ps":{"x":609.8233025984912,"y":425.93696563285835,"name":"point"},"pe":{"x":612.3,"y":425.9,"name":"point"},"name":"segment"},{"ps":{"x":612.3,"y":425.9,"name":"point"},"pe":{"x":613.3,"y":424,"name":"point"},"name":"segment"},{"ps":{"x":613.3,"y":424,"name":"point"},"pe":{"x":614.610344827586,"y":423.541379310345,"name":"point"},"name":"segment"},{"ps":{"x":614.610344827586,"y":423.541379310345,"name":"point"},"pe":{"x":614.8,"y":423.3,"name":"point"},"name":"segment"},{"ps":{"x":614.8,"y":423.3,"name":"point"},"pe":{"x":615.2200000000003,"y":423.32800000000003,"name":"point"},"name":"segment"},{"ps":{"x":615.2200000000003,"y":423.32800000000003,"name":"point"},"pe":{"x":615.3,"y":423.3,"name":"point"},"name":"segment"},{"ps":{"x":615.3,"y":423.3,"name":"point"},"pe":{"x":615.7051724137923,"y":423.3603448275862,"name":"point"},"name":"segment"},{"ps":{"x":615.7051724137923,"y":423.3603448275862,"name":"point"},"pe":{"x":620.4450381679391,"y":423.6763358778625,"name":"point"},"name":"segment"},{"ps":{"x":620.4450381679391,"y":423.6763358778625,"name":"point"},"pe":{"x":623.3,"y":421.6000000000001,"name":"point"},"name":"segment"},{"ps":{"x":623.3,"y":421.6000000000001,"name":"point"},"pe":{"x":625.3999999999997,"y":416.98,"name":"point"},"name":"segment"},{"ps":{"x":625.3999999999997,"y":416.98,"name":"point"},"pe":{"x":625.8,"y":416.5,"name":"point"},"name":"segment"},{"ps":{"x":625.8,"y":416.5,"name":"point"},"pe":{"x":627.5209302325579,"y":412.3139534883709,"name":"point"},"name":"segment"},{"ps":{"x":627.5209302325579,"y":412.3139534883709,"name":"point"},"pe":{"x":629.1474264705897,"y":408.73566176470115,"name":"point"},"name":"segment"},{"ps":{"x":629.1474264705897,"y":408.73566176470115,"name":"point"},"pe":{"x":629.4144013880857,"y":407.708212839792,"name":"point"},"name":"segment"},{"ps":{"x":629.4144013880857,"y":407.708212839792,"name":"point"},"pe":{"x":629.5,"y":407.5,"name":"point"},"name":"segment"},{"ps":{"x":629.5,"y":407.5,"name":"point"},"pe":{"x":629.4893858984078,"y":407.4196360879452,"name":"point"},"name":"segment"},{"ps":{"x":629.4893858984078,"y":407.4196360879452,"name":"point"},"pe":{"x":630.3,"y":404.3,"name":"point"},"name":"segment"},{"ps":{"x":630.3,"y":404.3,"name":"point"},"pe":{"x":633.3,"y":397,"name":"point"},"name":"segment"},{"ps":{"x":633.3,"y":397,"name":"point"},"pe":{"x":634.6,"y":396.74,"name":"point"},"name":"segment"},{"ps":{"x":634.6,"y":396.74,"name":"point"},"pe":{"x":634.8,"y":396.3,"name":"point"},"name":"segment"},{"ps":{"x":634.8,"y":396.3,"name":"point"},"pe":{"x":635.2472049689441,"y":396.61055900621113,"name":"point"},"name":"segment"},{"ps":{"x":635.2472049689441,"y":396.61055900621113,"name":"point"},"pe":{"x":635.3,"y":396.6,"name":"point"},"name":"segment"},{"ps":{"x":635.3,"y":396.6,"name":"point"},"pe":{"x":635.3136504014824,"y":396.65670166769615,"name":"point"},"name":"segment"},{"ps":{"x":635.3136504014824,"y":396.65670166769615,"name":"point"},"pe":{"x":635.8961248112734,"y":397.0611977856065,"name":"point"},"name":"segment"},{"ps":{"x":635.8961248112734,"y":397.0611977856065,"name":"point"},"pe":{"x":637.2,"y":402.2,"name":"point"},"name":"segment"},{"ps":{"x":637.2,"y":402.2,"name":"point"},"pe":{"x":637.8,"y":409.8,"name":"point"},"name":"segment"},{"ps":{"x":637.8,"y":409.8,"name":"point"},"pe":{"x":650.3633187772926,"y":407.1078602620087,"name":"point"},"name":"segment"},{"ps":{"x":650.3633187772926,"y":407.1078602620087,"name":"point"},"pe":{"x":652.8,"y":408.8,"name":"point"},"name":"segment"},{"ps":{"x":652.8,"y":408.8,"name":"point"},"pe":{"x":654.1391684901531,"y":411.7759299781182,"name":"point"},"name":"segment"},{"ps":{"x":654.1391684901531,"y":411.7759299781182,"name":"point"},"pe":{"x":653.8589003054708,"y":411.99025270758113,"name":"point"},"name":"segment"},{"ps":{"x":653.8589003054708,"y":411.99025270758113,"name":"point"},"pe":{"x":659.9,"y":424.9,"name":"point"},"name":"segment"},{"ps":{"x":659.9,"y":424.9,"name":"point"},"pe":{"x":660.1636363636363,"y":425.16363636363616,"name":"point"},"name":"segment"},{"ps":{"x":660.1636363636363,"y":425.16363636363616,"name":"point"},"pe":{"x":660.4747252747255,"y":425.8549450549451,"name":"point"},"name":"segment"},{"ps":{"x":660.4747252747255,"y":425.8549450549451,"name":"point"},"pe":{"x":660.95,"y":425.95,"name":"point"},"name":"segment"},{"ps":{"x":660.95,"y":425.95,"name":"point"},"pe":{"x":662.6285714285714,"y":427.62857142857126,"name":"point"},"name":"segment"},{"ps":{"x":662.6285714285714,"y":427.62857142857126,"name":"point"},"pe":{"x":662.8,"y":428.2,"name":"point"},"name":"segment"},{"ps":{"x":662.8,"y":428.2,"name":"point"},"pe":{"x":662.8,"y":428.5222222222222,"name":"point"},"name":"segment"},{"ps":{"x":662.8,"y":428.5222222222222,"name":"point"},"pe":{"x":663.3652173913043,"y":428.36521739130427,"name":"point"},"name":"segment"},{"ps":{"x":663.3652173913043,"y":428.36521739130427,"name":"point"},"pe":{"x":664.3,"y":429.3,"name":"point"},"name":"segment"},{"ps":{"x":664.3,"y":429.3,"name":"point"},"pe":{"x":666.7,"y":429.9,"name":"point"},"name":"segment"},{"ps":{"x":666.7,"y":429.9,"name":"point"},"pe":{"x":676.9880421243348,"y":424.80405390103044,"name":"point"},"name":"segment"},{"ps":{"x":676.9880421243348,"y":424.80405390103044,"name":"point"},"pe":{"x":677.0046511627908,"y":424.6,"name":"point"},"name":"segment"},{"ps":{"x":677.0046511627908,"y":424.6,"name":"point"},"pe":{"x":676.9199999999996,"y":424.6,"name":"point"},"name":"segment"},{"ps":{"x":676.9199999999996,"y":424.6,"name":"point"},"pe":{"x":677.0066093853271,"y":424.57594183740895,"name":"point"},"name":"segment"},{"ps":{"x":677.0066093853271,"y":424.57594183740895,"name":"point"},"pe":{"x":677.0326693227092,"y":424.2557768924303,"name":"point"},"name":"segment"},{"ps":{"x":677.0326693227092,"y":424.2557768924303,"name":"point"},"pe":{"x":679,"y":423.6,"name":"point"},"name":"segment"},{"ps":{"x":679,"y":423.6,"name":"point"},"pe":{"x":682.357482185273,"y":421.67707838479805,"name":"point"},"name":"segment"},{"ps":{"x":682.357482185273,"y":421.67707838479805,"name":"point"},"pe":{"x":682.8,"y":421.8,"name":"point"},"name":"segment"},{"ps":{"x":682.8,"y":421.8,"name":"point"},"pe":{"x":682.8180505415162,"y":421.8794223826715,"name":"point"},"name":"segment"},{"ps":{"x":682.8180505415162,"y":421.8794223826715,"name":"point"},"pe":{"x":687.5974683544301,"y":418.8379746835445,"name":"point"},"name":"segment"},{"ps":{"x":687.5974683544301,"y":418.8379746835445,"name":"point"},"pe":{"x":687.6086956521738,"y":418.66956521739127,"name":"point"},"name":"segment"},{"ps":{"x":687.6086956521738,"y":418.66956521739127,"name":"point"},"pe":{"x":690,"y":417.3,"name":"point"},"name":"segment"},{"ps":{"x":690,"y":417.3,"name":"point"},"pe":{"x":690.0055555555555,"y":417.30555555555554,"name":"point"},"name":"segment"},{"ps":{"x":690.0055555555555,"y":417.30555555555554,"name":"point"},"pe":{"x":690.8,"y":416.8,"name":"point"},"name":"segment"},{"ps":{"x":690.8,"y":416.8,"name":"point"},"pe":{"x":692.8728943338436,"y":417.77886676875954,"name":"point"},"name":"segment"},{"ps":{"x":692.8728943338436,"y":417.77886676875954,"name":"point"},"pe":{"x":693.5,"y":426.2,"name":"point"},"name":"segment"},{"ps":{"x":693.5,"y":426.2,"name":"point"},"pe":{"x":694.8,"y":428.5,"name":"point"},"name":"segment"},{"ps":{"x":694.8,"y":428.5,"name":"point"},"pe":{"x":695.5,"y":432.8,"name":"point"},"name":"segment"},{"ps":{"x":695.5,"y":432.8,"name":"point"},"pe":{"x":698.2,"y":432.8,"name":"point"},"name":"segment"},{"ps":{"x":698.2,"y":432.8,"name":"point"},"pe":{"x":704.9888039661226,"y":423.50026853955796,"name":"point"},"name":"segment"},{"ps":{"x":704.9888039661226,"y":423.50026853955796,"name":"point"},"pe":{"x":707.4083618917066,"y":424.64283755997263,"name":"point"},"name":"segment"},{"ps":{"x":707.4083618917066,"y":424.64283755997263,"name":"point"},"pe":{"x":708,"y":424,"name":"point"},"name":"segment"},{"ps":{"x":708,"y":424,"name":"point"},"pe":{"x":708,"y":424.9222222222223,"name":"point"},"name":"segment"},{"ps":{"x":708,"y":424.9222222222223,"name":"point"},"pe":{"x":708.8,"y":425.3,"name":"point"},"name":"segment"},{"ps":{"x":708.8,"y":425.3,"name":"point"},"pe":{"x":708.1976878612716,"y":429.2150289017341,"name":"point"},"name":"segment"},{"ps":{"x":708.1976878612716,"y":429.2150289017341,"name":"point"},"pe":{"x":707.5,"y":430.2,"name":"point"},"name":"segment"},{"ps":{"x":707.5,"y":430.2,"name":"point"},"pe":{"x":704.5,"y":433.2,"name":"point"},"name":"segment"},{"ps":{"x":704.5,"y":433.2,"name":"point"},"pe":{"x":703.2560975609756,"y":436.060975609756,"name":"point"},"name":"segment"},{"ps":{"x":703.2560975609756,"y":436.060975609756,"name":"point"},"pe":{"x":704.2222222222222,"y":437.8,"name":"point"},"name":"segment"},{"ps":{"x":704.2222222222222,"y":437.8,"name":"point"},"pe":{"x":706.8769230769229,"y":437.8,"name":"point"},"name":"segment"},{"ps":{"x":706.8769230769229,"y":437.8,"name":"point"},"pe":{"x":706.8,"y":438.3,"name":"point"},"name":"segment"},{"ps":{"x":706.8,"y":438.3,"name":"point"},"pe":{"x":709.1390862944162,"y":440.44416243654825,"name":"point"},"name":"segment"},{"ps":{"x":709.1390862944162,"y":440.44416243654825,"name":"point"},"pe":{"x":711.3,"y":441.6,"name":"point"},"name":"segment"},{"ps":{"x":711.3,"y":441.6,"name":"point"},"pe":{"x":714.2224376731302,"y":444.3470914127425,"name":"point"},"name":"segment"},{"ps":{"x":714.2224376731302,"y":444.3470914127425,"name":"point"},"pe":{"x":718.1776978417267,"y":445.86834532374104,"name":"point"},"name":"segment"},{"ps":{"x":718.1776978417267,"y":445.86834532374104,"name":"point"},"pe":{"x":721.853191489362,"y":445.02340425531924,"name":"point"},"name":"segment"},{"ps":{"x":721.853191489362,"y":445.02340425531924,"name":"point"},"pe":{"x":723.3,"y":444.3,"name":"point"},"name":"segment"},{"ps":{"x":723.3,"y":444.3,"name":"point"},"pe":{"x":724.4012145748989,"y":444.4376518218625,"name":"point"},"name":"segment"},{"ps":{"x":724.4012145748989,"y":444.4376518218625,"name":"point"},"pe":{"x":725,"y":444.3,"name":"point"},"name":"segment"},{"ps":{"x":725,"y":444.3,"name":"point"},"pe":{"x":730.3,"y":443.6,"name":"point"},"name":"segment"},{"ps":{"x":730.3,"y":443.6,"name":"point"},"pe":{"x":733.9156521739131,"y":445.62695652173926,"name":"point"},"name":"segment"},{"ps":{"x":733.9156521739131,"y":445.62695652173926,"name":"point"},"pe":{"x":735.3,"y":445.8,"name":"point"},"name":"segment"},{"ps":{"x":735.3,"y":445.8,"name":"point"},"pe":{"x":741.8,"y":445.8,"name":"point"},"name":"segment"},{"ps":{"x":741.8,"y":445.8,"name":"point"},"pe":{"x":742.1687969924812,"y":445.14436090225564,"name":"point"},"name":"segment"},{"ps":{"x":742.1687969924812,"y":445.14436090225564,"name":"point"},"pe":{"x":743.2345314505778,"y":445.62695763799746,"name":"point"},"name":"segment"},{"ps":{"x":743.2345314505778,"y":445.62695763799746,"name":"point"},"pe":{"x":743.3,"y":445.6,"name":"point"},"name":"segment"},{"ps":{"x":743.3,"y":445.6,"name":"point"},"pe":{"x":744.419018404908,"y":445.3901840490798,"name":"point"},"name":"segment"},{"ps":{"x":744.419018404908,"y":445.3901840490798,"name":"point"},"pe":{"x":744.2,"y":443.2,"name":"point"},"name":"segment"},{"ps":{"x":744.2,"y":443.2,"name":"point"},"pe":{"x":743.9540983606557,"y":441.9704918032786,"name":"point"},"name":"segment"},{"ps":{"x":743.9540983606557,"y":441.9704918032786,"name":"point"},"pe":{"x":744.6422857142858,"y":440.7470476190477,"name":"point"},"name":"segment"},{"ps":{"x":744.6422857142858,"y":440.7470476190477,"name":"point"},"pe":{"x":744.6,"y":440,"name":"point"},"name":"segment"},{"ps":{"x":744.6,"y":440,"name":"point"},"pe":{"x":745.6,"y":438.3,"name":"point"},"name":"segment"},{"ps":{"x":745.6,"y":438.3,"name":"point"},"pe":{"x":746.0498233215546,"y":438.24475853945813,"name":"point"},"name":"segment"},{"ps":{"x":746.0498233215546,"y":438.24475853945813,"name":"point"},"pe":{"x":746.3,"y":437.8,"name":"point"},"name":"segment"},{"ps":{"x":746.3,"y":437.8,"name":"point"},"pe":{"x":747.0298969072162,"y":438.1243986254295,"name":"point"},"name":"segment"},{"ps":{"x":747.0298969072162,"y":438.1243986254295,"name":"point"},"pe":{"x":751.3,"y":437.6,"name":"point"},"name":"segment"},{"ps":{"x":751.3,"y":437.6,"name":"point"},"pe":{"x":751.3,"y":439.96666666666664,"name":"point"},"name":"segment"},{"ps":{"x":751.3,"y":439.96666666666664,"name":"point"},"pe":{"x":753.1612903225806,"y":440.5870967741936,"name":"point"},"name":"segment"},{"ps":{"x":753.1612903225806,"y":440.5870967741936,"name":"point"},"pe":{"x":752.8,"y":444.2,"name":"point"},"name":"segment"},{"ps":{"x":752.8,"y":444.2,"name":"point"},"pe":{"x":757.2,"y":446.2,"name":"point"},"name":"segment"},{"ps":{"x":757.2,"y":446.2,"name":"point"},"pe":{"x":758.9810559006212,"y":447.5654761904762,"name":"point"},"name":"segment"},{"ps":{"x":758.9810559006212,"y":447.5654761904762,"name":"point"},"pe":{"x":761.3838747099769,"y":446.5420533642691,"name":"point"},"name":"segment"},{"ps":{"x":761.3838747099769,"y":446.5420533642691,"name":"point"},"pe":{"x":762.8,"y":444.2,"name":"point"},"name":"segment"},{"ps":{"x":762.8,"y":444.2,"name":"point"},"pe":{"x":763.3454545454546,"y":443.9818181818182,"name":"point"},"name":"segment"},{"ps":{"x":763.3454545454546,"y":443.9818181818182,"name":"point"},"pe":{"x":764.3,"y":444.3,"name":"point"},"name":"segment"},{"ps":{"x":764.3,"y":444.3,"name":"point"},"pe":{"x":764.3,"y":445.3,"name":"point"},"name":"segment"},{"ps":{"x":764.3,"y":445.3,"name":"point"},"pe":{"x":765.6,"y":445.3,"name":"point"},"name":"segment"},{"ps":{"x":765.6,"y":445.3,"name":"point"},"pe":{"x":764.9,"y":449,"name":"point"},"name":"segment"},{"ps":{"x":764.9,"y":449,"name":"point"},"pe":{"x":764.6,"y":453.3,"name":"point"},"name":"segment"},{"ps":{"x":764.6,"y":453.3,"name":"point"},"pe":{"x":766.9,"y":454,"name":"point"},"name":"segment"},{"ps":{"x":766.9,"y":454,"name":"point"},"pe":{"x":780.2496868475996,"y":455.45302713987485,"name":"point"},"name":"segment"},{"ps":{"x":780.2496868475996,"y":455.45302713987485,"name":"point"},"pe":{"x":786.8,"y":457.5,"name":"point"},"name":"segment"},{"ps":{"x":786.8,"y":457.5,"name":"point"},"pe":{"x":785.5,"y":458.5,"name":"point"},"name":"segment"},{"ps":{"x":785.5,"y":458.5,"name":"point"},"pe":{"x":782.5,"y":458.5,"name":"point"},"name":"segment"},{"ps":{"x":782.5,"y":458.5,"name":"point"},"pe":{"x":757.1344066237349,"y":460.2519779208832,"name":"point"},"name":"segment"},{"ps":{"x":757.1344066237349,"y":460.2519779208832,"name":"point"},"pe":{"x":748.3,"y":460.6,"name":"point"},"name":"segment"},{"ps":{"x":748.3,"y":460.6,"name":"point"},"pe":{"x":725.3,"y":460.3,"name":"point"},"name":"segment"},{"ps":{"x":725.3,"y":460.3,"name":"point"},"pe":{"x":645.6,"y":462,"name":"point"},"name":"segment"},{"ps":{"x":645.6,"y":462,"name":"point"},"pe":{"x":622.4,"y":462.3,"name":"point"},"name":"segment"},{"ps":{"x":622.4,"y":462.3,"name":"point"},"pe":{"x":605,"y":464.3,"name":"point"},"name":"segment"},{"ps":{"x":605,"y":464.3,"name":"point"},"pe":{"x":567.7751724137913,"y":465.0158620689656,"name":"point"},"name":"segment"},{"ps":{"x":567.7751724137913,"y":465.0158620689656,"name":"point"},"pe":{"x":563.3,"y":465.3,"name":"point"},"name":"segment"},{"ps":{"x":563.3,"y":465.3,"name":"point"},"pe":{"x":524.3033434650456,"y":469.88784194528876,"name":"point"},"name":"segment"},{"ps":{"x":524.3033434650456,"y":469.88784194528876,"name":"point"},"pe":{"x":524.2,"y":469.8,"name":"point"},"name":"segment"},{"ps":{"x":524.2,"y":469.8,"name":"point"},"pe":{"x":520.0857142857142,"y":469.8,"name":"point"},"name":"segment"},{"ps":{"x":520.0857142857142,"y":469.8,"name":"point"},"pe":{"x":515.8,"y":466.8,"name":"point"},"name":"segment"},{"ps":{"x":515.8,"y":466.8,"name":"point"},"pe":{"x":514.7151219512195,"y":466.4609756097562,"name":"point"},"name":"segment"},{"ps":{"x":514.7151219512195,"y":466.4609756097562,"name":"point"},"pe":{"x":514.5186785260483,"y":466.04002541296063,"name":"point"},"name":"segment"},{"ps":{"x":514.5186785260483,"y":466.04002541296063,"name":"point"},"pe":{"x":513.4347826086957,"y":466.0608695652174,"name":"point"},"name":"segment"},{"ps":{"x":513.4347826086957,"y":466.0608695652174,"name":"point"},"pe":{"x":509.7435528500277,"y":464.90736026563366,"name":"point"},"name":"segment"},{"ps":{"x":509.7435528500277,"y":464.90736026563366,"name":"point"},"pe":{"x":508.5535239810852,"y":466.1547399234408,"name":"point"},"name":"segment"},{"ps":{"x":508.5535239810852,"y":466.1547399234408,"name":"point"},"pe":{"x":506.1709497206705,"y":466.2005586592179,"name":"point"},"name":"segment"},{"ps":{"x":506.1709497206705,"y":466.2005586592179,"name":"point"},"pe":{"x":501.8,"y":471.3,"name":"point"},"name":"segment"},{"ps":{"x":501.8,"y":471.3,"name":"point"},"pe":{"x":496.3,"y":470.3,"name":"point"},"name":"segment"},{"ps":{"x":496.3,"y":470.3,"name":"point"},"pe":{"x":491.8,"y":476.8,"name":"point"},"name":"segment"},{"ps":{"x":491.8,"y":476.8,"name":"point"},"pe":{"x":487.24683544303804,"y":480.52531645569616,"name":"point"},"name":"segment"},{"ps":{"x":487.24683544303804,"y":480.52531645569616,"name":"point"},"pe":{"x":485.39595375722547,"y":480.7104046242774,"name":"point"},"name":"segment"},{"ps":{"x":485.39595375722547,"y":480.7104046242774,"name":"point"},"pe":{"x":474.8,"y":473.8,"name":"point"},"name":"segment"},{"ps":{"x":474.8,"y":473.8,"name":"point"},"pe":{"x":493.8,"y":460.3,"name":"point"},"name":"segment"},{"ps":{"x":493.8,"y":460.3,"name":"point"},"pe":{"x":489.8,"y":454.8,"name":"point"},"name":"segment"},{"ps":{"x":489.8,"y":454.8,"name":"point"},"pe":{"x":490.286346300534,"y":453.2193745232649,"name":"point"},"name":"segment"},{"ps":{"x":490.286346300534,"y":453.2193745232649,"name":"point"},"pe":{"x":489.3,"y":451.6,"name":"point"},"name":"segment"},{"ps":{"x":489.3,"y":451.6,"name":"point"},"pe":{"x":491.0807980049874,"y":450.63740648379087,"name":"point"},"name":"segment"},{"ps":{"x":491.0807980049874,"y":450.63740648379087,"name":"point"},"pe":{"x":491.7792207792208,"y":448.36753246753244,"name":"point"},"name":"segment"},{"ps":{"x":491.7792207792208,"y":448.36753246753244,"name":"point"},"pe":{"x":492.5,"y":448.8,"name":"point"},"name":"segment"},{"ps":{"x":492.5,"y":448.8,"name":"point"},"pe":{"x":495.6999999999999,"y":449.6,"name":"point"},"name":"segment"}],[{"ps":{"x":611.372463768116,"y":427.6623188405795,"name":"point"},"pe":{"x":612.7571428571428,"y":425.9,"name":"point"},"name":"segment"},{"ps":{"x":612.7571428571428,"y":425.9,"name":"point"},"pe":{"x":612.3,"y":425.9,"name":"point"},"name":"segment"},{"ps":{"x":612.3,"y":425.9,"name":"point"},"pe":{"x":611.372463768116,"y":427.6623188405795,"name":"point"},"name":"segment"}],[{"ps":{"x":565,"y":434.8,"name":"point"},"pe":{"x":565.7,"y":434.8,"name":"point"},"name":"segment"},{"ps":{"x":565.7,"y":434.8,"name":"point"},"pe":{"x":565.5,"y":434.7,"name":"point"},"name":"segment"},{"ps":{"x":565.5,"y":434.7,"name":"point"},"pe":{"x":565,"y":434.8,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":495.6999999999999,"y":449.6,"name":"point"},"pe":{"x":496.5,"y":449.8,"name":"point"},"name":"segment"},{"ps":{"x":496.5,"y":449.8,"name":"point"},"pe":{"x":497.8,"y":451.2,"name":"point"},"name":"segment"},{"ps":{"x":497.8,"y":451.2,"name":"point"},"pe":{"x":500.62352941176465,"y":449.6,"name":"point"},"name":"segment"},{"ps":{"x":500.62352941176465,"y":449.6,"name":"point"},"pe":{"x":504.3,"y":449.6,"name":"point"},"name":"segment"},{"ps":{"x":504.3,"y":449.6,"name":"point"},"pe":{"x":509.7,"y":448.3,"name":"point"},"name":"segment"},{"ps":{"x":509.7,"y":448.3,"name":"point"},"pe":{"x":510.16305569749636,"y":447.76647930505874,"name":"point"},"name":"segment"},{"ps":{"x":510.16305569749636,"y":447.76647930505874,"name":"point"},"pe":{"x":511.8,"y":447.5,"name":"point"},"name":"segment"},{"ps":{"x":511.8,"y":447.5,"name":"point"},"pe":{"x":512.0000000000002,"y":445.64999999999986,"name":"point"},"name":"segment"},{"ps":{"x":512.0000000000002,"y":445.64999999999986,"name":"point"},"pe":{"x":514.3,"y":443,"name":"point"},"name":"segment"},{"ps":{"x":514.3,"y":443,"name":"point"},"pe":{"x":522.3,"y":427.6,"name":"point"},"name":"segment"},{"ps":{"x":522.3,"y":427.6,"name":"point"},"pe":{"x":525,"y":426,"name":"point"},"name":"segment"},{"ps":{"x":525,"y":426,"name":"point"},"pe":{"x":527,"y":419.6,"name":"point"},"name":"segment"},{"ps":{"x":527,"y":419.6,"name":"point"},"pe":{"x":536.3,"y":419.3,"name":"point"},"name":"segment"},{"ps":{"x":536.3,"y":419.3,"name":"point"},"pe":{"x":536.3,"y":420.3,"name":"point"},"name":"segment"},{"ps":{"x":536.3,"y":420.3,"name":"point"},"pe":{"x":535.7,"y":421.6,"name":"point"},"name":"segment"},{"ps":{"x":535.7,"y":421.6,"name":"point"},"pe":{"x":533,"y":425.3,"name":"point"},"name":"segment"},{"ps":{"x":533,"y":425.3,"name":"point"},"pe":{"x":533,"y":431,"name":"point"},"name":"segment"},{"ps":{"x":533,"y":431,"name":"point"},"pe":{"x":531.7,"y":433.6,"name":"point"},"name":"segment"},{"ps":{"x":531.7,"y":433.6,"name":"point"},"pe":{"x":533.3,"y":438.6,"name":"point"},"name":"segment"},{"ps":{"x":533.3,"y":438.6,"name":"point"},"pe":{"x":534.74578313253,"y":439.0915662650602,"name":"point"},"name":"segment"},{"ps":{"x":534.74578313253,"y":439.0915662650602,"name":"point"},"pe":{"x":534.8,"y":439.2,"name":"point"},"name":"segment"},{"ps":{"x":534.8,"y":439.2,"name":"point"},"pe":{"x":534.9610738255034,"y":439.1647651006711,"name":"point"},"name":"segment"},{"ps":{"x":534.9610738255034,"y":439.1647651006711,"name":"point"},"pe":{"x":538.3,"y":440.3,"name":"point"},"name":"segment"},{"ps":{"x":538.3,"y":440.3,"name":"point"},"pe":{"x":547.1,"y":439.6,"name":"point"},"name":"segment"},{"ps":{"x":547.1,"y":439.6,"name":"point"},"pe":{"x":550.9,"y":438,"name":"point"},"name":"segment"},{"ps":{"x":550.9,"y":438,"name":"point"},"pe":{"x":549.7,"y":438.3,"name":"point"},"name":"segment"},{"ps":{"x":549.7,"y":438.3,"name":"point"},"pe":{"x":553,"y":435.6,"name":"point"},"name":"segment"},{"ps":{"x":553,"y":435.6,"name":"point"},"pe":{"x":557.7,"y":435.6,"name":"point"},"name":"segment"},{"ps":{"x":557.7,"y":435.6,"name":"point"},"pe":{"x":559.7,"y":432.6,"name":"point"},"name":"segment"},{"ps":{"x":559.7,"y":432.6,"name":"point"},"pe":{"x":561.3,"y":432.6,"name":"point"},"name":"segment"},{"ps":{"x":561.3,"y":432.6,"name":"point"},"pe":{"x":563.7,"y":433.6,"name":"point"},"name":"segment"},{"ps":{"x":563.7,"y":433.6,"name":"point"},"pe":{"x":565.5,"y":434.7,"name":"point"},"name":"segment"},{"ps":{"x":565.5,"y":434.7,"name":"point"},"pe":{"x":566.6864516129033,"y":434.43634408602156,"name":"point"},"name":"segment"},{"ps":{"x":566.6864516129033,"y":434.43634408602156,"name":"point"},"pe":{"x":566.8,"y":434.5,"name":"point"},"name":"segment"},{"ps":{"x":566.8,"y":434.5,"name":"point"},"pe":{"x":566.8888888888888,"y":434.3913580246913,"name":"point"},"name":"segment"},{"ps":{"x":566.8888888888888,"y":434.3913580246913,"name":"point"},"pe":{"x":570,"y":433.7,"name":"point"},"name":"segment"},{"ps":{"x":570,"y":433.7,"name":"point"},"pe":{"x":571.7,"y":431.6,"name":"point"},"name":"segment"},{"ps":{"x":571.7,"y":431.6,"name":"point"},"pe":{"x":572.3,"y":427,"name":"point"},"name":"segment"},{"ps":{"x":572.3,"y":427,"name":"point"},"pe":{"x":571,"y":422,"name":"point"},"name":"segment"},{"ps":{"x":571,"y":422,"name":"point"},"pe":{"x":571.7,"y":419.6,"name":"point"},"name":"segment"},{"ps":{"x":571.7,"y":419.6,"name":"point"},"pe":{"x":574.7,"y":419,"name":"point"},"name":"segment"},{"ps":{"x":574.7,"y":419,"name":"point"},"pe":{"x":575.7,"y":420,"name":"point"},"name":"segment"},{"ps":{"x":575.7,"y":420,"name":"point"},"pe":{"x":578,"y":426.3,"name":"point"},"name":"segment"},{"ps":{"x":578,"y":426.3,"name":"point"},"pe":{"x":580.3,"y":426.3,"name":"point"},"name":"segment"},{"ps":{"x":580.3,"y":426.3,"name":"point"},"pe":{"x":586.3,"y":423.3,"name":"point"},"name":"segment"},{"ps":{"x":586.3,"y":423.3,"name":"point"},"pe":{"x":594.3,"y":420.3,"name":"point"},"name":"segment"},{"ps":{"x":594.3,"y":420.3,"name":"point"},"pe":{"x":596.6,"y":423,"name":"point"},"name":"segment"},{"ps":{"x":596.6,"y":423,"name":"point"},"pe":{"x":596.7947261663286,"y":423.03245436105476,"name":"point"},"name":"segment"},{"ps":{"x":596.7947261663286,"y":423.03245436105476,"name":"point"},"pe":{"x":593.5,"y":429.8,"name":"point"},"name":"segment"},{"ps":{"x":593.5,"y":429.8,"name":"point"},"pe":{"x":595.5,"y":435.5,"name":"point"},"name":"segment"},{"ps":{"x":595.5,"y":435.5,"name":"point"},"pe":{"x":596.2,"y":438.2,"name":"point"},"name":"segment"},{"ps":{"x":596.2,"y":438.2,"name":"point"},"pe":{"x":598.8,"y":437.8,"name":"point"},"name":"segment"},{"ps":{"x":598.8,"y":437.8,"name":"point"},"pe":{"x":600.5,"y":435.5,"name":"point"},"name":"segment"},{"ps":{"x":600.5,"y":435.5,"name":"point"},"pe":{"x":602.8,"y":429.5,"name":"point"},"name":"segment"},{"ps":{"x":602.8,"y":429.5,"name":"point"},"pe":{"x":602.2,"y":427.8,"name":"point"},"name":"segment"},{"ps":{"x":602.2,"y":427.8,"name":"point"},"pe":{"x":602.2,"y":425.5,"name":"point"},"name":"segment"},{"ps":{"x":602.2,"y":425.5,"name":"point"},"pe":{"x":602.7065743944636,"y":424.0647058823528,"name":"point"},"name":"segment"},{"ps":{"x":602.7065743944636,"y":424.0647058823528,"name":"point"},"pe":{"x":605.4,"y":425.7,"name":"point"},"name":"segment"},{"ps":{"x":605.4,"y":425.7,"name":"point"},"pe":{"x":604.8,"y":425.8,"name":"point"},"name":"segment"},{"ps":{"x":604.8,"y":425.8,"name":"point"},"pe":{"x":606.4,"y":426.5,"name":"point"},"name":"segment"},{"ps":{"x":606.4,"y":426.5,"name":"point"},"pe":{"x":605.6,"y":426,"name":"point"},"name":"segment"},{"ps":{"x":605.6,"y":426,"name":"point"},"pe":{"x":607.4349083895853,"y":425.97261330761813,"name":"point"},"name":"segment"},{"ps":{"x":607.4349083895853,"y":425.97261330761813,"name":"point"},"pe":{"x":609.2,"y":426.8,"name":"point"},"name":"segment"},{"ps":{"x":609.2,"y":426.8,"name":"point"},"pe":{"x":609.8233025984912,"y":425.93696563285835,"name":"point"},"name":"segment"},{"ps":{"x":609.8233025984912,"y":425.93696563285835,"name":"point"},"pe":{"x":612.3,"y":425.9,"name":"point"},"name":"segment"},{"ps":{"x":612.3,"y":425.9,"name":"point"},"pe":{"x":613.3,"y":424,"name":"point"},"name":"segment"},{"ps":{"x":613.3,"y":424,"name":"point"},"pe":{"x":615.3,"y":423.3,"name":"point"},"name":"segment"},{"ps":{"x":615.3,"y":423.3,"name":"point"},"pe":{"x":620,"y":424,"name":"point"},"name":"segment"},{"ps":{"x":620,"y":424,"name":"point"},"pe":{"x":623.3,"y":421.6,"name":"point"},"name":"segment"},{"ps":{"x":623.3,"y":421.6,"name":"point"},"pe":{"x":627,"y":417,"name":"point"},"name":"segment"},{"ps":{"x":627,"y":417,"name":"point"},"pe":{"x":629.4144013880857,"y":407.708212839792,"name":"point"},"name":"segment"},{"ps":{"x":629.4144013880857,"y":407.708212839792,"name":"point"},"pe":{"x":629.5,"y":407.5,"name":"point"},"name":"segment"},{"ps":{"x":629.5,"y":407.5,"name":"point"},"pe":{"x":629.4893858984078,"y":407.4196360879452,"name":"point"},"name":"segment"},{"ps":{"x":629.4893858984078,"y":407.4196360879452,"name":"point"},"pe":{"x":630.3,"y":404.3,"name":"point"},"name":"segment"},{"ps":{"x":630.3,"y":404.3,"name":"point"},"pe":{"x":633.3,"y":397,"name":"point"},"name":"segment"},{"ps":{"x":633.3,"y":397,"name":"point"},"pe":{"x":635.3,"y":396.6,"name":"point"},"name":"segment"},{"ps":{"x":635.3,"y":396.6,"name":"point"},"pe":{"x":636.6,"y":402,"name":"point"},"name":"segment"},{"ps":{"x":636.6,"y":402,"name":"point"},"pe":{"x":637.6,"y":411,"name":"point"},"name":"segment"},{"ps":{"x":637.6,"y":411,"name":"point"},"pe":{"x":651,"y":407.6,"name":"point"},"name":"segment"},{"ps":{"x":651,"y":407.6,"name":"point"},"pe":{"x":652.6,"y":409.3,"name":"point"},"name":"segment"},{"ps":{"x":652.6,"y":409.3,"name":"point"},"pe":{"x":653.8589003054707,"y":411.9902527075812,"name":"point"},"name":"segment"},{"ps":{"x":653.8589003054707,"y":411.9902527075812,"name":"point"},"pe":{"x":652.8,"y":412.8,"name":"point"},"name":"segment"},{"ps":{"x":652.8,"y":412.8,"name":"point"},"pe":{"x":650.2,"y":412.8,"name":"point"},"name":"segment"},{"ps":{"x":650.2,"y":412.8,"name":"point"},"pe":{"x":637.5,"y":415.5,"name":"point"},"name":"segment"},{"ps":{"x":637.5,"y":415.5,"name":"point"},"pe":{"x":631.8,"y":418.2,"name":"point"},"name":"segment"},{"ps":{"x":631.8,"y":418.2,"name":"point"},"pe":{"x":624.8,"y":426.2,"name":"point"},"name":"segment"},{"ps":{"x":624.8,"y":426.2,"name":"point"},"pe":{"x":622.2,"y":428.2,"name":"point"},"name":"segment"},{"ps":{"x":622.2,"y":428.2,"name":"point"},"pe":{"x":620.5,"y":430.2,"name":"point"},"name":"segment"},{"ps":{"x":620.5,"y":430.2,"name":"point"},"pe":{"x":617.8,"y":432.5,"name":"point"},"name":"segment"},{"ps":{"x":617.8,"y":432.5,"name":"point"},"pe":{"x":614.5,"y":435.8,"name":"point"},"name":"segment"},{"ps":{"x":614.5,"y":435.8,"name":"point"},"pe":{"x":619.5,"y":435.8,"name":"point"},"name":"segment"},{"ps":{"x":619.5,"y":435.8,"name":"point"},"pe":{"x":621.5,"y":437.5,"name":"point"},"name":"segment"},{"ps":{"x":621.5,"y":437.5,"name":"point"},"pe":{"x":624.5,"y":440.8,"name":"point"},"name":"segment"},{"ps":{"x":624.5,"y":440.8,"name":"point"},"pe":{"x":627.2,"y":440.8,"name":"point"},"name":"segment"},{"ps":{"x":627.2,"y":440.8,"name":"point"},"pe":{"x":629.5,"y":439.2,"name":"point"},"name":"segment"},{"ps":{"x":629.5,"y":439.2,"name":"point"},"pe":{"x":631.5,"y":438.8,"name":"point"},"name":"segment"},{"ps":{"x":631.5,"y":438.8,"name":"point"},"pe":{"x":633.8,"y":439.5,"name":"point"},"name":"segment"},{"ps":{"x":633.8,"y":439.5,"name":"point"},"pe":{"x":635.2,"y":442.5,"name":"point"},"name":"segment"},{"ps":{"x":635.2,"y":442.5,"name":"point"},"pe":{"x":638.8,"y":445.2,"name":"point"},"name":"segment"},{"ps":{"x":638.8,"y":445.2,"name":"point"},"pe":{"x":642.8,"y":445.2,"name":"point"},"name":"segment"},{"ps":{"x":642.8,"y":445.2,"name":"point"},"pe":{"x":645.8,"y":444.2,"name":"point"},"name":"segment"},{"ps":{"x":645.8,"y":444.2,"name":"point"},"pe":{"x":649.5,"y":443.8,"name":"point"},"name":"segment"},{"ps":{"x":649.5,"y":443.8,"name":"point"},"pe":{"x":654.2,"y":432.8,"name":"point"},"name":"segment"},{"ps":{"x":654.2,"y":432.8,"name":"point"},"pe":{"x":654.2,"y":429.8,"name":"point"},"name":"segment"},{"ps":{"x":654.2,"y":429.8,"name":"point"},"pe":{"x":658.2,"y":426.2,"name":"point"},"name":"segment"},{"ps":{"x":658.2,"y":426.2,"name":"point"},"pe":{"x":660.2,"y":425.8,"name":"point"},"name":"segment"},{"ps":{"x":660.2,"y":425.8,"name":"point"},"pe":{"x":660.95,"y":425.95,"name":"point"},"name":"segment"},{"ps":{"x":660.95,"y":425.95,"name":"point"},"pe":{"x":662.6285714285714,"y":427.62857142857126,"name":"point"},"name":"segment"},{"ps":{"x":662.6285714285714,"y":427.62857142857126,"name":"point"},"pe":{"x":662.8,"y":428.2,"name":"point"},"name":"segment"},{"ps":{"x":662.8,"y":428.2,"name":"point"},"pe":{"x":662.8,"y":430.5,"name":"point"},"name":"segment"},{"ps":{"x":662.8,"y":430.5,"name":"point"},"pe":{"x":658.8,"y":433.5,"name":"point"},"name":"segment"},{"ps":{"x":658.8,"y":433.5,"name":"point"},"pe":{"x":656.2,"y":443.2,"name":"point"},"name":"segment"},{"ps":{"x":656.2,"y":443.2,"name":"point"},"pe":{"x":664.2,"y":443.2,"name":"point"},"name":"segment"},{"ps":{"x":664.2,"y":443.2,"name":"point"},"pe":{"x":669.2,"y":441.8,"name":"point"},"name":"segment"},{"ps":{"x":669.2,"y":441.8,"name":"point"},"pe":{"x":672.5,"y":438.8,"name":"point"},"name":"segment"},{"ps":{"x":672.5,"y":438.8,"name":"point"},"pe":{"x":676.5,"y":430.8,"name":"point"},"name":"segment"},{"ps":{"x":676.5,"y":430.8,"name":"point"},"pe":{"x":676.9880421243348,"y":424.8040539010306,"name":"point"},"name":"segment"},{"ps":{"x":676.9880421243348,"y":424.8040539010306,"name":"point"},"pe":{"x":677.4,"y":424.6,"name":"point"},"name":"segment"},{"ps":{"x":677.4,"y":424.6,"name":"point"},"pe":{"x":677.0046511627908,"y":424.6,"name":"point"},"name":"segment"},{"ps":{"x":677.0046511627908,"y":424.6,"name":"point"},"pe":{"x":677.0326693227092,"y":424.2557768924303,"name":"point"},"name":"segment"},{"ps":{"x":677.0326693227092,"y":424.2557768924303,"name":"point"},"pe":{"x":679,"y":423.6,"name":"point"},"name":"segment"},{"ps":{"x":679,"y":423.6,"name":"point"},"pe":{"x":682.357482185273,"y":421.67707838479805,"name":"point"},"name":"segment"},{"ps":{"x":682.357482185273,"y":421.67707838479805,"name":"point"},"pe":{"x":682.8,"y":421.8,"name":"point"},"name":"segment"},{"ps":{"x":682.8,"y":421.8,"name":"point"},"pe":{"x":683.8,"y":426.2,"name":"point"},"name":"segment"},{"ps":{"x":683.8,"y":426.2,"name":"point"},"pe":{"x":685.5,"y":426.2,"name":"point"},"name":"segment"},{"ps":{"x":685.5,"y":426.2,"name":"point"},"pe":{"x":687.2,"y":424.8,"name":"point"},"name":"segment"},{"ps":{"x":687.2,"y":424.8,"name":"point"},"pe":{"x":687.6086956521738,"y":418.66956521739127,"name":"point"},"name":"segment"},{"ps":{"x":687.6086956521738,"y":418.66956521739127,"name":"point"},"pe":{"x":690,"y":417.3,"name":"point"},"name":"segment"},{"ps":{"x":690,"y":417.3,"name":"point"},"pe":{"x":691.3,"y":418.6,"name":"point"},"name":"segment"},{"ps":{"x":691.3,"y":418.6,"name":"point"},"pe":{"x":692.1,"y":424.3,"name":"point"},"name":"segment"},{"ps":{"x":692.1,"y":424.3,"name":"point"},"pe":{"x":691.8,"y":424.3,"name":"point"},"name":"segment"},{"ps":{"x":691.8,"y":424.3,"name":"point"},"pe":{"x":692.6,"y":425.3,"name":"point"},"name":"segment"},{"ps":{"x":692.6,"y":425.3,"name":"point"},"pe":{"x":694.3,"y":433.6,"name":"point"},"name":"segment"},{"ps":{"x":694.3,"y":433.6,"name":"point"},"pe":{"x":697.6,"y":435.3,"name":"point"},"name":"segment"},{"ps":{"x":697.6,"y":435.3,"name":"point"},"pe":{"x":708,"y":424,"name":"point"},"name":"segment"},{"ps":{"x":708,"y":424,"name":"point"},"pe":{"x":708,"y":426.3,"name":"point"},"name":"segment"},{"ps":{"x":708,"y":426.3,"name":"point"},"pe":{"x":703,"y":435.6,"name":"point"},"name":"segment"},{"ps":{"x":703,"y":435.6,"name":"point"},"pe":{"x":703.2560975609756,"y":436.060975609756,"name":"point"},"name":"segment"},{"ps":{"x":703.2560975609756,"y":436.060975609756,"name":"point"},"pe":{"x":702.5,"y":437.8,"name":"point"},"name":"segment"},{"ps":{"x":702.5,"y":437.8,"name":"point"},"pe":{"x":704.2222222222222,"y":437.8,"name":"point"},"name":"segment"},{"ps":{"x":704.2222222222222,"y":437.8,"name":"point"},"pe":{"x":704.5,"y":438.3,"name":"point"},"name":"segment"},{"ps":{"x":704.5,"y":438.3,"name":"point"},"pe":{"x":707,"y":439.3,"name":"point"},"name":"segment"},{"ps":{"x":707,"y":439.3,"name":"point"},"pe":{"x":711.3,"y":441.6,"name":"point"},"name":"segment"},{"ps":{"x":711.3,"y":441.6,"name":"point"},"pe":{"x":716.3,"y":446.3,"name":"point"},"name":"segment"},{"ps":{"x":716.3,"y":446.3,"name":"point"},"pe":{"x":725,"y":444.3,"name":"point"},"name":"segment"},{"ps":{"x":725,"y":444.3,"name":"point"},"pe":{"x":730.3,"y":443.6,"name":"point"},"name":"segment"},{"ps":{"x":730.3,"y":443.6,"name":"point"},"pe":{"x":736.9,"y":447.3,"name":"point"},"name":"segment"},{"ps":{"x":736.9,"y":447.3,"name":"point"},"pe":{"x":739.9,"y":447,"name":"point"},"name":"segment"},{"ps":{"x":739.9,"y":447,"name":"point"},"pe":{"x":743.2345314505777,"y":445.62695763799746,"name":"point"},"name":"segment"},{"ps":{"x":743.2345314505777,"y":445.62695763799746,"name":"point"},"pe":{"x":744.5,"y":446.2,"name":"point"},"name":"segment"},{"ps":{"x":744.5,"y":446.2,"name":"point"},"pe":{"x":744.419018404908,"y":445.3901840490798,"name":"point"},"name":"segment"},{"ps":{"x":744.419018404908,"y":445.3901840490798,"name":"point"},"pe":{"x":744.9,"y":445.3,"name":"point"},"name":"segment"},{"ps":{"x":744.9,"y":445.3,"name":"point"},"pe":{"x":744.6,"y":440,"name":"point"},"name":"segment"},{"ps":{"x":744.6,"y":440,"name":"point"},"pe":{"x":745.6,"y":438.3,"name":"point"},"name":"segment"},{"ps":{"x":745.6,"y":438.3,"name":"point"},"pe":{"x":751.3,"y":437.6,"name":"point"},"name":"segment"},{"ps":{"x":751.3,"y":437.6,"name":"point"},"pe":{"x":751.3,"y":446,"name":"point"},"name":"segment"},{"ps":{"x":751.3,"y":446,"name":"point"},"pe":{"x":758.9,"y":447.6,"name":"point"},"name":"segment"},{"ps":{"x":758.9,"y":447.6,"name":"point"},"pe":{"x":758.9810559006212,"y":447.5654761904762,"name":"point"},"name":"segment"},{"ps":{"x":758.9810559006212,"y":447.5654761904762,"name":"point"},"pe":{"x":760.2,"y":448.5,"name":"point"},"name":"segment"},{"ps":{"x":760.2,"y":448.5,"name":"point"},"pe":{"x":761.3838747099769,"y":446.5420533642691,"name":"point"},"name":"segment"},{"ps":{"x":761.3838747099769,"y":446.5420533642691,"name":"point"},"pe":{"x":764.3,"y":445.3,"name":"point"},"name":"segment"},{"ps":{"x":764.3,"y":445.3,"name":"point"},"pe":{"x":765.6,"y":445.3,"name":"point"},"name":"segment"},{"ps":{"x":765.6,"y":445.3,"name":"point"},"pe":{"x":764.9,"y":449,"name":"point"},"name":"segment"},{"ps":{"x":764.9,"y":449,"name":"point"},"pe":{"x":764.6,"y":453.3,"name":"point"},"name":"segment"},{"ps":{"x":764.6,"y":453.3,"name":"point"},"pe":{"x":766.9,"y":454,"name":"point"},"name":"segment"},{"ps":{"x":766.9,"y":454,"name":"point"},"pe":{"x":780.2496868475996,"y":455.45302713987485,"name":"point"},"name":"segment"},{"ps":{"x":780.2496868475996,"y":455.45302713987485,"name":"point"},"pe":{"x":786.8,"y":457.5,"name":"point"},"name":"segment"},{"ps":{"x":786.8,"y":457.5,"name":"point"},"pe":{"x":785.5,"y":458.5,"name":"point"},"name":"segment"},{"ps":{"x":785.5,"y":458.5,"name":"point"},"pe":{"x":782.5,"y":458.5,"name":"point"},"name":"segment"},{"ps":{"x":782.5,"y":458.5,"name":"point"},"pe":{"x":757.1344066237349,"y":460.2519779208832,"name":"point"},"name":"segment"},{"ps":{"x":757.1344066237349,"y":460.2519779208832,"name":"point"},"pe":{"x":748.3,"y":460.6,"name":"point"},"name":"segment"},{"ps":{"x":748.3,"y":460.6,"name":"point"},"pe":{"x":725.3,"y":460.3,"name":"point"},"name":"segment"},{"ps":{"x":725.3,"y":460.3,"name":"point"},"pe":{"x":645.6,"y":462,"name":"point"},"name":"segment"},{"ps":{"x":645.6,"y":462,"name":"point"},"pe":{"x":622.4,"y":462.3,"name":"point"},"name":"segment"},{"ps":{"x":622.4,"y":462.3,"name":"point"},"pe":{"x":605,"y":464.3,"name":"point"},"name":"segment"},{"ps":{"x":605,"y":464.3,"name":"point"},"pe":{"x":514.5186785260482,"y":466.0400254129607,"name":"point"},"name":"segment"},{"ps":{"x":514.5186785260482,"y":466.0400254129607,"name":"point"},"pe":{"x":513.8,"y":464.5,"name":"point"},"name":"segment"},{"ps":{"x":513.8,"y":464.5,"name":"point"},"pe":{"x":512.2,"y":463.5,"name":"point"},"name":"segment"},{"ps":{"x":512.2,"y":463.5,"name":"point"},"pe":{"x":510.8,"y":463.8,"name":"point"},"name":"segment"},{"ps":{"x":510.8,"y":463.8,"name":"point"},"pe":{"x":508.5535239810852,"y":466.1547399234408,"name":"point"},"name":"segment"},{"ps":{"x":508.5535239810852,"y":466.1547399234408,"name":"point"},"pe":{"x":501,"y":466.3,"name":"point"},"name":"segment"},{"ps":{"x":501,"y":466.3,"name":"point"},"pe":{"x":487,"y":467.6,"name":"point"},"name":"segment"},{"ps":{"x":487,"y":467.6,"name":"point"},"pe":{"x":496,"y":462.6,"name":"point"},"name":"segment"},{"ps":{"x":496,"y":462.6,"name":"point"},"pe":{"x":489.3,"y":451.6,"name":"point"},"name":"segment"},{"ps":{"x":489.3,"y":451.6,"name":"point"},"pe":{"x":493,"y":449.6,"name":"point"},"name":"segment"},{"ps":{"x":493,"y":449.6,"name":"point"},"pe":{"x":495.6999999999999,"y":449.6,"name":"point"},"name":"segment"}],[{"ps":{"x":611.3,"y":427.8,"name":"point"},"pe":{"x":612.3,"y":427.3,"name":"point"},"name":"segment"},{"ps":{"x":612.3,"y":427.3,"name":"point"},"pe":{"x":613.4,"y":425.9,"name":"point"},"name":"segment"},{"ps":{"x":613.4,"y":425.9,"name":"point"},"pe":{"x":612.3,"y":425.9,"name":"point"},"name":"segment"},{"ps":{"x":612.3,"y":425.9,"name":"point"},"pe":{"x":611.3,"y":427.8,"name":"point"},"name":"segment"}],[{"ps":{"x":569.9,"y":433.9,"name":"point"},"pe":{"x":574,"y":432.8,"name":"point"},"name":"segment"},{"ps":{"x":574,"y":432.8,"name":"point"},"pe":{"x":570,"y":433.7,"name":"point"},"name":"segment"},{"ps":{"x":570,"y":433.7,"name":"point"},"pe":{"x":569.9,"y":433.9,"name":"point"},"name":"segment"}],[{"ps":{"x":565,"y":434.8,"name":"point"},"pe":{"x":565.7,"y":434.8,"name":"point"},"name":"segment"},{"ps":{"x":565.7,"y":434.8,"name":"point"},"pe":{"x":565.5,"y":434.7,"name":"point"},"name":"segment"},{"ps":{"x":565.5,"y":434.7,"name":"point"},"pe":{"x":565,"y":434.8,"name":"point"},"name":"segment"}]]`;

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(3);
            expect(poly2.faces.size).to.equal(4);

            let res = unify(poly1, poly2);

            expect(res.faces.size).to.equal(3);
        });
        it('Can perform unify. Fixed: Infinite loop for boolean union over (valid) polygons. Issue #55 case 0', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":885457739.1304348,"y":220050000,"name":"point"},"pe":{"x":885880000,"y":220050000,"name":"point"},"name":"segment"},{"ps":{"x":885880000,"y":220050000,"name":"point"},"pe":{"x":886111716.7381974,"y":221440300.42918456,"name":"point"},"name":"segment"},{"ps":{"x":886111716.7381974,"y":221440300.42918456,"name":"point"},"pe":{"x":885629798.7601395,"y":221601910.38557255,"name":"point"},"name":"segment"},{"ps":{"x":885629798.7601395,"y":221601910.38557255,"name":"point"},"pe":{"x":885950000,"y":224490000,"name":"point"},"name":"segment"},{"ps":{"x":885950000,"y":224490000,"name":"point"},"pe":{"x":885572474.0424377,"y":228923822.22616062,"name":"point"},"name":"segment"},{"ps":{"x":885572474.0424377,"y":228923822.22616062,"name":"point"},"pe":{"x":883940000,"y":231650000,"name":"point"},"name":"segment"},{"ps":{"x":883940000,"y":231650000,"name":"point"},"pe":{"x":883814095.0813553,"y":233095692.15629625,"name":"point"},"name":"segment"},{"ps":{"x":883814095.0813553,"y":233095692.15629625,"name":"point"},"pe":{"x":883252727.7414774,"y":256167889.82527742,"name":"point"},"name":"segment"},{"ps":{"x":883252727.7414774,"y":256167889.82527742,"name":"point"},"pe":{"x":882610351.261163,"y":263712226.99979052,"name":"point"},"name":"segment"},{"ps":{"x":882610351.261163,"y":263712226.99979052,"name":"point"},"pe":{"x":882952897.4299022,"y":268490915.6310136,"name":"point"},"name":"segment"},{"ps":{"x":882952897.4299022,"y":268490915.6310136,"name":"point"},"pe":{"x":882950001.1519145,"y":268609952.65631473,"name":"point"},"name":"segment"},{"ps":{"x":882950001.1519145,"y":268609952.65631473,"name":"point"},"pe":{"x":882038442.3014525,"y":270428964.23629075,"name":"point"},"name":"segment"},{"ps":{"x":882038442.3014525,"y":270428964.23629075,"name":"point"},"pe":{"x":882038439.5867643,"y":270428996.1187189,"name":"point"},"name":"segment"},{"ps":{"x":882038439.5867643,"y":270428996.1187189,"name":"point"},"pe":{"x":881287492.44713,"y":271927492.44712996,"name":"point"},"name":"segment"},{"ps":{"x":881287492.44713,"y":271927492.44712996,"name":"point"},"pe":{"x":881287488.7218044,"y":271927488.7218046,"name":"point"},"name":"segment"},{"ps":{"x":881287488.7218044,"y":271927488.7218046,"name":"point"},"pe":{"x":880740000,"y":273020000,"name":"point"},"name":"segment"},{"ps":{"x":880740000,"y":273020000,"name":"point"},"pe":{"x":880050000,"y":272860000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":272860000,"name":"point"},"pe":{"x":880050000,"y":270690000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":270690000,"name":"point"},"pe":{"x":880050000,"y":242973796.52605474,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":242973796.52605474,"name":"point"},"pe":{"x":880050000,"y":224390000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":224390000,"name":"point"},"pe":{"x":881870000,"y":220760000,"name":"point"},"name":"segment"},{"ps":{"x":881870000,"y":220760000,"name":"point"},"pe":{"x":880050000,"y":220153333.33333328,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":220153333.33333328,"name":"point"},"pe":{"x":880050000,"y":219200000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":219200000,"name":"point"},"pe":{"x":880610000,"y":218970000,"name":"point"},"name":"segment"},{"ps":{"x":880610000,"y":218970000,"name":"point"},"pe":{"x":881690000,"y":220050000,"name":"point"},"name":"segment"},{"ps":{"x":881690000,"y":220050000,"name":"point"},"pe":{"x":882461456.5387628,"y":220050000,"name":"point"},"name":"segment"},{"ps":{"x":882461456.5387628,"y":220050000,"name":"point"},"pe":{"x":882777039.9373531,"y":217050000,"name":"point"},"name":"segment"},{"ps":{"x":882777039.9373531,"y":217050000,"name":"point"},"pe":{"x":885125130.4347826,"y":217050000,"name":"point"},"name":"segment"},{"ps":{"x":885125130.4347826,"y":217050000,"name":"point"},"pe":{"x":885457739.1304348,"y":220050000,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":884930000,"y":215290000,"name":"point"},"pe":{"x":885950000,"y":224490000,"name":"point"},"name":"segment"},{"ps":{"x":885950000,"y":224490000,"name":"point"},"pe":{"x":881920000,"y":271820000,"name":"point"},"name":"segment"},{"ps":{"x":881920000,"y":271820000,"name":"point"},"pe":{"x":881380000,"y":272020000,"name":"point"},"name":"segment"},{"ps":{"x":881380000,"y":272020000,"name":"point"},"pe":{"x":879050000,"y":269690000,"name":"point"},"name":"segment"},{"ps":{"x":879050000,"y":269690000,"name":"point"},"pe":{"x":879050000,"y":252480000,"name":"point"},"name":"segment"},{"ps":{"x":879050000,"y":252480000,"name":"point"},"pe":{"x":883080000,"y":214170000,"name":"point"},"name":"segment"},{"ps":{"x":883080000,"y":214170000,"name":"point"},"pe":{"x":883620000,"y":213980000,"name":"point"},"name":"segment"},{"ps":{"x":883620000,"y":213980000,"name":"point"},"pe":{"x":884930000,"y":215290000,"name":"point"},"name":"segment"}]]`;

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            let res = unify(poly1, poly2);

            expect(res.faces.size).to.equal(1);
            expect(res.edges.size).to.equal(34);
        });
        it('Can perform unify. Not fixed: Infinite loop for boolean union over (valid) polygons. Issue #55 case 1', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":1236898403.171192,"y":220104489.05237198,"name":"point"},"pe":{"x":1223110000,"y":236470000,"name":"point"},"name":"segment"},{"ps":{"x":1223110000,"y":236470000,"name":"point"},"pe":{"x":1223530000,"y":236890000,"name":"point"},"name":"segment"},{"ps":{"x":1223530000,"y":236890000,"name":"point"},"pe":{"x":1224331213.9324033,"y":236204452.3401371,"name":"point"},"name":"segment"},{"ps":{"x":1224331213.9324033,"y":236204452.3401371,"name":"point"},"pe":{"x":1224110000,"y":236470000,"name":"point"},"name":"segment"},{"ps":{"x":1224110000,"y":236470000,"name":"point"},"pe":{"x":1224530000,"y":236890000,"name":"point"},"name":"segment"},{"ps":{"x":1224530000,"y":236890000,"name":"point"},"pe":{"x":1226584146.0582714,"y":235127082.21840945,"name":"point"},"name":"segment"},{"ps":{"x":1226584146.0582714,"y":235127082.21840945,"name":"point"},"pe":{"x":1250931121.7834568,"y":213444607.75634384,"name":"point"},"name":"segment"},{"ps":{"x":1250931121.7834568,"y":213444607.75634384,"name":"point"},"pe":{"x":1499161155.7619252,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1499161155.7619252,"y":1050000,"name":"point"},"pe":{"x":1499330000.0000002,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1499330000.0000002,"y":1050000,"name":"point"},"pe":{"x":1503561880.3418803,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1503561880.3418803,"y":1050000,"name":"point"},"pe":{"x":1503810000,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1503810000,"y":1050000,"name":"point"},"pe":{"x":1503845447.6327908,"y":1145064.1061217745,"name":"point"},"name":"segment"},{"ps":{"x":1503845447.6327908,"y":1145064.1061217745,"name":"point"},"pe":{"x":1503890000,"y":1160000,"name":"point"},"name":"segment"},{"ps":{"x":1503890000,"y":1160000,"name":"point"},"pe":{"x":1503933233.0827074,"y":1380488.721804647,"name":"point"},"name":"segment"},{"ps":{"x":1503933233.0827074,"y":1380488.721804647,"name":"point"},"pe":{"x":1504030000,"y":1640000,"name":"point"},"name":"segment"},{"ps":{"x":1504030000,"y":1640000,"name":"point"},"pe":{"x":1284695674.5477602,"y":189637802.97710437,"name":"point"},"name":"segment"},{"ps":{"x":1284695674.5477602,"y":189637802.97710437,"name":"point"},"pe":{"x":1229805187.049371,"y":235234498.97279018,"name":"point"},"name":"segment"},{"ps":{"x":1229805187.049371,"y":235234498.97279018,"name":"point"},"pe":{"x":1206790000,"y":254840000,"name":"point"},"name":"segment"},{"ps":{"x":1206790000,"y":254840000,"name":"point"},"pe":{"x":1200345165.1079006,"y":261937067.68178037,"name":"point"},"name":"segment"},{"ps":{"x":1200345165.1079006,"y":261937067.68178037,"name":"point"},"pe":{"x":1195570000,"y":266029999.99999997,"name":"point"},"name":"segment"},{"ps":{"x":1195570000,"y":266029999.99999997,"name":"point"},"pe":{"x":1195050000,"y":265790000.00000003,"name":"point"},"name":"segment"},{"ps":{"x":1195050000,"y":265790000.00000003,"name":"point"},"pe":{"x":1195050000,"y":265590000.0000002,"name":"point"},"name":"segment"},{"ps":{"x":1195050000,"y":265590000.0000002,"name":"point"},"pe":{"x":1190690000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1190690000,"y":269950000,"name":"point"},"pe":{"x":1188095946.9026546,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1188095946.9026546,"y":269950000,"name":"point"},"pe":{"x":1183763203.5398228,"y":273950000,"name":"point"},"name":"segment"},{"ps":{"x":1183763203.5398228,"y":273950000,"name":"point"},"pe":{"x":1182452264.1509435,"y":273950000,"name":"point"},"name":"segment"},{"ps":{"x":1182452264.1509435,"y":273950000,"name":"point"},"pe":{"x":1187066819.4070086,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1187066819.4070086,"y":269950000,"name":"point"},"pe":{"x":1186180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1186180000,"y":269950000,"name":"point"},"pe":{"x":1185970000,"y":269360000,"name":"point"},"name":"segment"},{"ps":{"x":1185970000,"y":269360000,"name":"point"},"pe":{"x":1200867290.5140696,"y":256937423.86408997,"name":"point"},"name":"segment"},{"ps":{"x":1200867290.5140696,"y":256937423.86408997,"name":"point"},"pe":{"x":1309090858.6978958,"y":132503906.35777506,"name":"point"},"name":"segment"},{"ps":{"x":1309090858.6978958,"y":132503906.35777506,"name":"point"},"pe":{"x":1359934130.1642103,"y":73533323.55885088,"name":"point"},"name":"segment"},{"ps":{"x":1359934130.1642103,"y":73533323.55885088,"name":"point"},"pe":{"x":1379180804.4268446,"y":51915743.952495456,"name":"point"},"name":"segment"},{"ps":{"x":1379180804.4268446,"y":51915743.952495456,"name":"point"},"pe":{"x":1389793012.4132636,"y":39714017.55941675,"name":"point"},"name":"segment"},{"ps":{"x":1389793012.4132636,"y":39714017.55941675,"name":"point"},"pe":{"x":1423290000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1423290000,"y":50000,"name":"point"},"pe":{"x":1424290000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1424290000,"y":50000,"name":"point"},"pe":{"x":1428780000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1428780000,"y":50000,"name":"point"},"pe":{"x":1428790000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1428790000,"y":50000,"name":"point"},"pe":{"x":1428952077.9220784,"y":407922.0779276299,"name":"point"},"name":"segment"},{"ps":{"x":1428952077.9220784,"y":407922.0779276299,"name":"point"},"pe":{"x":1429030000,"y":570000,"name":"point"},"name":"segment"},{"ps":{"x":1429030000,"y":570000,"name":"point"},"pe":{"x":1429027037.0218253,"y":573456.7565310667,"name":"point"},"name":"segment"},{"ps":{"x":1429027037.0218253,"y":573456.7565310667,"name":"point"},"pe":{"x":1429027082.4737701,"y":573557.1295764182,"name":"point"},"name":"segment"},{"ps":{"x":1429027082.4737701,"y":573557.1295764182,"name":"point"},"pe":{"x":1428900309.972682,"y":728121.7084697284,"name":"point"},"name":"segment"},{"ps":{"x":1428900309.972682,"y":728121.7084697284,"name":"point"},"pe":{"x":1428622307.7106557,"y":1045633.9402333818,"name":"point"},"name":"segment"},{"ps":{"x":1428622307.7106557,"y":1045633.9402333818,"name":"point"},"pe":{"x":1332840000,"y":112790000,"name":"point"},"name":"segment"},{"ps":{"x":1332840000,"y":112790000,"name":"point"},"pe":{"x":1256233091.7992697,"y":199456401.19678846,"name":"point"},"name":"segment"},{"ps":{"x":1256233091.7992697,"y":199456401.19678846,"name":"point"},"pe":{"x":1236898403.171192,"y":220104489.05237198,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":1503890000,"y":1160000,"name":"point"},"pe":{"x":1503990000,"y":1670000,"name":"point"},"name":"segment"},{"ps":{"x":1503990000,"y":1670000,"name":"point"},"pe":{"x":1206790000,"y":254840000,"name":"point"},"name":"segment"},{"ps":{"x":1206790000,"y":254840000,"name":"point"},"pe":{"x":1196810000,"y":265829999.99999997,"name":"point"},"name":"segment"},{"ps":{"x":1196810000,"y":265829999.99999997,"name":"point"},"pe":{"x":1191660000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1191660000,"y":269950000,"name":"point"},"pe":{"x":1186180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1186180000,"y":269950000,"name":"point"},"pe":{"x":1185970000,"y":269360000,"name":"point"},"name":"segment"},{"ps":{"x":1185970000,"y":269360000,"name":"point"},"pe":{"x":1204210000,"y":254150000,"name":"point"},"name":"segment"},{"ps":{"x":1204210000,"y":254150000,"name":"point"},"pe":{"x":1423290000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1423290000,"y":50000,"name":"point"},"pe":{"x":1428790000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1428790000,"y":50000,"name":"point"},"pe":{"x":1429030000,"y":580000,"name":"point"},"name":"segment"},{"ps":{"x":1429030000,"y":580000,"name":"point"},"pe":{"x":1238840000,"y":217800000,"name":"point"},"name":"segment"},{"ps":{"x":1238840000,"y":217800000,"name":"point"},"pe":{"x":1223110000,"y":236470000,"name":"point"},"name":"segment"},{"ps":{"x":1223110000,"y":236470000,"name":"point"},"pe":{"x":1223530000,"y":236890000,"name":"point"},"name":"segment"},{"ps":{"x":1223530000,"y":236890000,"name":"point"},"pe":{"x":1500400000,"y":-10000,"name":"point"},"name":"segment"},{"ps":{"x":1500400000,"y":-10000,"name":"point"},"pe":{"x":1503890000,"y":1160000,"name":"point"},"name":"segment"}]]`;

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);

            expect( () => unify(poly1, poly2)).to.throw(Errors.CANNOT_COMPLETE_BOOLEAN_OPERATION.message)
            // let res = unify(poly1, poly2);
            // expect(res.faces.size).to.equal(1);
            // expect(res.edges.size).to.equal(44);
        });
        it('Can perform unify. Fixed: Infinite loop for boolean union over (valid) polygons. Issue #55 case 2', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":1171923150.7737844,"y":255990437.5658898,"name":"point"},"pe":{"x":1171782510.010546,"y":256209390.93089134,"name":"point"},"name":"segment"},{"ps":{"x":1171782510.010546,"y":256209390.93089134,"name":"point"},"pe":{"x":1160700000,"y":270980000,"name":"point"},"name":"segment"},{"ps":{"x":1160700000,"y":270980000,"name":"point"},"pe":{"x":1155954306.7336805,"y":270305454.91937846,"name":"point"},"name":"segment"},{"ps":{"x":1155954306.7336805,"y":270305454.91937846,"name":"point"},"pe":{"x":1154272706.1855671,"y":267950000,"name":"point"},"name":"segment"},{"ps":{"x":1154272706.1855671,"y":267950000,"name":"point"},"pe":{"x":1154240000,"y":267950000,"name":"point"},"name":"segment"},{"ps":{"x":1154240000,"y":267950000,"name":"point"},"pe":{"x":1154115681.989453,"y":267730052.75057024,"name":"point"},"name":"segment"},{"ps":{"x":1154115681.989453,"y":267730052.75057024,"name":"point"},"pe":{"x":1154089926.5606358,"y":267693976.55424812,"name":"point"},"name":"segment"},{"ps":{"x":1154089926.5606358,"y":267693976.55424812,"name":"point"},"pe":{"x":1154092735.9985795,"y":267689455.9974853,"name":"point"},"name":"segment"},{"ps":{"x":1154092735.9985795,"y":267689455.9974853,"name":"point"},"pe":{"x":1153993265.3061225,"y":267513469.38775504,"name":"point"},"name":"segment"},{"ps":{"x":1153993265.3061225,"y":267513469.38775504,"name":"point"},"pe":{"x":1154107703.533026,"y":267284592.9339485,"name":"point"},"name":"segment"},{"ps":{"x":1154107703.533026,"y":267284592.9339485,"name":"point"},"pe":{"x":1286198103.4762266,"y":54821391.148841284,"name":"point"},"name":"segment"},{"ps":{"x":1286198103.4762266,"y":54821391.148841284,"name":"point"},"pe":{"x":1286232330.342853,"y":54685500.32193941,"name":"point"},"name":"segment"},{"ps":{"x":1286232330.342853,"y":54685500.32193941,"name":"point"},"pe":{"x":1319996203.9438455,"y":457619.7648851394,"name":"point"},"name":"segment"},{"ps":{"x":1319996203.9438455,"y":457619.7648851394,"name":"point"},"pe":{"x":1320005737.7285142,"y":442888.0849567612,"name":"point"},"name":"segment"},{"ps":{"x":1320005737.7285142,"y":442888.0849567612,"name":"point"},"pe":{"x":1320250000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1320250000,"y":50000,"name":"point"},"pe":{"x":1320260000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1320260000,"y":50000,"name":"point"},"pe":{"x":1335760000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1335760000,"y":50000,"name":"point"},"pe":{"x":1335929722.2222219,"y":350277.77777527034,"name":"point"},"name":"segment"},{"ps":{"x":1335929722.2222219,"y":350277.77777527034,"name":"point"},"pe":{"x":1336020000,"y":510000,"name":"point"},"name":"segment"},{"ps":{"x":1336020000,"y":510000,"name":"point"},"pe":{"x":1336017144.7222269,"y":514632.0777871349,"name":"point"},"name":"segment"},{"ps":{"x":1336017144.7222269,"y":514632.0777871349,"name":"point"},"pe":{"x":1336017149.883367,"y":514641.78073088516,"name":"point"},"name":"segment"},{"ps":{"x":1336017149.883367,"y":514641.78073088516,"name":"point"},"pe":{"x":1335880726.4613864,"y":736824.8325242014,"name":"point"},"name":"segment"},{"ps":{"x":1335880726.4613864,"y":736824.8325242014,"name":"point"},"pe":{"x":1335867232.677719,"y":757832.3218925294,"name":"point"},"name":"segment"},{"ps":{"x":1335867232.677719,"y":757832.3218925294,"name":"point"},"pe":{"x":1298200972.0620072,"y":61863287.90206727,"name":"point"},"name":"segment"},{"ps":{"x":1298200972.0620072,"y":61863287.90206727,"name":"point"},"pe":{"x":1172870000,"y":254760000,"name":"point"},"name":"segment"},{"ps":{"x":1172870000,"y":254760000,"name":"point"},"pe":{"x":1171923150.7737844,"y":255990437.5658898,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":1336020000,"y":520000,"name":"point"},"pe":{"x":1159520000,"y":275300000,"name":"point"},"name":"segment"},{"ps":{"x":1159520000,"y":275300000,"name":"point"},"pe":{"x":1153980000,"y":267540000.00000003,"name":"point"},"name":"segment"},{"ps":{"x":1153980000,"y":267540000.00000003,"name":"point"},"pe":{"x":1155110000,"y":265279999.99999997,"name":"point"},"name":"segment"},{"ps":{"x":1155110000,"y":265279999.99999997,"name":"point"},"pe":{"x":1320250000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1320250000,"y":50000,"name":"point"},"pe":{"x":1335770000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1335770000,"y":50000,"name":"point"},"pe":{"x":1336020000,"y":520000,"name":"point"},"name":"segment"}]]`;

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);

            let res = unify(poly1, poly2);
            expect(res.faces.size).to.equal(1);
            expect(res.edges.size).to.equal(30);
        });
        it('Can perform unify. Fixed: Infinite loop for boolean union over (valid) polygons. Issue #55 case 3', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":963110483.3545868,"y":269107685.0983406,"name":"point"},"pe":{"x":962820000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962820000,"y":269950000,"name":"point"},"pe":{"x":962180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962180000,"y":269950000,"name":"point"},"pe":{"x":962019413.2873166,"y":269468239.8619499,"name":"point"},"name":"segment"},{"ps":{"x":962019413.2873166,"y":269468239.8619499,"name":"point"},"pe":{"x":961030000,"y":266500000,"name":"point"},"name":"segment"},{"ps":{"x":961030000,"y":266500000,"name":"point"},"pe":{"x":966175263.1589682,"y":251057368.42534572,"name":"point"},"name":"segment"},{"ps":{"x":966175263.1589682,"y":251057368.42534572,"name":"point"},"pe":{"x":966175295.0230584,"y":251057272.79318383,"name":"point"},"name":"segment"},{"ps":{"x":966175295.0230584,"y":251057272.79318383,"name":"point"},"pe":{"x":966175296.766696,"y":251057267.55705994,"name":"point"},"name":"segment"},{"ps":{"x":966175296.766696,"y":251057267.55705994,"name":"point"},"pe":{"x":976070000,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976070000,"y":221360000,"name":"point"},"pe":{"x":976070737.1913013,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976070737.1913013,"y":221360000,"name":"point"},"pe":{"x":976133768.8287557,"y":221170835.3623748,"name":"point"},"name":"segment"},{"ps":{"x":976133768.8287557,"y":221170835.3623748,"name":"point"},"pe":{"x":978480316.5153537,"y":212915423.20107156,"name":"point"},"name":"segment"},{"ps":{"x":978480316.5153537,"y":212915423.20107156,"name":"point"},"pe":{"x":980406482.933095,"y":207214400.17572352,"name":"point"},"name":"segment"},{"ps":{"x":980406482.933095,"y":207214400.17572352,"name":"point"},"pe":{"x":983852818.8247252,"y":195147914.48011336,"name":"point"},"name":"segment"},{"ps":{"x":983852818.8247252,"y":195147914.48011336,"name":"point"},"pe":{"x":983745147.5406188,"y":194393170.13909355,"name":"point"},"name":"segment"},{"ps":{"x":983745147.5406188,"y":194393170.13909355,"name":"point"},"pe":{"x":985572292.778238,"y":187965072.7681096,"name":"point"},"name":"segment"},{"ps":{"x":985572292.778238,"y":187965072.7681096,"name":"point"},"pe":{"x":985959329.1152494,"y":187772494.00818902,"name":"point"},"name":"segment"},{"ps":{"x":985959329.1152494,"y":187772494.00818902,"name":"point"},"pe":{"x":998070000,"y":145370000,"name":"point"},"name":"segment"},{"ps":{"x":998070000,"y":145370000,"name":"point"},"pe":{"x":1007858422.2638745,"y":114514175.1976823,"name":"point"},"name":"segment"},{"ps":{"x":1007858422.2638745,"y":114514175.1976823,"name":"point"},"pe":{"x":1031079999.9999999,"y":38350000,"name":"point"},"name":"segment"},{"ps":{"x":1031079999.9999999,"y":38350000,"name":"point"},"pe":{"x":1034703389.160534,"y":29891385.83928786,"name":"point"},"name":"segment"},{"ps":{"x":1034703389.160534,"y":29891385.83928786,"name":"point"},"pe":{"x":1039333510.7471844,"y":15295957.011262229,"name":"point"},"name":"segment"},{"ps":{"x":1039333510.7471844,"y":15295957.011262229,"name":"point"},"pe":{"x":1040050000,"y":12430000,"name":"point"},"name":"segment"},{"ps":{"x":1040050000,"y":12430000,"name":"point"},"pe":{"x":1040050000,"y":6868285.714286132,"name":"point"},"name":"segment"},{"ps":{"x":1040050000,"y":6868285.714286132,"name":"point"},"pe":{"x":1042106828.0223789,"y":253171.97762108434,"name":"point"},"name":"segment"},{"ps":{"x":1042106828.0223789,"y":253171.97762108434,"name":"point"},"pe":{"x":1042310000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1042310000,"y":50000,"name":"point"},"pe":{"x":1044170000.0000001,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1044170000.0000001,"y":50000,"name":"point"},"pe":{"x":1049950000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1049950000,"y":50000,"name":"point"},"pe":{"x":1050119999.9999999,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1050119999.9999999,"y":50000,"name":"point"},"pe":{"x":1049950000,"y":565386.7660759832,"name":"point"},"name":"segment"},{"ps":{"x":1049950000,"y":565386.7660759832,"name":"point"},"pe":{"x":1049950000,"y":4425499.557913405,"name":"point"},"name":"segment"},{"ps":{"x":1049950000,"y":4425499.557913405,"name":"point"},"pe":{"x":1046506509.4862496,"y":11004971.706644002,"name":"point"},"name":"segment"},{"ps":{"x":1046506509.4862496,"y":11004971.706644002,"name":"point"},"pe":{"x":1045677238.9335306,"y":13519060.344104007,"name":"point"},"name":"segment"},{"ps":{"x":1045677238.9335306,"y":13519060.344104007,"name":"point"},"pe":{"x":1043946455.9954085,"y":15896462.063592784,"name":"point"},"name":"segment"},{"ps":{"x":1043946455.9954085,"y":15896462.063592784,"name":"point"},"pe":{"x":1040991221.0400991,"y":21543025.050703794,"name":"point"},"name":"segment"},{"ps":{"x":1040991221.0400991,"y":21543025.050703794,"name":"point"},"pe":{"x":1040872178.295911,"y":21909982.500677887,"name":"point"},"name":"segment"},{"ps":{"x":1040872178.295911,"y":21909982.500677887,"name":"point"},"pe":{"x":1037930000.0000001,"y":34630000,"name":"point"},"name":"segment"},{"ps":{"x":1037930000.0000001,"y":34630000,"name":"point"},"pe":{"x":1024920000.0000001,"y":71650000,"name":"point"},"name":"segment"},{"ps":{"x":1024920000.0000001,"y":71650000,"name":"point"},"pe":{"x":1013859031.1877896,"y":111481293.96151306,"name":"point"},"name":"segment"},{"ps":{"x":1013859031.1877896,"y":111481293.96151306,"name":"point"},"pe":{"x":1007953545.869533,"y":131559944.04358706,"name":"point"},"name":"segment"},{"ps":{"x":1007953545.869533,"y":131559944.04358706,"name":"point"},"pe":{"x":988950000,"y":188576174.22012946,"name":"point"},"name":"segment"},{"ps":{"x":988950000,"y":188576174.22012946,"name":"point"},"pe":{"x":988950000,"y":192650000,"name":"point"},"name":"segment"},{"ps":{"x":988950000,"y":192650000,"name":"point"},"pe":{"x":986502916.7781204,"y":195918144.03974694,"name":"point"},"name":"segment"},{"ps":{"x":986502916.7781204,"y":195918144.03974694,"name":"point"},"pe":{"x":979600799.2717452,"y":216626527.78828007,"name":"point"},"name":"segment"},{"ps":{"x":979600799.2717452,"y":216626527.78828007,"name":"point"},"pe":{"x":975950000,"y":228674346.74615034,"name":"point"},"name":"segment"},{"ps":{"x":975950000,"y":228674346.74615034,"name":"point"},"pe":{"x":975950000,"y":231876924.60976407,"name":"point"},"name":"segment"},{"ps":{"x":975950000,"y":231876924.60976407,"name":"point"},"pe":{"x":967950526.5044882,"y":255073006.67197832,"name":"point"},"name":"segment"},{"ps":{"x":967950526.5044882,"y":255073006.67197832,"name":"point"},"pe":{"x":963762999.179433,"y":268892054.8688656,"name":"point"},"name":"segment"},{"ps":{"x":963762999.179433,"y":268892054.8688656,"name":"point"},"pe":{"x":963110483.3545868,"y":269107685.0983406,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":1017930000,"y":97640000,"name":"point"},"pe":{"x":992930000,"y":182640000,"name":"point"},"name":"segment"},{"ps":{"x":992930000,"y":182640000,"name":"point"},"pe":{"x":962820000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962820000,"y":269950000,"name":"point"},"pe":{"x":962180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962180000,"y":269950000,"name":"point"},"pe":{"x":961030000,"y":266500000,"name":"point"},"name":"segment"},{"ps":{"x":961030000,"y":266500000,"name":"point"},"pe":{"x":976070000,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976070000,"y":221360000,"name":"point"},"pe":{"x":976080000,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976080000,"y":221360000,"name":"point"},"pe":{"x":1005070000,"y":119370000,"name":"point"},"name":"segment"},{"ps":{"x":1005070000,"y":119370000,"name":"point"},"pe":{"x":1042170000.0000001,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1042170000.0000001,"y":50000,"name":"point"},"pe":{"x":1050119999.9999999,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1050119999.9999999,"y":50000,"name":"point"},"pe":{"x":1017930000,"y":97640000,"name":"point"},"name":"segment"}]]`

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);
            expect(poly1.edges.size).to.equal(48);
            expect(poly2.edges.size).to.equal(10);

            let res = unify(poly1, poly2);

            expect(res.faces.size).to.equal(1);
            expect(res.edges.size).to.equal(33);
        });
        it('Fixed: Infinity Loop When unifying polygon Issue #82', function () {
            const { Box, BooleanOperations, Polygon } = Flatten;
            const rectSet = [
                {"x":85,"y":146.66666666666666,"width":35,"height":73.33333333333333},
                {"x":120,"y":0,"width":120,"height":73.33333333333333},
                {"x":120,"y":73.33333333333333,"width":120,"height":73.33333333333333},
                {"x":120,"y":146.66666666666666,"width":120,"height":73.33333333333333},
                {"x":240,"y":0,"width":120,"height":73.33333333333333},
                {"x":240,"y":73.33333333333333,"width":84,"height":73.33333333333333},
            ];
            const boxSet = rectSet.map(ele => new Box(ele.x, ele.y, ele.x + ele.width, ele.y + ele.height));
            const polys = boxSet.map( box => new Polygon(box));

            const p = polys.reduce(
                (acc, poly) => BooleanOperations.unify(acc, poly),
                new Polygon(),
            );

            expect(p.faces.size).to.equal(1);
            expect(p.edges.size).to.equal(13);

        })
        it('Fixed: Infinite Loop when calling unify on polygons #94', () => {
            let p0 = new Polygon([
                [-81.658177, 28.354585],
                [-81.658176, 28.354642],
                [-81.657906, 28.354638],
                [-81.657907, 28.354582],
                [-81.657908, 28.354526],
                [-81.658178, 28.354529]
            ])

            let p1 = new Polygon([
                [-81.6579063, 28.3546095],
                [-81.657906, 28.354638],
                [-81.658176, 28.3546417],
                [-81.6581764, 28.354613],
            ])

            const m = new Flatten.Matrix().scale(1e6, 1e6);

            p0 = p0.transform(m);
            p1 = p1.transform(m);

            if ([...p0.faces][0].orientation() != [...p1.faces][0].orientation()) {
                p1 = p1.reverse();
            }

            const p3 = unify(p0,p1);

            expect(p3.faces.size).to.equal(1);
            expect(p3.edges.size).to.equal(9);
        })
        
        it('Fixed: Infinite Loop when calling unify for multipolygon with touching faces #171', () => {
            const a = new Flatten.Polygon([
                [
                    point(70, 10),
                    point(80, 10),
                    point(80, 50),
                    point(70, 50),
                ],
                [
                    point(90, 10),
                    point(100, 10),
                    point(100, 50),
                    point(90, 50),
                ],
                [
                    point(100, 0),
                    point(120, 0),
                    point(120, 10),
                    point(100, 10),
                ],
            ]);
            const b = new Flatten.Polygon([ point(0, 0), point(100, 0), point(100, 10), point(0, 10) ]);

            expect(a.isValid()).to.equal(true);
            expect(b.isValid()).to.equal(true);

            const c = Flatten.BooleanOperations.unify(a, b);

            expect(c.faces.size).to.equal(1);
        });

        it('Fixed: Infinite Loop when calling unify for multipolygon with touching faces #171: case 2 - self-touching face', () => {
            const a = new Flatten.Polygon([
                [
                    point(70, 10),
                    point(80, 10),
                    point(80, 50),
                    point(70, 50),
                ],
                [
                    point(90, 10), point(100, 10), point(100, 50), point(110, 50), point(110, 10), point(100, 10), point(100, 0),
                    point(120, 0), point(120, 60), point(90, 60)
                ]
            ]);
            const b = new Flatten.Polygon([ point(0, 0), point(100, 0), point(100, 10), point(0, 10) ]);

            // incorrectly reports polygon as invalid
            // expect(a.isValid()).to.equal(true);
            expect(b.isValid()).to.equal(true);

            const c = Flatten.BooleanOperations.unify(a, b);

            expect(c.faces.size).to.equal(2);
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
        it('Can perform (boolean) subtraction. First polygon inside the second', function () {
            "use strict";

            let {Polygon, point} = Flatten;

            let polygon1 = new Polygon();
            polygon1.addFace([point(100, 10), point(100, 300), point(400, 150), point(250, 10)]);

            let polygon2 = new Polygon();
            polygon2.addFace([point(50, 0), point(50, 400), point(500, 400), point(500, 0)]);

            let poly = subtract(polygon2, polygon1);
            expect(poly.faces.size).to.equal(2);
            expect(poly.edges.size).to.equal(8);

        });

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
        it('Can perform subtract. Fixed: Issue #55 case 0', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":885457739.1304348,"y":220050000,"name":"point"},"pe":{"x":885880000,"y":220050000,"name":"point"},"name":"segment"},{"ps":{"x":885880000,"y":220050000,"name":"point"},"pe":{"x":886111716.7381974,"y":221440300.42918456,"name":"point"},"name":"segment"},{"ps":{"x":886111716.7381974,"y":221440300.42918456,"name":"point"},"pe":{"x":885629798.7601395,"y":221601910.38557255,"name":"point"},"name":"segment"},{"ps":{"x":885629798.7601395,"y":221601910.38557255,"name":"point"},"pe":{"x":885950000,"y":224490000,"name":"point"},"name":"segment"},{"ps":{"x":885950000,"y":224490000,"name":"point"},"pe":{"x":885572474.0424377,"y":228923822.22616062,"name":"point"},"name":"segment"},{"ps":{"x":885572474.0424377,"y":228923822.22616062,"name":"point"},"pe":{"x":883940000,"y":231650000,"name":"point"},"name":"segment"},{"ps":{"x":883940000,"y":231650000,"name":"point"},"pe":{"x":883814095.0813553,"y":233095692.15629625,"name":"point"},"name":"segment"},{"ps":{"x":883814095.0813553,"y":233095692.15629625,"name":"point"},"pe":{"x":883252727.7414774,"y":256167889.82527742,"name":"point"},"name":"segment"},{"ps":{"x":883252727.7414774,"y":256167889.82527742,"name":"point"},"pe":{"x":882610351.261163,"y":263712226.99979052,"name":"point"},"name":"segment"},{"ps":{"x":882610351.261163,"y":263712226.99979052,"name":"point"},"pe":{"x":882952897.4299022,"y":268490915.6310136,"name":"point"},"name":"segment"},{"ps":{"x":882952897.4299022,"y":268490915.6310136,"name":"point"},"pe":{"x":882950001.1519145,"y":268609952.65631473,"name":"point"},"name":"segment"},{"ps":{"x":882950001.1519145,"y":268609952.65631473,"name":"point"},"pe":{"x":882038442.3014525,"y":270428964.23629075,"name":"point"},"name":"segment"},{"ps":{"x":882038442.3014525,"y":270428964.23629075,"name":"point"},"pe":{"x":882038439.5867643,"y":270428996.1187189,"name":"point"},"name":"segment"},{"ps":{"x":882038439.5867643,"y":270428996.1187189,"name":"point"},"pe":{"x":881287492.44713,"y":271927492.44712996,"name":"point"},"name":"segment"},{"ps":{"x":881287492.44713,"y":271927492.44712996,"name":"point"},"pe":{"x":881287488.7218044,"y":271927488.7218046,"name":"point"},"name":"segment"},{"ps":{"x":881287488.7218044,"y":271927488.7218046,"name":"point"},"pe":{"x":880740000,"y":273020000,"name":"point"},"name":"segment"},{"ps":{"x":880740000,"y":273020000,"name":"point"},"pe":{"x":880050000,"y":272860000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":272860000,"name":"point"},"pe":{"x":880050000,"y":270690000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":270690000,"name":"point"},"pe":{"x":880050000,"y":242973796.52605474,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":242973796.52605474,"name":"point"},"pe":{"x":880050000,"y":224390000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":224390000,"name":"point"},"pe":{"x":881870000,"y":220760000,"name":"point"},"name":"segment"},{"ps":{"x":881870000,"y":220760000,"name":"point"},"pe":{"x":880050000,"y":220153333.33333328,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":220153333.33333328,"name":"point"},"pe":{"x":880050000,"y":219200000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":219200000,"name":"point"},"pe":{"x":880610000,"y":218970000,"name":"point"},"name":"segment"},{"ps":{"x":880610000,"y":218970000,"name":"point"},"pe":{"x":881690000,"y":220050000,"name":"point"},"name":"segment"},{"ps":{"x":881690000,"y":220050000,"name":"point"},"pe":{"x":882461456.5387628,"y":220050000,"name":"point"},"name":"segment"},{"ps":{"x":882461456.5387628,"y":220050000,"name":"point"},"pe":{"x":882777039.9373531,"y":217050000,"name":"point"},"name":"segment"},{"ps":{"x":882777039.9373531,"y":217050000,"name":"point"},"pe":{"x":885125130.4347826,"y":217050000,"name":"point"},"name":"segment"},{"ps":{"x":885125130.4347826,"y":217050000,"name":"point"},"pe":{"x":885457739.1304348,"y":220050000,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":884930000,"y":215290000,"name":"point"},"pe":{"x":885950000,"y":224490000,"name":"point"},"name":"segment"},{"ps":{"x":885950000,"y":224490000,"name":"point"},"pe":{"x":881920000,"y":271820000,"name":"point"},"name":"segment"},{"ps":{"x":881920000,"y":271820000,"name":"point"},"pe":{"x":881380000,"y":272020000,"name":"point"},"name":"segment"},{"ps":{"x":881380000,"y":272020000,"name":"point"},"pe":{"x":879050000,"y":269690000,"name":"point"},"name":"segment"},{"ps":{"x":879050000,"y":269690000,"name":"point"},"pe":{"x":879050000,"y":252480000,"name":"point"},"name":"segment"},{"ps":{"x":879050000,"y":252480000,"name":"point"},"pe":{"x":883080000,"y":214170000,"name":"point"},"name":"segment"},{"ps":{"x":883080000,"y":214170000,"name":"point"},"pe":{"x":883620000,"y":213980000,"name":"point"},"name":"segment"},{"ps":{"x":883620000,"y":213980000,"name":"point"},"pe":{"x":884930000,"y":215290000,"name":"point"},"name":"segment"}]]`;

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);

            let res = subtract(poly2, poly1);

            expect(res.faces.size).to.equal(4);
            expect(res.edges.size).to.equal(18);
        });
        it('Can perform subtract. Fixed: Issue #55 case 1', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":1236898403.171192,"y":220104489.05237198,"name":"point"},"pe":{"x":1223110000,"y":236470000,"name":"point"},"name":"segment"},{"ps":{"x":1223110000,"y":236470000,"name":"point"},"pe":{"x":1223530000,"y":236890000,"name":"point"},"name":"segment"},{"ps":{"x":1223530000,"y":236890000,"name":"point"},"pe":{"x":1224331213.9324033,"y":236204452.3401371,"name":"point"},"name":"segment"},{"ps":{"x":1224331213.9324033,"y":236204452.3401371,"name":"point"},"pe":{"x":1224110000,"y":236470000,"name":"point"},"name":"segment"},{"ps":{"x":1224110000,"y":236470000,"name":"point"},"pe":{"x":1224530000,"y":236890000,"name":"point"},"name":"segment"},{"ps":{"x":1224530000,"y":236890000,"name":"point"},"pe":{"x":1226584146.0582714,"y":235127082.21840945,"name":"point"},"name":"segment"},{"ps":{"x":1226584146.0582714,"y":235127082.21840945,"name":"point"},"pe":{"x":1250931121.7834568,"y":213444607.75634384,"name":"point"},"name":"segment"},{"ps":{"x":1250931121.7834568,"y":213444607.75634384,"name":"point"},"pe":{"x":1499161155.7619252,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1499161155.7619252,"y":1050000,"name":"point"},"pe":{"x":1499330000.0000002,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1499330000.0000002,"y":1050000,"name":"point"},"pe":{"x":1503561880.3418803,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1503561880.3418803,"y":1050000,"name":"point"},"pe":{"x":1503810000,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1503810000,"y":1050000,"name":"point"},"pe":{"x":1503845447.6327908,"y":1145064.1061217745,"name":"point"},"name":"segment"},{"ps":{"x":1503845447.6327908,"y":1145064.1061217745,"name":"point"},"pe":{"x":1503890000,"y":1160000,"name":"point"},"name":"segment"},{"ps":{"x":1503890000,"y":1160000,"name":"point"},"pe":{"x":1503933233.0827074,"y":1380488.721804647,"name":"point"},"name":"segment"},{"ps":{"x":1503933233.0827074,"y":1380488.721804647,"name":"point"},"pe":{"x":1504030000,"y":1640000,"name":"point"},"name":"segment"},{"ps":{"x":1504030000,"y":1640000,"name":"point"},"pe":{"x":1284695674.5477602,"y":189637802.97710437,"name":"point"},"name":"segment"},{"ps":{"x":1284695674.5477602,"y":189637802.97710437,"name":"point"},"pe":{"x":1229805187.049371,"y":235234498.97279018,"name":"point"},"name":"segment"},{"ps":{"x":1229805187.049371,"y":235234498.97279018,"name":"point"},"pe":{"x":1206790000,"y":254840000,"name":"point"},"name":"segment"},{"ps":{"x":1206790000,"y":254840000,"name":"point"},"pe":{"x":1200345165.1079006,"y":261937067.68178037,"name":"point"},"name":"segment"},{"ps":{"x":1200345165.1079006,"y":261937067.68178037,"name":"point"},"pe":{"x":1195570000,"y":266029999.99999997,"name":"point"},"name":"segment"},{"ps":{"x":1195570000,"y":266029999.99999997,"name":"point"},"pe":{"x":1195050000,"y":265790000.00000003,"name":"point"},"name":"segment"},{"ps":{"x":1195050000,"y":265790000.00000003,"name":"point"},"pe":{"x":1195050000,"y":265590000.0000002,"name":"point"},"name":"segment"},{"ps":{"x":1195050000,"y":265590000.0000002,"name":"point"},"pe":{"x":1190690000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1190690000,"y":269950000,"name":"point"},"pe":{"x":1188095946.9026546,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1188095946.9026546,"y":269950000,"name":"point"},"pe":{"x":1183763203.5398228,"y":273950000,"name":"point"},"name":"segment"},{"ps":{"x":1183763203.5398228,"y":273950000,"name":"point"},"pe":{"x":1182452264.1509435,"y":273950000,"name":"point"},"name":"segment"},{"ps":{"x":1182452264.1509435,"y":273950000,"name":"point"},"pe":{"x":1187066819.4070086,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1187066819.4070086,"y":269950000,"name":"point"},"pe":{"x":1186180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1186180000,"y":269950000,"name":"point"},"pe":{"x":1185970000,"y":269360000,"name":"point"},"name":"segment"},{"ps":{"x":1185970000,"y":269360000,"name":"point"},"pe":{"x":1200867290.5140696,"y":256937423.86408997,"name":"point"},"name":"segment"},{"ps":{"x":1200867290.5140696,"y":256937423.86408997,"name":"point"},"pe":{"x":1309090858.6978958,"y":132503906.35777506,"name":"point"},"name":"segment"},{"ps":{"x":1309090858.6978958,"y":132503906.35777506,"name":"point"},"pe":{"x":1359934130.1642103,"y":73533323.55885088,"name":"point"},"name":"segment"},{"ps":{"x":1359934130.1642103,"y":73533323.55885088,"name":"point"},"pe":{"x":1379180804.4268446,"y":51915743.952495456,"name":"point"},"name":"segment"},{"ps":{"x":1379180804.4268446,"y":51915743.952495456,"name":"point"},"pe":{"x":1389793012.4132636,"y":39714017.55941675,"name":"point"},"name":"segment"},{"ps":{"x":1389793012.4132636,"y":39714017.55941675,"name":"point"},"pe":{"x":1423290000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1423290000,"y":50000,"name":"point"},"pe":{"x":1424290000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1424290000,"y":50000,"name":"point"},"pe":{"x":1428780000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1428780000,"y":50000,"name":"point"},"pe":{"x":1428790000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1428790000,"y":50000,"name":"point"},"pe":{"x":1428952077.9220784,"y":407922.0779276299,"name":"point"},"name":"segment"},{"ps":{"x":1428952077.9220784,"y":407922.0779276299,"name":"point"},"pe":{"x":1429030000,"y":570000,"name":"point"},"name":"segment"},{"ps":{"x":1429030000,"y":570000,"name":"point"},"pe":{"x":1429027037.0218253,"y":573456.7565310667,"name":"point"},"name":"segment"},{"ps":{"x":1429027037.0218253,"y":573456.7565310667,"name":"point"},"pe":{"x":1429027082.4737701,"y":573557.1295764182,"name":"point"},"name":"segment"},{"ps":{"x":1429027082.4737701,"y":573557.1295764182,"name":"point"},"pe":{"x":1428900309.972682,"y":728121.7084697284,"name":"point"},"name":"segment"},{"ps":{"x":1428900309.972682,"y":728121.7084697284,"name":"point"},"pe":{"x":1428622307.7106557,"y":1045633.9402333818,"name":"point"},"name":"segment"},{"ps":{"x":1428622307.7106557,"y":1045633.9402333818,"name":"point"},"pe":{"x":1332840000,"y":112790000,"name":"point"},"name":"segment"},{"ps":{"x":1332840000,"y":112790000,"name":"point"},"pe":{"x":1256233091.7992697,"y":199456401.19678846,"name":"point"},"name":"segment"},{"ps":{"x":1256233091.7992697,"y":199456401.19678846,"name":"point"},"pe":{"x":1236898403.171192,"y":220104489.05237198,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":1503890000,"y":1160000,"name":"point"},"pe":{"x":1503990000,"y":1670000,"name":"point"},"name":"segment"},{"ps":{"x":1503990000,"y":1670000,"name":"point"},"pe":{"x":1206790000,"y":254840000,"name":"point"},"name":"segment"},{"ps":{"x":1206790000,"y":254840000,"name":"point"},"pe":{"x":1196810000,"y":265829999.99999997,"name":"point"},"name":"segment"},{"ps":{"x":1196810000,"y":265829999.99999997,"name":"point"},"pe":{"x":1191660000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1191660000,"y":269950000,"name":"point"},"pe":{"x":1186180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1186180000,"y":269950000,"name":"point"},"pe":{"x":1185970000,"y":269360000,"name":"point"},"name":"segment"},{"ps":{"x":1185970000,"y":269360000,"name":"point"},"pe":{"x":1204210000,"y":254150000,"name":"point"},"name":"segment"},{"ps":{"x":1204210000,"y":254150000,"name":"point"},"pe":{"x":1423290000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1423290000,"y":50000,"name":"point"},"pe":{"x":1428790000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1428790000,"y":50000,"name":"point"},"pe":{"x":1429030000,"y":580000,"name":"point"},"name":"segment"},{"ps":{"x":1429030000,"y":580000,"name":"point"},"pe":{"x":1238840000,"y":217800000,"name":"point"},"name":"segment"},{"ps":{"x":1238840000,"y":217800000,"name":"point"},"pe":{"x":1223110000,"y":236470000,"name":"point"},"name":"segment"},{"ps":{"x":1223110000,"y":236470000,"name":"point"},"pe":{"x":1223530000,"y":236890000,"name":"point"},"name":"segment"},{"ps":{"x":1223530000,"y":236890000,"name":"point"},"pe":{"x":1500400000,"y":-10000,"name":"point"},"name":"segment"},{"ps":{"x":1500400000,"y":-10000,"name":"point"},"pe":{"x":1503890000,"y":1160000,"name":"point"},"name":"segment"}]]`;

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);

            let res = subtract(poly1, poly2);
            expect(res.faces.size).to.equal(6);
            expect(res.edges.size).to.equal(30);
        });
        it('Can perform subtract. Fixed: Infinite loop for boolean union over (valid) polygons. Issue #55 case 2', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":1171923150.7737844,"y":255990437.5658898,"name":"point"},"pe":{"x":1171782510.010546,"y":256209390.93089134,"name":"point"},"name":"segment"},{"ps":{"x":1171782510.010546,"y":256209390.93089134,"name":"point"},"pe":{"x":1160700000,"y":270980000,"name":"point"},"name":"segment"},{"ps":{"x":1160700000,"y":270980000,"name":"point"},"pe":{"x":1155954306.7336805,"y":270305454.91937846,"name":"point"},"name":"segment"},{"ps":{"x":1155954306.7336805,"y":270305454.91937846,"name":"point"},"pe":{"x":1154272706.1855671,"y":267950000,"name":"point"},"name":"segment"},{"ps":{"x":1154272706.1855671,"y":267950000,"name":"point"},"pe":{"x":1154240000,"y":267950000,"name":"point"},"name":"segment"},{"ps":{"x":1154240000,"y":267950000,"name":"point"},"pe":{"x":1154115681.989453,"y":267730052.75057024,"name":"point"},"name":"segment"},{"ps":{"x":1154115681.989453,"y":267730052.75057024,"name":"point"},"pe":{"x":1154089926.5606358,"y":267693976.55424812,"name":"point"},"name":"segment"},{"ps":{"x":1154089926.5606358,"y":267693976.55424812,"name":"point"},"pe":{"x":1154092735.9985795,"y":267689455.9974853,"name":"point"},"name":"segment"},{"ps":{"x":1154092735.9985795,"y":267689455.9974853,"name":"point"},"pe":{"x":1153993265.3061225,"y":267513469.38775504,"name":"point"},"name":"segment"},{"ps":{"x":1153993265.3061225,"y":267513469.38775504,"name":"point"},"pe":{"x":1154107703.533026,"y":267284592.9339485,"name":"point"},"name":"segment"},{"ps":{"x":1154107703.533026,"y":267284592.9339485,"name":"point"},"pe":{"x":1286198103.4762266,"y":54821391.148841284,"name":"point"},"name":"segment"},{"ps":{"x":1286198103.4762266,"y":54821391.148841284,"name":"point"},"pe":{"x":1286232330.342853,"y":54685500.32193941,"name":"point"},"name":"segment"},{"ps":{"x":1286232330.342853,"y":54685500.32193941,"name":"point"},"pe":{"x":1319996203.9438455,"y":457619.7648851394,"name":"point"},"name":"segment"},{"ps":{"x":1319996203.9438455,"y":457619.7648851394,"name":"point"},"pe":{"x":1320005737.7285142,"y":442888.0849567612,"name":"point"},"name":"segment"},{"ps":{"x":1320005737.7285142,"y":442888.0849567612,"name":"point"},"pe":{"x":1320250000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1320250000,"y":50000,"name":"point"},"pe":{"x":1320260000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1320260000,"y":50000,"name":"point"},"pe":{"x":1335760000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1335760000,"y":50000,"name":"point"},"pe":{"x":1335929722.2222219,"y":350277.77777527034,"name":"point"},"name":"segment"},{"ps":{"x":1335929722.2222219,"y":350277.77777527034,"name":"point"},"pe":{"x":1336020000,"y":510000,"name":"point"},"name":"segment"},{"ps":{"x":1336020000,"y":510000,"name":"point"},"pe":{"x":1336017144.7222269,"y":514632.0777871349,"name":"point"},"name":"segment"},{"ps":{"x":1336017144.7222269,"y":514632.0777871349,"name":"point"},"pe":{"x":1336017149.883367,"y":514641.78073088516,"name":"point"},"name":"segment"},{"ps":{"x":1336017149.883367,"y":514641.78073088516,"name":"point"},"pe":{"x":1335880726.4613864,"y":736824.8325242014,"name":"point"},"name":"segment"},{"ps":{"x":1335880726.4613864,"y":736824.8325242014,"name":"point"},"pe":{"x":1335867232.677719,"y":757832.3218925294,"name":"point"},"name":"segment"},{"ps":{"x":1335867232.677719,"y":757832.3218925294,"name":"point"},"pe":{"x":1298200972.0620072,"y":61863287.90206727,"name":"point"},"name":"segment"},{"ps":{"x":1298200972.0620072,"y":61863287.90206727,"name":"point"},"pe":{"x":1172870000,"y":254760000,"name":"point"},"name":"segment"},{"ps":{"x":1172870000,"y":254760000,"name":"point"},"pe":{"x":1171923150.7737844,"y":255990437.5658898,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":1336020000,"y":520000,"name":"point"},"pe":{"x":1159520000,"y":275300000,"name":"point"},"name":"segment"},{"ps":{"x":1159520000,"y":275300000,"name":"point"},"pe":{"x":1153980000,"y":267540000.00000003,"name":"point"},"name":"segment"},{"ps":{"x":1153980000,"y":267540000.00000003,"name":"point"},"pe":{"x":1155110000,"y":265279999.99999997,"name":"point"},"name":"segment"},{"ps":{"x":1155110000,"y":265279999.99999997,"name":"point"},"pe":{"x":1320250000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1320250000,"y":50000,"name":"point"},"pe":{"x":1335770000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1335770000,"y":50000,"name":"point"},"pe":{"x":1336020000,"y":520000,"name":"point"},"name":"segment"}]]`;

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);

            let res = subtract(poly1, poly2);
            expect(res.faces.size).to.equal(3);
            expect(res.edges.size).to.equal(11);
        });
        it('Can perform subtract. Fixed: Infinite loop for boolean union over (valid) polygons. Issue #55 case 3', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":963110483.3545868,"y":269107685.0983406,"name":"point"},"pe":{"x":962820000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962820000,"y":269950000,"name":"point"},"pe":{"x":962180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962180000,"y":269950000,"name":"point"},"pe":{"x":962019413.2873166,"y":269468239.8619499,"name":"point"},"name":"segment"},{"ps":{"x":962019413.2873166,"y":269468239.8619499,"name":"point"},"pe":{"x":961030000,"y":266500000,"name":"point"},"name":"segment"},{"ps":{"x":961030000,"y":266500000,"name":"point"},"pe":{"x":966175263.1589682,"y":251057368.42534572,"name":"point"},"name":"segment"},{"ps":{"x":966175263.1589682,"y":251057368.42534572,"name":"point"},"pe":{"x":966175295.0230584,"y":251057272.79318383,"name":"point"},"name":"segment"},{"ps":{"x":966175295.0230584,"y":251057272.79318383,"name":"point"},"pe":{"x":966175296.766696,"y":251057267.55705994,"name":"point"},"name":"segment"},{"ps":{"x":966175296.766696,"y":251057267.55705994,"name":"point"},"pe":{"x":976070000,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976070000,"y":221360000,"name":"point"},"pe":{"x":976070737.1913013,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976070737.1913013,"y":221360000,"name":"point"},"pe":{"x":976133768.8287557,"y":221170835.3623748,"name":"point"},"name":"segment"},{"ps":{"x":976133768.8287557,"y":221170835.3623748,"name":"point"},"pe":{"x":978480316.5153537,"y":212915423.20107156,"name":"point"},"name":"segment"},{"ps":{"x":978480316.5153537,"y":212915423.20107156,"name":"point"},"pe":{"x":980406482.933095,"y":207214400.17572352,"name":"point"},"name":"segment"},{"ps":{"x":980406482.933095,"y":207214400.17572352,"name":"point"},"pe":{"x":983852818.8247252,"y":195147914.48011336,"name":"point"},"name":"segment"},{"ps":{"x":983852818.8247252,"y":195147914.48011336,"name":"point"},"pe":{"x":983745147.5406188,"y":194393170.13909355,"name":"point"},"name":"segment"},{"ps":{"x":983745147.5406188,"y":194393170.13909355,"name":"point"},"pe":{"x":985572292.778238,"y":187965072.7681096,"name":"point"},"name":"segment"},{"ps":{"x":985572292.778238,"y":187965072.7681096,"name":"point"},"pe":{"x":985959329.1152494,"y":187772494.00818902,"name":"point"},"name":"segment"},{"ps":{"x":985959329.1152494,"y":187772494.00818902,"name":"point"},"pe":{"x":998070000,"y":145370000,"name":"point"},"name":"segment"},{"ps":{"x":998070000,"y":145370000,"name":"point"},"pe":{"x":1007858422.2638745,"y":114514175.1976823,"name":"point"},"name":"segment"},{"ps":{"x":1007858422.2638745,"y":114514175.1976823,"name":"point"},"pe":{"x":1031079999.9999999,"y":38350000,"name":"point"},"name":"segment"},{"ps":{"x":1031079999.9999999,"y":38350000,"name":"point"},"pe":{"x":1034703389.160534,"y":29891385.83928786,"name":"point"},"name":"segment"},{"ps":{"x":1034703389.160534,"y":29891385.83928786,"name":"point"},"pe":{"x":1039333510.7471844,"y":15295957.011262229,"name":"point"},"name":"segment"},{"ps":{"x":1039333510.7471844,"y":15295957.011262229,"name":"point"},"pe":{"x":1040050000,"y":12430000,"name":"point"},"name":"segment"},{"ps":{"x":1040050000,"y":12430000,"name":"point"},"pe":{"x":1040050000,"y":6868285.714286132,"name":"point"},"name":"segment"},{"ps":{"x":1040050000,"y":6868285.714286132,"name":"point"},"pe":{"x":1042106828.0223789,"y":253171.97762108434,"name":"point"},"name":"segment"},{"ps":{"x":1042106828.0223789,"y":253171.97762108434,"name":"point"},"pe":{"x":1042310000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1042310000,"y":50000,"name":"point"},"pe":{"x":1044170000.0000001,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1044170000.0000001,"y":50000,"name":"point"},"pe":{"x":1049950000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1049950000,"y":50000,"name":"point"},"pe":{"x":1050119999.9999999,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1050119999.9999999,"y":50000,"name":"point"},"pe":{"x":1049950000,"y":565386.7660759832,"name":"point"},"name":"segment"},{"ps":{"x":1049950000,"y":565386.7660759832,"name":"point"},"pe":{"x":1049950000,"y":4425499.557913405,"name":"point"},"name":"segment"},{"ps":{"x":1049950000,"y":4425499.557913405,"name":"point"},"pe":{"x":1046506509.4862496,"y":11004971.706644002,"name":"point"},"name":"segment"},{"ps":{"x":1046506509.4862496,"y":11004971.706644002,"name":"point"},"pe":{"x":1045677238.9335306,"y":13519060.344104007,"name":"point"},"name":"segment"},{"ps":{"x":1045677238.9335306,"y":13519060.344104007,"name":"point"},"pe":{"x":1043946455.9954085,"y":15896462.063592784,"name":"point"},"name":"segment"},{"ps":{"x":1043946455.9954085,"y":15896462.063592784,"name":"point"},"pe":{"x":1040991221.0400991,"y":21543025.050703794,"name":"point"},"name":"segment"},{"ps":{"x":1040991221.0400991,"y":21543025.050703794,"name":"point"},"pe":{"x":1040872178.295911,"y":21909982.500677887,"name":"point"},"name":"segment"},{"ps":{"x":1040872178.295911,"y":21909982.500677887,"name":"point"},"pe":{"x":1037930000.0000001,"y":34630000,"name":"point"},"name":"segment"},{"ps":{"x":1037930000.0000001,"y":34630000,"name":"point"},"pe":{"x":1024920000.0000001,"y":71650000,"name":"point"},"name":"segment"},{"ps":{"x":1024920000.0000001,"y":71650000,"name":"point"},"pe":{"x":1013859031.1877896,"y":111481293.96151306,"name":"point"},"name":"segment"},{"ps":{"x":1013859031.1877896,"y":111481293.96151306,"name":"point"},"pe":{"x":1007953545.869533,"y":131559944.04358706,"name":"point"},"name":"segment"},{"ps":{"x":1007953545.869533,"y":131559944.04358706,"name":"point"},"pe":{"x":988950000,"y":188576174.22012946,"name":"point"},"name":"segment"},{"ps":{"x":988950000,"y":188576174.22012946,"name":"point"},"pe":{"x":988950000,"y":192650000,"name":"point"},"name":"segment"},{"ps":{"x":988950000,"y":192650000,"name":"point"},"pe":{"x":986502916.7781204,"y":195918144.03974694,"name":"point"},"name":"segment"},{"ps":{"x":986502916.7781204,"y":195918144.03974694,"name":"point"},"pe":{"x":979600799.2717452,"y":216626527.78828007,"name":"point"},"name":"segment"},{"ps":{"x":979600799.2717452,"y":216626527.78828007,"name":"point"},"pe":{"x":975950000,"y":228674346.74615034,"name":"point"},"name":"segment"},{"ps":{"x":975950000,"y":228674346.74615034,"name":"point"},"pe":{"x":975950000,"y":231876924.60976407,"name":"point"},"name":"segment"},{"ps":{"x":975950000,"y":231876924.60976407,"name":"point"},"pe":{"x":967950526.5044882,"y":255073006.67197832,"name":"point"},"name":"segment"},{"ps":{"x":967950526.5044882,"y":255073006.67197832,"name":"point"},"pe":{"x":963762999.179433,"y":268892054.8688656,"name":"point"},"name":"segment"},{"ps":{"x":963762999.179433,"y":268892054.8688656,"name":"point"},"pe":{"x":963110483.3545868,"y":269107685.0983406,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":1017930000,"y":97640000,"name":"point"},"pe":{"x":992930000,"y":182640000,"name":"point"},"name":"segment"},{"ps":{"x":992930000,"y":182640000,"name":"point"},"pe":{"x":962820000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962820000,"y":269950000,"name":"point"},"pe":{"x":962180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962180000,"y":269950000,"name":"point"},"pe":{"x":961030000,"y":266500000,"name":"point"},"name":"segment"},{"ps":{"x":961030000,"y":266500000,"name":"point"},"pe":{"x":976070000,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976070000,"y":221360000,"name":"point"},"pe":{"x":976080000,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976080000,"y":221360000,"name":"point"},"pe":{"x":1005070000,"y":119370000,"name":"point"},"name":"segment"},{"ps":{"x":1005070000,"y":119370000,"name":"point"},"pe":{"x":1042170000.0000001,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1042170000.0000001,"y":50000,"name":"point"},"pe":{"x":1050119999.9999999,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1050119999.9999999,"y":50000,"name":"point"},"pe":{"x":1017930000,"y":97640000,"name":"point"},"name":"segment"}]]`

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);
            expect(poly1.edges.size).to.equal(48);
            expect(poly2.edges.size).to.equal(10);

            let res = subtract(poly1, poly2);

            expect(res.faces.size).to.equal(3);
            expect(res.edges.size).to.equal(10);
        });
        it('Fixed: Infinite loop when subtracting polygons (v1.2.20) Issue #81', function() {
            const pA = new Flatten.Polygon([
                [50, 100],
                [100, 100],
                [100, 50],
                [100, 0],
                [50, 0],
                [0, 0],
                [0, 50],
                [50, 50],
                [50, 100]
            ]);
            const pB = new Flatten.Polygon([
                [50, 50],
                [100, 50],
                [100, 0],
                [50, 0],
                [50, 50]
            ]);
            const pC = new Flatten.Polygon([
                [50, 50],
                [50, 100],
                [100, 100],
                [100, 50],
                [50, 50]
            ]);

            const p0 = Flatten.BooleanOperations.subtract(pA, pB);
            expect(p0.faces.size).to.equal(1);
            expect(p0.edges.size).to.equal(8);

            const p1 = Flatten.BooleanOperations.subtract(p0, pC);
            expect(p1.faces.size).to.equal(1);
            expect(p1.edges.size).to.equal(4);
        });
        it('Can perform subtract. Fixed issue #76', () => {
            const points1 = [
                [
                    [0,0],
                    [0,40],
                    [23,40],
                    [23,0],
                    [0,0],
                ],
            ];
            const points2 = [
                [
                    [0,0],
                    [0,40.00000000000001],
                    [1.8,40.00000000000001],
                    [1.8,0],
                    [0,0],
                ],
            ];
            const p1 = new Flatten.Polygon(points1)
            const p2 = new Flatten.Polygon(points2)

            const p = subtract(p1, p2);

            expect(p.faces.size).to.equal(1);
            expect(p.edges.size).to.equal(4);
        })
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
        it("issue #42 Intersect does not seem to work when a second is inside first", function() {
            const item1 = new Polygon([[0, 30], [30, 30], [30, 0], [0, 0]]);
            const item2 = new Polygon([[10, 20], [20, 20], [20, 10], [10, 10]]);
            const intersection = intersect(item1, item2);

            expect(intersection.faces.size).to.equal(1);
            expect(intersection.edges.size).to.equal(4);
        })
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

            let myCircle = new Polygon();
            myCircle.addFace([arc(point(0,0),84.5779281026111, 0, 2*Math.PI, Flatten.CW)]);

            myPoly = intersect(myPoly,myCircle);

            myCircle = new Polygon();
            myCircle.addFace([arc(point(0,0),84.49938828627135, 0, 2*Math.PI, Flatten.CW)]);

            myPoly = subtract(myPoly,myCircle);

            myCircle = new Polygon();
            myCircle.addFace([arc(point(0,120),84.8710637077582, 0, 2*Math.PI, Flatten.CW)]);

            myPoly = intersect(myPoly,myCircle);

            myCircle = new Polygon();
            myCircle.addFace([arc(point(0,120),84.79252389141845, 0, 2*Math.PI, Flatten.CW)]);

            myPoly = subtract(myPoly,myCircle);

            myCircle = new Polygon();
            myCircle.addFace([arc(point(120,120),85.20624291591454, 0, 2*Math.PI, Flatten.CW)]);

            myPoly = intersect(myPoly,myCircle);

            myCircle = new Polygon();
            myCircle.addFace([arc(point(120,120), 85.1277030995748, 0, 2*Math.PI, Flatten.CW)]);

            myPoly = subtract(myPoly,myCircle);

            expect(myPoly.faces.size).to.equal(1);
            expect(myPoly.edges.size).to.equal(7);
            expect([...myPoly.faces][0].size).to.equal(7);
            expect([...myPoly.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CW);

        });
        it("Fixed: Issue #8", function() {
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
            const p = unify(p1, p2)
            expect(p.faces.size).to.equal(1);
            expect(p.edges.size).to.equal(12);
        });
        it("Subtract bug from flatten-js/core 1.2 onwards #15", function() {
            const poly = new Polygon();
            poly.addFace([point(200,0), point(200,200), point(0,200), point(0,0)])
            const cutter = new Polygon();
            cutter.addFace([point(100,0),point(100,200),point(200,200),point(200,0)])
            const reducedAreas = subtract(poly, cutter);

            expect(reducedAreas.faces.size).to.equal(1);
            expect(reducedAreas.edges.size).to.equal(7);
        });
        it('Can perform intersection. Fixed: Issue #55 case 0', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":885457739.1304348,"y":220050000,"name":"point"},"pe":{"x":885880000,"y":220050000,"name":"point"},"name":"segment"},{"ps":{"x":885880000,"y":220050000,"name":"point"},"pe":{"x":886111716.7381974,"y":221440300.42918456,"name":"point"},"name":"segment"},{"ps":{"x":886111716.7381974,"y":221440300.42918456,"name":"point"},"pe":{"x":885629798.7601395,"y":221601910.38557255,"name":"point"},"name":"segment"},{"ps":{"x":885629798.7601395,"y":221601910.38557255,"name":"point"},"pe":{"x":885950000,"y":224490000,"name":"point"},"name":"segment"},{"ps":{"x":885950000,"y":224490000,"name":"point"},"pe":{"x":885572474.0424377,"y":228923822.22616062,"name":"point"},"name":"segment"},{"ps":{"x":885572474.0424377,"y":228923822.22616062,"name":"point"},"pe":{"x":883940000,"y":231650000,"name":"point"},"name":"segment"},{"ps":{"x":883940000,"y":231650000,"name":"point"},"pe":{"x":883814095.0813553,"y":233095692.15629625,"name":"point"},"name":"segment"},{"ps":{"x":883814095.0813553,"y":233095692.15629625,"name":"point"},"pe":{"x":883252727.7414774,"y":256167889.82527742,"name":"point"},"name":"segment"},{"ps":{"x":883252727.7414774,"y":256167889.82527742,"name":"point"},"pe":{"x":882610351.261163,"y":263712226.99979052,"name":"point"},"name":"segment"},{"ps":{"x":882610351.261163,"y":263712226.99979052,"name":"point"},"pe":{"x":882952897.4299022,"y":268490915.6310136,"name":"point"},"name":"segment"},{"ps":{"x":882952897.4299022,"y":268490915.6310136,"name":"point"},"pe":{"x":882950001.1519145,"y":268609952.65631473,"name":"point"},"name":"segment"},{"ps":{"x":882950001.1519145,"y":268609952.65631473,"name":"point"},"pe":{"x":882038442.3014525,"y":270428964.23629075,"name":"point"},"name":"segment"},{"ps":{"x":882038442.3014525,"y":270428964.23629075,"name":"point"},"pe":{"x":882038439.5867643,"y":270428996.1187189,"name":"point"},"name":"segment"},{"ps":{"x":882038439.5867643,"y":270428996.1187189,"name":"point"},"pe":{"x":881287492.44713,"y":271927492.44712996,"name":"point"},"name":"segment"},{"ps":{"x":881287492.44713,"y":271927492.44712996,"name":"point"},"pe":{"x":881287488.7218044,"y":271927488.7218046,"name":"point"},"name":"segment"},{"ps":{"x":881287488.7218044,"y":271927488.7218046,"name":"point"},"pe":{"x":880740000,"y":273020000,"name":"point"},"name":"segment"},{"ps":{"x":880740000,"y":273020000,"name":"point"},"pe":{"x":880050000,"y":272860000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":272860000,"name":"point"},"pe":{"x":880050000,"y":270690000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":270690000,"name":"point"},"pe":{"x":880050000,"y":242973796.52605474,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":242973796.52605474,"name":"point"},"pe":{"x":880050000,"y":224390000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":224390000,"name":"point"},"pe":{"x":881870000,"y":220760000,"name":"point"},"name":"segment"},{"ps":{"x":881870000,"y":220760000,"name":"point"},"pe":{"x":880050000,"y":220153333.33333328,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":220153333.33333328,"name":"point"},"pe":{"x":880050000,"y":219200000,"name":"point"},"name":"segment"},{"ps":{"x":880050000,"y":219200000,"name":"point"},"pe":{"x":880610000,"y":218970000,"name":"point"},"name":"segment"},{"ps":{"x":880610000,"y":218970000,"name":"point"},"pe":{"x":881690000,"y":220050000,"name":"point"},"name":"segment"},{"ps":{"x":881690000,"y":220050000,"name":"point"},"pe":{"x":882461456.5387628,"y":220050000,"name":"point"},"name":"segment"},{"ps":{"x":882461456.5387628,"y":220050000,"name":"point"},"pe":{"x":882777039.9373531,"y":217050000,"name":"point"},"name":"segment"},{"ps":{"x":882777039.9373531,"y":217050000,"name":"point"},"pe":{"x":885125130.4347826,"y":217050000,"name":"point"},"name":"segment"},{"ps":{"x":885125130.4347826,"y":217050000,"name":"point"},"pe":{"x":885457739.1304348,"y":220050000,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":884930000,"y":215290000,"name":"point"},"pe":{"x":885950000,"y":224490000,"name":"point"},"name":"segment"},{"ps":{"x":885950000,"y":224490000,"name":"point"},"pe":{"x":881920000,"y":271820000,"name":"point"},"name":"segment"},{"ps":{"x":881920000,"y":271820000,"name":"point"},"pe":{"x":881380000,"y":272020000,"name":"point"},"name":"segment"},{"ps":{"x":881380000,"y":272020000,"name":"point"},"pe":{"x":879050000,"y":269690000,"name":"point"},"name":"segment"},{"ps":{"x":879050000,"y":269690000,"name":"point"},"pe":{"x":879050000,"y":252480000,"name":"point"},"name":"segment"},{"ps":{"x":879050000,"y":252480000,"name":"point"},"pe":{"x":883080000,"y":214170000,"name":"point"},"name":"segment"},{"ps":{"x":883080000,"y":214170000,"name":"point"},"pe":{"x":883620000,"y":213980000,"name":"point"},"name":"segment"},{"ps":{"x":883620000,"y":213980000,"name":"point"},"pe":{"x":884930000,"y":215290000,"name":"point"},"name":"segment"}]]`;

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);

            let res = intersect(poly2, poly1);

            expect(res.faces.size).to.equal(1);
            expect(res.edges.size).to.equal(18);
        });
        it('Can perform intersection. Fixed: Issue #55 case 1', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":1236898403.171192,"y":220104489.05237198,"name":"point"},"pe":{"x":1223110000,"y":236470000,"name":"point"},"name":"segment"},{"ps":{"x":1223110000,"y":236470000,"name":"point"},"pe":{"x":1223530000,"y":236890000,"name":"point"},"name":"segment"},{"ps":{"x":1223530000,"y":236890000,"name":"point"},"pe":{"x":1224331213.9324033,"y":236204452.3401371,"name":"point"},"name":"segment"},{"ps":{"x":1224331213.9324033,"y":236204452.3401371,"name":"point"},"pe":{"x":1224110000,"y":236470000,"name":"point"},"name":"segment"},{"ps":{"x":1224110000,"y":236470000,"name":"point"},"pe":{"x":1224530000,"y":236890000,"name":"point"},"name":"segment"},{"ps":{"x":1224530000,"y":236890000,"name":"point"},"pe":{"x":1226584146.0582714,"y":235127082.21840945,"name":"point"},"name":"segment"},{"ps":{"x":1226584146.0582714,"y":235127082.21840945,"name":"point"},"pe":{"x":1250931121.7834568,"y":213444607.75634384,"name":"point"},"name":"segment"},{"ps":{"x":1250931121.7834568,"y":213444607.75634384,"name":"point"},"pe":{"x":1499161155.7619252,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1499161155.7619252,"y":1050000,"name":"point"},"pe":{"x":1499330000.0000002,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1499330000.0000002,"y":1050000,"name":"point"},"pe":{"x":1503561880.3418803,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1503561880.3418803,"y":1050000,"name":"point"},"pe":{"x":1503810000,"y":1050000,"name":"point"},"name":"segment"},{"ps":{"x":1503810000,"y":1050000,"name":"point"},"pe":{"x":1503845447.6327908,"y":1145064.1061217745,"name":"point"},"name":"segment"},{"ps":{"x":1503845447.6327908,"y":1145064.1061217745,"name":"point"},"pe":{"x":1503890000,"y":1160000,"name":"point"},"name":"segment"},{"ps":{"x":1503890000,"y":1160000,"name":"point"},"pe":{"x":1503933233.0827074,"y":1380488.721804647,"name":"point"},"name":"segment"},{"ps":{"x":1503933233.0827074,"y":1380488.721804647,"name":"point"},"pe":{"x":1504030000,"y":1640000,"name":"point"},"name":"segment"},{"ps":{"x":1504030000,"y":1640000,"name":"point"},"pe":{"x":1284695674.5477602,"y":189637802.97710437,"name":"point"},"name":"segment"},{"ps":{"x":1284695674.5477602,"y":189637802.97710437,"name":"point"},"pe":{"x":1229805187.049371,"y":235234498.97279018,"name":"point"},"name":"segment"},{"ps":{"x":1229805187.049371,"y":235234498.97279018,"name":"point"},"pe":{"x":1206790000,"y":254840000,"name":"point"},"name":"segment"},{"ps":{"x":1206790000,"y":254840000,"name":"point"},"pe":{"x":1200345165.1079006,"y":261937067.68178037,"name":"point"},"name":"segment"},{"ps":{"x":1200345165.1079006,"y":261937067.68178037,"name":"point"},"pe":{"x":1195570000,"y":266029999.99999997,"name":"point"},"name":"segment"},{"ps":{"x":1195570000,"y":266029999.99999997,"name":"point"},"pe":{"x":1195050000,"y":265790000.00000003,"name":"point"},"name":"segment"},{"ps":{"x":1195050000,"y":265790000.00000003,"name":"point"},"pe":{"x":1195050000,"y":265590000.0000002,"name":"point"},"name":"segment"},{"ps":{"x":1195050000,"y":265590000.0000002,"name":"point"},"pe":{"x":1190690000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1190690000,"y":269950000,"name":"point"},"pe":{"x":1188095946.9026546,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1188095946.9026546,"y":269950000,"name":"point"},"pe":{"x":1183763203.5398228,"y":273950000,"name":"point"},"name":"segment"},{"ps":{"x":1183763203.5398228,"y":273950000,"name":"point"},"pe":{"x":1182452264.1509435,"y":273950000,"name":"point"},"name":"segment"},{"ps":{"x":1182452264.1509435,"y":273950000,"name":"point"},"pe":{"x":1187066819.4070086,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1187066819.4070086,"y":269950000,"name":"point"},"pe":{"x":1186180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1186180000,"y":269950000,"name":"point"},"pe":{"x":1185970000,"y":269360000,"name":"point"},"name":"segment"},{"ps":{"x":1185970000,"y":269360000,"name":"point"},"pe":{"x":1200867290.5140696,"y":256937423.86408997,"name":"point"},"name":"segment"},{"ps":{"x":1200867290.5140696,"y":256937423.86408997,"name":"point"},"pe":{"x":1309090858.6978958,"y":132503906.35777506,"name":"point"},"name":"segment"},{"ps":{"x":1309090858.6978958,"y":132503906.35777506,"name":"point"},"pe":{"x":1359934130.1642103,"y":73533323.55885088,"name":"point"},"name":"segment"},{"ps":{"x":1359934130.1642103,"y":73533323.55885088,"name":"point"},"pe":{"x":1379180804.4268446,"y":51915743.952495456,"name":"point"},"name":"segment"},{"ps":{"x":1379180804.4268446,"y":51915743.952495456,"name":"point"},"pe":{"x":1389793012.4132636,"y":39714017.55941675,"name":"point"},"name":"segment"},{"ps":{"x":1389793012.4132636,"y":39714017.55941675,"name":"point"},"pe":{"x":1423290000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1423290000,"y":50000,"name":"point"},"pe":{"x":1424290000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1424290000,"y":50000,"name":"point"},"pe":{"x":1428780000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1428780000,"y":50000,"name":"point"},"pe":{"x":1428790000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1428790000,"y":50000,"name":"point"},"pe":{"x":1428952077.9220784,"y":407922.0779276299,"name":"point"},"name":"segment"},{"ps":{"x":1428952077.9220784,"y":407922.0779276299,"name":"point"},"pe":{"x":1429030000,"y":570000,"name":"point"},"name":"segment"},{"ps":{"x":1429030000,"y":570000,"name":"point"},"pe":{"x":1429027037.0218253,"y":573456.7565310667,"name":"point"},"name":"segment"},{"ps":{"x":1429027037.0218253,"y":573456.7565310667,"name":"point"},"pe":{"x":1429027082.4737701,"y":573557.1295764182,"name":"point"},"name":"segment"},{"ps":{"x":1429027082.4737701,"y":573557.1295764182,"name":"point"},"pe":{"x":1428900309.972682,"y":728121.7084697284,"name":"point"},"name":"segment"},{"ps":{"x":1428900309.972682,"y":728121.7084697284,"name":"point"},"pe":{"x":1428622307.7106557,"y":1045633.9402333818,"name":"point"},"name":"segment"},{"ps":{"x":1428622307.7106557,"y":1045633.9402333818,"name":"point"},"pe":{"x":1332840000,"y":112790000,"name":"point"},"name":"segment"},{"ps":{"x":1332840000,"y":112790000,"name":"point"},"pe":{"x":1256233091.7992697,"y":199456401.19678846,"name":"point"},"name":"segment"},{"ps":{"x":1256233091.7992697,"y":199456401.19678846,"name":"point"},"pe":{"x":1236898403.171192,"y":220104489.05237198,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":1503890000,"y":1160000,"name":"point"},"pe":{"x":1503990000,"y":1670000,"name":"point"},"name":"segment"},{"ps":{"x":1503990000,"y":1670000,"name":"point"},"pe":{"x":1206790000,"y":254840000,"name":"point"},"name":"segment"},{"ps":{"x":1206790000,"y":254840000,"name":"point"},"pe":{"x":1196810000,"y":265829999.99999997,"name":"point"},"name":"segment"},{"ps":{"x":1196810000,"y":265829999.99999997,"name":"point"},"pe":{"x":1191660000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1191660000,"y":269950000,"name":"point"},"pe":{"x":1186180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":1186180000,"y":269950000,"name":"point"},"pe":{"x":1185970000,"y":269360000,"name":"point"},"name":"segment"},{"ps":{"x":1185970000,"y":269360000,"name":"point"},"pe":{"x":1204210000,"y":254150000,"name":"point"},"name":"segment"},{"ps":{"x":1204210000,"y":254150000,"name":"point"},"pe":{"x":1423290000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1423290000,"y":50000,"name":"point"},"pe":{"x":1428790000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1428790000,"y":50000,"name":"point"},"pe":{"x":1429030000,"y":580000,"name":"point"},"name":"segment"},{"ps":{"x":1429030000,"y":580000,"name":"point"},"pe":{"x":1238840000,"y":217800000,"name":"point"},"name":"segment"},{"ps":{"x":1238840000,"y":217800000,"name":"point"},"pe":{"x":1223110000,"y":236470000,"name":"point"},"name":"segment"},{"ps":{"x":1223110000,"y":236470000,"name":"point"},"pe":{"x":1223530000,"y":236890000,"name":"point"},"name":"segment"},{"ps":{"x":1223530000,"y":236890000,"name":"point"},"pe":{"x":1500400000,"y":-10000,"name":"point"},"name":"segment"},{"ps":{"x":1500400000,"y":-10000,"name":"point"},"pe":{"x":1503890000,"y":1160000,"name":"point"},"name":"segment"}]]`;

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);

            let res = intersect(poly1, poly2);
            expect(res.faces.size).to.equal(1);
            expect(res.edges.size).to.equal(44);
        });
        it('Can perform intersect. Fixed: Infinite loop for boolean union over (valid) polygons. Issue #55 case 2', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":1171923150.7737844,"y":255990437.5658898,"name":"point"},"pe":{"x":1171782510.010546,"y":256209390.93089134,"name":"point"},"name":"segment"},{"ps":{"x":1171782510.010546,"y":256209390.93089134,"name":"point"},"pe":{"x":1160700000,"y":270980000,"name":"point"},"name":"segment"},{"ps":{"x":1160700000,"y":270980000,"name":"point"},"pe":{"x":1155954306.7336805,"y":270305454.91937846,"name":"point"},"name":"segment"},{"ps":{"x":1155954306.7336805,"y":270305454.91937846,"name":"point"},"pe":{"x":1154272706.1855671,"y":267950000,"name":"point"},"name":"segment"},{"ps":{"x":1154272706.1855671,"y":267950000,"name":"point"},"pe":{"x":1154240000,"y":267950000,"name":"point"},"name":"segment"},{"ps":{"x":1154240000,"y":267950000,"name":"point"},"pe":{"x":1154115681.989453,"y":267730052.75057024,"name":"point"},"name":"segment"},{"ps":{"x":1154115681.989453,"y":267730052.75057024,"name":"point"},"pe":{"x":1154089926.5606358,"y":267693976.55424812,"name":"point"},"name":"segment"},{"ps":{"x":1154089926.5606358,"y":267693976.55424812,"name":"point"},"pe":{"x":1154092735.9985795,"y":267689455.9974853,"name":"point"},"name":"segment"},{"ps":{"x":1154092735.9985795,"y":267689455.9974853,"name":"point"},"pe":{"x":1153993265.3061225,"y":267513469.38775504,"name":"point"},"name":"segment"},{"ps":{"x":1153993265.3061225,"y":267513469.38775504,"name":"point"},"pe":{"x":1154107703.533026,"y":267284592.9339485,"name":"point"},"name":"segment"},{"ps":{"x":1154107703.533026,"y":267284592.9339485,"name":"point"},"pe":{"x":1286198103.4762266,"y":54821391.148841284,"name":"point"},"name":"segment"},{"ps":{"x":1286198103.4762266,"y":54821391.148841284,"name":"point"},"pe":{"x":1286232330.342853,"y":54685500.32193941,"name":"point"},"name":"segment"},{"ps":{"x":1286232330.342853,"y":54685500.32193941,"name":"point"},"pe":{"x":1319996203.9438455,"y":457619.7648851394,"name":"point"},"name":"segment"},{"ps":{"x":1319996203.9438455,"y":457619.7648851394,"name":"point"},"pe":{"x":1320005737.7285142,"y":442888.0849567612,"name":"point"},"name":"segment"},{"ps":{"x":1320005737.7285142,"y":442888.0849567612,"name":"point"},"pe":{"x":1320250000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1320250000,"y":50000,"name":"point"},"pe":{"x":1320260000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1320260000,"y":50000,"name":"point"},"pe":{"x":1335760000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1335760000,"y":50000,"name":"point"},"pe":{"x":1335929722.2222219,"y":350277.77777527034,"name":"point"},"name":"segment"},{"ps":{"x":1335929722.2222219,"y":350277.77777527034,"name":"point"},"pe":{"x":1336020000,"y":510000,"name":"point"},"name":"segment"},{"ps":{"x":1336020000,"y":510000,"name":"point"},"pe":{"x":1336017144.7222269,"y":514632.0777871349,"name":"point"},"name":"segment"},{"ps":{"x":1336017144.7222269,"y":514632.0777871349,"name":"point"},"pe":{"x":1336017149.883367,"y":514641.78073088516,"name":"point"},"name":"segment"},{"ps":{"x":1336017149.883367,"y":514641.78073088516,"name":"point"},"pe":{"x":1335880726.4613864,"y":736824.8325242014,"name":"point"},"name":"segment"},{"ps":{"x":1335880726.4613864,"y":736824.8325242014,"name":"point"},"pe":{"x":1335867232.677719,"y":757832.3218925294,"name":"point"},"name":"segment"},{"ps":{"x":1335867232.677719,"y":757832.3218925294,"name":"point"},"pe":{"x":1298200972.0620072,"y":61863287.90206727,"name":"point"},"name":"segment"},{"ps":{"x":1298200972.0620072,"y":61863287.90206727,"name":"point"},"pe":{"x":1172870000,"y":254760000,"name":"point"},"name":"segment"},{"ps":{"x":1172870000,"y":254760000,"name":"point"},"pe":{"x":1171923150.7737844,"y":255990437.5658898,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":1336020000,"y":520000,"name":"point"},"pe":{"x":1159520000,"y":275300000,"name":"point"},"name":"segment"},{"ps":{"x":1159520000,"y":275300000,"name":"point"},"pe":{"x":1153980000,"y":267540000.00000003,"name":"point"},"name":"segment"},{"ps":{"x":1153980000,"y":267540000.00000003,"name":"point"},"pe":{"x":1155110000,"y":265279999.99999997,"name":"point"},"name":"segment"},{"ps":{"x":1155110000,"y":265279999.99999997,"name":"point"},"pe":{"x":1320250000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1320250000,"y":50000,"name":"point"},"pe":{"x":1335770000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1335770000,"y":50000,"name":"point"},"pe":{"x":1336020000,"y":520000,"name":"point"},"name":"segment"}]]`;

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);

            let res = intersect(poly1, poly2);
            expect(res.faces.size).to.equal(1);
            expect(res.edges.size).to.equal(26);
        });
        it('Can perform intersect. Fixed: Infinite loop for boolean union over (valid) polygons. Issue #55 case 3', function () {
            "use strict";

            const json1 = `[[{"ps":{"x":963110483.3545868,"y":269107685.0983406,"name":"point"},"pe":{"x":962820000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962820000,"y":269950000,"name":"point"},"pe":{"x":962180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962180000,"y":269950000,"name":"point"},"pe":{"x":962019413.2873166,"y":269468239.8619499,"name":"point"},"name":"segment"},{"ps":{"x":962019413.2873166,"y":269468239.8619499,"name":"point"},"pe":{"x":961030000,"y":266500000,"name":"point"},"name":"segment"},{"ps":{"x":961030000,"y":266500000,"name":"point"},"pe":{"x":966175263.1589682,"y":251057368.42534572,"name":"point"},"name":"segment"},{"ps":{"x":966175263.1589682,"y":251057368.42534572,"name":"point"},"pe":{"x":966175295.0230584,"y":251057272.79318383,"name":"point"},"name":"segment"},{"ps":{"x":966175295.0230584,"y":251057272.79318383,"name":"point"},"pe":{"x":966175296.766696,"y":251057267.55705994,"name":"point"},"name":"segment"},{"ps":{"x":966175296.766696,"y":251057267.55705994,"name":"point"},"pe":{"x":976070000,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976070000,"y":221360000,"name":"point"},"pe":{"x":976070737.1913013,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976070737.1913013,"y":221360000,"name":"point"},"pe":{"x":976133768.8287557,"y":221170835.3623748,"name":"point"},"name":"segment"},{"ps":{"x":976133768.8287557,"y":221170835.3623748,"name":"point"},"pe":{"x":978480316.5153537,"y":212915423.20107156,"name":"point"},"name":"segment"},{"ps":{"x":978480316.5153537,"y":212915423.20107156,"name":"point"},"pe":{"x":980406482.933095,"y":207214400.17572352,"name":"point"},"name":"segment"},{"ps":{"x":980406482.933095,"y":207214400.17572352,"name":"point"},"pe":{"x":983852818.8247252,"y":195147914.48011336,"name":"point"},"name":"segment"},{"ps":{"x":983852818.8247252,"y":195147914.48011336,"name":"point"},"pe":{"x":983745147.5406188,"y":194393170.13909355,"name":"point"},"name":"segment"},{"ps":{"x":983745147.5406188,"y":194393170.13909355,"name":"point"},"pe":{"x":985572292.778238,"y":187965072.7681096,"name":"point"},"name":"segment"},{"ps":{"x":985572292.778238,"y":187965072.7681096,"name":"point"},"pe":{"x":985959329.1152494,"y":187772494.00818902,"name":"point"},"name":"segment"},{"ps":{"x":985959329.1152494,"y":187772494.00818902,"name":"point"},"pe":{"x":998070000,"y":145370000,"name":"point"},"name":"segment"},{"ps":{"x":998070000,"y":145370000,"name":"point"},"pe":{"x":1007858422.2638745,"y":114514175.1976823,"name":"point"},"name":"segment"},{"ps":{"x":1007858422.2638745,"y":114514175.1976823,"name":"point"},"pe":{"x":1031079999.9999999,"y":38350000,"name":"point"},"name":"segment"},{"ps":{"x":1031079999.9999999,"y":38350000,"name":"point"},"pe":{"x":1034703389.160534,"y":29891385.83928786,"name":"point"},"name":"segment"},{"ps":{"x":1034703389.160534,"y":29891385.83928786,"name":"point"},"pe":{"x":1039333510.7471844,"y":15295957.011262229,"name":"point"},"name":"segment"},{"ps":{"x":1039333510.7471844,"y":15295957.011262229,"name":"point"},"pe":{"x":1040050000,"y":12430000,"name":"point"},"name":"segment"},{"ps":{"x":1040050000,"y":12430000,"name":"point"},"pe":{"x":1040050000,"y":6868285.714286132,"name":"point"},"name":"segment"},{"ps":{"x":1040050000,"y":6868285.714286132,"name":"point"},"pe":{"x":1042106828.0223789,"y":253171.97762108434,"name":"point"},"name":"segment"},{"ps":{"x":1042106828.0223789,"y":253171.97762108434,"name":"point"},"pe":{"x":1042310000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1042310000,"y":50000,"name":"point"},"pe":{"x":1044170000.0000001,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1044170000.0000001,"y":50000,"name":"point"},"pe":{"x":1049950000,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1049950000,"y":50000,"name":"point"},"pe":{"x":1050119999.9999999,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1050119999.9999999,"y":50000,"name":"point"},"pe":{"x":1049950000,"y":565386.7660759832,"name":"point"},"name":"segment"},{"ps":{"x":1049950000,"y":565386.7660759832,"name":"point"},"pe":{"x":1049950000,"y":4425499.557913405,"name":"point"},"name":"segment"},{"ps":{"x":1049950000,"y":4425499.557913405,"name":"point"},"pe":{"x":1046506509.4862496,"y":11004971.706644002,"name":"point"},"name":"segment"},{"ps":{"x":1046506509.4862496,"y":11004971.706644002,"name":"point"},"pe":{"x":1045677238.9335306,"y":13519060.344104007,"name":"point"},"name":"segment"},{"ps":{"x":1045677238.9335306,"y":13519060.344104007,"name":"point"},"pe":{"x":1043946455.9954085,"y":15896462.063592784,"name":"point"},"name":"segment"},{"ps":{"x":1043946455.9954085,"y":15896462.063592784,"name":"point"},"pe":{"x":1040991221.0400991,"y":21543025.050703794,"name":"point"},"name":"segment"},{"ps":{"x":1040991221.0400991,"y":21543025.050703794,"name":"point"},"pe":{"x":1040872178.295911,"y":21909982.500677887,"name":"point"},"name":"segment"},{"ps":{"x":1040872178.295911,"y":21909982.500677887,"name":"point"},"pe":{"x":1037930000.0000001,"y":34630000,"name":"point"},"name":"segment"},{"ps":{"x":1037930000.0000001,"y":34630000,"name":"point"},"pe":{"x":1024920000.0000001,"y":71650000,"name":"point"},"name":"segment"},{"ps":{"x":1024920000.0000001,"y":71650000,"name":"point"},"pe":{"x":1013859031.1877896,"y":111481293.96151306,"name":"point"},"name":"segment"},{"ps":{"x":1013859031.1877896,"y":111481293.96151306,"name":"point"},"pe":{"x":1007953545.869533,"y":131559944.04358706,"name":"point"},"name":"segment"},{"ps":{"x":1007953545.869533,"y":131559944.04358706,"name":"point"},"pe":{"x":988950000,"y":188576174.22012946,"name":"point"},"name":"segment"},{"ps":{"x":988950000,"y":188576174.22012946,"name":"point"},"pe":{"x":988950000,"y":192650000,"name":"point"},"name":"segment"},{"ps":{"x":988950000,"y":192650000,"name":"point"},"pe":{"x":986502916.7781204,"y":195918144.03974694,"name":"point"},"name":"segment"},{"ps":{"x":986502916.7781204,"y":195918144.03974694,"name":"point"},"pe":{"x":979600799.2717452,"y":216626527.78828007,"name":"point"},"name":"segment"},{"ps":{"x":979600799.2717452,"y":216626527.78828007,"name":"point"},"pe":{"x":975950000,"y":228674346.74615034,"name":"point"},"name":"segment"},{"ps":{"x":975950000,"y":228674346.74615034,"name":"point"},"pe":{"x":975950000,"y":231876924.60976407,"name":"point"},"name":"segment"},{"ps":{"x":975950000,"y":231876924.60976407,"name":"point"},"pe":{"x":967950526.5044882,"y":255073006.67197832,"name":"point"},"name":"segment"},{"ps":{"x":967950526.5044882,"y":255073006.67197832,"name":"point"},"pe":{"x":963762999.179433,"y":268892054.8688656,"name":"point"},"name":"segment"},{"ps":{"x":963762999.179433,"y":268892054.8688656,"name":"point"},"pe":{"x":963110483.3545868,"y":269107685.0983406,"name":"point"},"name":"segment"}]]`;
            const json2 = `[[{"ps":{"x":1017930000,"y":97640000,"name":"point"},"pe":{"x":992930000,"y":182640000,"name":"point"},"name":"segment"},{"ps":{"x":992930000,"y":182640000,"name":"point"},"pe":{"x":962820000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962820000,"y":269950000,"name":"point"},"pe":{"x":962180000,"y":269950000,"name":"point"},"name":"segment"},{"ps":{"x":962180000,"y":269950000,"name":"point"},"pe":{"x":961030000,"y":266500000,"name":"point"},"name":"segment"},{"ps":{"x":961030000,"y":266500000,"name":"point"},"pe":{"x":976070000,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976070000,"y":221360000,"name":"point"},"pe":{"x":976080000,"y":221360000,"name":"point"},"name":"segment"},{"ps":{"x":976080000,"y":221360000,"name":"point"},"pe":{"x":1005070000,"y":119370000,"name":"point"},"name":"segment"},{"ps":{"x":1005070000,"y":119370000,"name":"point"},"pe":{"x":1042170000.0000001,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1042170000.0000001,"y":50000,"name":"point"},"pe":{"x":1050119999.9999999,"y":50000,"name":"point"},"name":"segment"},{"ps":{"x":1050119999.9999999,"y":50000,"name":"point"},"pe":{"x":1017930000,"y":97640000,"name":"point"},"name":"segment"}]]`

            let poly1 = new Polygon(JSON.parse(json1));
            let poly2 = new Polygon(JSON.parse(json2));

            expect(poly1.faces.size).to.equal(1);
            expect(poly2.faces.size).to.equal(1);
            expect(poly1.edges.size).to.equal(48);
            expect(poly2.edges.size).to.equal(10);

            let res = intersect(poly1, poly2);

            expect(res.faces.size).to.equal(1);
            expect(res.edges.size).to.equal(49);
        });
        it('Fixed: Infinite Loop when intersecting Polygons (v1.3.4) #139', function () {
            "use strict";

            const pA = new Flatten.Polygon([
                [-0.804520127123574, 1.339393817643834],
                [-1.44342, 1.33547],
                [-1.44295, 1.25844],
                [-0.752200567469394, 1.262673030567845],
                [-0.43494, 0.94929],
                [-0.43409, 0.80945],
                [-0.25009, 0.81058],
                [-0.25141, 1.02663],
                [-0.68773, 1.45762]
            ]);
            const pB = new Flatten.Polygon([
                [-0.214786655677953, 0.455460687589484],
                [-0.212933692475707, 0.153478772239008],
                [-0.484814598920061, 0.151810509043677],
                [-0.486769173837377, 0.470352332492435],
                [-0.248008083589586, 0.471817372257627],
                [-0.249883531819723, 0.777463727237025],
                [-0.465717468690565, 0.776139368649679],
                [-0.465819080405634, 0.792699276747961],
                [-0.465920692120704, 0.809259184846243],
                [-0.250086755249862, 0.810583543433589],
                [-0.251412423519267, 1.026630922371995],
                [-0.687726883276347, 1.457623579428936],
                [-0.756104256819758, 1.388401897090016],
                [-1.443720258787936, 1.384182680361611],
                [-1.438077171905942, 0.464515099781405],
                [-1.232127415898958, 0.465778808963956],
                [-1.232025804183888, 0.449218900865674],
                [-1.231924192468819, 0.432658992767392],
                [-1.437873948475803, 0.431395283584842],
                [-1.432852247643994, -0.387003502569683],
                [-0.481544249575428, -0.381166269858653],
                [-0.48303032139303, -0.13897753492647],
                [-0.211149414948676, -0.137309271731139],
                [-0.209663343131074, -0.379498006663323],
                [0.200564602125089, -0.376980845043859],
                [0.191764012137382, 1.057272688691121],
                [0.801011113203148, 1.06101103328053],
                [0.795297496613716, 1.992173011653193],
                [0.791836950662651, 2.556146593640385],
                [0.808396858760933, 2.556248205355453],
                [0.824956766859214, 2.556349817070523],
                [0.82831570109521, 2.008936143181614],
                [1.138005691324793, 2.010836403186699],
                [1.136817822087325, 2.204426339069638],
                [1.133637313580856, 2.722761538283504],
                [1.132394558666998, 2.925296326207573],
                [0.822704568437416, 2.923396066202488],
                [0.823093498442912, 2.860011198195052],
                [0.80653359034463, 2.859909586479983],
                [0.789973682246349, 2.859807974764913],
                [0.789483140525783, 2.939752750870631],
                [0.789064019048082, 3.008057996461665],
                [-0.298484790363228, 3.001384789153383],
                [-0.296166674927848, 2.623595884154547],
                [-0.568547791511448, 2.621924551666208],
                [-0.567338612600993, 2.424861726598873],
                [-0.564183869086205, 1.910725510682341],
                [-0.562183479538207, 1.584717165551983],
                [-0.664451337317651, 1.481186526718725],
                [-0.218376785223659, 1.040552822854055],
                [-0.216865327338229, 0.794226858765446]
            ]);

            const p0 = Flatten.BooleanOperations.intersect(pA, pB);

            expect(p0.faces.size).to.equal(1);
            expect(p0.edges.size).to.equal(15);
        });
        it("Infinite Loop when intersecting Polygons (v1.3.4) #139 case 2", function() {
            let pA = new Flatten.Polygon([
                [ 101.201, 2.97 ],
                [ 101.202, 2.97 ],
                [ 101.202, 2.9706 ],
                [ 101.201, 2.9706 ]
            ]);

            let pB = new Flatten.Polygon([
                [ 101.19,  2.99 ],
                [ 101.22,  2.99 ],
                [ 101.22,  2.97 ],
                [ 101.2,  2.97]
            ]);

            let pA_scaled = pA.transform(new Flatten.Matrix().scale(10000,10000))
            let pB_scaled = pB.transform(new Flatten.Matrix().scale(10000,10000))

            if ([...pA_scaled.faces][0].orientation() != [...pB_scaled.faces][0].orientation()) {
                pB_scaled = pB_scaled.reverse();
            }

            const p0 = Flatten.BooleanOperations.intersect(pA_scaled, pB_scaled);

            expect(p0.faces.size).to.equal(1);
            expect(p0.edges.size).to.equal(4);
        })
    });
    describe("Boolean operations with empty polygon", function() {
        it ('Can operate with empty polygon', function() {
            const p1 = new Polygon([[[0, 0], [0, 100], [100, 100], [100, 0]]]);

            const p2 = new Polygon([[[0, 0], [0, 50], [50, 50], [50, 0]]]);

            const emptyP = new Polygon([]);

// Works
            const res1 = subtract(p1, p2);
            expect(res1.faces.size).to.equal(1);
            expect(res1.edges.size).to.equal(6);

            const res2 = subtract(p2, p1);
            expect(res2.faces.size).to.equal(0);
            expect(res2.edges.size).to.equal(0);
            expect(res2.isEmpty()).to.be.true;

// Do not work (see console)
            let res3;
            try {
                res3 = subtract(p1, emptyP);
            } catch (err) {
                console.log(err);
            }
            expect(res3.faces.size).to.equal(1);
            expect(res3.edges.size).to.equal(4);
            expect(equal(res3, p1)).to.be.true;

            let res4;
            try {
                res4 = subtract(emptyP, p1);
            } catch (err) {
                console.log(err);
            }
            expect(res4.isEmpty()).to.be.true;

            let res5;
            try {
                res5 = intersect(p1, emptyP);
            } catch (err) {
                console.log(err);
            }
            expect(res5.isEmpty()).to.be.true;

            let res6;
            try {
                res6 = intersect(emptyP, p1);
            } catch (err) {
                console.log(err);
            }
            expect(res6.isEmpty()).to.be.true;

        })
    })
});
