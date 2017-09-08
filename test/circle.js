'use strict';

let expect = require('chai').expect;
let Flatten = require('../index');

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} = Flatten;

let {point, vector, circle, line, segment, arc, ray} = Flatten;

describe('#Flatten.Circle', function() {
    it('May create new instance of Circle', function () {
        let circle = new Flatten.Circle(new Flatten.Point(0,0), 1);
        expect(circle).to.be.an.instanceof(Flatten.Circle);
    });
    it('Constructor Circle(pt, r) creates new circle', function() {
        let circle = new Flatten.Circle(new Flatten.Point(1,1), 2);
        expect(circle.pc).to.deep.equal({x:1, y:1});
        expect(circle.r).to.equal(2);
    });
    it('New circle may be constructed by function call', function() {
        expect(circle(point(1,1), 3)).to.deep.equal(new Flatten.Circle(new Flatten.Point(1,1), 3));
    });
    it('May create new instance by clone', function() {
        let circle = new Flatten.Circle(new Flatten.Point(1,1), 2);
        let circle1 = circle.clone();
        expect(circle1).to.deep.equal(circle);
        expect(circle1 === circle).to.be.false;
    });
    it('Method contains returns true if point belongs to the circle', function () {
        let pt = new Flatten.Point(0,1);
        let circle = new Flatten.Circle(new Flatten.Point(0,0), 2);
        expect(circle.contains(pt)).to.equal(true);
    });
    it('Can return circle bounding box', function () {
        let circle = new Flatten.Circle(new Flatten.Point(0,0), 2);
        expect(circle.box).to.deep.equal({xmin:-2, ymin:-2, xmax:2, ymax:2});
    });
    it('Can transform circle into closed CCW arc', function () {
        let circle = new Flatten.Circle(new Flatten.Point(0,0), 2);
        let arc = circle.toArc(true);
        expect(arc.sweep).to.equal(Flatten.PIx2);
        expect(arc.start.equalTo(point(-2,0))).to.be.true;
        expect(arc.end.equalTo(point(-2,0))).to.be.true;
    });
    it('Can transform circle into closed CW arc', function () {
        let circle = new Flatten.Circle(new Flatten.Point(0,0), 2);
        let arc = circle.toArc(false);
        expect(arc.sweep).to.equal(Flatten.PIx2);
        expect(arc.start.equalTo(point(-2,0))).to.be.true;
        expect(arc.end.equalTo(point(-2,0))).to.be.true;
    });
    it('Can intersect circle with line. Case 1 no intersection', function() {
        let circle = new Flatten.Circle(new Flatten.Point(0, 0), 2);
        let line = new Flatten.Line(point(3, 3), vector(0, 1));
        let ip = circle.intersect(line);
        expect(ip.length).to.equal(0)
    });
    it('Can intersect circle with line. Case 2 Touching', function() {
        let circle = new Flatten.Circle(new Flatten.Point(0, 0), 2);
        let line = new Flatten.Line(point(3, 2), vector(0, 1));
        let ip = circle.intersect(line);
        expect(ip.length).to.equal(1);
        expect(ip[0]).to.deep.equal({x:0,y:2});
    });
    it('Can intersect circle with line. Case 3 Two points', function() {
        let circle = new Flatten.Circle(new Flatten.Point(0, 0), 2);
        let line = new Flatten.Line(point(1, 1), vector(0, 1));
        let ip = circle.intersect(line);
        expect(ip.length).to.equal(2);
    });
    it('Can intersect circle with segment. One point', function() {
        let circle = new Flatten.Circle(new Flatten.Point(0, 0), 2);
        let segment = new Flatten.Segment(point(1, 1), point(3,3));
        let ip = circle.intersect(segment);
        expect(ip.length).to.equal(1);
    });
    it('Can intersect circle with segment.2 points', function() {
        let circle = new Flatten.Circle(new Flatten.Point(0, 0), 2);
        let segment = new Flatten.Segment(point(-3, -3), point(3, 3));
        let ip = circle.intersect(segment);
        expect(ip.length).to.equal(2);
    });
    it('Can intersect circle with arc', function() {
        let circle = new Flatten.Circle(new Flatten.Point(0, 0), 2);
        let circle1 = new Flatten.Circle(new Flatten.Point(0, 1), 2);
        let arc = circle1.toArc();
        let ip = circle.intersect(arc);
        expect(ip.length).to.equal(2);
    });
    it('Can intersect circle with circle - quick reject', function() {
        let circle1 = new Flatten.Circle(new Flatten.Point(0, 0), 2);
        let circle2 = new Flatten.Circle(new Flatten.Point(5, 4), 2);
        let ip = circle1.intersect(circle2);
        expect(ip.length).to.equal(0);
    });
    it('Can intersect circle with circle - no intersection r1 + r2 < dist', function() {
        let circle1 = new Flatten.Circle(new Flatten.Point(0, 0), 2);
        let circle2 = new Flatten.Circle(new Flatten.Point(2, 2), 0.5);
        let ip = circle1.intersect(circle2);
        expect(ip.length).to.equal(0);
    });
    it('Can intersect circle with circle - no intersection: one inside another', function() {
        let circle1 = new Flatten.Circle(new Flatten.Point(0, 0), 4);
        let circle2 = new Flatten.Circle(new Flatten.Point(0, 0), 3);
        let ip = circle1.intersect(circle2);
        expect(ip.length).to.equal(0);
    });
    it('Can intersect circle with circle - same circle, one intersection, leftmost point', function() {
        let circle = new Flatten.Circle(new Flatten.Point(0, 0), 4);
        let ip = circle.intersect(circle.clone());
        expect(ip.length).to.equal(1);
        expect(ip[0]).to.deep.equal({x:-4,y:0});
    });
    it('Can intersect circle with circle - degenerated circle', function() {
        let circle1 = new Flatten.Circle(new Flatten.Point(0, 0), 2);
        let circle2 = new Flatten.Circle(new Flatten.Point(2, 0), 0);
        let ip = circle1.intersect(circle2);
        expect(ip.length).to.equal(0);
    });
});

