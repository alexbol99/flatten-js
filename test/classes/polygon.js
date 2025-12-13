/**
 * Created by Alex Bol on 3/25/2017.
 */

import { expect } from 'chai';
import Flatten, {arc, matrix} from '../../index';

import {Point, Circle, Line, Segment, Arc, Box, Polygon, Edge, PlanarSet, Multiline} from '../../index';
import {point, vector, circle, line, segment, box, multiline} from '../../index';
import {intersectPolygon2Polygon, intersectMultiline2Polygon} from "../../src/algorithms/intersection";
import * as BooleanOperations from "../../src/algorithms/boolean_op";
let {unify} = BooleanOperations;

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
        let polygon = new Polygon(circle(point(3,3),50));
        // polygon.addFace(circle(point(3,3),50));
        expect(polygon.faces.size).to.equal(1);
        expect(polygon.edges.size).to.equal(1);
        expect([...polygon.faces][0].orientation()).to.equal(Flatten.ORIENTATION.CCW);
    });
    it('Can construct polygon from a box in CCW orientation', function() {
        let polygon = new Polygon(box(30,40,100,200));
        // polygon.addFace(box(30,40,100,200));
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
    it('Can construct polygon using class constructor', function () {
        let poly = new Polygon([
            point(100, 20),
            point(250, 75),
            point(350, 75),
            point(300, 270),
            point(170, 200),
            point(120, 350),
            point(70, 120)
        ]);
        expect(poly.faces.size).to.equal(1);
        expect(poly.edges.size).to.equal(7);
    });
    it('Can construct polygon using array of pairs of numbers', function () {
        let poly = new Polygon( [[1,1], [1,2], [2,2], [2,1]]);
        expect(poly.faces.size).to.equal(1);
        expect(poly.edges.size).to.equal(4);
    });
    it('Allow creation of Polygon from a Nested Array of Points #23', function () {
        let poly = new Polygon([[[1,1],[1,3],[2,3],[2,1]], [[2,2], [2,3], [4,3], [4,2]]]);
        expect(poly.faces.size).to.equal(2);
        expect(poly.edges.size).to.equal(8);
    });
    it( 'Uncaught ReferenceError: Illegal Parameters for Nested Multipolygon #79', () => {
        const smallPoly = [
            [
                [
                    [
                        1,
                        1
                    ],
                    [
                        1,
                        2
                    ],
                    [
                        2,
                        2
                    ],
                    [
                        2,
                        1
                    ]
                ]
            ],
            [
                [
                    [
                        4,
                        4
                    ],
                    [
                        4,
                        5
                    ],
                    [
                        5,
                        5
                    ],
                    [
                        5,
                        4
                    ]
                ]
            ]
        ]

        const poly = new Polygon(smallPoly);
        expect(poly.faces.size).to.equal(2);
        expect(poly.edges.size).to.equal(8);
    });
    it('Can parse GeoJSON one-loop polygon', () => {
        let geoJSON = {
            "type": "Polygon",
            "coordinates": [
                [
                    [100.0, 0.0],
                    [101.0, 0.0],
                    [101.0, 1.0],
                    [100.0, 1.0],
                    [100.0, 0.0]
                ]
            ]
        }
        const poly = new Polygon(geoJSON.coordinates);
        expect(poly.faces.size).to.equal(1);
        expect(poly.edges.size).to.equal(4);  // zero-length segment should be skipped
    });
    it('Can parse GeoJSON polygon with hole', () => {
        let geoJSON =    {
            "type": "Polygon",
            "coordinates": [
                [
                    [100.0, 0.0],
                    [101.0, 0.0],
                    [101.0, 1.0],
                    [100.0, 1.0],
                    [100.0, 0.0]
                ],
                [
                    [100.8, 0.8],
                    [100.8, 0.2],
                    [100.2, 0.2],
                    [100.2, 0.8],
                    [100.8, 0.8]
                ]
            ]
        }
        const poly = new Polygon(geoJSON.coordinates);
        expect(poly.faces.size).to.equal(2);
        expect(poly.edges.size).to.equal(8);  // zero-length segment should be skipped

        const [o1, o2] = [...poly.faces].map( face => face.orientation());
        expect(o1).to.not.equal(o2);
    });
    it('Can parse GeoJSON multi-polygon', () => {
        let geoJSON =    {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [102.0, 2.0],
                        [103.0, 2.0],
                        [103.0, 3.0],
                        [102.0, 3.0],
                        [102.0, 2.0]
                    ]
                ],
                [
                    [
                        [100.0, 0.0],
                        [101.0, 0.0],
                        [101.0, 1.0],
                        [100.0, 1.0],
                        [100.0, 0.0]
                    ],
                    [
                        [100.2, 0.2],
                        [100.2, 0.8],
                        [100.8, 0.8],
                        [100.8, 0.2],
                        [100.2, 0.2]
                    ]
                ]
            ]
        }
        const poly = new Polygon(geoJSON.coordinates);
        expect(poly.faces.size).to.equal(3);
        expect(poly.edges.size).to.equal(12);

        const [o1, o2, o3] = [...poly.faces].map( face => face.orientation());
        expect(o1).to.equal(o2);
        expect(o2).to.not.equal(o3);
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
    it('Can construct multi polygon using constructor', function () {
        let points = [point(1,1), point(5,1), point(3, 5), point(-1,-1), point(-5,-1), point(-3, -5),];
        let segments1 = [segment(points[0], points[1]), segment(points[1], points[2]), segment(points[2], points[0])];
        let segments2 = [segment(points[3], points[4]), segment(points[4], points[5]), segment(points[5], points[3])];
        let polygon = new Polygon([segments1, segments2]);

        expect(polygon.faces.size).to.equal(2);
        expect(polygon.edges.size).to.equal(6);
        expect([...polygon.faces][0].size).to.equal(3);
        expect([...polygon.faces][1].size).to.equal(3);
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
        polygon.addFace([
            point(1,1), point(3,1), point(3,2), point(1,2)
        ]);
        expect(polygon.area()).to.equal(2);
    });
    it('"Illegal parameters" when computing area of a valid polygon #220 case 3', function () {
        // This test (and the code of arc.breakToFunctional and arc.sweep)
        // assumes that arcs become circles only when abs(startAngle - endAngle)
        // is 2 PI within tolerance, but not when the span of the angles we pass
        // in is *bigger* than 2 PI. That's as good a choice as any, and seems
        // to be consistent behavior across Flatten, but it's worth noting that
        // it could be that anything > 2 PI is a circle, and this would allow
        // for arcs arbitrarily close to full circles (within float epsilon) to
        // be distinguished from circles and treated appropriately.
        const c3 = new Polygon([
            arc(point(0, 0), 1, 2 * Math.PI * 1.4999998, 0.000001, true),
            segment(point(1, 0).rotate(0.000001), point(0, 0)),
            segment(point(0, 0), point(1, 0).rotate(2 * Math.PI * 1.4999998)),
        ]);

        const area = c3.area();
        expect(area).to.be.approximately(((2 * Math.PI * 1.4999998 - 2 * Math.PI) + 0.000001) / 2, 0.001);
    })
    it('"Illegal parameters" when computing area of a valid polygon #220 case #1', function () {
        const a1 = arc(point(0, 0), 1, 2 * Math.PI * 0.9999999, 0.000001, true);
        const c1 = new Polygon([
            a1,
            segment(a1.end, point(Math.SQRT1_2, Math.SQRT1_2)),
            segment(point(Math.SQRT1_2, Math.SQRT1_2), a1.start)
        ]);
        const area1 = c1.area();
        expect(area1).to.be.lessThan(Flatten.DP_TOL);
    })
    it('"Illegal parameters" when computing area of a valid polygon #220 case #2', function () {
        const a2 = arc(point(0, 0), 1, 2 * Math.PI * 0.9999999, (Math.PI / 2) * 0.9999993, true)
        const c2 = new Polygon([
            a2,
            segment(a2.end, point(Math.SQRT1_2, Math.SQRT1_2)),
            segment(point(Math.SQRT1_2, Math.SQRT1_2), a2.start)
        ]);

        const area2 = c2.area();
        expect(area2).to.be.approximately(Math.PI/4 - Math.SQRT1_2, 0.001);
    })
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
    it('Can check if contour contains segment (issue #31)', function() {
        const points = [
            point(306, 306),
            point(647, 211),
            point(647, 109),
            point(147, 109),
            point(147, 491),
            point(600, 491),
            point(600, 401),
            point(379, 401),
        ];
        const poly = new Polygon(points);
        const lineA = line(point(550, 491), point(500, 401));
        const lineB = line(point(520, 491), point(500, 401));
        const intersectPointsA = poly.intersect(lineA);
        const intersectPointsB = poly.intersect(lineB);
        // const constSegmentOutA = new Segment(intersectPointsA[1], intersectPointsA[3]);
        expect(poly.contains(segment(intersectPointsA[0], intersectPointsA[1]))).to.be.true;
        expect(poly.contains(segment(intersectPointsA[1], intersectPointsA[2]))).to.be.false;
        expect(poly.contains(segment(intersectPointsA[2], intersectPointsA[3]))).to.be.true;
        expect(poly.contains(segment(intersectPointsA[0], intersectPointsA[2]))).to.be.false;
        expect(poly.contains(segment(intersectPointsA[1], intersectPointsA[3]))).to.be.false;

        expect(poly.contains(segment(intersectPointsB[0], intersectPointsB[1]))).to.be.true;
        expect(poly.contains(segment(intersectPointsB[1], intersectPointsB[2]))).to.be.false;
        expect(poly.contains(segment(intersectPointsB[2], intersectPointsB[3]))).to.be.true;
        expect(poly.contains(segment(intersectPointsB[0], intersectPointsB[2]))).to.be.false;
        expect(poly.contains(segment(intersectPointsB[1], intersectPointsB[3]))).to.be.false;

        expect(poly.contains(segment(intersectPointsA[2], intersectPointsB[3]))).to.be.true;
        expect(poly.contains(segment(intersectPointsA[2], intersectPointsB[2]))).to.be.true;
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
    it('distanceTo between Polygons: First point of segment is not always on the this polygon #57', function () {
        "use strict";

        let rec1 = new Box(0, 0, 200, 50);
        let rec2 = new Box(0, 500, 200, 550);
        const p1 = new Polygon(rec1);
        const p2 = new Polygon(rec2);

        let [dist, shortest_segment] = p1.distanceTo(p2);

        expect(dist).to.equal(450);
        expect(shortest_segment.ps).to.deep.equal({"x": 200, "y": 50});
        expect(shortest_segment.pe).to.deep.equal({"x": 200, "y": 500});
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
    it ('Can remove vertex and merge edges', function() {
        const a = new Polygon(box(0, 0, 100, 50));
        const b = new Polygon(box(0, 50, 100, 100));

        const union = unify(a, b);
        for (const pt of [point(0, 50), point(100, 50)]) {
            let edge_to_merge = union.findEdgeByPoint(pt);
            if (edge_to_merge === undefined) continue;
            union.removeEndVertex(edge_to_merge);
        }
        expect(union.faces.size).to.equal(1);
        expect(union.edges.size).to.equal(4);
    })
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

            let line = new Line(point(100, 20), point(300, 200));
            expect(polygon.intersect(line).length).to.equal(2);
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
            poly.addFace(points);

            let ip = poly.intersect(segment);
            expect(ip.length).to.equal(2);
            expect(ip[0]).to.deep.equal(point(150,20));
            expect(ip[1]).to.deep.equal(point(150,40));
        });
    });
    it('Can translate polygon', function() {
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

        let newPolygon = polygon.translate(vector(100,50));
        expect(newPolygon.faces.size).to.equal(1);
        expect(newPolygon.edges.size).to.equal(7);
    });
    it('Can rotate polygon', function() {
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

        let newPolygon = polygon.rotate(Math.PI/2, polygon.box.center);
        expect(newPolygon.faces.size).to.equal(1);
        expect(newPolygon.edges.size).to.equal(7);
    });
    it('Can transform polygon', function() {
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

        let pc = polygon.box.center;
        let m = matrix().translate(pc.x,pc.y).rotate(Math.PI/2).translate(-pc.x,-pc.y);
        let newPolygon = polygon.transform(m);
        expect(newPolygon.faces.size).to.equal(1);
        expect(newPolygon.edges.size).to.equal(7);
    });
    it('Issue #18 Division by zero error when checking if polygon contains a point',function() {
        const points = [
            new Point(-0.0774582, 51.4791865),
            new Point(-0.0784252, 51.4792941),
            new Point(-0.0774582, 51.4791865)
        ];
        const poly = new Polygon();
        poly.addFace(points);
        const pp = new Point(-0.07776044568759738, 51.47918678917519);
        const contains = poly.contains(pp);
        expect(contains).to.be.equal(false);
    });
    it('Can split polygon into islands (issue #9 in @flatten-js/boolean-op)', function() {
        let p1 = point(20, 20);
        let p2 = point(20, -20);
        let p3 = point(-20, -20) ;
        let p4 = point(-20, 20);
        let p5 = point(10, 10);
        let p6 = point(10, -10);
        let p7 = point(-10, -10) ;
        let p8 = point(-10, 10);
        let p9 = point(30, 5);
        let p10 = point(40, 5);
        let p11 = point(40, -5) ;
        let p12 = point(30, -5);

        let polygon = new Polygon([[p9, p10, p11, p12],[p1, p2, p3, p4 ],[p5, p8, p7, p6 ]]);
        let islandsArray = polygon.splitToIslands();

        expect(islandsArray.length).to.equal(2);
        expect(islandsArray[0].faces.size).to.equal(2);
        expect(islandsArray[0].edges.size).to.equal(8);
        expect(islandsArray[1].faces.size).to.equal(1);
        expect(islandsArray[1].edges.size).to.equal(4);
    });
    it('splitToIslands should not fail if the polygon is empty', function() {
        const polygon = new Polygon();
        const islandsArray = polygon.splitToIslands();

        expect(islandsArray.length).to.equal(0);
    });
    describe('#Flatten.Polygon.cut(multiline) methods', function() {
        it('Can cut polygon with line. Case of non-intersection', function() {
            let l = line( point(100,400), vector(0,1) );
            let points = [point(100, 20), point(250, 75), point(350, 75), point(300, 200), point(170, 200), point(120, 350), point(70, 120) ];
            let p = new Polygon(points);
            let cut_polygon = p.cutWithLine(l);

            expect(cut_polygon.faces.size).to.equal(p.faces.size);
            expect(cut_polygon.edges.size).to.equal(p.edges.size);
        });
        it('Can cut polygon with multiline line. Case of touching in one point', function() {
            let l = line( point(100,350), vector(0,1) );
            let points = [point(100, 20), point(250, 75), point(350, 75), point(300, 200), point(170, 200), point(120, 350), point(70, 120) ];
            let p = new Polygon(points);
            let mline = multiline([l]);
            let cut_polygon = p.cut(mline);

            expect(cut_polygon.faces.size).to.equal(p.faces.size);
            expect(cut_polygon.edges.size).to.equal(p.edges.size);
        });
        it('Can cut polygon with line into 2 polygons', function() {
            let l = line( point(100,175), vector(0,1) );
            let points = [point(100, 20), point(250, 75), point(350, 75), point(300, 200), point(170, 200), point(120, 350), point(70, 120) ];
            let p = new Polygon(points);
            let mline = multiline([l]);
            let cut_polygon = p.cut(mline);

            expect(cut_polygon.faces.size).to.equal(2);
            expect([...cut_polygon.faces][0].edges.length).to.equal(6);
            expect([...cut_polygon.faces][1].edges.length).to.equal(5);
        });
        it('Can cut polygon with line into 3 polygons', function() {
            let l = line( point(100,250), vector(0,1) );
            let points = [point(100, 20), point(250, 75), point(350, 75), point(300, 350), point(170, 200), point(120, 350), point(70, 120) ];
            let p = new Polygon(points);
            let mline = multiline([l]);
            let cut_polygon = p.cut(mline);

            expect(cut_polygon.faces.size).to.equal(3);
            const faces = [...cut_polygon.faces]
            expect(faces[0].edges.length).to.equal(9);
            expect(faces[1].edges.length).to.equal(3);
            expect(faces[2].edges.length).to.equal(3);
        });
    });

    it('Can cut polygon with holes by line. Case 1. Line cuts edge not in vertex', () => {
        const poly = new Polygon([
            [
                [0, 0],
                [100, 0],
                [100, 100],
                [0, 100]
            ],
            [
                [30, 30],
                [30, 70],
                [70, 70],
                [70, 30]
            ]
        ]);
        const l = line(point(50, 50), vector(1, 0));

        const res_poly = poly.cutWithLine(l);

        expect(res_poly.faces.size).to.equal(2);
        expect(res_poly.edges.size).to.equal(16);
    });

    it('Can cut polygon with holes by line. Case 2. Line is touching hole in vertex', () => {
        const poly = new Polygon([
            [
                [0, 0],
                [100, 0],
                [100, 100],
                [0, 100]
            ],
            [
                [30, 50],
                [50, 70],
                [70, 50],
                [50, 30]
            ]
        ]);
        const l = line(point(30, 0), vector(1, 0));

        const res_poly = poly.cutWithLine(l);

        expect(res_poly.faces.size).to.equal(3);
        expect(res_poly.edges.size).to.equal(14);
    });

    it('Can cut polygon without holes by line. Line is touching concave vertex', () => {
        let l = line(point(100, 250), vector(0.7, 1));
        let points = [
            point(100, 20),
            point(250, 75),
            point(350, 75),
            point(300, 350),
            point(170, 200),
            point(120, 350),
            point(70, 120)
        ];
        let poly = new Polygon(points);
        const res_poly = poly.cutWithLine(l);

        expect(res_poly.faces.size).to.equal(3);
        expect(res_poly.edges.size).to.equal(14);
    });
    it('Can cut polygon with MultiLine #159', () => {
        const poly = new Polygon([
            point(20, 20),
            point(60, 20),
            point(60, 60),
            point(20, 60)
        ]);
        const multiLine = new Multiline([
            segment(20, 20, 40, 40),
            segment(40, 40, 50, 40),
            segment(50, 40, 60, 60)
        ]);
        const newPoly = poly.cut(multiLine);

        expect(newPoly.faces.size).to.equal(2);
        expect(newPoly.edges.size).to.equal(10)
    })
    it('Polygon.cut error #175', () => {
        // Create polygon from json
        let json = [
            [
                {
                    ps: {x: 641.64, y: 118.32, name: "point"},
                    pe: {x: 641.64, y: 151.74, name: "point"},
                    name: "segment"
                },
                {
                    ps: {x: 641.64, y: 151.74, name: "point"},
                    pe: {x: 504.66, y: 151.74, name: "point"},
                    name: "segment"
                },
                {
                    ps: {x: 504.66, y: 151.74, name: "point"},
                    pe: {x: 504.66, y: 118.32, name: "point"},
                    name: "segment"
                },
                {
                    ps: {x: 504.66, y: 118.32, name: "point"},
                    pe: {x: 641.64, y: 118.32, name: "point"},
                    name: "segment"
                }
            ]
        ];

        let polygon = new Polygon(json);

        // Create Multiline
        let mlj = [
            {
                ps: {x: 576.48, y: 118.32, name: "point"},
                pe: {x: 576.48, y: 274.14, name: "point"},
                name: "segment"
            },
            {
                ps: {x: 576.48, y: 274.14, name: "point"},
                pe: {x: 641.64, y: 274.14, name: "point"},
                name: "segment"
            }
        ];
        let ml = multiline(mlj.map((s) => segment(s)));
        const newPoly = polygon.cut(ml)
        const a = newPoly.toArray()
        expect(newPoly.faces.size).to.equal(2);
        expect(newPoly.edges.size).to.equal(8)
    })
    it("Polygon cut error #176", () => {
        let polygon = new Polygon([
            [
                {
                    ps: {x: 310.1, y: 423.82, name: "point",},
                    pe: {x: 310.1, y: 460.66, name: "point",},
                    name: "segment",
                },
                {
                    ps: {x: 310.1, y: 460.66, name: "point",},
                    pe: {x: 189.98, y: 460.66, name: "point",},
                    name: "segment",
                },
                {
                    ps: {x: 189.98, y: 460.66, name: "point",},
                    pe: {x: 189.98, y: 423.94, name: "point",},
                    name: "segment",
                },
                {
                    ps: {x: 189.98, y: 423.94, name: "point",},
                    pe: {x: 210.5, y: 423.94, name: "point",},
                    name: "segment",
                },
                {
                    ps: {x: 210.5, y: 423.94, name: "point",},
                    pe: {x: 210.5, y: 313.75, name: "point",},
                    name: "segment",
                },
                {
                    ps: {x: 210.5, y: 313.75, name: "point",},
                    pe: {x: 272.66, y: 313.75, name: "point",},
                    name: "segment",
                },
                {
                    ps: {x: 272.66, y: 313.75, name: "point",},
                    pe: {x: 272.66, y: 325.99, name: "point",},
                    name: "segment",
                },
                {
                    ps: {x: 272.66, y: 325.99, name: "point",},
                    pe: {x: 291.38, y: 325.99, name: "point",},
                    name: "segment",
                },
                {
                    ps: {x: 291.38, y: 325.99, name: "point",},
                    pe: {x: 291.38, y: 423.94, name: "point",},
                    name: "segment",
                },
                {
                    ps: {x: 291.38, y: 423.94, name: "point",},
                    pe: {x: 310.1, y: 423.82, name: "point",},
                    name: "segment",
                },
            ]])

        let ml = new Multiline([
            {
                ps: {x: 210.5, y: 460.66, name: "point"},
                pe: {x: 210.5, y: 423.94, name: "point"},
                name: "segment",
            }, {
                ps: {x: 210.5, y: 423.94, name: "point",},
                pe: {x: 253.94, y: 423.94, name: "point",},
                name: "segment",
            },
            {
                ps: {x: 253.94, y: 423.94, name: "point",},
                pe: {x: 253.94, y: 442.3, name: "point",},
                name: "segment",
            },
            {
                ps: {x: 253.94, y: 442.3, name: "point",},
                pe: {x: 272.66, y: 442.3, name: "point",},
                name: "segment",
            },
            {
                ps: {x: 272.66, y: 442.3, name: "point",},
                pe: {x: 272.66, y: 460.66, name: "point",},
                name: "segment",
            },
        ].map(l => segment(l)))

        let slices = polygon.cut(ml)

        if (slices.toArray().length !== 3) {
            console.error('Cut fail.')
        }
    })
    it('Self-intersecting output when cutting a multipolygon with a multiline #205', () => {
        const input = new Polygon([[
            {"ps":{"x":0,"y":0,"name":"point"},"pe":{"x":0,"y":50,"name":"point"},"name":"segment"},
            {"ps":{"x":0,"y":50,"name":"point"},"pe":{"x":100,"y":50,"name":"point"},"name":"segment"},
            {"ps":{"x":100,"y":50,"name":"point"},"pe":{"x":100,"y":0,"name":"point"},"name":"segment"},
            {"ps":{"x":100,"y":0,"name":"point"},"pe":{"x":0,"y":0,"name":"point"},"name":"segment"}
        ],[
            {"ps":{"x":0,"y":50,"name":"point"},"pe":{"x":0,"y":100,"name":"point"},"name":"segment"},
            {"ps":{"x":0,"y":100,"name":"point"},"pe":{"x":100,"y":100,"name":"point"},"name":"segment"},
            {"ps":{"x":100,"y":100,"name":"point"},"pe":{"x":100,"y":50,"name":"point"},"name":"segment"},
            {"ps":{"x":100,"y":50,"name":"point"},"pe":{"x":0,"y":50,"name":"point"},"name":"segment"}
        ]])
        const cutline = new Multiline([
            new Segment(point(50,110), point(50, -10))
        ])
        const result = input.cut(cutline)
        expect(result.faces.size).to.equal(4)
        expect(result.edges.size).to.equal(16)
    })
    describe('#Intersections', function () {
        it('Can perform intersection between polygons', function () {
            const poly1 = new Polygon(
                [point(0, 0), point(150, 0), point(150, 30), point(0, 30)]
            );
            const poly2 = new Polygon(
                [point(100, 20), point(200, 20), point(200, 40), point(100, 40)]
            );
            const ip = intersectPolygon2Polygon(poly1, poly2)

            expect(ip.length).to.equal(2)
            expect(ip[0]).to.deep.equal({x:150, y:20})
            expect(ip[1]).to.deep.equal({x:100, y:30})
        });
        it('Can perform intersection between multiline and polygon', function() {
            let poly = new Polygon([
                point(100, 20),
                point(250, 75),
                point(350, 75),
                point(300, 200),
                point(170, 200),
                point(120, 350),
                point(70, 120)
            ]);
            let l = line( point(100,175), vector(0,1) );
            let mline = new Multiline([l]);
            let ip = intersectMultiline2Polygon(mline, poly)

            expect(ip.length).to.equal(2);
        });
    });
    describe('#SVG output', function () {
        it('Can create path element', function () {
            const poly = new Polygon(
                [point(0, 0), point(150, 0), point(150, 30), point(0, 30)]
            );

            const svg = poly.svg();
            expect(typeof svg).to.be.equal("string")
            expect(svg).to.not.equal("");
        });
        it('Can create dpath string', function () {
            const poly = new Polygon(
                [point(0, 0), point(150, 0), point(150, 30), point(0, 30)]
            );

            const svg = poly.dpath();
            expect(typeof svg).to.be.equal("string")
            expect(svg).to.not.equal("");
        });
    });
});
