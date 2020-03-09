'use strict';

import { expect } from 'chai';
import Flatten from '../../index';

import {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} from '../../index';

import {point, vector, circle, line, segment, arc, ray} from '../../index';

describe('#Flatten.Circle', function() {
    it('May create new instance of Circle', function () {
        let circle = new Circle(new Point(0,0), 1);
        expect(circle).to.be.an.instanceof(Circle);
    });
    it('Constructor Circle(pt, r) creates new circle', function() {
        let circle = new Circle(new Point(1,1), 2);
        expect(circle.pc).to.deep.equal({x:1, y:1});
        expect(circle.r).to.equal(2);
    });
    it('New circle may be constructed by function call', function() {
        expect(circle(point(1,1), 3)).to.deep.equal(new Circle(new Point(1,1), 3));
    });
    it('May create new instance by clone', function() {
        let circle = new Circle(new Point(1,1), 2);
        let circle1 = circle.clone();
        expect(circle1).to.deep.equal(circle);
        expect(circle1 === circle).to.be.false;
    });
    it('Method contains returns true if point belongs to the circle', function () {
        let pt = new Point(0,1);
        let circle = new Circle(new Point(0,0), 2);
        expect(circle.contains(pt)).to.equal(true);
    });
    it('Can return circle bounding box', function () {
        let circle = new Circle(new Point(0,0), 2);
        expect(circle.box).to.deep.equal({xmin:-2, ymin:-2, xmax:2, ymax:2});
    });
    it('Can transform circle into closed CCW arc', function () {
        let circle = new Circle(new Point(0,0), 2);
        let arc = circle.toArc(true);
        expect(arc.sweep).to.equal(Flatten.PIx2);
        expect(arc.start.equalTo(point(-2,0))).to.be.true;
        expect(arc.end.equalTo(point(-2,0))).to.be.true;
    });
    it('Can transform circle into closed CW arc', function () {
        let circle = new Circle(new Point(0,0), 2);
        let arc = circle.toArc(false);
        expect(arc.sweep).to.equal(Flatten.PIx2);
        expect(arc.start.equalTo(point(-2,0))).to.be.true;
        expect(arc.end.equalTo(point(-2,0))).to.be.true;
    });
    it('Can intersect circle with line. Case 1 no intersection', function() {
        let circle = new Circle(new Point(0, 0), 2);
        let line = new Line(point(3, 3), vector(0, 1));
        let ip = circle.intersect(line);
        expect(ip.length).to.equal(0)
    });
    it('Can intersect circle with line. Case 2 Touching', function() {
        let circle = new Circle(new Point(0, 0), 2);
        let line = new Line(point(3, 2), vector(0, 1));
        let ip = circle.intersect(line);
        expect(ip.length).to.equal(1);
        expect(ip[0]).to.deep.equal({x:0,y:2});
    });
    it('Can intersect circle with line. Case 3 Two points', function() {
        let circle = new Circle(new Point(0, 0), 2);
        let line = new Line(point(1, 1), vector(0, 1));
        let ip = circle.intersect(line);
        expect(ip.length).to.equal(2);
    });
    it('Can intersect circle with segment. One point', function() {
        let circle = new Circle(new Point(0, 0), 2);
        let segment = new Segment(point(1, 1), point(3,3));
        let ip = circle.intersect(segment);
        expect(ip.length).to.equal(1);
    });
    it('Can intersect circle with segment.2 points', function() {
        let circle = new Circle(new Point(0, 0), 2);
        let segment = new Segment(point(-3, -3), point(3, 3));
        let ip = circle.intersect(segment);
        expect(ip.length).to.equal(2);
    });
    it('Can intersect circle with arc', function() {
        let circle = new Circle(new Point(0, 0), 2);
        let circle1 = new Circle(new Point(0, 1), 2);
        let arc = circle1.toArc();
        let ip = circle.intersect(arc);
        expect(ip.length).to.equal(2);
    });
    it('Can intersect circle with circle - quick reject', function() {
        let circle1 = new Circle(new Point(0, 0), 2);
        let circle2 = new Circle(new Point(5, 4), 2);
        let ip = circle1.intersect(circle2);
        expect(ip.length).to.equal(0);
    });
    it('Can intersect circle with circle - no intersection r1 + r2 < dist', function() {
        let circle1 = new Circle(new Point(0, 0), 2);
        let circle2 = new Circle(new Point(2, 2), 0.5);
        let ip = circle1.intersect(circle2);
        expect(ip.length).to.equal(0);
    });
    it('Can intersect circle with circle - no intersection: one inside another', function() {
        let circle1 = new Circle(new Point(0, 0), 4);
        let circle2 = new Circle(new Point(0, 0), 3);
        let ip = circle1.intersect(circle2);
        expect(ip.length).to.equal(0);
    });
    it('Can intersect circle with circle - same circle, one intersection, leftmost point', function() {
        let circle = new Circle(new Point(0, 0), 4);
        let ip = circle.intersect(circle.clone());
        expect(ip.length).to.equal(1);
        expect(ip[0]).to.deep.equal({x:-4,y:0});
    });
    it('Can intersect circle with circle - degenerated circle', function() {
        let circle1 = new Circle(new Point(0, 0), 2);
        let circle2 = new Circle(new Point(2, 0), 0);
        let ip = circle1.intersect(circle2);
        expect(ip.length).to.equal(0);
    });
    it('Intersect circle with polygon', function() {
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
        let circle = new Circle(point(150,50), 50);
        expect(circle.intersect(polygon).length).to.equal(2);
    });
    it('Intersect circle with box', function() {
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
        let circle = new Circle(point(150,50), 50);
        expect(circle.intersect(polygon.box).length).to.equal(2);
    });
    describe('#Flatten.Circle.DistanceTo', function() {
        it('Can measure distance between circle and point', function() {
            let c = circle(point(200,200), 50);
            let pt = point(200, 100);

            let [dist, shortest_segment] = c.distanceTo(pt);
            expect(dist).to.equal(50);
            expect(shortest_segment.ps).to.deep.equal({x:200,y:150})
            expect(shortest_segment.pe).to.deep.equal(pt);
        });
        it('Can measure distance between circle and circle', function() {
            let c1 = circle(point(200,200), 50);
            let c2 = circle(point(200,230), 100);

            let [dist, shortest_segment] = c1.distanceTo(c2);
            expect(dist).to.equal(20);
            expect(shortest_segment.ps).to.deep.equal({"x": 200, "y": 150});
            expect(shortest_segment.pe).to.deep.equal({"x": 200, "y": 130});
        });
        it('Can measure distance between circle and line', function() {
            let c = circle(point(200,200), 50);
            let l = line(point(200,130), vector(0,1));

            let [dist, shortest_segment] = c.distanceTo(l);
            expect(dist).to.equal(20);
            expect(shortest_segment.ps).to.deep.equal({"x": 200, "y": 150});
            expect(shortest_segment.pe).to.deep.equal({"x": 200, "y": 130});
        });
        it('Can measure distance between circle and segment', function() {
            let c = circle(point(200,200), 50);
            let seg = segment(point(200,130), point(220,130));

            let [dist, shortest_segment] = c.distanceTo(seg);
            expect(dist).to.equal(20);
            expect(shortest_segment.ps).to.deep.equal({"x": 200, "y": 150});
            expect(shortest_segment.pe).to.deep.equal({"x": 200, "y": 130});
        });
        it('Can measure distance between circle and arc', function() {
            let c = circle(point(200,200), 50);
            let a = circle(point(200,100), 20).toArc();

            let [dist, shortest_segment] = c.distanceTo(a);
            expect(dist).to.equal(30);
            expect(shortest_segment.ps).to.deep.equal({"x": 200, "y": 150});
            expect(shortest_segment.pe).to.deep.equal({"x": 200, "y": 120});
        });
        it('Can measure distance between circle and polygon', function () {
            let points = [
                point(100, 20),
                point(250, 75),
                point(350, 75),
                point(300, 270),
                point(170, 200),
                point(120, 350),
                point(70, 120)
            ];

            let poly = new Polygon();
            poly.addFace(points);
            poly.addFace([circle(point(175,150), 30).toArc()]);

            let c = circle(point(300,25), 25);

            let [dist, shortest_segment] = c.distanceTo(poly);

            expect(dist).to.equal(25);
            expect(shortest_segment.ps).to.deep.equal({"x": 300, "y": 50});
            expect(shortest_segment.pe).to.deep.equal({"x": 300, "y": 75});
        })
    });
    it('Method svg() without parameters creates svg string with default attributes', function() {
        let c = circle(point(300,25), 25);
        let svg = c.svg();
        expect(svg.search("stroke")).to.not.equal(-1);
        expect(svg.search("stroke-width")).to.not.equal(-1);
        expect(svg.search("fill")).to.not.equal(-1);
        expect(svg.search("fill-opacity")).to.not.equal(-1);
    });
    it('Method svg() with extra parameters may add additional attributes', function() {
        let c = circle(point(300,25), 25);
        let svg = c.svg({id:"123",className:"name"});
        expect(svg.search("stroke")).to.not.equal(-1);
        expect(svg.search("stroke-width")).to.not.equal(-1);
        expect(svg.search("fill")).to.not.equal(-1);
        expect(svg.search("id")).to.not.equal(-1);
        expect(svg.search("class")).to.not.equal(-1);
    })
});

