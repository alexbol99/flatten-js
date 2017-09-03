'use strict';

let expect = require('chai').expect;
let Flatten = require('../index');
// let now = require("performance-now");

let {point, segment, arc, face, polygon} = Flatten;
let {ray_shoot} = Flatten;

describe('#Algorithms.Ray_Shooting', function() {
    it('Function defined', function () {
        expect(ray_shoot).to.exist;
        expect(ray_shoot).to.be.a('function');
    });
});