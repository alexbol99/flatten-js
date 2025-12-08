/**
 * Created by Alex Bol on 9/8/2017.
 */
 'use strict';

import { expect } from 'chai';
import Flatten, {Relations as to} from '../../index';

import {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} from '../../index';
import {point, vector, circle, line, segment, arc, ray} from '../../index';
import {Errors} from "../../src/utils/errors";

describe('#Flatten.Segment', function() {
    it('May create new instance of Segment', function () {
        let segment = new Segment();
        expect(segment).to.be.an.instanceof(Segment);
    });
    it('Constructor Segment(ps, pe) creates new instance of Segment', function () {
        let ps = new Point(1,1);
        let pe = new Point(2,3);
        let segment = new Segment(ps, pe);
        expect(segment.start).to.deep.equal({x:1, y:1});
        expect(segment.end).to.deep.equal({x:2, y:3});
    });
    it('May construct segment when second point is omitted', function () {
        let ps = new Point(10,10);
        let segment = new Segment(ps);
        expect(segment.start).to.deep.equal({x:10, y:10});
        expect(segment.end).to.deep.equal({x:0, y:0});
    });
    it('May constructor by array [4] ', function () {
        let ps = new Point(1,1);
        let pe = new Point(2,3);
        let segment = new Segment([ps.x,ps.y,pe.x,pe.y]);
        expect(segment.start).to.deep.equal(ps);
        expect(segment.end).to.deep.equal(pe);
    });
    it('New segment may be constructed by function call', function() {
        expect(segment(point(1,1), point(2,3))).to.deep.equal(new Segment(new Point(1,1), new Point(2,3)));
    });
    it('Constructor with illegal parameters throw error', function() {
        let fn = function () {new Segment([1,2,3])};
        expect(fn).to.throw(Errors.ILLEGAL_PARAMETERS.message);
    });
    it('Method clone copy to a new instance of Segment', function () {
        let ps = new Point(1,1);
        let pe = new Point(2,3);
        let segment = new Segment(ps, pe);
        expect(segment.clone()).to.deep.equal(segment);
    });
    it('Method length returns length of segment', function () {
        let ps = new Point(1,1);
        let pe = new Point(5,4);
        let segment = new Segment(ps, pe);
        expect(segment.length).to.equal(5.0);
    });
    it('Method box returns bounding box of segment', function () {
        let ps = new Point(1,1);
        let pe = new Point(5,4);
        let segment = new Segment(ps, pe);
        expect(segment.box).to.deep.equal({xmin:1, ymin:1, xmax:5, ymax:4});
    });
    it('Method slope returns slope of segment', function () {
        let ps = new Point(1,1);
        let pe = new Point(5,5);
        let segment = new Segment(ps, pe);
        expect(segment.slope).to.equal(Math.PI/4);
    });
    it('Method contains returns true if point belongs to segment', function () {
        let ps = new Point(-2,2);
        let pe = new Point(2,2);
        let segment = new Segment(ps, pe);
        let pt = new Point(1,2);
        expect(segment.contains(pt)).to.equal(true);
    });
    it('Method tangentInStart and tangentInEnd returns vector [ps pe] and [pe, ps]', function () {
        let ps = new Point(5,1);
        let pe = new Point(5,5);
        let segment = new Segment(ps, pe);
        expect(segment.tangentInStart()).to.deep.equal(vector(0,1));
        expect(segment.tangentInEnd()).to.deep.equal(vector(0,-1));
    });
    it('Calculates middle point', function() {
        let ps = new Point(-2,-2);
        let pe = new Point(2,2);
        let segment = new Segment(ps, pe);
        expect(segment.middle()).to.deep.equal({x:0,y:0});
    });
    it('Can translate segment by given vector', function() {
        let seg = segment(0,0,3,3);
        let v = vector(-1,-1);
        let seg_t = segment(-1,-1,2,2);
        expect(seg.translate(v)).to.deep.equal(seg_t);
    });
    it('Can rotate by angle around center of bounding box', function() {
        let seg = segment(0,0,6,0);
        let seg_plus_pi_2 = segment(3,-3,3,3);
        let seg_minus_pi_2 = segment(3,3,3,-3);
        let center = seg.box.center;
        expect(seg.rotate(Math.PI/2, center).equalTo(seg_plus_pi_2)).to.be.true
        expect(seg.rotate(-Math.PI/2, center).equalTo(seg_minus_pi_2)).to.be.true
    });
    it('Can rotate by angle around given point', function() {
        let seg = segment(1,1,3,3);
        let seg_plus_pi_2 = segment(1,1,-1,3);
        let seg_minus_pi_2 = segment(1,1,3,-1);
        expect(seg.rotate(Math.PI/2,seg.start).equalTo(seg_plus_pi_2)).to.be.true
        expect(seg.rotate(-Math.PI/2,seg.start).equalTo(seg_minus_pi_2)).to.be.true
    });
    it('Method svg() without parameters creates svg string with default attributes', function() {
        let seg = new Segment(point(-2,2), point(2,2));
        let svg = seg.svg();
        expect(svg.search("stroke")).to.not.equal(-1);
    })
    it('Method svg() with extra parameters may add additional attributes', function() {
        let seg = new Segment(point(-2,2), point(2,2));
        let svg = seg.svg({id:"123",className:"name"});
        expect(svg.search("stroke")).to.not.equal(-1);
        expect(svg.search("id")).to.not.equal(-1);
        expect(svg.search("class")).to.not.equal(-1);
    })
    describe('#Flatten.Segment.Intersect', function() {
        it('Intersection with Segment - not parallel segments case (one point)', function () {
            let segment1 = new Segment(new Point(0,0), new Point(2,2));
            let segment2 = new Segment(new Point(0,2), new Point(2,0));
            expect(segment1.intersect(segment2).length).to.equal(1);
            expect(segment1.intersect(segment2)[0]).to.deep.equal({x:1, y:1});
        });
        it('Intersection with Segment - overlapping segments case (two points)', function () {
            let segment1 = new Segment(new Point(0,0), new Point(2,2));
            let segment2 = new Segment(new Point(3,3), new Point(1,1));
            expect(segment1.intersect(segment2).length).to.equal(2);
            expect(segment1.intersect(segment2)[0]).to.deep.equal({x:2, y:2});
            expect(segment1.intersect(segment2)[1]).to.deep.equal({x:1, y:1});
        });
        it('Intersection with Segment - boxes intersecting, segments not intersecting', function () {
            let segment1 = new Segment(new Point(0,0), new Point(2,2));
            let segment2 = new Segment(new Point(0.5,1.5), new Point(-2,-4));
            expect(segment1.box.intersect(segment2.box)).to.equal(true);
            expect(segment1.intersect(segment2).length).to.equal(0);
        });
        it('Intersection with Segment - boxes not intersecting, quick reject', function () {
            let segment1 = new Segment(new Point(0,0), new Point(2,2));
            let segment2 = new Segment(new Point(-0.5,2.5), new Point(-2,-4));
            expect(segment1.box.not_intersect(segment2.box)).to.equal(true);
            expect(segment1.intersect(segment2).length).to.equal(0);
        });
        it('Intersection with Line - not parallel segments case (one point)', function () {
            let segment = new Segment(new Point(0,0), new Point(2,2));
            let line = new Line(new Point(0,2), new Point(2,0));
            expect(segment.intersect(line).length).to.equal(1);
            expect(segment.intersect(line)[0]).to.deep.equal({x:1, y:1});
        });
        it('Intersection with Line - segment lays on line case (two points)', function () {
            let segment = new Segment(0,0,2,2);
            let line = new Line(new Point(3,3), new Point(1,1));
            expect(segment.intersect(line).length).to.equal(2);
            expect(segment.intersect(line)[0]).to.deep.equal({x:0, y:0});
            expect(segment.intersect(line)[1]).to.deep.equal({x:2, y:2});
        });
        it('intersectSegment2Segment does not report touching segments #85', function () {
            const a = new Segment(new Point(-1, 0), new Point(0, 0));
            const b = new Segment(new Point(1e-30, 0), new Point(1, 0));

            expect(a.intersect(b).length).to.equal(1);
            expect(a.intersect(b)[0].equalTo(new Point(0, 0))).to.be.true;
        })
        it('Intersection with Circle', function () {
            let segment = new Segment(0,0,2,2);
            let circle = new Circle(new Point(0,0), 1);
            let ip_expected = new Point(Math.sqrt(2)/2, Math.sqrt(2)/2);
            expect(segment.intersect(circle).length).to.equal(1);
            expect(segment.intersect(circle)[0].equalTo(ip_expected)).to.equal(true);
        });
        it('Intersection with Circle - case of tangent', function () {
            let segment = new Segment(-2,2,2,2);
            let circle = new Circle(new Point(0,0), 2);
            let ip_expected = new Point(0, 2);
            expect(segment.intersect(circle).length).to.equal(1);
            expect(segment.intersect(circle)[0].equalTo(ip_expected)).to.equal(true);
        });
        it('Intersection with Polygon', function () {
            let segment = new Segment(150,-20,150,60);

            let points = [
                point(100, 20),
                point(200, 20),
                point(200, 40),
                point(100, 40)
            ];

            let poly = new Polygon();
            let face = poly.addFace(points);

            let ip_expected = new Point(0, 2);
            let ip = segment.intersect(poly);
            expect(ip.length).to.equal(2);
            expect(ip[0].equalTo(point(150,20))).to.be.true;
            expect(ip[1].equalTo(point(150,40))).to.be.true;
        });
        it('Intersection with Box', function () {
            let segment = new Segment(150,-20,150,60);

            let points = [
                point(100, 20),
                point(200, 20),
                point(200, 40),
                point(100, 40)
            ];

            let poly = new Polygon();
            let face = poly.addFace(points);

            let ip_expected = new Point(0, 2);
            let ip = segment.intersect(poly.box);
            expect(ip.length).to.equal(2);
            expect(ip[0].equalTo(point(150,20))).to.be.true;
            expect(ip[1].equalTo(point(150,40))).to.be.true;
        });
        it("Intersection between two very close lines returns zero intersections (#99)", () => {
            const s1 = segment([34.35, 36.557426400375626, 25.4, 36.557426400375626]);
            const s2 = segment([25.4, 36.55742640037563, 31.25, 36.55742640037563]);

            const ip = s1.intersect(s2);
            expect(ip.length).to.equal(2);

            const [dist, shortest_segment] = s1.distanceTo(s2);
        })
    });
    describe('#Flatten.Segment.DistanceTo', function() {
        it('Distance to Segment Case 1 Intersected Segments', function () {
            let segment1 = new Segment(new Point(0, 0), new Point(2, 2));
            let segment2 = new Segment(new Point(0, 2), new Point(2, 0));
            expect(segment1.distanceTo(segment2)[0]).to.equal(0);
        });
        it('Distance to Segment Case 2 Not Intersected Segments', function () {
            let segment1 = new Segment(new Point(0, 0), new Point(2, 2));
            let segment2 = new Segment(new Point(1, 0), new Point(4, 0));
            let [dist, ...rest] = segment1.distanceTo(segment2);
            expect(Flatten.Utils.EQ(dist,Math.sqrt(2)/2)).to.be.true;
        });
        it('Distance to Line', function() {
            let seg = segment(1,3,4,6);
            let l = line(point(-1,1),vector(0,-1));
            expect(seg.distanceTo(l)[0]).to.equal(2);
        })
        it('Distance to Circle Case 1 Intersection - touching', function () {
            let segment = new Segment(point(-4, 2), point(4, 2));
            let circle = new Circle(point(0,0),2);
            expect(segment.distanceTo(circle)[0]).to.equal(0);
        });
        it('Distance to Circle Case 1 Intersection - two points', function () {
            let segment = new Segment(point(-4, 2), point(4, 2));
            let circle = new Circle(point(0,0),3);
            expect(segment.distanceTo(circle)[0]).to.equal(0);
        });
        it('Distance to Circle Case 1 Intersection - one points', function () {
            let segment = new Segment(point(0, 2), point(4, 2));
            let circle = new Circle(point(0,0),3);
            expect(segment.distanceTo(circle)[0]).to.equal(0);
        });
        it('Distance to Circle Case 2 Projection', function () {
            let segment = new Segment(point(-4, 4), point(4, 4));
            let circle = new Circle(point(0,0),2);
            expect(segment.distanceTo(circle)[0]).to.equal(2);
        });
        it('Distance to Circle Case 3 End point out of the circle', function () {
            let segment = new Segment(point(2,2), point(4,2));
            let circle = new Circle(point(0,0),2);
            expect(segment.distanceTo(circle)[0]).to.equal(2*Math.sqrt(2)-2);
        });
        it('Distance to Circle Case 3 End point inside the circle', function () {
            let segment = new Segment(point(-1,1), point(1,1));
            let circle = new Circle(point(0,0),2);
            expect(segment.distanceTo(circle)[0]).to.equal(2 - Math.sqrt(2));
        });
    });

    describe('#Flatten.Segment.pointAtLength', function () {
        it('gets the point at specific length', function () {
            let segment = new Segment(point(-1,1), point(1,1))
            expect(segment.length).to.equal(2)
            expect(segment.pointAtLength(1).x).to.equal(0)
            expect(segment.pointAtLength(0).x).to.equal(-1)
            expect(segment.pointAtLength(2).x).to.equal(1)
            expect(segment.pointAtLength(0.5).x).to.equal(-0.5)
        });
        it('points at specific length is on segment', function () {
            let segment = new Segment(point(-12,4), point(30, -2))
            let length = segment.length
            for (let i = 0; i < 33; i++) {
                let point = segment.pointAtLength(i / 33 * length)
                expect(segment.contains(point)).to.be.true
            }
        });
    });
});
