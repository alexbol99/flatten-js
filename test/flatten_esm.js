import { expect } from 'chai';
import Flatten from '../src/flatten';
import Point from '../src/classes/point';

describe('#Flatten-JS', function() {
    it('Namespace Flatten defined', function () {
        expect(Flatten).to.exist;
    });
    it('Constant DP_TOL is defined', function () {
        expect(Flatten.DP_TOL).to.exist;
    });
    it('Class Point defined', function () {
        expect(Point).to.exist;
    });
    it('May create new Point', function() {
        let point = new Flatten.Point();
        expect(point).to.be.an.instanceof(Flatten.Point);
    });
});