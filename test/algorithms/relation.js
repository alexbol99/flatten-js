'use strict';

import { expect } from 'chai';
import Flatten, {multiline} from '../../index';
// import {relate, disjoint, equal, intersect, touch, inside, contain, covered, cover} from '../../src/algorithms/relation';
import {intersectLine2Polygon} from "../../src/algorithms/intersection";

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} = Flatten;

let {point, vector, circle, line, segment, arc, ray, box} = Flatten;
let {relate, disjoint, equal, intersect, touch, inside, contain, covered, cover} = Flatten.Relations;

describe('#Algorithms.Relation', function() {
    it('Function relate defined', () => {
        expect(relate).to.exist;
        expect(relate).to.be.a('function');
    });
    it('Namespace Relations exist on Flatten', () => {
        expect(Flatten.Relations).to.exist;
    });
    it('Relations may be consumed from Flatten.Relations namespace', () => {
        expect(Flatten.Relations.disjoint).to.exist;
        expect(Flatten.Relations.intersect).to.exist;
        expect(Flatten.Relations.equal).to.exist;
        expect(Flatten.Relations.touch).to.exist;
        expect(Flatten.Relations.inside).to.exist;
        expect(Flatten.Relations.contain).to.exist;
        expect(Flatten.Relations.covered).to.exist;
        expect(Flatten.Relations.cover).to.exist;
    })
    it('Functions disjoint,equals,intersects,touches exist', () => {
        expect(disjoint).to.be.a('function');
        expect(equal).to.be.a('function');
        expect(intersect).to.be.a('function');
        expect(touch).to.be.a('function');
    });
    describe('#Algorithms.Relation.Line2Line', function() {
        it ('Parallel case (disjoint)', () => {
            let l1 = line( point(10,10), vector(1,1) );
            let l2 = line( l1.pt.translate(vector(10,10)), l1.norm );
            let de9im = relate(l1, l2);

            expect(de9im.I2E[0]).to.be.deep.equal(l1);
            expect(de9im.E2I[0]).to.be.deep.equal(l2);
            expect(disjoint(l1,l2)).to.be.true;
            expect(equal(l1,l2)).to.be.false;
            expect(intersect(l1,l2)).to.be.false;
            expect(touch(l1,l2)).to.be.false;
        });
        it ('Equal case', () => {
            let l1 = line( point(10,10), vector(1,1) );
            let l2 = line( point(10,10), vector(-1,-1) );

            expect(equal(l1,l2)).to.be.true;
            expect(intersect(l1,l2)).to.be.true;
            expect(disjoint(l1,l2)).to.be.false;
            expect(touch(l1,l2)).to.be.false;
        });
        it ('Intersection case', () => {
            let l1 = line( point(10,10), vector(1,1) );
            let l2 = line( point(20,20), vector(1,-1) );

            expect(equal(l1,l2)).to.be.false;
            expect(intersect(l1,l2)).to.be.true;
            expect(disjoint(l1,l2)).to.be.false;
            expect(touch(l1,l2)).to.be.false;
        });
    });
    describe('#Algorithms.Relation.Line2Circle', function() {
        it ('Disjoint case', () => {
            let l = line( point(10,10), vector(1,0) );
            let c = circle( point(0,0), 5 );

            expect(disjoint(l, c)).to.be.true;
            expect(equal(l, c)).to.be.false;
            expect(intersect(l, c)).to.be.false;
            expect(touch(l, c)).to.be.false;
        });
        it ('Touching case', () => {
            let l = line( point(10,10), vector(1,0) );
            let c = circle( point(0,0), 10 );

            expect(equal(l, c)).to.be.false;
            expect(intersect(l, c)).to.be.true;
            expect(disjoint(l, c)).to.be.false;
            expect(touch(l, c)).to.be.true;
        });
        it ('Intersection case', () => {
            let l = line( point(5,5), vector(1,0) );
            let c = circle( point(0,0), 10 );

            expect(equal(l, c)).to.be.false;
            expect(intersect(l, c)).to.be.true;
            expect(disjoint(l, c)).to.be.false;
            expect(touch(l, c)).to.be.false;
        });
    });
    describe('#Algorithms.Relation.Line2Box', function() {
        it ('Intersection case', () => {
            let l = line( point(400,120), vector(0.5,1) );
            let b = circle(point(300,150), 100).box;

            expect(equal(l, b)).to.be.false;
            expect(intersect(l, b)).to.be.true;
            expect(disjoint(l, b)).to.be.false;
            expect(touch(l, b)).to.be.false;
        });
    });

    describe('#Algorithms.Relation.Line2Polygon', function() {
        it ('Disjoint case', () => {
            let l = line( point(400,0), vector(1,0) );
            let points = [point(100, 20), point(250, 75), point(350, 75), point(300, 200), point(170, 200), point(120, 350), point(70, 120) ];
            let p = new Polygon(points);

            expect(disjoint(l, p)).to.be.true;
            expect(equal(l, p)).to.be.false;
            expect(intersect(l, p)).to.be.false;
            expect(touch(l, p)).to.be.false;
        });
        it ('Touching case - touch in one point', () => {
            let l = line( point(100,350), vector(0,1) );
            let points = [point(100, 20), point(250, 75), point(350, 75), point(300, 200), point(170, 200), point(120, 350), point(70, 120) ];
            let p = new Polygon(points);

            expect(equal(l, p)).to.be.false;
            expect(intersect(l, p)).to.be.true;
            expect(disjoint(l, p)).to.be.false;
            expect(touch(l, p)).to.be.true;
        });
        it ('Intersection case - 2 intersection point', () => {
            let l = line( point(100,175), vector(0,1) );
            let points = [point(100, 20), point(250, 75), point(350, 75), point(300, 200), point(170, 200), point(120, 350), point(70, 120) ];
            let p = new Polygon(points);

            let de9im = relate(l, p);
            expect(de9im.I2I.length).to.equal(1);
            expect(de9im.I2I[0]).to.be.instanceof(Flatten.Segment);

            expect(equal(l, p)).to.be.false;
            expect(intersect(l, p)).to.be.true;
            expect(disjoint(l, p)).to.be.false;
            expect(touch(l, p)).to.be.false;
        });
        it('Can properly detect contains / covered relation. Issue #65', () => {
            function rectangle(xmin, ymin, xmax, ymax) {
                const box = new Flatten.Box(xmin, ymin, xmax, ymax);
                return new Flatten.Polygon(box);
            }

            const width = 200;
            const buffer = 60;
            const height = 20;
            let poly1 = rectangle(
                -width / 2 - buffer,
                -buffer,
                width / 2 + buffer,
                height + buffer
            )
                .rotate(Math.PI)
                .translate(Flatten.vector(180, 150));

            let poly2 = rectangle(
                -width / 2 - buffer,
                -buffer,
                width / 2 + buffer,
                height + buffer
            )
                .rotate(Math.PI)
                .translate(Flatten.vector(420, 145));

            let poly3 = rectangle(0, 0, 800, 500);

            const combo = Flatten.BooleanOperations.subtract(
                poly3,
                Flatten.BooleanOperations.unify(poly1, poly2)
            );

            const seg = Flatten.segment(Flatten.point(255, 65), Flatten.point(390, 215));

            //
            // The created combo polygon is a rectangle with a hole. The segment passes over this hole.
            // However the checks still show that the segment is contained in the polygon, even though most of it is over the
            // hole.
            //

            const bContains = combo.contains(seg) // Should be false, but is true
            const bCovered = Flatten.Relations.covered(seg, combo) // Should be false, but is true

            expect(bContains).to.be.false;
            expect(bCovered).to.be.false;
        });
        it('Can properly detect touch relation. Issue #65', () => {
            const poly = new Flatten.Polygon([
                Flatten.point(710, 750),
                Flatten.point(688.9918693812442, 814.656377752172),
                Flatten.point(633.9918693812442, 854.6162167924668),
                Flatten.point(566.0081306187558, 854.616216792467),
                Flatten.point(511.0081306187558, 814.656377752172),
                Flatten.point(490, 750),
                Flatten.point(511.0081306187558, 685.343622247828),
                Flatten.point(566.0081306187558, 645.3837832075332),
                Flatten.point(633.9918693812442, 645.383783207533),
                Flatten.point(688.9918693812442, 685.343622247828)
            ]);
            const seg = Flatten.segment(Flatten.point(600, 900), Flatten.point(620, 570));

            const bTouch = Flatten.Relations.touch(seg, poly); // Should be false, but is true

            expect(bTouch).to.be.false;
        })
    });
    describe('#Algorithms.Relation.Circle2Circle', function() {
        it ('Intersection case', () => {
            const c1 = circle(point(250, 150), 100);
            const c2 = circle(point(350, 150), 50);
            expect(intersect(c1, c2)).to.be.true;
        });
        it ('Disjoint case', () => {
            const c1 = circle(point(250, 150), 100);
            const c2 = circle(point(450, 150), 50);
            expect(disjoint(c1, c2)).to.be.true;
            expect(intersect(c1, c2)).to.be.false;
        });
        it ('Touching case', () => {
            const c1 = circle(point(250, 150), 100);
            const c2 = circle(point(400, 150), 50);
            expect(disjoint(c1, c2)).to.be.false;
            expect(intersect(c1, c2)).to.be.true;
            expect(touch(c1, c2)).to.be.true;
        });
        it ('Contain case', () => {
            const c1 = circle(point(250, 150), 100);
            const c2 = circle(point(275, 150), 50);
            expect(disjoint(c1, c2)).to.be.false;
            expect(intersect(c1, c2)).to.be.true;
            expect(contain(c1, c2)).to.be.true;
        });
        it ('Inside case', () => {
            const c1 = circle(point(250, 150), 100);
            const c2 = circle(point(275, 150), 50);
            expect(disjoint(c1, c2)).to.be.false;
            expect(intersect(c1, c2)).to.be.true;
            expect(inside(c2, c1)).to.be.true;
        });
    });
    describe('#Algorithms.Relation.Polygon2Polygon', function() {
        it('May calculate relations. Disjoint case', () => {
            let p1 = new Polygon(box(0,0,50,100).toSegments());
            let p2 = new Polygon(box(100,50,150,150).toSegments());

            let de9im = relate(p1, p2);

            expect(de9im.I2I.length).to.equal(0);

            expect(disjoint(p1, p2)).to.be.true;
            expect(equal(p1, p2)).to.be.false;
            expect(intersect(p1, p2)).to.be.false;
            expect(touch(p1, p2)).to.be.false;
            expect(inside(p1, p2)).to.be.false;
            expect(contain(p1, p2)).to.be.false;
        });
        it('May calculate relations. Touching from outside case', () => {
            let p1 = new Polygon(box(0,0,50,100).toSegments());
            let p2 = new Polygon(box(50,50,100,150).toSegments());

            let de9im = relate(p1, p2);

            expect(disjoint(p1, p2)).to.be.false;
            expect(equal(p1, p2)).to.be.false;
            expect(intersect(p1, p2)).to.be.true;
            expect(touch(p1, p2)).to.be.true;
            expect(inside(p1, p2)).to.be.false;
            expect(contain(p1, p2)).to.be.false;
            expect(covered(p1,p2)).to.be.false;
            expect(cover(p1,p2)).to.be.false;
        });
        it('May calculate relations. Case of inclusion', () => {
            let p1 = new Polygon(box(0,0,50,100).toSegments());
            let p2 = new Polygon(box(20,20,30,30).toSegments());

            let de9im = relate(p1, p2);

            expect(disjoint(p1, p2)).to.be.false;
            expect(equal(p1, p2)).to.be.false;
            expect(intersect(p1, p2)).to.be.true;
            expect(touch(p1, p2)).to.be.false;
            expect(inside(p1, p2)).to.be.false;
            expect(contain(p1, p2)).to.be.true;
            expect(covered(p1,p2)).to.be.false;
            expect(cover(p1,p2)).to.be.true;
        });
        it('May calculate relations. Case of covered', () => {
            let p1 = new Polygon(box(0,0,50,100).toSegments());
            let p2 = new Polygon(box(20,0,50,30).toSegments());

            let de9im = relate(p1, p2);

            expect(disjoint(p1, p2)).to.be.false;
            expect(equal(p1, p2)).to.be.false;
            expect(intersect(p1, p2)).to.be.true;
            expect(touch(p1, p2)).to.be.false;
            expect(inside(p1, p2)).to.be.false;
            expect(contain(p1, p2)).to.be.true;
            expect(covered(p1,p2)).to.be.false;
            expect(cover(p1,p2)).to.be.true;
        });
        it('May calculate relations. Case of intersected polygons', () => {
            let p1 = new Polygon(box(0,0,50,100).toSegments());
            let p2 = new Polygon(box(20,20,150,200).toSegments());

            let de9im = relate(p1, p2);

            expect(disjoint(p1, p2)).to.be.false;
            expect(equal(p1, p2)).to.be.false;
            expect(intersect(p1, p2)).to.be.true;
            expect(touch(p1, p2)).to.be.false;
            expect(inside(p1, p2)).to.be.false;
            expect(contain(p1, p2)).to.be.false;
            expect(covered(p1,p2)).to.be.false;
            expect(cover(p1,p2)).to.be.false;
        });
        it('Infinite loop error in Relations.relate()  issue #63', () => {
            let polygonA = new Polygon(JSON.parse('[[{"pc":{"x":361.86046511627904,"y":358.1395348837209,"name":"point"},"r":3.7013112186046513,"startAngle":0.8060492302297078,"endAngle":4.549840858948246,"counterClockwise":false,"name":"arc"},{"ps":{"x":361.26146984929693,"y":354.4870139177165,"name":"point"},"pe":{"x":355.3805768669687,"y":355.45145110913296,"name":"point"},"name":"segment"},{"pc":{"x":356.27906976744185,"y":360.93023255813955,"name":"point"},"r":5.551966827906977,"startAngle":4.549840858948247,"endAngle":0.8060492302297152,"counterClockwise":false,"name":"arc"},{"ps":{"x":360.12299918636324,"y":364.936295747922,"name":"point"},"pe":{"x":364.42308472889334,"y":360.8102436769092,"name":"point"},"name":"segment"}]]'));
            let polygonB = new Polygon(JSON.parse('[[{"pc":{"x":356.27906976744185,"y":360.93023255813955,"name":"point"},"r":5.551966827906977,"startAngle":4.569083935001064,"endAngle":1.9978954813868353,"counterClockwise":false,"name":"arc"},{"ps":{"x":353.979265872936,"y":365.9834728754998,"name":"point"},"pe":{"x":359.7242924817441,"y":368.59811887275936,"name":"point"},"name":"segment"},{"pc":{"x":362.7906976744186,"y":361.86046511627904,"name":"point"},"r":7.402622437209303,"startAngle":1.9978954813868424,"endAngle":4.56908393500106,"counterClockwise":false,"name":"arc"},{"ps":{"x":361.7334917412655,"y":354.5337240561091,"name":"point"},"pe":{"x":355.48616531757705,"y":355.4351767630121,"name":"point"},"name":"segment"}]]'));

            let de9im = relate(polygonA, polygonB);

            expect(de9im.intersect()).to.be.true;
        });
        it('Calculate contains relation for multipolygon. Issue #81', function() {
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

            expect(p0.contains(pB)).to.be.false;
            expect(p0.contains(pC)).to.be.true;
        });
    });
});
