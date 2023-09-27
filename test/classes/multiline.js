
import { expect } from 'chai';
import Flatten from '../../index';

import {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, PlanarSet} from '../../index';
import {point, vector, circle, line, segment, arc} from '../../index';

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
});
