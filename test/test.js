/**
 * Created by Alex Bol on 2/18/2017.
 */
'use strict';

let expect = require('chai').expect;
let Flatten = require('../index');

describe('#Flatten-JS', function() {
    /*
    it('should be an instance of Flatten', function() {
        var result = Flatten instanceof Flatten;
        expect(result).to.equal(true);
    });
    */
    it('Version should be 0.0.1', function() {
        let version = Flatten.version;
        expect(version).to.equal("0.0.1");
    });
    it('Double point tolerance eqals to 0.000001', function() {
        let dp_tol = Flatten.DP_TOL;
        expect(dp_tol).to.equal(0.000001);
    });
    it('May create new Point', function() {
        let point = new Flatten.Point();
        expect(point).to.be.an.instanceof(Flatten.Point);
    });
});

describe('#Flatten.Point', function() {
    it('Default constructor creates new (0,0) point', function() {
        let point = new Flatten.Point();
        expect(point).to.deep.equal({x:0, y:0});
    });
    it('Method equalTo return true if points are equal', function() {
        let point = new Flatten.Point();
        let zero = new Flatten.Point(0,0);
        let equals = point.equalTo(zero);
        expect(equals).to.equal(true);
    });
});
