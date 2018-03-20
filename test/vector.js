/**
 * Created by Alex Bol on 9/8/2017.
 */

'use strict';

let expect = require('chai').expect;
// let Flatten = require('../index');
let Flatten = require('../dist/flatten.min');
let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} = Flatten;

let {point, vector, circle, line, segment, arc, ray} = Flatten;

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
    it('New vector may be constructed by function call', function() {
        expect(vector(point(1,1), point(3,3))).to.deep.equal({x:2, y:2});
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
    it('Method length calculates vector length', function() {
        let v = new Flatten.Vector(1,1);
        expect(v.length).to.equal(Math.sqrt(2));
    });
    it('Get slope - angle in radians between vector and axe x', function() {
        let v1 = new Flatten.Vector(1,1);
        let v2 = new Flatten.Vector(-1,1);
        let v3 = new Flatten.Vector(-1,-1);
        let v4 = new Flatten.Vector(1,-1);
        expect(v1.slope).to.equal(Math.PI/4);
        expect(v2.slope).to.equal(3*Math.PI/4);
        expect(v3.slope).to.equal(5*Math.PI/4);
        expect(v4.slope).to.equal(7*Math.PI/4);
    });
    it('Method normalize returns unit vector', function() {
        let v = new Flatten.Vector(1,1);
        let equals = Flatten.Utils.EQ(v.normalize().length, 1.0);
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
