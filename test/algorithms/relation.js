'use strict';

import { expect } from 'chai';
import Flatten, {multiline} from '../../index';
import {relate, disjoint, equal, intersect, touch, inside, contain, covered, cover} from '../../src/algorithms/relation';
import {intersectLine2Polygon} from "../../src/algorithms/intersection";

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} = Flatten;

let {point, vector, circle, line, segment, arc, ray, box} = Flatten;


describe('#Algorithms.Relation', function() {
    it('Function relate defined', () => {
        expect(relate).to.exist;
        expect(relate).to.be.a('function');
    });
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
    describe('#Algorithms.Relation.Polygoon2Polygon', function() {
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
    });
});
