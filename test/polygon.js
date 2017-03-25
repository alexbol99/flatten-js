/**
 * Created by Alex Bol on 3/25/2017.
 */

let expect = require('chai').expect;
let Flatten = require('../index');
let PlanarSet = require('../data_structures/planar_set');

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face} = Flatten;
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
        expect(face.signedArea()).to.equal(0);
        expect(face.orientation).to.equal(Flatten.ORIENTATION.NOT_ORIENTABLE);
    });
    it('Can calculate area of the one-face polygon', function() {
        let polygon = new Polygon();
        let face = polygon.addFace([
            point(1,1), point(3,1), point(3,2), point(1,2)
        ]);
        expect(polygon.area()).to.equal(2);
    });
});
