'use strict';

let expect = require('chai').expect;
let Flatten = require('../index');
// let now = require("performance-now");

let {Polygon} = Flatten;
let {point, segment, arc, circle} = Flatten;
let {clip} = Flatten;

describe('#Algorithms.Clip', function() {
    it('Function defined', function () {
        expect(clip).to.exist;
        expect(clip).to.be.a('function');
    });
    it('Can clip segment case 1 - 2 intersections', function () {
        "use strict";
        let points = [point(100, 20), point(200, 20), point(200, 40), point(100, 40)];
        let poly = new Polygon();
        poly.addFace(points);
        let seg = segment(point(0,30), point(300, 30));
        let clipped = clip(seg, poly, Flatten.CLIP_INSIDE);
        expect(clipped.length).to.equal(2);
        expect(clipped[0]).to.deep.equal(segment(point(0,30),point(100,30)));
        expect(clipped[1]).to.deep.equal(segment(point(200,30),point(300,30)));
    });
    // it('Can clip segment case 2 - 1 intersections, clip till end', function () {
    //     "use strict";
    //     let points = [point(100, 20), point(200, 20), point(200, 40), point(100, 40)];
    //     let poly = new Polygon();
    //     poly.addFace(points);
    //     let seg = segment(point(0,30), point(150, 30));
    //     let clipped = clip(seg, poly, Flatten.CLIP_INSIDE);
    //     expect(clipped.length).to.equal(1);
    //     expect(clipped[0]).to.deep.equal(segment(point(0,30),point(100,30)));
    // });

});
