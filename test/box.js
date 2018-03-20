/**
 * Created by Alex Bol on 9/8/2017.
 */
'use strict';

let expect = require('chai').expect;
// let Flatten = require('../index');
let Flatten = require('../dist/flatten.min');

let {Box} = Flatten;

describe('#Flatten.Box', function() {
    it('May create new instance of Box', function () {
        let box = new Flatten.Box();
        expect(box).to.be.an.instanceof(Flatten.Box);
    });
    it('Method intersect returns true if two boxes intersected', function () {
        let box1 = new Flatten.Box(1, 1, 3, 3);
        let box2 = new Flatten.Box(-3, -3, 2, 2);
        expect(box1.intersect(box2)).to.equal(true);
    });
    it('Method expand expands current box with other', function () {
        let box1 = new Flatten.Box(1, 1, 3, 3);
        let box2 = new Flatten.Box(-3, -3, 2, 2);
        expect(box1.merge(box2)).to.deep.equal({xmin:-3, ymin:-3, xmax:3, ymax:3});
    });
});

