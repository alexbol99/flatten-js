/**
 * Created by Alex Bol on 3/25/2017.
 */

let expect = require('chai').expect;
let Flatten = require('../index');

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, PlanarSet} = Flatten;
let {point, vector, circle, line, segment, arc} = Flatten;

describe('#Flatten.Polygon', function() {
    it('May create new instance of Polygon', function () {
        let polygon = new Polygon();
        expect(polygon).to.be.an.instanceof(Polygon);
    });
    it('Default construct creates instance of Polygon faces edges as instances of PlanarSet', function () {
        let polygon = new Polygon();
        expect(polygon.edges).to.be.an.instanceof(PlanarSet);
        expect(polygon.faces).to.be.an.instanceof(PlanarSet);
    });
    it('Default construct creates instance of Polygon with 0 faces and 0 edges', function () {
        let polygon = new Polygon();
        expect(polygon.edges.size).to.equal(0);
        expect(polygon.faces.size).to.equal(0);
    });
    it('Can construct Polygon from array of 3 points', function () {
        let polygon = new Polygon();
        let points = [
            new Point(1,1), new Point(5,1), new Point(3, 5)
        ];
        polygon.addFace(points);
        expect(polygon.edges.size).to.equal(3);
        expect(polygon.faces.size).to.equal(1);
    });
    it('Can construct Polygon from array of 3 segments', function () {
        let polygon = new Polygon();
        let points = [
            new Point(1,1), new Point(5,1), new Point(3, 5)
        ];
        let segments = [
            new Segment(points[0], points[1]),
            new Segment(points[1], points[2]),
            new Segment(points[2], points[0])
        ];
        polygon.addFace(segments);
        expect(polygon.edges.size).to.equal(3);
        expect(polygon.faces.size).to.equal(1);
    });
    it('Can construct Polygon with multiple faces', function () {
        let polygon = new Polygon();
        let points = [
            new Point(1,1), new Point(5,1), new Point(3, 5),
            new Point(-1,-1), new Point(-5,-1), new Point(-3, -5),
        ];
        let segments1 = [
            new Segment(points[0], points[1]),
            new Segment(points[1], points[2]),
            new Segment(points[2], points[0])
        ];
        let segments2 = [
            new Segment(points[3], points[4]),
            new Segment(points[4], points[5]),
            new Segment(points[5], points[3])
        ];
        polygon.addFace(segments1);
        polygon.addFace(segments2);
        expect(polygon.edges.size).to.equal(6);
        expect(polygon.faces.size).to.equal(2);
    });
    it('Can remove faces from polygon', function () {
        let polygon = new Polygon();
        let points = [
            new Point(1,1), new Point(5,1), new Point(3, 5),
            new Point(-1,-1), new Point(-5,-1), new Point(-3, -5),
        ];
        let segments1 = [
            new Segment(points[0], points[1]),
            new Segment(points[1], points[2]),
            new Segment(points[2], points[0])
        ];
        let segments2 = [
            new Segment(points[3], points[4]),
            new Segment(points[4], points[5]),
            new Segment(points[5], points[3])
        ];
        let face1 = polygon.addFace(segments1);
        let face2 = polygon.addFace(segments2);

        polygon.deleteFace(face1);
        expect(polygon.faces.has(face1)).to.be.false;
        expect(polygon.edges.size).to.equal(3);
        expect(polygon.faces.size).to.equal(1);

        polygon.deleteFace(face2);
        expect(polygon.faces.has(face2)).to.be.false;
        expect(polygon.edges.size).to.equal(0);
        expect(polygon.faces.size).to.equal(0);

    });
    it('Can create new instance of the polygon', function() {
        let polygon = new Polygon();
        polygon.addFace([point(1,1), point(3,1), point(3,2), point(1,2)]);
        polygon.addFace([point(-1,1), point(-3,1), point(-3, 2), point(-1,2)]);
        let polygon2 = polygon.clone();
        expect(polygon2 === polygon).to.be.false;
        expect(polygon2).to.deep.equal(polygon);
    });
    it('Can return bounding box of the polygon', function() {
        let polygon = new Polygon();
        polygon.addFace([point(1,1), point(3,1), point(3,2), point(1,2)]);
        polygon.addFace([point(-1,1), point(-3,1), point(-3, 2), point(-1,2)]);
        let box = polygon.box;
        expect(box.xmin).to.equal(-3);
        expect(box.ymin).to.equal(1);
        expect(box.xmax).to.equal(3);
        expect(box.ymax).to.equal(2);
    });
    it('Can return array of vertices', function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,2), point(1,2)];
        polygon.addFace(points);
        expect(polygon.vertices).to.deep.equal(points);
    });
    it('Can calculate area of the one-face polygon', function() {
        let polygon = new Polygon();
        let face = polygon.addFace([
            point(1,1), point(3,1), point(3,2), point(1,2)
        ]);
        expect(polygon.area()).to.equal(2);
    });
    it('Can check point in contour. Donut Case 1 Boundary top',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        let b = circle(point(200,200), 75).toArc(false);
        polygon.addFace([a]);
        polygon.addFace([b]);
        let pt = point(200,100);
        expect(polygon.contains(pt)).to.be.true;
    });
    it('Can check point in contour. Donut Case 2 Center',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        let b = circle(point(200,200), 75).toArc(false);
        polygon.addFace([a]);
        polygon.addFace([b]);
        let pt = point(200,200);
        expect(pt.on(polygon)).to.be.false;
    });
    it('Can check point in contour. Donut Case 3 Inside',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        let b = circle(point(200,200), 75).toArc(false);
        polygon.addFace([a]);
        polygon.addFace([b]);
        let pt = point(200,290);
        expect(polygon.contains(pt)).to.be.true;
    });
    it('Can check point in contour. Donut Case 4 Boundary inner circle start',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        let b = circle(point(200,200), 75).toArc(false);
        polygon.addFace([a]);
        polygon.addFace([b]);
        let pt = point(125, 200);
        expect(polygon.contains(pt)).to.be.true;
    });
});
describe('#Flatten.Face', function() {
    "use strict";
    it('Can iterate edges as iterable', function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,2), point(1,2)];
        let face = polygon.addFace(points);
        expect([...face]).to.be.an.instanceof(Array);
        for (let edge of face) {
            expect(edge).to.be.an.instanceof(Edge);
        }
        expect(face.size).to.equal(4);
    });
    it('Can get array of edges for the given face', function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,2), point(1,2)];
        let face = polygon.addFace(points);
        let edges = face.edges;
        let vertices = edges.map(edge => edge.start);
        expect(edges.length).to.equal(4);
        expect(vertices.length).to.equal(4);
        expect(vertices).to.deep.equal(points);
    });
    it('Can count edges in face',function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,2), point(1,2)];
        let face = polygon.addFace(points);
        expect(face.size).to.equal(4);
    });
    it('Can set orientation of face to CCW', function() {
        let polygon = new Polygon();
        let face = polygon.addFace([
            point(1,1), point(3,1), point(3,2), point(1,2)
        ]);
        expect(face.signedArea()).to.equal(-2);
        expect(face.orientation).to.equal(Flatten.ORIENTATION.CCW);
    });
    it('Can set orientation of face to CW', function() {
        let polygon = new Polygon();
        let face = polygon.addFace([
            arc(point(1,1), 1, 0, 2*Math.PI, false)
        ]);
        expect(Flatten.Utils.EQ(face.signedArea(), Math.PI)).to.equal(true);
        expect(face.orientation).to.equal(Flatten.ORIENTATION.CW);
    });
    it('Can set orientation of degenerated face to not-orientable', function() {
        let polygon = new Polygon();
        let face = polygon.addFace([
            point(1,1), point(3,1), point(1,1)
        ]);
        expect(face.area()).to.equal(0);
        expect(face.orientation).to.equal(Flatten.ORIENTATION.NOT_ORIENTABLE);
    });
});