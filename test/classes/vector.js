/**
 * Created by Alex Bol on 9/8/2017.
 */

'use strict';

import { expect } from 'chai';
import Flatten from '../../index';

import {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} from '../../index';
import {point, vector, circle, line, segment, arc, ray} from '../../index';

describe('#Flatten.Vector', function() {
    it('May create new instance of Vector', function () {
        let vector = new Vector(1,1);
        expect(vector).to.be.an.instanceof(Vector);
    });
    it('Default constructor creates new Vector(0, 0)', function () {
        let vector = new Vector();
        expect(vector).to.deep.equal({x:0,y:0});
    });
    it('Constructor Vector(x, y) creates vector [x, y]', function () {
        let vector = new Vector(1,1);
        expect(vector).to.deep.equal({x:1, y:1});
    });
    it('Constructor Vector(ps, pe) creates vector [ps, pe]', function () {
        let ps = new Point(1,1);
        let pe = new Point(3,2);
        let vector = new Vector(ps,pe);
        expect(vector).to.deep.equal({x:2, y:1});
    });
    it('Constructor Vector([x, y]) creates vector [x, y]', function () {
        let vector = new Vector([1,1]);
        expect(vector).to.deep.equal({x:1, y:1});
    });
    it('Constructor Vector with illegal parameters throw error', function () {
        let ps = new Point(1,1);
        let fn = function() { new Vector(ps,2) };
        expect(fn).to.throw(ReferenceError);
    });
    it('New vector may be constructed by function call', function() {
        expect(vector(point(1,1), point(3,3))).to.deep.equal({x:2, y:2});
    });
    it('Method clone creates new instance of Vector', function() {
        let v1 = new Vector(2,1);
        let v2 = v1.clone();
        expect(v2).to.be.an.instanceof(Vector);
        expect(v2).to.not.equal(v1);
        expect(v2).to.deep.equal(v1);
    });
    it('Method mutliply vector by scalar', function() {
        let v1 = new Vector(2,1);
        let v2 = v1.multiply(2);
        expect(v2).to.deep.equal({x:4,y:2});
    });
    it('Method dot calculates dot product', function() {
        let v1 = new Vector(2,0);
        let v2 = new Vector(0,2);
        expect(v1.dot(v2)).to.equal(0);
    });
    it('Method cross calculates cross product', function() {
        let v1 = new Vector(2,0);
        let v2 = new Vector(0,2);
        expect(v1.cross(v2)).to.equal(4);
    });
    it('Method length calculates vector length', function() {
        let v = new Vector(1,1);
        expect(v.length).to.equal(Math.sqrt(2));
    });
    it('Get slope - angle in radians between vector and axe x', function() {
        let v1 = new Vector(1,1);
        let v2 = new Vector(-1,1);
        let v3 = new Vector(-1,-1);
        let v4 = new Vector(1,-1);
        expect(v1.slope).to.equal(Math.PI/4);
        expect(v2.slope).to.equal(3*Math.PI/4);
        expect(v3.slope).to.equal(5*Math.PI/4);
        expect(v4.slope).to.equal(7*Math.PI/4);
    });
    it('Method normalize returns unit vector', function() {
        let v = new Vector(1,1);
        let equals = Flatten.Utils.EQ(v.normalize().length, 1.0);
        expect(equals).to.equal(true);
    });
    it('Method normalize throw error on zero length vector', function () {
        let v = new Vector(0,0);
        let fn = function() { v.normalize() };
        expect(fn).to.throw(Error);
    });
    it ('Method rotate returns new vector rotated by given angle, positive angle defines rotation in counter clockwise direction', function() {
        let vector = new Vector(1,1);
        let angle = Math.PI/2;
        let rotated_vector = vector.rotate(angle);
        let expected_vector = new Vector(-1, 1);
        let equals = rotated_vector.equalTo(expected_vector);
        expect(equals).to.equal(true);
    });
    it ('Method rotate rotates clockwise when angle is negative', function() {
        let vector = new Vector(1,1);
        let angle = -Math.PI/2;
        let rotated_vector = vector.rotate(angle);
        let expected_vector = new Vector(1, -1);
        let equals = rotated_vector.equalTo(expected_vector);
        expect(equals).to.equal(true);
    });
    it ('Method add return sum of two vectors', function() {
        let v1 = vector(2,1);
        let v2 = vector(1,2);
        expect(v1.add(v2)).to.deep.equal({x:3,y:3});
    });
    it ('Method subtract returns difference between two vectors', function() {
        let v1 = vector(2,1);
        let v2 = vector(1,2);
        expect(v1.subtract(v2)).to.deep.equal({x:1,y:-1});
    });
    it('Method invert returns inverted vector', function() {
        let v = new Vector(2,1);
        expect(v.invert()).to.deep.equal({x:-2,y:-1});
    });

    it ('Method angle returns angle between two vectors', function() {
        let v = vector(3,0);
        let v1 = vector(3,3);
        let v2 = vector(0,3);
        let v3 = vector(-3,0);
        let v4 = vector(-3,-3);
        let v5 = vector(0,-3);
        let v6 = vector(3,-3);

        expect(Flatten.Utils.EQ(v.angleTo(v), 0)).to.be.true;
        expect(Flatten.Utils.EQ(v.angleTo(v1), Math.PI/4)).to.be.true;
        expect(Flatten.Utils.EQ(v.angleTo(v2), Math.PI/2)).to.be.true;
        expect(Flatten.Utils.EQ(v.angleTo(v3), Math.PI)).to.be.true;
        expect(Flatten.Utils.EQ(v.angleTo(v4), 5*Math.PI/4)).to.be.true;
        expect(Flatten.Utils.EQ(v.angleTo(v5), 3*Math.PI/2)).to.be.true;
        expect(Flatten.Utils.EQ(v.angleTo(v6), 7*Math.PI/4)).to.be.true;
    });
    it ('Method projection returns new vector case 1', function() {
        let v1 = vector(3,3);
        let v2 = vector(10,0);
        expect(v1.projectionOn(v2)).to.deep.equal({x:3,y:0})
    });
    it ('Method projection returns new vector case 2', function() {
        let v1 = vector(-3,3);
        let v2 = vector(10,0);
        let vp = vector(-3,0);
        expect(v1.projectionOn(v2).equalTo(vp)).to.be.true;
    });
    it ('Method projection returns new vector case 3', function() {
        let v1 = vector(3,3);
        let v2 = vector(-3,3);
        let vp = vector(0,0);
        expect(v1.projectionOn(v2).equalTo(vp)).to.be.true;
    });
});
