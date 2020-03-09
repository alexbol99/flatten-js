'use strict';

import { expect } from 'chai';
import DE9IM from '../../src/data_structures/de9im';

describe('#data_structures.DE9IM', function () {
    it('Class DE9IM', function () {
        expect(DE9IM).to.exist;
    });
    it('May construct new instance of DE9IM', function() {
        let denim = new DE9IM();
        expect(denim).to.be.an.instanceof(DE9IM);
    });
    it('May get access to any element of the matrix using getter function', function() {
        let denim = new DE9IM();
        denim.m.fill([]);
        expect(denim.I2I).be.an.instanceof(Array);
        expect(denim.I2B).be.an.instanceof(Array);
        expect(denim.I2E).be.an.instanceof(Array);
        expect(denim.B2I).be.an.instanceof(Array);
        expect(denim.B2B).be.an.instanceof(Array);
        expect(denim.B2E).be.an.instanceof(Array);
        expect(denim.E2I).be.an.instanceof(Array);
        expect(denim.E2B).be.an.instanceof(Array);
        expect(denim.E2E).be.an.instanceof(Array);
    });
    it('May set any element of the matrix using setter function', function() {
        let denim = new DE9IM();
        denim.I2I = []; expect(denim.I2I).be.an.instanceof(Array);
        denim.I2B = []; expect(denim.I2B).be.an.instanceof(Array);
        denim.I2E = []; expect(denim.I2E).be.an.instanceof(Array);
        denim.B2I = []; expect(denim.B2I).be.an.instanceof(Array);
        denim.B2B = []; expect(denim.B2B).be.an.instanceof(Array);
        denim.B2E = []; expect(denim.B2E).be.an.instanceof(Array);
        denim.E2I = []; expect(denim.E2I).be.an.instanceof(Array);
        denim.E2B = []; expect(denim.E2B).be.an.instanceof(Array);
        denim.E2E = []; expect(denim.E2E).be.an.instanceof(Array);
    });
    it('May output empty intersection matrix to relation string', function() {
        let denim = new DE9IM();
        expect(denim.toString()).to.be.equal('*********');
    });
    it('May transform DISJOINT intersection matrix to proper string', function() {
        let denim = new DE9IM();
        denim.I2I = [];
        denim.I2B = denim.B2I = [];
        denim.B2B = [];
        expect(denim.toString()).to.be.equal('FF*FF****');
    });
});
