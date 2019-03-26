/**
 * Created by Alex Bol on 9/8/2017.
 */

'use strict';

import { expect } from 'chai';
import Flatten from '../index';

import {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} from '../index';
import {point, vector, circle, line, segment, arc, ray} from '../index';

describe('#Flatten.Ray', function() {
    it('May create new instance of Ray', function () {
        let ray = new Ray();
        expect(ray).to.be.an.instanceof(Ray);
        expect(ray.start).to.be.deep.equal({x:0,y:0})
    });
    it('May return bounding box of ray', function () {
        let ray = new Ray(2,2);
        expect(ray.box).to.be.deep.equal({xmin:2,ymin:2,xmax:Number.POSITIVE_INFINITY,ymax:2});
    });
    it('May find intersection between ray and segment. Case 1. Quick reject', function() {
        let r =  ray(2,2);
        let seg = segment(point(0,3), point(1,1));
        let ip = r.intersect(seg);
        expect(ip.length).to.be.equal(0);
    });
    it('May find intersection between ray and segment. Case 2. No intersection', function() {
        let r =  ray(2,2);
        let seg = segment(point(0,3), point(3,0));
        let ip = r.intersect(seg);
        expect(ip.length).to.be.equal(0);
    });
    it('May find intersection between ray and segment. Case 3. Start intersection', function() {
        let r =  ray(2,2);
        let seg = segment(point(1,1), point(3,3));
        let ip = r.intersect(seg);
        expect(ip.length).to.be.equal(1);
        expect(ip[0]).to.be.deep.equal(point(2,2));
    });
    it('May find intersection between ray and segment. Case 4. One not start intersection', function() {
        let r =  ray(2,2);
        let seg = segment(point(4,0), point(4,4));
        let ip = r.intersect(seg);
        expect(ip.length).to.be.equal(1);
        expect(ip[0]).to.be.deep.equal(point(4,2));
    });
    it('May find intersection between ray and segment. Case 5. Two intersections', function() {
        let r =  ray(2,2);
        let seg = segment(point(4,2), point(8,2));
        let ip = r.intersect(seg);
        expect(ip.length).to.be.equal(2);
        expect(ip[0]).to.be.deep.equal(point(4,2));
        expect(ip[1]).to.be.deep.equal(point(8,2));
    });
    it('May find intersection between ray and arc. Case 1. Quick reject', function() {
        let r =  ray(3,3);
        let a = arc(point(6,0), 2, 0, Math.PI, Flatten.CCW);
        let ip = r.intersect(a);
        expect(ip.length).to.be.equal(0);
    });
    it('May find intersection between ray and arc. Case 2. No interection', function() {
        let r =  ray(3,3);
        let a = arc(point(4,3), 2, Math.PI/2, 3*Math.PI/2, Flatten.CCW);
        let ip = r.intersect(a);
        expect(ip.length).to.be.equal(0);
    });
    it('May find intersection between ray and arc. Case 3. One touching interection', function() {
        let r =  ray(3,3);
        let a = arc(point(6, 0), 3, Math.PI/2, 3*Math.PI/2, Flatten.CCW);
        let ip = r.intersect(a);
        expect(ip.length).to.be.equal(1);
        expect(ip[0]).to.be.deep.equal(point(6,3));
    });
    it('May find intersection between ray and arc. Case 4. One regular interection', function() {
        let r =  ray(3,3);
        let a = arc(point(4,3), 2, Math.PI/2, 3*Math.PI/2, Flatten.CW);
        let ip = r.intersect(a);
        expect(ip.length).to.be.equal(1);
        expect(ip[0]).to.be.deep.equal(point(6,3));
    });
    it('May find intersection between ray and arc. Case 5. Two interections', function() {
        let r =  ray(3,3);
        let a = arc(point(6,3), 3, 0, Math.PI, Flatten.CW);
        let ip = r.intersect(a);
        expect(ip.length).to.be.equal(2);
        expect(ip[0]).to.be.deep.equal(point(3,3));
        expect(ip[1]).to.be.deep.equal(point(9,3));
    });
});
