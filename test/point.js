/**
 * Created by Alex Bol on 9/8/2017.
 */
'use strict';

let expect = require('chai').expect;
let Flatten = require('../index');

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} = Flatten;

let {point, vector, circle, line, segment, arc, ray} = Flatten;

describe('#Flatten.Point', function() {
    it('May create new Point', function() {
        let point = new Flatten.Point();
        expect(point).to.be.an.instanceof(Flatten.Point);
    });
    it('Default constructor creates new (0,0) point', function() {
        let point = new Flatten.Point();
        expect(point).to.deep.equal({x:0, y:0});
    });
    it('New point may be constructed by function call', function() {
        expect(point(1,3)).to.deep.equal({x:1, y:3});
    });
    it('Method clone creates new instance of Point', function() {
        let point1 = new Flatten.Point(2,1);
        let point2 = point1.clone();
        expect(point2).to.be.an.instanceof(Flatten.Point);
        expect(point2).to.not.equal(point1);
        expect(point2).to.deep.equal(point1);
    });
    it('Method equalTo return true if points are equal', function() {
        let point = new Flatten.Point();
        let zero = new Flatten.Point(0,0);
        let equals = point.equalTo(zero);
        expect(equals).to.equal(true);
    });
    it('Method equalTo return true if points are equal up to DP_TOL tolerance', function() {
        let point1 = new Flatten.Point(1,1);
        let point2 = new Flatten.Point(1,1.000000999);
        let equals = point1.equalTo(point2);
        expect(equals).to.equal(true);
    });
    it ('Method translate returns new point translated by (dx, dy)', function() {
        let point = new Flatten.Point(1,1);
        let tpoint = point.translate(2,0);
        expect(tpoint).to.deep.equal({x:3,y:1});
    });
    it ('Method rotates returns new point rotated by default around (0.0), counter clockwise', function() {
        let point = new Flatten.Point(1,1);
        let rotated_point = point.rotate(Math.PI/2);
        let expected_point = new Flatten.Point(-1, 1);
        let equals = rotated_point.equalTo(expected_point);
        expect(equals).to.equal(true);
    });
    it ('Method rotate returns new point rotated around center, counter clockwise', function() {
        let point = new Flatten.Point(2,1);
        let center = new Flatten.Point(1,1);
        let rotated_point = point.rotate(Math.PI/2, center);
        let expected_point = new Flatten.Point(1, 2);
        let equals = rotated_point.equalTo(expected_point);
        expect(equals).to.equal(true);
    });
    it ('Method translate returns new point translated by vector', function() {
        let point = new Flatten.Point(1,1);
        let v = new Flatten.Vector(2,0);
        let tpoint = point.translate(v);
        expect(tpoint).to.deep.equal({x:3,y:1});
    });
    it('Method translate with illegal parameters throws error', function () {
        let point = new Flatten.Point(1,1);
        let v = new Flatten.Vector(2,0);
        let fn = function() { return point.translate(v,1) };
        expect(fn).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
    });
    it ('Method returns projection point on given line', function() {
        let anchor = new Flatten.Point(1,1);
        let norm = new Flatten.Vector(0,1);
        let line = new Flatten.Line(anchor, norm);
        let pt = new Flatten.Point(2,2);
        let proj_pt = pt.projectionOn(line);
        expect(proj_pt).to.deep.equal({x:2,y:1});
    });
    describe('#Flatten.Point.Distance methods', function() {
        it('Method distanceTo return distance to other point ', function() {
            let point1 = new Flatten.Point(1,1);
            let point2 = new Flatten.Point(2,2);
            expect(point1.distanceTo(point2)).to.equal(Math.sqrt(2));
        });
        it('Method distanceTo calculates distance to given line', function () {
            let anchor = new Flatten.Point(1, 1);
            let norm = new Flatten.Vector(0, 1);
            let line = new Flatten.Line(anchor, norm);
            let pt = new Flatten.Point(2, 2);
            expect(pt.distanceTo(line)).to.equal(1);
        });
        it('Method distanceTo returns distance to segment', function () {
            let ps = new Flatten.Point(-2,2);
            let pe = new Flatten.Point(2,2);
            let segment = new Flatten.Segment(ps, pe);
            let pt1 = new Flatten.Point(2,4);            /* point in segment scope */
            let pt2 = new Flatten.Point(-5,2);           /* point is out of segment scope */
            let pt3 = new Flatten.Point(6,2);            /* point is out of segment scope */
            expect(pt1.distanceTo(segment)).to.equal(2);
            expect(pt2.distanceTo(segment)).to.equal(3);
            expect(pt3.distanceTo(segment)).to.equal(4);
        });
        it('Method distanceTo returns distance to circle', function () {
            let circle = new Flatten.Circle(new Flatten.Point(), 3);
            let pt1 = new Flatten.Point(5,0);
            let pt2 = new Flatten.Point(0,2);
            expect(pt1.distanceTo(circle)).to.equal(2);
            expect(pt2.distanceTo(circle)).to.equal(1);
        });
        it('Method distanceTo returns distance to arc', function () {
            let circle = new Flatten.Circle(new Flatten.Point(), 3);
            let arc = circle.toArc()
            let pt1 = new Flatten.Point(5,0);
            let pt2 = new Flatten.Point(0,2);
            expect(pt1.distanceTo(arc)).to.equal(2);
            expect(pt2.distanceTo(arc)).to.equal(1);
        });
    });
    describe('#Flatten.Point.On inclusion queries', function() {
        it('Method "on" returns true if point checked with same points', function () {
            let pt = new Flatten.Point(0, 1);
            expect(pt.on(pt.clone())).to.equal(true);
        });
        it('Method "on" returns true if point belongs to line', function () {
            let pt1 = new Flatten.Point(1, 1);
            let pt2 = new Flatten.Point(2, 2);
            let pt3 = new Flatten.Point(3, 3);
            let line = new Flatten.Line(pt1, pt2);
            expect(pt3.on(line)).to.equal(true);
        });
        it('Method "on" returns true if point belongs to circle', function () {
            let pt = new Flatten.Point(0, 1);
            let circle = new Flatten.Circle(new Flatten.Point(0, 0), 2);
            expect(pt.on(circle)).to.equal(true);
        });
        it('Method "on" returns true if point belongs to segment', function () {
            let pt1 = new Flatten.Point(1, 1);
            let pt2 = new Flatten.Point(2, 2);
            let pt3 = new Flatten.Point(3, 3);
            let segment = new Flatten.Line(pt1, pt3);
            expect(pt2.on(segment)).to.equal(true);
        });
        it('Method "on" returns true if point belongs to arc', function () {
            let arc = new Flatten.Arc(new Flatten.Point(), 1, -Math.PI/4, Math.PI/4, false);
            let pt = new Flatten.Point(-1,0);
            expect(pt.on(arc)).to.equal(true);
        })
    });
    it('Method leftTo returns true if point is on the "left" semi plane, which is the side of the normal vector', function() {
        let line = new Flatten.Line(new Flatten.Point(-1, -1), new Flatten.Point(1,1));
        let pt1 = new Flatten.Point(-2,2);
        let pt2 = new Flatten.Point(3,1);
        expect(pt1.leftTo(line)).to.equal(true);
        expect(pt2.leftTo(line)).to.equal(false);
    });
});
