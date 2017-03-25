/**
 * Created by Alex Bol on 2/18/2017.
 */
'use strict';

require('jsdom-global')();
let expect = require('chai').expect;
let Flatten = require('../index');
let PlanarSet = require('../data_structures/planar_set');
let fs = require('fs');

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face} = Flatten;

let {point, vector, circle, line, segment, arc} = Flatten;

describe('#Flatten-JS', function() {

    it('Version should be 0.0.1', function() {
        let version = Flatten.version;
        expect(version).to.equal("0.0.1");
    });
    it('Double point tolerance eqals to 0.000001', function() {
        let dp_tol = Flatten.DP_TOL;
        expect(dp_tol).to.equal(0.000001);
    });
    it('Class Point defined', function() {
        expect(Point).to.exist;
    });
    it('Class Vector defined', function() {
        expect(Vector).to.exist;
    });
    it('Class Box defined', function() {
        expect(Box).to.exist;
    });
    it('Class Line defined', function() {
        expect(Line).to.exist;
    });
    it('Class Circle defined', function() {
        expect(Circle).to.exist;
    });
    it('Class Segment defined', function() {
        expect(Segment).to.exist;
    });
    it('Class Arc defined', function() {
        expect(Arc).to.exist;
    });
    it('Class Polygon defined', function() {
        expect(Polygon).to.exist;
    });
    it('Class Face defined', function() {
        expect(Polygon).to.exist;
    });
    it('Class Edge defined', function() {
        expect(Polygon).to.exist;
    });
});

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
    });
    describe('#Flatten.Point.On inclusion queries', function() {
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

describe('#Flatten.Vector', function() {
    it('May create new instance of Vector', function () {
        let vector = new Flatten.Vector(1,1);
        expect(vector).to.be.an.instanceof(Flatten.Vector);
    });
    it('Default constructor creates new Vector(0, 0)', function () {
        let vector = new Flatten.Vector();
        expect(vector).to.deep.equal({x:0,y:0});
    });
    it('Constructor Vector(x, y) creates vector [x, y]', function () {
        let vector = new Flatten.Vector(1,1);
        expect(vector).to.deep.equal({x:1, y:1});
    });
    it('Constructor Vector(ps, pe) creates vector [ps, pe]', function () {
        let ps = new Flatten.Point(1,1);
        let pe = new Flatten.Point(3,2);
        let vector = new Flatten.Vector(ps,pe);
        expect(vector).to.deep.equal({x:2, y:1});
    });
    it('Constructor Vector with illegal parameters throw error', function () {
        let ps = new Flatten.Point(1,1);
        let fn = function() { new Flatten.Vector(ps,2) };
        expect(fn).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
    });
    it('New vector may be constructed by function call', function() {
        expect(vector(point(1,1), point(3,3))).to.deep.equal({x:2, y:2});
    });
    it('Method clone creates new instance of Vector', function() {
        let v1 = new Flatten.Vector(2,1);
        let v2 = v1.clone();
        expect(v2).to.be.an.instanceof(Flatten.Vector);
        expect(v2).to.not.equal(v1);
        expect(v2).to.deep.equal(v1);
    });
    it('Method mutliply vector by scalar', function() {
        let v1 = new Flatten.Vector(2,1);
        let v2 = v1.multiply(2);
        expect(v2).to.deep.equal({x:4,y:2});
    });
    it('Method dot calculates dot product', function() {
        let v1 = new Flatten.Vector(2,0);
        let v2 = new Flatten.Vector(0,2);
        expect(v1.dot(v2)).to.equal(0);
    });
    it('Method cross calculates cross product', function() {
        let v1 = new Flatten.Vector(2,0);
        let v2 = new Flatten.Vector(0,2);
        expect(v1.cross(v2)).to.equal(4);
    });
    it('Method length calculates vector length', function() {
        let v = new Flatten.Vector(1,1);
        expect(v.length).to.equal(Math.sqrt(2));
    });
    it('Get slope - angle in radians between vector and axe x', function() {
        let v1 = new Flatten.Vector(1,1);
        let v2 = new Flatten.Vector(-1,1);
        let v3 = new Flatten.Vector(-1,-1);
        let v4 = new Flatten.Vector(1,-1);
        expect(v1.slope).to.equal(Math.PI/4);
        expect(v2.slope).to.equal(3*Math.PI/4);
        expect(v3.slope).to.equal(5*Math.PI/4);
        expect(v4.slope).to.equal(7*Math.PI/4);
    });
    it('Method normalize returns unit vector', function() {
        let v = new Flatten.Vector(1,1);
        let equals = Flatten.Utils.EQ(v.normalize().length, 1.0);
        expect(equals).to.equal(true);
    });
    it('Method normalize throw error on zero length vector', function () {
        let v = new Flatten.Vector(0,0);
        let fn = function() { v.normalize() };
        expect(fn).to.throw(Flatten.Errors.ZERO_DIVISION);
    });
    it ('Method rotate returns new vector rotated by given angle, positive angle defines rotation in counter clockwise direction', function() {
        let vector = new Flatten.Vector(1,1);
        let angle = Math.PI/2;
        let rotated_vector = vector.rotate(angle);
        let expected_vector = new Flatten.Vector(-1, 1);
        let equals = rotated_vector.equalTo(expected_vector);
        expect(equals).to.equal(true);
    });
    it ('Method rotate rotates clockwise when angle is negative', function() {
        let vector = new Flatten.Vector(1,1);
        let angle = -Math.PI/2;
        let rotated_vector = vector.rotate(angle);
        let expected_vector = new Flatten.Vector(1, -1);
        let equals = rotated_vector.equalTo(expected_vector);
        expect(equals).to.equal(true);
    });
});

describe('#Flatten.Line', function() {
    it('May create new instance of Line', function () {
        let line = new Flatten.Line();
        expect(line).to.be.an.instanceof(Flatten.Line);
    });
    it('Default constructor creates new line that is equal to axe x', function() {
        let line = new Flatten.Line();
        expect(line.pt).to.deep.equal({x:0, y:0});
        expect(line.norm).to.deep.equal({x:0, y:1});
    });
    it('Constructor Line(pt1, pt2) creates line that passes through two points', function () {
        let pt1 = new Flatten.Point(1,1);
        let pt2 = new Flatten.Point(2,2);
        let line = new Flatten.Line(pt1, pt2);
        expect(pt1.on(line)).to.equal(true);
        expect(pt2.on(line)).to.equal(true);
    });
    it('Constructor Line(pt, norm) creates same line as Line(norm,pt)', function () {
        let pt = new Flatten.Point(1,1);
        let norm = new Flatten.Vector(-1,1);
        let line1 = new Flatten.Line(pt, norm);
        let line2 = new Flatten.Line(norm, pt);
        expect(line1.pt).to.deep.equal(line2.pt);
        expect(line1.norm).to.deep.equal(line2.norm);
    });
    it('Illegal Constructor throws error', function () {
        let pt = new Flatten.Point(1, 1);
        let fn1 = function() { new Flatten.Line(pt) };
        let fn2 = function() { new Flatten.Line(pt, '123') };
        let fn3 = function() { new Flatten.Line(pt, pt) };
        let fn4 = function() { new Flatten.Line(pt, new Flatten.Vector(0,0)) };
        expect(fn1).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
        expect(fn2).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
        expect(fn3).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
        expect(fn4).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
    });
    it('New line may be constructed by function call', function() {
        let l = line(point(1,3), point(3,3));
        expect(l.pt).to.deep.equal({x:1, y:3});
        expect(l.norm.equalTo(vector(0,1))).to.equal(true);
    });
    it('Get slope - angle in radians between line and axe x', function() {
        let pt1 = new Flatten.Point(1,1);
        let pt2 = new Flatten.Point(2,2);
        let line = new Flatten.Line(pt1, pt2);
        expect(line.slope).to.equal(Math.PI/4);
    });
    it('Method contains returns true if point belongs to the line', function () {
        let pt1 = new Flatten.Point(1,1);
        let pt2 = new Flatten.Point(2,2);
        let pt3 = new Flatten.Point(3,3);
        let line = new Flatten.Line(pt1, pt2);
        expect(line.contains(pt3)).to.equal(true);
    });
    describe('#Flatten.Line.intersect methods return array of intersection points if intersection exist', function() {
        it('Line to line intersection ', function () {
            let line1 = new Flatten.Line(new Flatten.Point(0, 1), new Flatten.Point(2, 1));
            let line2 = new Flatten.Line(new Flatten.Point(1, 0), new Flatten.Point(1, 2));
            let ip = line1.intersect(line2);
            let expected_ip = new Flatten.Point(1, 1);
            expect(ip.length).to.equal(1);

            let equals = ip[0].equalTo(expected_ip);
            expect(equals).to.equal(true);
        });
        it('Method intersect returns zero length array if intersection does not exist', function () {
            let line1 = new Flatten.Line(new Flatten.Point(0, 1), new Flatten.Point(2, 1));
            let line2 = new Flatten.Line(new Flatten.Point(0, 2), new Flatten.Point(2, 2));
            let ip = line1.intersect(line2);
            expect(ip.length).to.equal(0);
        });
        it('Line to circle intersection ', function () {
            let line = new Flatten.Line(new Flatten.Point(-1, 1), new Flatten.Point(1, 1));
            let circle = new Flatten.Circle(new Flatten.Point(0, 0), 3);
            let ip = line.intersect(circle);
            expect(ip.length).to.equal(2);
            expect(ip[0].y).to.equal(1);
            expect(ip[1].y).to.equal(1);
        });
    });

});

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
    it('Method contains returns true if point belongs to the circle', function () {
        let pt = new Flatten.Point(0,1);
        let circle = new Flatten.Circle(new Flatten.Point(0,0), 2);
        expect(circle.contains(pt)).to.equal(true);
    });
    it('Can return circle bounding box', function () {
        let circle = new Flatten.Circle(new Flatten.Point(0,0), 2);
        expect(circle.box).to.deep.equal({xmin:-2, ymin:-2, xmax:2, ymax:2});
    });

});

