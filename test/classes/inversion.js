/**
 * Created by Alex Bol on 9/8/2017.
 */
'use strict';

import { expect } from 'chai';
// import Flatten from '../../index';

import {Point, Circle, Line, Inversion} from '../../index';
import {point, circle, line, vector} from '../../index';

describe('#Flatten.Inversion', function() {
    it('May create new instance of Inversion object', function () {
        const I = new Inversion(circle(point(100,100),50));
        expect(I).to.be.an.instanceof(Inversion);
    });
    it('May construct inversion operator with given circle', () => {
        const I = new Inversion(circle(point(100,100),50));
        expect(I.circle).to.deep.equal(circle(point(100,100),50))
    });
    it('May invert point around circle', () => {
        const I = new Inversion(circle(point(100,100),50));
        const p = point(200,100);
        const inv_p = I.inverse(p);
        expect(inv_p).to.deep.equal(point(125,100));

        /* test inversion property */
        const d1 = I.inversion_circle.center.distanceTo(p)[0];
        const d2 = I.inversion_circle.center.distanceTo(inv_p)[0];
        expect(d1 * d2).to.equal(I.inversion_circle.r * I.inversion_circle.r);
    });
    it('May invert line in circle, line does not pass through inversion center', () => {
        const I = new Inversion(circle(point(100,100),50));
        const l = line(point(200,100), vector(1,0));
        const inv_circle = I.inverse(l);

        expect(inv_circle).to.deep.equal(circle(point(112.5,100), 12.5));
        /* Expect inv_circle pass through inversion center */
        expect(inv_circle.contains(I.inversion_circle.center)).to.be.true;
    })
    it('May invert line in circle, line pass through inversion center', () => {
        const center = point(100,100);
        const I = new Inversion(circle(center,50));
        const l = line(center, vector(1,0));
        const inv_line = I.inverse(l);

        /* Expect line to be mapped to itself */
        expect(inv_line).to.deep.equal(l);
    })
    it('May invert circle in circle, circle does not pass through inversion center', () => {
        const I = new Inversion(circle(point(100,100),50));
        const c = circle(point(250,100), 50);
        const inv_circle = I.inverse(c);

        expect(inv_circle).to.deep.equal(circle(point(118.75,100),6.25));
    })
    it('May invert circle in circle, circle passes through inversion center', () => {
        const I = new Inversion(circle(point(100,100),50));
        const c = circle(point(200,100), 100);
        const inv_line = I.inverse(c);

        /* Expect circle passes through inversion center mapped to the line */
        expect(inv_line).to.deep.equal(line(point(112.5,100),vector(1,0)));

        /* Expect line to pass through intersection points between circles */
        const ip = I.inversion_circle.intersect(c);
        expect(inv_line.contains(ip[0])).to.be.true;
        expect(inv_line.contains(ip[1])).to.be.true;
    })

});

