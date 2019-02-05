/**
 * Created by Alex Bol on 3/25/2017.
 */

import { expect } from 'chai';
import Flatten from '../src/index';

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, PlanarSet} = Flatten;
let {point, vector, circle, line, segment, arc, box} = Flatten;

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
    it('Can construct polygon from Circle in CCW orientation', function() {
        let polygon = new Polygon();
        polygon.addFace(circle(point(3,3),50));
        expect(polygon.faces.size).to.equal(1);
        expect(polygon.edges.size).to.equal(1);
        expect([...polygon.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CCW);
    });
    it('Can construct polygon from a box in CCW orientation', function() {
        let polygon = new Polygon();
        polygon.addFace(box(30,40,100,200));
        expect(polygon.faces.size).to.equal(1);
        expect(polygon.edges.size).to.equal(4);
        expect([...polygon.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CCW);
    });
    it('Can construct polygon from a box and circle as a hole', function() {
        let polygon = new Polygon();
        polygon.addFace(box(0,0,100,100));
        polygon.addFace(circle(point(40,40),20)).reverse();    // change orientation to CW
        expect(polygon.faces.size).to.equal(2);
        expect(polygon.edges.size).to.equal(5);
        expect([...polygon.faces][0].size).to.equal(4);
        expect([...polygon.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CCW);
        expect([...polygon.faces][1].size).to.equal(1);
        expect([...polygon.faces][1].orientation()).to.equal(Flatten.ORIENTATION.CW);
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

        let [dist, shortest_segment] = poly.distanceTo(c);

        expect(dist).to.equal(25);
        expect(shortest_segment.pe).to.deep.equal({"x": 300, "y": 50});
        expect(shortest_segment.ps).to.deep.equal({"x": 300, "y": 75});
    });
    it('Can measure distance between two polygons', function () {
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

        let poly1 = new Polygon();
        poly1.addFace(points);
        poly1.addFace([circle(point(175,150), 30).toArc()]);

        let poly2 = new Polygon();
        poly2.addFace( [circle(point(250, 300), 50).toArc()]);


        let [dist, shortest_segment] = Flatten.Distance.distance(poly1, poly2);
        expect(dist).to.equal(50);
        expect(shortest_segment.pe).to.deep.equal({"x": 250, "y": 250});
        expect(shortest_segment.ps).to.deep.equal({"x": 250, "y": 200});

    });
    it('Can add new vertex to face and split edge of polygon (segment)', function () {
        "use strict";
        let points = [
            point(100, 20),
            point(200, 20),
            point(200, 40),
            point(100, 40)
        ];

        let poly = new Polygon();
        poly.addFace(points);

        expect(poly.edges.size).to.equal(4);

        let pt = point(150,20);
        let edge = [...poly.edges].find((e) => e.shape.contains(pt));
        let newEdge = poly.addVertex(pt, edge);

        expect(poly.edges.size).to.equal(5);
        expect(edge.start).to.deep.equal(pt);
        expect(edge.end).to.deep.equal({x:200,y:20});
        expect(newEdge.start).to.deep.equal({x:100,y:20});
        expect(newEdge.end).to.deep.equal(pt);
        expect(newEdge.next).to.equal(edge);
        expect(edge.prev).to.equal(newEdge);
    });
    it('Can add new vertex to face and split edge of polygon (arc)',function() {
        let polygon = new Polygon();
        polygon.addFace([circle(point(200,200), 100).toArc(true)]);
        let pt = point(300,200);
        expect(pt.on(polygon)).to.be.true;
        let edge = [...polygon.edges].find((e) => e.shape.contains(pt));
        let newEdge = polygon.addVertex(pt, edge);
        expect(polygon.edges.size).to.equal(2);
        expect(newEdge.end.equalTo(edge.start)).to.be.true;
        expect(edge.end.equalTo(newEdge.start)).to.be.true;
        expect(Flatten.Utils.EQ(newEdge.shape.sweep, Math.PI)).to.be.true;
        expect(Flatten.Utils.EQ(edge.shape.sweep, Math.PI)).to.be.true;
        expect(newEdge.next).to.equal(edge);
        expect(newEdge.prev).to.equal(edge);
        expect(edge.prev).to.equal(newEdge);
        expect(edge.next).to.equal(newEdge);
    });
    it('Can calculate inclusion flag of the edge', function () {
        "use strict";
        let points = [
            point(100, 20),
            point(200, 20),
            point(200, 40),
            point(100, 40)
        ];
        let poly = new Polygon();
        poly.addFace(points);

        let bv1 = new Edge(segment(point(120,30), point(130, 35))).setInclusion(poly);  // fully inside
        let bv2 = new Edge(segment(point(120,50), point(130, 55))).setInclusion(poly);  // fully outside
        let bv3 = new Edge(segment(point(100,30), point(200, 30))).setInclusion(poly);  // middle inside
        let bv4 = new Edge(segment(point(150,30), point(200, 40))).setInclusion(poly);  // start inside
        let bv5 = new Edge(segment(point(120,20), point(130, 20))).setInclusion(poly);  // boundary

        expect(bv1).to.equal(Flatten.INSIDE);
        expect(bv2).to.equal(Flatten.OUTSIDE);
        expect(bv3).to.equal(Flatten.INSIDE);
        expect(bv4).to.equal(Flatten.INSIDE);
        expect(bv5).to.equal(Flatten.BOUNDARY);
    });
    it('Can remove chain of edges from face', function () {
        "use strict";
        let points = [
            point(100, 20),
            point(200, 20),
            point(200, 40),
            point(100, 40)
        ];

        let poly = new Polygon();
        let face = poly.addFace(points);
        expect(face.size).to.equal(4);

        // remove chain from #1 to #2, leave #0 #3
        let edgeFrom = face.first;    // #1
        let edgeTo = edgeFrom.next;   // #2
        poly.removeChain(face, edgeFrom, edgeTo);

        expect(face.size).to.equal(2);
        expect(poly.edges.size).to.equal(2);
    });
    it('Can stringify and parse polygon with segments', function () {
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

        let string = JSON.stringify(polygon);

        let jsonPolygon = JSON.parse(string);
        let newPolygon = new Polygon();
        for (let jsonFace of jsonPolygon) {
            newPolygon.addFace(jsonFace);
        }

        expect(newPolygon.edges.size).to.equal(polygon.edges.size);
        expect(newPolygon.faces.size).to.equal(polygon.faces.size);
    });
    it('Can stringify and parse polygon with segments and arcs', function () {
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
        polygon.addFace([circle(point(175,150), 30).toArc()]);

        let string = JSON.stringify(polygon,null," ");

        let jsonPolygon = JSON.parse(string);
        let newPolygon = new Polygon();
        for (let jsonFace of jsonPolygon) {
            newPolygon.addFace(jsonFace);
        }

        expect(newPolygon.edges.size).to.equal(polygon.edges.size);
        expect(newPolygon.faces.size).to.equal(polygon.faces.size);
    });
    it('Can check if polygon is valid', function () {
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
        expect(polygon.isValid()).to.be.true;
    });
    it('Can check if polygon is invalid if one of faces is not simple', function () {
        "use strict";

        let points = [
            point(100, 20),
            point(220, 270),
            point(350, 75),
            point(300, 200),
            point(170, 200),
            point(120, 350),
            point(70, 120)
        ];

        let polygon = new Polygon();
        polygon.addFace(points);
        expect(polygon.isValid()).to.be.false;
    });
    describe('#Flatten.Polygon.intersect(shape) methods', function() {
        it('Intersect arc with polygon', function() {
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
            let arc = new Arc(point(150,50), 50, Math.PI/3, 5*Math.PI/3, Flatten.CCW);
            expect(polygon.intersect(arc).length).to.equal(1);
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
            expect(polygon.intersect(line).length).to.equal(4);
        });
        it('Intersection with Polygon', function () {
            let segment = new Flatten.Segment(150,-20,150,60);

            let points = [
                point(100, 20),
                point(200, 20),
                point(200, 40),
                point(100, 40)
            ];

            let poly = new Polygon();
            let face = poly.addFace(points);

            let ip_expected = new Flatten.Point(0, 2);
            let ip = poly.intersect(segment);
            expect(ip.length).to.equal(2);
            expect(ip[0].equalTo(point(150,20))).to.be.true;
            expect(ip[1].equalTo(point(150,40))).to.be.true;
        });
    });
    it('Issue #18 Division by zero error when checking if polygon contains a point',function() {
        const points = [
            new Flatten.Point(-0.0774582, 51.4791865),
            new Flatten.Point(-0.0784252, 51.4792941),
            new Flatten.Point(-0.0774582, 51.4791865)
        ];
        const poly = new Flatten.Polygon();
        poly.addFace(points);
        const pp = new Flatten.Point(-0.07776044568759738, 51.47918678917519);
        const contains = poly.contains(pp);
        expect(contains).to.be.equal(false);
    });
});