describe('#Flatten.Segment', function() {
    it('May create new instance of Segment', function () {
        let segment = new Flatten.Segment();
        expect(segment).to.be.an.instanceof(Flatten.Segment);
    });
    it('Constructor Segment(ps, pe) creates new instance of Segment', function () {
        let ps = new Flatten.Point(1,1);
        let pe = new Flatten.Point(2,3);
        let segment = new Flatten.Segment(ps, pe);
        expect(segment.start).to.deep.equal({x:1, y:1});
        expect(segment.end).to.deep.equal({x:2, y:3});
    });
    it('New segment may be constructed by function call', function() {
        expect(segment(point(1,1), point(2,3))).to.deep.equal(new Flatten.Segment(new Flatten.Point(1,1), new Flatten.Point(2,3)));
    });
    it('Method clone copy to a new instance of Segment', function () {
        let ps = new Flatten.Point(1,1);
        let pe = new Flatten.Point(2,3);
        let segment = new Flatten.Segment(ps, pe);
        expect(segment.clone()).to.deep.equal(segment);
    });
    it('Method length returns length of segment', function () {
        let ps = new Flatten.Point(1,1);
        let pe = new Flatten.Point(5,4);
        let segment = new Flatten.Segment(ps, pe);
        expect(segment.length).to.equal(5.0);
    });
    it('Method box returns bounding box of segment', function () {
        let ps = new Flatten.Point(1,1);
        let pe = new Flatten.Point(5,4);
        let segment = new Flatten.Segment(ps, pe);
        expect(segment.box).to.deep.equal({xmin:1, ymin:1, xmax:5, ymax:4});
    });
    it('Method slope returns slope of segment', function () {
        let ps = new Flatten.Point(1,1);
        let pe = new Flatten.Point(5,5);
        let segment = new Flatten.Segment(ps, pe);
        expect(segment.slope).to.equal(Math.PI/4);
    });
    it('Method contains returns true if point belongs to segment', function () {
        let ps = new Flatten.Point(-2,2);
        let pe = new Flatten.Point(2,2);
        let segment = new Flatten.Segment(ps, pe);
        let pt = new Flatten.Point(1,2);
        expect(segment.contains(pt)).to.equal(true);
    });
    describe('#Flatten.Segment.Intersect', function() {
       it('Intersection with Segment - not parallel segments case (one point)', function () {
           let segment1 = new Flatten.Segment(new Flatten.Point(0,0), new Flatten.Point(2,2));
           let segment2 = new Flatten.Segment(new Flatten.Point(0,2), new Flatten.Point(2,0));
           expect(segment1.intersect(segment2).length).to.equal(1);
           expect(segment1.intersect(segment2)[0]).to.deep.equal({x:1, y:1});
       });
        it('Intersection with Segment - overlapping segments case (two points)', function () {
            let segment1 = new Flatten.Segment(new Flatten.Point(0,0), new Flatten.Point(2,2));
            let segment2 = new Flatten.Segment(new Flatten.Point(3,3), new Flatten.Point(1,1));
            expect(segment1.intersect(segment2).length).to.equal(2);
            expect(segment1.intersect(segment2)[0]).to.deep.equal({x:2, y:2});
            expect(segment1.intersect(segment2)[1]).to.deep.equal({x:1, y:1});
        });
        it('Intersection with Segment - boxes intersecting, segments not intersecting', function () {
            let segment1 = new Flatten.Segment(new Flatten.Point(0,0), new Flatten.Point(2,2));
            let segment2 = new Flatten.Segment(new Flatten.Point(0.5,1.5), new Flatten.Point(-2,-4));
            expect(segment1.box.intersect(segment2.box)).to.equal(true);
            expect(segment1.intersect(segment2).length).to.equal(0);
        });
        it('Intersection with Segment - boxes not intersecting, quick reject', function () {
            let segment1 = new Flatten.Segment(new Flatten.Point(0,0), new Flatten.Point(2,2));
            let segment2 = new Flatten.Segment(new Flatten.Point(-0.5,2.5), new Flatten.Point(-2,-4));
            expect(segment1.box.notIntersect(segment2.box)).to.equal(true);
            expect(segment1.intersect(segment2).length).to.equal(0);
        });
        it('Intersection with Line - not parallel segments case (one point)', function () {
            let segment = new Flatten.Segment(new Flatten.Point(0,0), new Flatten.Point(2,2));
            let line = new Flatten.Line(new Flatten.Point(0,2), new Flatten.Point(2,0));
            expect(segment.intersect(line).length).to.equal(1);
            expect(segment.intersect(line)[0]).to.deep.equal({x:1, y:1});
        });
        it('Intersection with Line - segment lays on line case (two points)', function () {
            let segment = new Flatten.Segment(0,0,2,2);
            let line = new Flatten.Line(new Flatten.Point(3,3), new Flatten.Point(1,1));
            expect(segment.intersect(line).length).to.equal(2);
            expect(segment.intersect(line)[0]).to.deep.equal({x:0, y:0});
            expect(segment.intersect(line)[1]).to.deep.equal({x:2, y:2});
        });
        it('Intersection with Circle', function () {
            let segment = new Flatten.Segment(0,0,2,2);
            let circle = new Flatten.Circle(new Flatten.Point(0,0), 1);
            let ip_expected = new Flatten.Point(Math.sqrt(2)/2, Math.sqrt(2)/2);
            expect(segment.intersect(circle).length).to.equal(1);
            expect(segment.intersect(circle)[0].equalTo(ip_expected)).to.equal(true);
        });
        it('Intersection with Circle - case of tangent', function () {
            let segment = new Flatten.Segment(-2,2,2,2);
            let circle = new Flatten.Circle(new Flatten.Point(0,0), 2);
            let ip_expected = new Flatten.Point(0, 2);
            expect(segment.intersect(circle).length).to.equal(1);
            expect(segment.intersect(circle)[0].equalTo(ip_expected)).to.equal(true);
        });
    });
});

