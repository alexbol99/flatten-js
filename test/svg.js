/**
 * Created by Alex Bol on 3/25/2017.
 */

let expect = require('chai').expect;
// let Flatten = require('../index');
let Flatten = require('../dist/flatten.min');
let fs = require('fs');

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, PlanarSet} = Flatten;

let {point, vector, circle, line, segment, arc} = Flatten;

describe('#SVG Methods', function() {
    it('Create svg legal string for point', function() {
        let pt = point(3,4);
        console.log(pt.svg());
    });
    it('Create svg legal string for circle', function() {
        console.log(circle(point(3,4),5).svg());
    });
    it('Create svg legal string for segment', function() {
        console.log(segment(point(3,4),point(5,6)).svg());
    });
    it('Create svg legal string for arc', function() {
        console.log(arc(point(),10,Math.PI/4,3*Math.PI/4,true).svg());
    });
    it('Create svg file', function() {
        let svgstart = `<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">`;
        let svgend = `</svg>`;

        let a = arc(point(200, 150), 100, -Math.PI/6, 2*Math.PI, false );

        let shapes = [
            segment(10, 150, 300, 150),
            a,
            a.pc,
            a.start,
            a.end
        ];

        let parts = a.breakToFunctional();
        /*
         let s1 = segment(10,10,200,200);
         let s2 = segment(10,160,200,30);
         let c = circle(point(200, 110), 50);
         let ip = s1.intersect(s2);*/

        // let svgcontent = shapes.reduce((acc, shape) => acc + shape.svg(), "");

        let svgcontent = parts.reduce((acc, shape) => acc + shape.svg(), "");

        fs.writeFile("example.svg", svgstart + svgcontent + svgend, function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    });

    it('Create svg file 2', function() {
        let svgstart = `<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">`;
        let svgend = `</svg>`;

        // let a = arc(point(200, 150), 100, Math.PI/6, Math.PI/3, true ); // ok
        // let a = arc(point(200, 150), 100, Math.PI/6, 3*Math.PI/4, true ); // ok
        // let a = arc(point(200, 150), 100, Math.PI/6, Math.PI + Math.PI/6, true ); // ok
        // let a = arc(point(200, 150), 100, Math.PI/6, 3*Math.PI/2, true ); // ok
        // let a = arc(point(200, 150), 100, Math.PI/6, -Math.PI/6, true ); // ok
        // let a = arc(point(200, 150), 100, Math.PI/6, 0, true ); // ok
        let a = arc(point(200, 150), 100, Math.PI/6, Math.PI/12, true ); // ok
        // let a = arc(point(200, 150), 100, -Math.PI/6, 2*Math.PI, false );
        let parts = a.breakToFunctional();
        let svgcontent = parts.reduce((acc, shape) => acc + shape.svg() + shape.start.svg(), "");

        fs.writeFile("example2.svg", svgstart + svgcontent + svgend, function(err) {});
    });

    it('Create svg file 3', function() {
        let svgstart = `<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">`;
        let svgend = `\n</svg>`;

        let polygon = new Polygon();

        let vertices1 = [point(50,50), point(50,250), point(250, 250), point(250,50)];
        let vertices2 = [point(100,100), point(200,100), point(200, 200), point(100,200)];

        // let arcs = [
        //     arc(point(100,100), 50, 0, Math.PI/2, true),
        //     arc(point(100,200), 50, -Math.PI/2, 0, true),
        //     arc(point(200,200), 50, Math.PI, 3*Math.PI/2, true),
        //     arc(point(200,100), 50, Math.PI/2, Math.PI, true),
        // ];
        // let arcs = [
        //     arc(point(150,150), 50, 0, Math.PI, true),
        //     arc(point(150,150), 50, Math.PI, 0, true)
        // ];
        let arcs = [arc(point(150,150), 50, -Math.PI, Math.PI, true)];

        polygon.addFace(vertices1);
        // polygon.addFace(vertices2);
        polygon.addFace(arcs);

        let svgcontent = polygon.svg();
        // svgcontent += arcs.reduce((acc, shape) => acc + shape.svg(), svgcontent);

        fs.writeFile("example3.svg", svgstart + svgcontent + svgend, function(err) {});
    });
    it('Performance test - svg4', function() {
        let svgstart = `<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">`;
        let svgend = `\n</svg>`;

        let random = function(max) { return Math.floor(Math.random() * max) + 1;}

        let planarSet = new PlanarSet();

        for (let i=0; i < 100; i++) {
            planarSet.add( new Segment(random(600),random(600),random(600),random(600)) );
        }

        let pts = [];

        planarSet.forEach( (shape) => {
            let resp = planarSet.search(shape.box);
            for (let i=0; i < resp.length; i++) {
                let ip = shape.intersect(resp[i]);
                for (let j=0; j < ip.length; j++) {
                    pts.push(ip[j]);
                }
            }
        });
        // planarSet.add(pts);

        let svgcontent = planarSet.svg();
        // svgcontent += arcs.reduce((acc, shape) => acc + shape.svg(), svgcontent);

        // fs.writeFile("example4.svg", svgstart + svgcontent + svgend, function(err) {});
    });

});
