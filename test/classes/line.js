/**
 * Created by Alex Bol on 9/8/2017.
 */
'use strict';

import { expect } from 'chai';
import Flatten from '../../index';

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} = Flatten;

let {point, vector, circle, line, segment, arc, ray} = Flatten;

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
    it('Constructor with illegal parameters throws error. Case 1', function () {
        let pt = new Flatten.Point(1, 1);
        let fn1 = function() { new Flatten.Line(pt) };
        expect(fn1).to.throw(ReferenceError);
    });
    it('Constructor with illegal parameters throws error. Case 2', function () {
        let pt = new Flatten.Point(1, 1);
        let fn2 = function() { new Flatten.Line(pt, '123') };
        expect(fn2).to.throw(ReferenceError);
    });
    it('Constructor with illegal parameters throws error. Case 3', function () {
        let pt = new Flatten.Point(1, 1);
        let fn3 = function() { new Flatten.Line(pt, pt) };
        expect(fn3).to.throw(ReferenceError);
    });
    it('Constructor with zero vector throws error', function () {
        let fn1 = function() { new Flatten.Line(point(1, 1), vector(0,0)) };
        let fn2 = function() { new Flatten.Line(vector(0,0), point(1, 1) ) };
        expect(fn1).to.throw(ReferenceError);
        expect(fn2).to.throw(ReferenceError);
    });
    it('New line may be constructed by function call', function() {
        let l = line(point(1,3), point(3,3));
        expect(l.pt).to.deep.equal({x:1, y:3});
        expect(l.norm.equalTo(vector(0,1))).to.equal(true);
    });
    it('May create new instance by clone', function() {
        let l = line(point(1,3), point(3,3));
        let l1 = l.clone();
        expect(l1).to.deep.equal(l);
        expect(l1 === l).to.be.false;
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
    it('May split line by point into array of two rays',function() {
        let pt = point(100,200);
        let norm = vector(0,1);
        let l = line(pt,norm);
        let split_pt = point(300,200);
        let res = l.split(split_pt);
        expect(res[0]).to.deep.equal(ray(split_pt, norm.invert()));
        expect(res[1]).to.deep.equal(ray(split_pt, norm));
    });
    it('May return 1-dim coordinate of point on line', function() {
        let pt = point(100,200);
        let norm = vector(0,1);
        let l = line(pt,norm);

        expect(l.coord( point(300,200) )).to.equal(300);
        expect(l.coord( point(0,200) )).to.equal(0);
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
        it('Line to circle intersection - horizontal line, line constricted with 2 points', function () {
            let line = new Flatten.Line(new Flatten.Point(-1, 1), new Flatten.Point(1, 1));
            let circle = new Flatten.Circle(new Flatten.Point(0, 0), 3);
            let ip = line.intersect(circle);
            expect(ip.length).to.equal(2);
            expect(ip[0].y).to.equal(1);
            expect(ip[1].y).to.equal(1);
        });
        it('Line to circle intersection - horizontal line, line constructed with point and vector ', function () {
            let line = new Flatten.Line(new Flatten.Point(-1, 1), new Flatten.Vector(0, 3));
            let circle = new Flatten.Circle(new Flatten.Point(0, 0), 3);
            let ip = line.intersect(circle);
            expect(ip.length).to.equal(2);
            expect(ip[0].y).to.equal(1);
            expect(ip[1].y).to.equal(1);
        });
        it('Line to circle intersection - diagonal line, line constructed with point and vector ', function () {
            let line = new Flatten.Line(new Flatten.Point(-3, -3), new Flatten.Vector(-1, 1));
            let circle = new Flatten.Circle(new Flatten.Point(0, 0), 1);
            let ip = line.intersect(circle);
            const sqrt_2_2 = Math.sqrt(2)/2.;
            expect(ip.length).to.equal(2);
            expect(ip[0].equalTo(point(-sqrt_2_2,-sqrt_2_2))).to.be.true
            expect(ip[1].equalTo(point(sqrt_2_2,sqrt_2_2))).to.be.true
        });
        it('Line to arc intersection - quick reject ', function () {
            let line = new Flatten.Line(point(1, 0), vector(1, 0));
            let arc = new Flatten.Arc(point(1, 0), 3, -Math.PI/3, Math.PI/3, Flatten.CCW);
            let ip = line.intersect(arc);
            expect(ip.length).to.equal(0);
        });
        it('Line to polygon intersection', function() {
            "use strict";

            let points = [
                point(100, 20),
                point(250, 75),
                point(350, 75),
                point(300, 200),
                point(170, 200),
                point(120, 350),
                point(70, 120)
            ];
            let polygon = new Polygon();
            polygon.addFace(points);

            let line = new Flatten.Line(point(100, 20), point(300, 200));

            let ip = line.intersect(polygon);
            expect(ip.length).to.equal(2);
        });
        it('Line to box intersection', function() {
            "use strict";

            let points = [
                point(100, 20),
                point(250, 75),
                point(350, 75),
                point(300, 200),
                point(170, 200),
                point(120, 350),
                point(70, 120)
            ];
            let polygon = new Polygon();
            polygon.addFace(points);

            let line = new Flatten.Line(point(100, 20), point(300, 200));

            let ip = line.intersect(polygon.box);
            expect(ip.length).to.equal(2);
        });
    });
    it('May check if two lines are parallel', function () {
        let line1 = new Flatten.Line(new Flatten.Point(0, 2), new Flatten.Point(2, 0));
        let line2 = new Flatten.Line(new Flatten.Point(4, 0), new Flatten.Point(0, 4));
        expect(line1.parallelTo(line2)).to.be.true;
    });
    it('May check if two lines are not parallel', function () {
        let line1 = new Flatten.Line(new Flatten.Point(0, 2), new Flatten.Point(2, 0));
        let line2 = new Flatten.Line(new Flatten.Point(4.001, 0), new Flatten.Point(0, 4));
        expect(line1.parallelTo(line2)).to.be.false;
    });
    it('Method svg() creates same svg string as segment with same points', function() {
        let l = line(point(4, 0), point(0, 4));
        let box = new Box(0,0,4,4);
        let svg = l.svg(box);
        let svg_seg = segment(4,0,0,4).svg();
        expect(svg).to.equal(svg_seg);
    });
    it('Method svg() without parameters creates svg string with default attributes', function() {
        let l = line(point(4, 0), point(0, 4));
        let box = new Box(0,0,4,4);
        let svg = l.svg(box);
        expect(svg.search("stroke")).to.not.equal(-1);
        expect(svg.search("stroke-width")).to.not.equal(-1);

    });
    it('Method svg() with extra parameters may add additional attributes', function() {
        let l = line(point(4, 0), point(0, 4));
        let box = new Box(0,0,4,4);
        let svg = l.svg(box,{id:"123",className:"name"});
        expect(svg.search("stroke")).to.not.equal(-1);
        expect(svg.search("stroke-width")).to.not.equal(-1);
        expect(svg.search("id")).to.not.equal(-1);
        expect(svg.search("class")).to.not.equal(-1);
    });
    it('May stringify and parse line', function() {
        let l = line(point(4, 0), point(0, 4));
        let str = JSON.stringify(l)
        let l_json = JSON.parse(str);
        let l_parsed = line(l_json);
        expect(l_parsed).to.deep.equal(l);
    });
});

