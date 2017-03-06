/**
 * Created by Alex Bol on 2/18/2017.
 */
'use strict';

let expect = require('chai').expect;
let Flatten = require('../index');

describe('#Flatten-JS', function() {
    it('Version should be 0.0.1', function() {
        let version = Flatten.version;
        expect(version).to.equal("0.0.1");
    });
    it('Double point tolerance eqals to 0.000001', function() {
        let dp_tol = Flatten.DP_TOL;
        expect(dp_tol).to.equal(0.000001);
    });
    it('Class Point defined', function() {
        expect(Flatten.Point).to.exist;
    });
    it('Class Vector defined', function() {
        expect(Flatten.Vector).to.exist;
    });
});

describe('#Flatten.Point', function() {
    it('May create new Point', function() {
        let point = new Flatten.Point();
        expect(point).to.be.an.instanceof(Flatten.Point);
    });
    it('Default constructor creates new (0,0) point', function() {
        let point = new Flatten.Point();
        expect(point).to.deep.equal({x:0, y:0});
    });
    it('Method clone creates new instance of Point', function() {
        let point1 = new Flatten.Point(2,1);
        let point2 = point1.clone();
        expect(point2).to.be.an.instanceof(Flatten.Point);
        expect(point2).to.not.equal(point1);
        expect(point2).to.deep.equal(point1);
    });
    it('Method equalTo return true if points are equal', function() {
        let point = new Flatten.Point();
        let zero = new Flatten.Point(0,0);
        let equals = point.equalTo(zero);
        expect(equals).to.equal(true);
    });
    it('Method equalTo return true if points are equal up to DP_TOL tolerance', function() {
        let point1 = new Flatten.Point(1,1);
        let point2 = new Flatten.Point(1,1.000000999);
        let equals = point1.equalTo(point2);
        expect(equals).to.equal(true);
    });
    it('Method distanceTo return distance to other point ', function() {
        let point1 = new Flatten.Point(1,1);
        let point2 = new Flatten.Point(2,2);
        expect(point1.distanceTo(point2)).to.equal(Math.sqrt(2));
    });
    it ('Method translate returns new point translated by (dx, dy)', function() {
        let point = new Flatten.Point(1,1);
        let tpoint = point.translate(2,0);
        expect(tpoint).to.deep.equal({x:3,y:1});
    });
    it ('Method rotates returns new point rotated by default around (0.0), counter clockwise', function() {
        let point = new Flatten.Point(1,1);
        let rotated_point = point.rotate(Math.PI/2);
        let expected_point = new Flatten.Point(-1, 1);
        let equals = rotated_point.equalTo(expected_point);
        expect(equals).to.equal(true);
    });
    it ('Method rotate returns new point rotated around center, counter clockwise', function() {
        let point = new Flatten.Point(2,1);
        let center = new Flatten.Point(1,1);
        let rotated_point = point.rotate(Math.PI/2, center);
        let expected_point = new Flatten.Point(1, 2);
        let equals = rotated_point.equalTo(expected_point);
        expect(equals).to.equal(true);
    });
    it ('Method translate returns new point translated by vector', function() {
        let point = new Flatten.Point(1,1);
        let v = new Flatten.Vector(2,0);
        let tpoint = point.translate(v);
        expect(tpoint).to.deep.equal({x:3,y:1});
    });
    it('Method translate with illegal parameters throws error', function () {
        let point = new Flatten.Point(1,1);
        let v = new Flatten.Vector(2,0);
        let fn = function() { return point.translate(v,1) };
        expect(fn).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
    });
    it ('Method returns projection point on given line', function() {
        let anchor = new Flatten.Point(1,1);
        let norm = new Flatten.Vector(0,1);
        let line = new Flatten.Line(anchor, norm);
        let pt = new Flatten.Point(2,2);
        let proj_pt = pt.projectionOn(line);
        expect(proj_pt).to.deep.equal({x:2,y:1});
    });
    it ('Method distanceTo calculates distance to given line', function() {
        let anchor = new Flatten.Point(1,1);
        let norm = new Flatten.Vector(0,1);
        let line = new Flatten.Line(anchor, norm);
        let pt = new Flatten.Point(2,2);
        expect(pt.distanceTo(line)).to.equal(1);
    });
    it('Method "on" returns true if point belongs to given line', function () {
        let pt1 = new Flatten.Point(1,1);
        let pt2 = new Flatten.Point(2,2);
        let pt3 = new Flatten.Point(3,3);
        let line = new Flatten.Line(pt1, pt2);
        expect(pt3.on(line)).to.equal(true);
    });
    it('Method intersect returns array of intersection points if intersection exist', function () {
        let line1 = new Flatten.Line(new Flatten.Point(0,1), new Flatten.Point(2,1));
        let line2 = new Flatten.Line(new Flatten.Point(1,0), new Flatten.Point(1,2));
        let ip = line1.intersect(line2);
        let expected_ip = new Flatten.Point(1,1);
        expect(ip.length).to.equal(1);

        let equals = ip[0].equalTo(expected_ip);
        expect(equals).to.equal(true);
    });
    it('Method intersect returns zero length array if intersection does not exist', function () {
        let line1 = new Flatten.Line(new Flatten.Point(0,1), new Flatten.Point(2,1));
        let line2 = new Flatten.Line(new Flatten.Point(0,2), new Flatten.Point(2,2));
        let ip = line1.intersect(line2);
        expect(ip.length).to.equal(0);
    });

});