describe('#Flatten.Arc', function() {
    it('May create new instance of Arc', function () {
        let arc = new Flatten.Arc();
        expect(arc).to.be.an.instanceof(Flatten.Arc);
    });
    it('Default constructor constructs full circle unit arc with zero center and sweep 2PI CW', function() {
        let arc = new Flatten.Arc();
        expect(arc.pc).to.deep.equal({x: 0, y: 0});
        expect(arc.sweep).to.equal(Flatten.PIx2);
        expect(arc.counterClockwise).to.equal(true);
    });
    it('Constructor can create different CCW arcs if counterClockwise=true', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 1, Math.PI/4, 3*Math.PI/4, true);
        expect(arc.sweep).to.equal(Math.PI/2);
    });
    it('Constructor can create different CCW arcs if counterClockwise=true', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 1, 3*Math.PI/4, Math.PI/4, true);
        expect(arc.sweep).to.equal(3*Math.PI/2);
    });
    it('Constructor can create different CCW arcs if counterClockwise=true', function () {
        let arc = new Flatten.Arc(new Flatten.Point(3,4), 1, Math.PI/4, -Math.PI/4, true);
        expect(arc.sweep).to.equal(3*Math.PI/2);
    });
    it('Constructor can create different CCW arcs if counterClockwise=true', function () {
        let arc = new Flatten.Arc(new Flatten.Point(2,-2), 1, -Math.PI/4, Math.PI/4, true);
        expect(arc.sweep).to.equal(Math.PI/2);
    });
    it('Constructor can create different CW arcs if counterClockwise=false', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 1, Math.PI/4, 3*Math.PI/4, false);
        expect(arc.sweep).to.equal(3*Math.PI/2);
    });
    it('Constructor can create different CW arcs if counterClockwise=false', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 1, 3*Math.PI/4, Math.PI/4, false);
        expect(arc.sweep).to.equal(Math.PI/2);
    });
    it('Constructor can create different CW arcs if counterClockwise=false', function () {
        let arc = new Flatten.Arc(new Flatten.Point(3,4), 1, Math.PI/4, -Math.PI/4, false);
        expect(arc.sweep).to.equal(Math.PI/2);
    });
    it('Constructor can create different CW arcs if counterClockwise=false', function () {
        let arc = new Flatten.Arc(new Flatten.Point(2,-2), 1, -Math.PI/4, Math.PI/4, false);
        expect(arc.sweep).to.equal(3*Math.PI/2);
    });
    it('In order to construct full circle, set end_angle = start_angle + 2pi', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 5, Math.PI, 3*Math.PI, true);
        expect(arc.sweep).to.equal(2*Math.PI);
    });
    it('Constructor creates zero arc when end_angle = start_angle', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 5, Math.PI/4, Math.PI/4, true);
        expect(arc.sweep).to.equal(0);
    });
    it('New arc may be constructed by function call', function() {
        expect(arc(point(), 5, Math.PI, 3*Math.PI, true)).to.deep.equal(new Flatten.Arc(new Flatten.Point(), 5, Math.PI, 3*Math.PI, true));
    });
    it('Getter arc.start returns start point', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 1, -Math.PI/4, Math.PI/4, true);
        expect(arc.start).to.deep.equal({x:Math.cos(-Math.PI/4),y:Math.sin(-Math.PI/4)});
    });
    it('Getter arc.end returns end point', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 1, -Math.PI/4, Math.PI/4, true);
        expect(arc.end).to.deep.equal({x:Math.cos(Math.PI/4),y:Math.sin(Math.PI/4)});
    });
    it('Getter arc.length returns arc length', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 1, -Math.PI/4, Math.PI/4, true);
        expect(arc.length).to.equal(Math.PI/2);
    });
    it('Getter arc.length returns arc length', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 5, -Math.PI/4, Math.PI/4, false);
        expect(arc.length).to.equal(5*3*Math.PI/2);
    });
    it('Getter arc.box returns arc bounding box, CCW case', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 1, -Math.PI/4, Math.PI/4, true);
        expect(Flatten.Utils.EQ(arc.box.xmin,Math.sqrt(2)/2)).to.equal(true);
        expect(Flatten.Utils.EQ(arc.box.ymin,-Math.sqrt(2)/2)).to.equal(true);
        expect(Flatten.Utils.EQ(arc.box.xmax,1)).to.equal(true);
        expect(Flatten.Utils.EQ(arc.box.ymax,Math.sqrt(2)/2)).to.equal(true);
    });
    it('Getter arc.box returns arc bounding box, CW case', function () {
        let arc = new Flatten.Arc(new Flatten.Point(), 1, -Math.PI/4, Math.PI/4, false);
        expect(Flatten.Utils.EQ(arc.box.xmin,-1)).to.equal(true);
        expect(Flatten.Utils.EQ(arc.box.ymin,-1)).to.equal(true);
        expect(Flatten.Utils.EQ(arc.box.xmax,Math.sqrt(2)/2)).to.equal(true);
        expect(Flatten.Utils.EQ(arc.box.ymax,1)).to.equal(true);
    });
    describe('#Flatten.Arc.breakToFunctional', function() {
        it('Case 1. No intersection with axes', function () {
            let arc = new Flatten.Arc(new Flatten.Point(), 1, Math.PI/6, Math.PI/3, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).to.equal(1);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, arc.endAngle)).to.equal(true);
        });
        it('Case 2. One intersection, two sub arcs', function () {
            let arc = new Flatten.Arc(new Flatten.Point(), 1, Math.PI/6, 3*Math.PI/4, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).to.equal(2);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, Math.PI/2)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[1].startAngle, Math.PI/2)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[1].endAngle, arc.endAngle)).to.equal(true);
        });
        it('Case 3. One intersection, two sub arcs, CW', function () {
            let arc = new Flatten.Arc(new Flatten.Point(), 1, Math.PI/6, -Math.PI/6, false);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).to.equal(2);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, 0)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[1].startAngle, 0)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[1].endAngle, arc.endAngle)).to.equal(true);
        });
        it('Case 4. One intersection, start at extreme point', function () {
            let arc = new Flatten.Arc(new Flatten.Point(), 1, Math.PI/2, 3*Math.PI/4, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).to.equal(1);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, Math.PI/2)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, arc.endAngle)).to.equal(true);
        });
        it('Case 5. 2 intersections, 3 parts', function () {
            let arc = new Flatten.Arc(new Flatten.Point(), 1, Math.PI/4, 5*Math.PI/4, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).to.equal(3);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, Math.PI/2)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[1].endAngle, Math.PI)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[2].endAngle, arc.endAngle)).to.equal(true);
        });
        it('Case 6. 2 intersections, 3 parts, CW', function () {
            let arc = new Flatten.Arc(new Flatten.Point(), 1, 3*Math.PI/4, -Math.PI/4, false);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).to.equal(3);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, Math.PI/2)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[1].startAngle, Math.PI/2)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[1].endAngle, 0)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[2].startAngle, 0)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[2].endAngle, arc.endAngle)).to.equal(true);
        });
        it('Case 7. 2 intersections on extreme points, 1 parts, CW', function () {
            let arc = new Flatten.Arc(new Flatten.Point(), 1, Math.PI/2, 0, false);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).to.equal(1);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, Math.PI/2)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, 0)).to.equal(true);
        });
        it('Case 7. 4 intersections on extreme points, 5 parts', function () {
            let arc = new Flatten.Arc(new Flatten.Point(), 1, Math.PI/3, Math.PI/6, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).to.equal(5);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).to.equal(true);
            expect(Flatten.Utils.EQ(f_arcs[4].endAngle, arc.endAngle)).to.equal(true);
        });
        it('Case 8. Full circle, 4 intersections on extreme points, 4 parts', function () {
            let arc = new Flatten.Arc(new Flatten.Point(), 1, Math.PI/2, Math.PI/2 + 2*Math.PI, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).to.equal(4);
        });
    });
    describe('#Flatten.Arc.intersect', function() {
        it('Intersect arc with segment', function() {
            let arc = new Arc(point(), 1, 0, Math.PI, true);
            let segment = new Segment(-1, 0.5, 1, 0.5);
            let ip = arc.intersect(segment);
            expect(ip.length).to.equal(2);
        });
        it('Intersect arc with arc', function() {
            let arc1 = new Arc(point(), 1, 0, Math.PI, true);
            let arc2 = new Arc(point(0,1), 1, Math.PI, 2*Math.PI, true);
            let ip = arc1.intersect(arc2);
            expect(ip.length).to.equal(2);
        });
        it('Intersect arc with arc, case of touching', function () {
            let arc1 = new Arc(point(), 1, 0, Math.PI, true);
            let arc2 = new Arc(point(0,2), 1, -Math.PI/4, -3*Math.PI*4, false);
            let ip = arc1.intersect(arc2);
            expect(ip.length).to.equal(1);
            expect(ip[0]).to.deep.equal({x:0,y:1});
        });
        it('Intersect arc with arc, overlapping case', function () {
            let arc1 = new Arc(point(), 1, 0, Math.PI, true);
            let arc2 = new Arc(point(), 1, -Math.PI/2, Math.PI/2, true);
            let ip = arc1.intersect(arc2);
            expect(ip.length).to.equal(2);
            expect(ip[0].equalTo(point(1,0))).to.equal(true);
            expect(ip[1].equalTo(point(0,1))).to.equal(true);
        });
        it('Intersect arc with arc, overlapping case, 4 points', function () {
            let arc1 = new Arc(point(), 1, -Math.PI/4, 5*Math.PI/4, true);
            let arc2 = new Arc(point(), 1, Math.PI/4, 3*Math.PI/4, false);
            let ip = arc1.intersect(arc2);
            expect(ip.length).to.equal(4);
        });
    });
    it('Calculate signed area under circular arc, full circle case, CCW', function() {
        let arc = new Arc(point(0,1), 1, 0, 2*Math.PI, true);
        let area = arc.definiteIntegral();
        expect( Flatten.Utils.EQ(area, -Math.PI)).to.equal(true);
    });
    it('Calculate signed area under circular arc, full circle case, CW', function() {
        let arc = new Arc(point(0,1), 1, 0, 2*Math.PI, false);
        let area = arc.definiteIntegral();
        expect( Flatten.Utils.EQ(area, Math.PI)).to.equal(true);
    });
});

describe('#Flatten.Box', function() {
    it('May create new instance of Box', function () {
        let box = new Flatten.Box();
        expect(box).to.be.an.instanceof(Flatten.Box);
    });
    it('Method intersect returns true if two boxes intersected', function () {
        let box1 = new Flatten.Box(1, 1, 3, 3);
        let box2 = new Flatten.Box(-3, -3, 2, 2);
        expect(box1.intersect(box2)).to.equal(true);
    });
    it('Method expand expands current box with other', function () {
        let box1 = new Flatten.Box(1, 1, 3, 3);
        let box2 = new Flatten.Box(-3, -3, 2, 2);
        expect(box1.merge(box2)).to.deep.equal({xmin:-3, ymin:-3, xmax:3, ymax:3});
    });
});




