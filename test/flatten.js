/**
 * Created by Alex Bol on 9/8/2017.
 */

'use strict';

import { expect } from 'chai';
import Flatten from '../src/index';

let {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray, Matrix} = Flatten;
let {point, vector, circle, line, segment, arc, ray} = Flatten;
let {Distance, PlanarSet} = Flatten;

describe('#Flatten-JS', function() {
    it('Class Matrix defined', function() {
        expect(Matrix).to.exist;
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
        expect(Edge).to.exist;
    });
    it('Class Ray defined', function() {
        expect(Ray).to.exist;
    });
    it('Namespace Distance defined', function() {
        expect(Distance).to.exist;
    });
});