describe('#Flatten.Vector', function() {
    it('May create new instance of Vector', function () {
        let vector = new Flatten.Vector(1,1);
        expect(vector).to.be.an.instanceof(Flatten.Vector);
    });
    it('Default constructor creates new Vector(0, 0)', function () {
        let vector = new Flatten.Vector();
        expect(vector).to.deep.equal({x:0,y:0});
    });
    it('Constructor Vector(x, y) creates vector [x, y]', function () {
        let vector = new Flatten.Vector(1,1);
        expect(vector).to.deep.equal({x:1, y:1});
    });
    it('Constructor Vector(ps, pe) creates vector [ps, pe]', function () {
        let ps = new Flatten.Point(1,1);
        let pe = new Flatten.Point(3,2);
        let vector = new Flatten.Vector(ps,pe);
        expect(vector).to.deep.equal({x:2, y:1});
    });
    it('Constructor Vector with illegal parameters throw error', function () {
        let ps = new Flatten.Point(1,1);
        let fn = function() { new Flatten.Vector(ps,2) };
        expect(fn).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
    });
    it('Method clone creates new instance of Vector', function() {
        let v1 = new Flatten.Vector(2,1);
        let v2 = v1.clone();
        expect(v2).to.be.an.instanceof(Flatten.Vector);
        expect(v2).to.not.equal(v1);
        expect(v2).to.deep.equal(v1);
    });
    it('Method mutliply vector by scalar', function() {
        let v1 = new Flatten.Vector(2,1);
        let v2 = v1.multiply(2);
        expect(v2).to.deep.equal({x:4,y:2});
    });
    it('Method dot calculates dot product', function() {
        let v1 = new Flatten.Vector(2,0);
        let v2 = new Flatten.Vector(0,2);
        expect(v1.dot(v2)).to.equal(0);
    });
    it('Method cross calculates cross product', function() {
        let v1 = new Flatten.Vector(2,0);
        let v2 = new Flatten.Vector(0,2);
        expect(v1.cross(v2)).to.equal(4);
    });
    it('Method len calculates vector length', function() {
        let v = new Flatten.Vector(1,1);
        expect(v.len()).to.equal(Math.sqrt(2));
    });
    it('Method slope calculates angle in radians between vector and axe x', function() {
        let v = new Flatten.Vector(1,1);
        expect(v.slope()).to.equal(Math.PI/4);
    });
    it('Method normalize returns unit vector', function() {
        let v = new Flatten.Vector(1,1);
        let equals = Flatten.Utils.EQ(v.normalize().len(), 1.0);
        expect(equals).to.equal(true);
    });
    it('Method normalize throw error on zero length vector', function () {
        let v = new Flatten.Vector(0,0);
        let fn = function() { v.normalize() };
        expect(fn).to.throw(Flatten.Errors.ZERO_DIVISION);
    });
    it ('Method rotate returns new vector rotated by given angle, positive angle defines rotation in counter clockwise direction', function() {
        let vector = new Flatten.Vector(1,1);
        let angle = Math.PI/2;
        let rotated_vector = vector.rotate(angle);
        let expected_vector = new Flatten.Vector(-1, 1);
        let equals = rotated_vector.equalTo(expected_vector);
        expect(equals).to.equal(true);
    });
    it ('Method rotate rotates clockwise when angle is negative', function() {
        let vector = new Flatten.Vector(1,1);
        let angle = -Math.PI/2;
        let rotated_vector = vector.rotate(angle);
        let expected_vector = new Flatten.Vector(1, -1);
        let equals = rotated_vector.equalTo(expected_vector);
        expect(equals).to.equal(true);
    });
});

