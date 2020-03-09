/**
 * Created by Alex Bol on 9/8/2017.
 */
'use strict';

import { expect } from 'chai';

import {Circle, Line, } from '../../index';
import {point, circle, line} from '../../index';
import {inverse} from '../../src/algorithms/inversion';

describe('#Flatten.Inversion', function() {
    it('Line passing through inversion center mapped into itself ', function () {
        const ic = circle( point(2,2), 5);
        const test_line = line(point(-5,2), point(5,2));
        const inv_res = inverse(test_line, ic);

        expect(inv_res).to.be.an.instanceof(Line);
        expect(inv_res).to.be.deep.equal(test_line);
    });
    it('Line not passing through inversion center is mapping into circle ', function () {
        const ic = circle( point(2,2), 5);
        const test_line = line(point(-5,10), point(5,10));
        const inv_res = inverse(test_line, ic);

        expect(inv_res).to.be.an.instanceof(Circle);
    });
    it('Circle not passing through inversion center is mapping into circle ', function () {
        const ic = circle( point(2,2), 5);
        const test_circle = circle(point(-5,10), 5);
        const inv_res = inverse(test_circle, ic);

        expect(inv_res).to.be.an.instanceof(Circle);
    });
    it('Circle passing through inversion center is mapping into line', function () {
        const ic = circle( point(2,2), 5);
        const test_circle = circle(point(-8,2), 10);
        const inv_res = inverse(test_circle, ic);

        expect(inv_res).to.be.an.instanceof(Line);
    });
});
