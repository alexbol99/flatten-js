/**
 * Created by Alex Bol on 3/21/2017.
 */

'use strict';

let expect = require('chai').expect;
let Flatten = require('../index');
// let PlanarSet = require('../data_structures/planar_set');

let {Point, Segment, Circle, Box, PlanarSet} = Flatten;

describe('#Data_structures.PlanarSet', function() {
    it('Class PlanarSet defined', function() {
        expect(PlanarSet).to.exist;
    });
    it('May construct new instance of PlanarSet', function () {
        let planarSet = new PlanarSet();
        expect(planarSet).to.be.an.instanceof(PlanarSet);
    });
    it('May add planar objects', function () {
        let planarSet = new PlanarSet();
        let segment = new Flatten.Segment(1,2,4,5);
        let circle = new Flatten.Circle(new Flatten.Point(3,3), 5);
        planarSet.add(segment);
        planarSet.add(circle);
        expect(planarSet.has(segment)).to.equal(true);
        expect(planarSet.has(circle)).to.equal(true);
        expect(planarSet.size).to.equal(2);
    });
    it('May delete planar objects', function () {
        let planarSet = new PlanarSet();
        let segment = new Flatten.Segment(1,2,4,5);
        let circle = new Flatten.Circle(new Flatten.Point(3,3), 5);
        planarSet.add(segment);
        planarSet.add(circle);
        planarSet.delete(segment);
        expect(planarSet.has(segment)).to.equal(false);
        expect(planarSet.size).to.equal(1);
    });
    it('May not add same object twice (without error ?) ', function () {
        let planarSet = new PlanarSet();
        let segment = new Flatten.Segment(1,2,4,5);
        planarSet.add(segment);
        planarSet.add(segment);
        expect(planarSet.size).to.equal(1);
    });
    it('May find planar objects in given box', function () {
        let planarSet = new PlanarSet();
        let segment = new Segment(1,1,2,2);
        let circle = new Circle(new Point(3,3), 1);
        planarSet.add(segment);
        planarSet.add(circle);
        let resp = planarSet.search(new Box(0,0,1,1));
        expect(resp.length).to.equal(1);
        expect(resp[0]).to.equal(segment);
    });
    it('May find planar objects in given box', function () {
        let planarSet = new PlanarSet();
        let segment = new Segment(1,1,2,2);
        let circle = new Circle(new Point(3,3), 1);
        planarSet.add(segment);
        planarSet.add(circle);
        let resp = planarSet.search(new Box(2,2,3,3));
        expect(resp.length).to.equal(2);
        expect(resp[0]).to.equal(segment);
        expect(resp[1]).to.equal(circle);
    });
});
