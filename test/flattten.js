/**
 * Created by Alex Bol on 9/8/2017.
 */

'use strict';

require('jsdom-global')();
let expect = require('chai').expect;
let Flatten = require('../index');
let PlanarSet = require('../data_structures/planar_set');
let fs = require('fs');

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} = Flatten;

let {point, vector, circle, line, segment, arc, ray} = Flatten;

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
        expect(Point).to.exist;
    });
    it('Class Vector defined', function() {
        expect(Vector).to.exist;
    });
    it('Class Box defined', function() {
        expect(Box).to.exist;
    });
    it('Class Line defined', function() {
        expect(Line).to.exist;
    });
    it('Class Circle defined', function() {
        expect(Circle).to.exist;
    });
    it('Class Segment defined', function() {
        expect(Segment).to.exist;
    });
    it('Class Arc defined', function() {
        expect(Arc).to.exist;
    });
    it('Class Polygon defined', function() {
        expect(Polygon).to.exist;
    });
    it('Class Face defined', function() {
        expect(Polygon).to.exist;
    });
    it('Class Edge defined', function() {
        expect(Polygon).to.exist;
    });
    it('Class Ray defined', function() {
        expect(Ray).to.exist;
    });
});

