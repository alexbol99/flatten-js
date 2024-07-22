
import { expect } from 'chai';
import Flatten, {line} from '../../index';

import {point, segment} from '../../index';

describe('#Flatten.Multiline', function() {
    "use strict";

    it('May create new instance of Multiline', function () {
        let ml = new Flatten.Multiline();
        expect(ml).to.be.an.instanceof(Flatten.Multiline);
    });
    it('Default constructor creates new empty multiline', function() {
        let ml = new Flatten.Multiline();
        expect(ml.size).to.equal(0);
    });
    it('May construct multiline from sequence of segments', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75))
            ];
        let ml = new Flatten.Multiline(shapes);
        expect(ml.size).to.equal(2);
    });
    it ('May get array of edges of multiline', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75))
        ];
        let ml = new Flatten.Multiline(shapes);
        let other_shapes = ml.edges.map(edge => edge.shape);
        expect(other_shapes[0]).to.be.deep.equal(shapes[0]);
        expect(other_shapes[1]).to.be.deep.equal(shapes[1]);
    });
    it ('May get array of vertices of multiline', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75))
        ];
        let ml = new Flatten.Multiline(shapes);
        let points = ml.vertices;
        expect(points[0]).to.be.deep.equal(point(0,0));
        expect(points[1]).to.be.deep.equal(point(50,100));
        expect(points[2]).to.be.deep.equal(point(100,75));
    });
    it ('May get box of multiline', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75))
        ];
        let ml = new Flatten.Multiline(shapes);
        expect(ml.box).to.deep.equal({xmin:0, ymin:0, xmax:100, ymax:100});
    });
    it ('May get length of multiline', function() {
        let shapes = [
            segment([0, 0, 50, 100]),
            segment([50, 100, 100, 75])
        ];
        let ml = new Flatten.Multiline(shapes);
        expect(ml.length).to.be.closeTo(167.705098, 0.001);
    });
    it ('May create infinite multiline', function() {
        let shapes = [line(point(0, 0), point(50, 100))]
        let ml = new Flatten.Multiline(shapes);
        expect(ml.isInfinite).to.be.true;
    });
    it ('May get length of infinite multiline', function() {
        let shapes = [line(point(0, 0), point(50, 100))]
        let ml = new Flatten.Multiline(shapes);
        expect(ml.length).to.be.equal(Infinity);
    });
    it('May calculate pointAtLength in multiline', function() {
        const shapes = [
            segment(point(0,0), point(50,0)),
            segment(point(50,0), point(50,50)),
            segment(point(50,50), point(100,50))
        ];
        const ml = new Flatten.Multiline(shapes);
        const p1 = ml.pointAtLength(0);
        const p2 = ml.pointAtLength(75);
        const p3 = ml.pointAtLength(120);

        expect(p1).to.be.deep.equal(point(0,0));
        expect(p2).to.be.deep.equal(point(50,25));
        expect(p3).to.be.deep.equal(point(70,50));
    });
    it('May calculate distance between a point and a multiline', function() {
        const shapes = [
            segment(point(0,0), point(50,0)),
            segment(point(50,0), point(50,50)),
            segment(point(50,50), point(100,50))
        ];
        const ml = new Flatten.Multiline(shapes);
        const d1 = point(25,25).distanceTo(ml);
        const d2 = point(-25,0).distanceTo(ml);
        expect(d1[0]).to.be.equal(25);
        expect(d2[0]).to.be.equal(25);
    });
    it('May transform multiline to an array of shapes', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75))
        ];
        let ml = new Flatten.Multiline(shapes);
        let other_shapes = ml.toShapes();
        expect(other_shapes[0]).to.be.deep.equal(shapes[0]);
        expect(other_shapes[1]).to.be.deep.equal(shapes[1]);
    });
    it('May delete first edge from multiline', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75)),
            segment(point(100,75), point(150,50))
        ];
        let ml = new Flatten.Multiline(shapes);
        let edge = ml.first;

        expect(ml.size).to.equal(3);

        ml = ml.remove(edge);
        expect(ml.size).to.equal(2);

        expect(ml.first.shape).to.be.deep.equal(shapes[1]);
        expect(ml.last.shape).to.be.deep.equal(shapes[2]);
    });
    it('May delete middle edge from multiline', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75)),
            segment(point(100,75), point(150,50))
        ];
        let ml = new Flatten.Multiline(shapes);
        let edge = ml.first.next;

        expect(ml.size).to.equal(3);

        ml = ml.remove(edge);
        expect(ml.size).to.equal(2);

        expect(ml.first.shape).to.be.deep.equal(shapes[0]);
        expect(ml.last.shape).to.be.deep.equal(shapes[2]);
    });
    it('May delete last edge from multiline', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75)),
            segment(point(100,75), point(150,50))
        ];
        let ml = new Flatten.Multiline(shapes);
        let edge = ml.last;

        expect(ml.size).to.equal(3);

        ml = ml.remove(edge);
        expect(ml.size).to.equal(2);

        expect(ml.first.shape).to.be.deep.equal(shapes[0]);
        expect(ml.last.shape).to.be.deep.equal(shapes[1]);
    });
    it('May delete all edges from multiline', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75)),
            segment(point(100,75), point(150,50))
        ];
        let ml = new Flatten.Multiline(shapes);

        expect(ml.size).to.equal(3);

        ml = ml.remove(ml.first);
        ml = ml.remove(ml.first);
        ml = ml.remove(ml.first);

        expect(ml.size).to.equal(0);
        expect(ml.isEmpty()).to.be.true;
    });
    it('May add vertex to polyline', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75))
        ];
        let ml = new Flatten.Multiline(shapes);
        let pt = point(25,50);
        let edge = ml.findEdgeByPoint(pt);
        ml.addVertex(pt, edge);
        expect(ml.size).to.equal(3);
    });
    it('May split polyline with intersections', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,75))
        ];
        let ml = new Flatten.Multiline(shapes);
        let pt = point(25,50);
        let edge = ml.findEdgeByPoint(pt);
        ml.addVertex(pt, edge);
        expect(ml.size).to.equal(3);
    });
    it('May split polyline with array of points', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,0))
        ];
        let ml = new Flatten.Multiline(shapes);
        let pts = [
            point(25,50),
            point(75,50)
            ];
        ml = ml.split(pts);

        expect(ml.size).to.equal(4);
    });
    it('May stringify using toJSON transformation', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,0))
        ];
        let ml = new Flatten.Multiline(shapes);
        let str = JSON.stringify(ml);

        expect(str).not.to.be.empty;
    });
    it('May create svg path', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,0))
        ];
        let ml = new Flatten.Multiline(shapes);
        let str = ml.svg();

        expect(str).not.to.be.empty;
    })
    it('May create dpath string to be inserted into "d" atrtibute', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,0))
        ];
        let ml = new Flatten.Multiline(shapes);
        let str = ml.dpath();

        expect(str).not.to.be.empty;
    })
    it('May create points string to be inserted into "points" atrtibute', function() {
        let shapes = [
            segment(point(0,0), point(50,100)),
            segment(point(50,100), point(100,0))
        ];
        let ml = new Flatten.Multiline(shapes);
        let str = ml.svgPoints();

        expect(str).not.to.be.empty;
    })
});
