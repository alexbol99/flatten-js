'use strict';

import { expect } from 'chai';
import DE9IM from '../src/data_structures/de9im';

describe('#data_structures.DE9IM', function () {
    it('Class DE9IM', function () {
        expect(DE9IM).to.exist;
    });
    it('May construct new instance of DE9IM', function() {
        let denim = new DE9IM();
        expect(denim).to.be.an.instanceof(DE9IM);
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