describe('#Flatten.Line', function() {
    it('May create new instance of Line', function () {
        let line = new Flatten.Line();
        expect(line).to.be.an.instanceof(Flatten.Line);
    });
    it('Default constructor creates new line that is equal to axe x', function() {
        let line = new Flatten.Line();
        expect(line.pt).to.deep.equal({x:0, y:0});
        expect(line.norm).to.deep.equal({x:0, y:1});
    });
    it('Constructor Line(pt1, pt2) creates line that passes through two points', function () {
        let pt1 = new Flatten.Point(1,1);
        let pt2 = new Flatten.Point(2,2);
        let line = new Flatten.Line(pt1, pt2);
        let equals = line.norm.equalTo(new Flatten.Vector(-1,1));
        expect(line.pt).to.deep.equal({x:1, y:1});
        expect(equals).to.equal(true);
    });
    it('Constructor Line(pt, norm) creates same line as Line(norm,pt)', function () {
        let pt = new Flatten.Point(1,1);
        let norm = new Flatten.Vector(-1,1);
        let line1 = new Flatten.Line(pt, norm);
        let line2 = new Flatten.Line(norm, pt);
        expect(line1.pt).to.deep.equal(line2.pt);
        expect(line1.norm).to.deep.equal(line2.norm);
    });
    it('Illegal Constructor throws error', function () {
        let pt = new Flatten.Point(1, 1);
        let fn1 = function() { new Flatten.Line(pt) };
        let fn2 = function() { new Flatten.Line(pt, '123') };
        let fn3 = function() { new Flatten.Line(pt, pt) };
        let fn4 = function() { new Flatten.Line(pt, new Flatten.Vector(0,0)) };
        expect(fn1).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
        expect(fn2).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
        expect(fn3).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
        expect(fn4).to.throw(Flatten.Errors.ILLEGAL_PARAMETERS);
    });
    it('Method slope calculates angle in radians between line and axe x', function() {
        let pt1 = new Flatten.Point(1,1);
        let pt2 = new Flatten.Point(2,2);
        let line = new Flatten.Line(pt1, pt2);
        expect(line.slope()).to.equal(Math.PI/4);
    });
    it('Method contains returns true if point belongs to the line', function () {
        let pt1 = new Flatten.Point(1,1);
        let pt2 = new Flatten.Point(2,2);
        let pt3 = new Flatten.Point(3,3);
        let line = new Flatten.Line(pt1, pt2);
        expect(line.contains(pt3)).to.equal(true);
    });

});