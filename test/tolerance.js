/**
 * @author Mark Dane
 */
'use strict';

import { expect } from 'chai';
import Flatten from '../index';

import {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} from '../index';
import {point, vector, circle, line, segment, arc, ray} from '../index';

describe('#Flatten.DP_TOL', function() {
    it('Default tolerace of 0.000001', function () {
        expect(Flatten.DP_TOL).to.be.equal(0.000001);
    });
    it('Change tolerance with Flatten.Utils.setTolerance', function() {
        const tolerance = 1e-3;
        Flatten.Utils.setTolerance(tolerance);
        expect(Flatten.DP_TOL).to.be.equal(tolerance);
        expect(Flatten.Utils.getTolerance()).to.be.equal(tolerance);

        const a = new Point(0,0);
        const b = new Point(1e-4, 1e-4);
    });
    it('Change tolerance with Flatten.DP_TOL', function() {
        const tolerance = 1e-3;
        Flatten.DP_TOL = tolerance;
        expect(Flatten.DP_TOL).to.be.equal(tolerance);
        expect(Flatten.Utils.getTolerance()).to.be.equal(tolerance);

        const a = new Point(0,0);
        const b = new Point(1e-4, 1e-4);
        expect(a.equalTo(b)).to.be.true;
    });
    it('Change tolerance with Flatten.Utils.DP_TOL', function() {
        const tolerance = 1e-3;
        Flatten.Utils.DP_TOL = tolerance;
        expect(Flatten.DP_TOL).to.be.equal(tolerance);
        expect(Flatten.Utils.getTolerance()).to.be.equal(tolerance);

        const a = new Point(0,0);
        const b = new Point(1e-4, 1e-4);
        expect(a.equalTo(b)).to.be.true;
    });
    it('Line.incidentTo with default tolerance value', function(){
        const norm = new Vector(0,1);
        const lineA =  new Line(new Point(0,0), norm);
        const lineB = new Line(new Point(1e-8, 1e-8), norm);
        const lineC = new Line(new Point(1e-3, 1e-3), norm);
        expect(lineA.incidentTo(lineB)).to.be.true;
        expect(lineA.incidentTo(lineC)).to.be.false;
    })
    it('Line.incidentTo with new tolerance value', function(){
        Flatten.DP_TOL = 0.001;
        const norm = new Vector(0,1);
        const lineA =  new Line(new Point(0,0), norm);
        const lineB = new Line(new Point(0.00001, 0.00001), norm);
        const lineC = new Line(new Point(0,0.002), norm);
        expect(lineA.incidentTo(lineB)).to.be.true;
        expect(lineA.incidentTo(lineC)).to.be.false;
    })
})