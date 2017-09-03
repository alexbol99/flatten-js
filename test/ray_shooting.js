'use strict';

let expect = require('chai').expect;
let Flatten = require('../index');
// let now = require("performance-now");

let {Polygon} = Flatten;
let {point, segment, arc} = Flatten;
let {ray_shoot} = Flatten;

describe('#Algorithms.Ray_Shooting', function() {
    it('Function defined', function () {
        expect(ray_shoot).to.exist;
        expect(ray_shoot).to.be.a('function');
    });
    it('Can check point in contour. Case 1 Inside',function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,3), point(1,3)];
        let face = polygon.addFace(points);
        let contains = ray_shoot(polygon, point(2,2));
        expect(contains).to.be.equal(Flatten.INSIDE);
    });
    it('Can check point in contour. Case 2 Quick reject - outside',function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,3), point(1,3)];
        let face = polygon.addFace(points);
        let contains = ray_shoot(polygon, point(0,2));
        expect(contains).to.be.equal(Flatten.OUTSIDE);
    });
    it('Can check point in contour. Case 3. Boundary',function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,3), point(1,3)];
        let face = polygon.addFace(points);
        let contains = ray_shoot(polygon, point(2,3));
        expect(contains).to.be.equal(Flatten.BOUNDARY);
    });
});