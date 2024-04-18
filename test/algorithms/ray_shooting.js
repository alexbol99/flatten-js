'use strict';

import { expect } from 'chai';
import Flatten from '../../index';
import {Polygon, point,circle} from '../../index';
import {ray_shoot} from "../../src/algorithms/ray_shooting";

describe('#Algorithms.Ray_Shooting', function() {
    it('Function defined', function () {
        expect(ray_shoot).to.exist;
        expect(ray_shoot).to.be.a('function');
    });
    it('Can check point in contour. Rectangle Case 1 Inside',function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,3), point(1,3)];
        let face = polygon.addFace(points);
        let contains = ray_shoot(polygon, point(2,2));
        expect(contains).to.be.equal(Flatten.INSIDE);
    });
    it('Can check point in contour. Rectangle Case 2 Quick reject - outside',function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,3), point(1,3)];
        let face = polygon.addFace(points);
        let contains = ray_shoot(polygon, point(0,2));
        expect(contains).to.be.equal(Flatten.OUTSIDE);
    });
    it('Can check point in contour. Rectangle Case 3. Boundary overlapping',function() {
        let polygon = new Polygon();
        let points = [point(1,1), point(3,1), point(3,3), point(1,3)];
        let face = polygon.addFace(points);
        let contains = ray_shoot(polygon, point(2,3));
        expect(contains).to.be.equal(Flatten.BOUNDARY);
    });
    it('Can check point in contour. Circle Case 1 Boundary top',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        polygon.addFace([a]);
        //polygon.addFace([b]);
        let pt = point(200,100);
        let contains = ray_shoot(polygon, pt);
        expect(contains).to.be.equal(Flatten.BOUNDARY);
    });
    it('Can check point in contour. Donut Case 1 Boundary top',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        let b = circle(point(200,200), 75).toArc(false);
        polygon.addFace([a]);
        polygon.addFace([b]);
        let pt = point(200,100);
        let contains = ray_shoot(polygon, pt);
        expect(contains).to.be.equal(Flatten.BOUNDARY);
    });
    it('Can check point in contour. Donut Case 2 Center',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        let b = circle(point(200,200), 75).toArc(false);
        polygon.addFace([a]);
        polygon.addFace([b]);
        let pt = point(200,200);
        let contains = ray_shoot(polygon, pt);
        expect(contains).to.be.equal(Flatten.OUTSIDE);
    });
    it('Can check point in contour. Donut Case 3 Inside',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        let b = circle(point(200,200), 75).toArc(false);
        polygon.addFace([a]);
        polygon.addFace([b]);
        let pt = point(200,290);
        let contains = ray_shoot(polygon, pt);
        expect(contains).to.be.equal(Flatten.INSIDE);
    });
    it('Can check point in contour. Donut Case 4 Boundary inner circle start',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        let b = circle(point(200,200), 75).toArc(false);
        polygon.addFace([a]);
        polygon.addFace([b]);
        let pt = point(125, 200);
        let contains = ray_shoot(polygon, pt);
        expect(contains).to.be.equal(Flatten.BOUNDARY);
    });
    it('Can check point in contour. Donut Case 5 Another island inside',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        let b = circle(point(200,200), 75).toArc(false);
        let c = circle(point(200,200), 20).toArc(true);
        polygon.addFace([a]);
        polygon.addFace([b]);
        polygon.addFace([c]);
        let pt = point(200, 200);
        let contains = ray_shoot(polygon, pt);
        expect(contains).to.be.equal(Flatten.INSIDE);
    });
    it('Can check point in contour. Donut Case 6 Another island inside',function() {
        let polygon = new Polygon();
        let a = circle(point(200,200), 100).toArc(true);
        let b = circle(point(200,200), 75).toArc(false);
        let c = circle(point(200,200), 20).toArc(true);
        polygon.addFace([a]);
        polygon.addFace([b]);
        polygon.addFace([c]);
        let pt = point(150, 210);
        let contains = ray_shoot(polygon, pt);
        expect(contains).to.be.equal(Flatten.OUTSIDE);
    });
    
    it('Can check point in contour. Multipolygon with touching faces - outside', function() {
        const polygon = new Flatten.Polygon();
        polygon.addFace([ point(90, 10), point(100, 10), point(100, 50), point(90, 50) ]);
        polygon.addFace([ point(100, 0), point(120, 0), point(120, 10), point(100, 10) ]);

        let contains = ray_shoot(polygon, point(85, 10));
        expect(contains).to.be.equal(Flatten.OUTSIDE);
    })

    it('Can check point in contour. Multipolygon with touching faces - boundary', function() {
        const polygon = new Flatten.Polygon();
        polygon.addFace([ point(90, 10), point(100, 10), point(100, 50), point(90, 50) ]);
        polygon.addFace([ point(100, 0), point(120, 0), point(120, 10), point(100, 10) ]);

        let contains = ray_shoot(polygon, point(95, 10));
        expect(contains).to.be.equal(Flatten.BOUNDARY);
    })

    it('Can check point in contour. Polygon with self-touching face - outside', function() {
        const polygon = new Flatten.Polygon();
        polygon.addFace([
            point(90, 10), point(100, 10), point(100, 50), point(110, 50), point(110, 10), point(100, 10), point(100, 0),
            point(120, 0), point(120, 60), point(90, 60)
        ]);

        let contains = ray_shoot(polygon, point(85, 10));
        expect(contains).to.be.equal(Flatten.OUTSIDE);
    })
});