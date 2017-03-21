/**
 * Created by Alex Bol on 3/21/2017.
 */

'use strict';

let expect = require('chai').expect;
let Flatten = require('../index');
let PlanarSet = require('../data_structures/planar_set');

let {Point, Segment, Circle, Box} = Flatten;

describe('#Data_structures.PlanarSet', function() {
    let Index = class Dummy {
        add() {}
        delete() {}
        find() {}
    };
    it('Class PlanarSet defined', function() {
        expect(PlanarSet).to.exist;
    });
    it('May construct new instance of PlanarSet', function () {
        let planarSet = new PlanarSet(Index);
        expect(planarSet).to.be.an.instanceof(PlanarSet);
    });
    it('May add planar objects', function () {
        let planarSet = new PlanarSet(Index);
        let segment = new Flatten.Segment(1,2,4,5);
        let circle = new Flatten.Circle(new Flatten.Point(3,3), 5);
        planarSet.add(segment);
        planarSet.add(circle);
        expect(planarSet.has(segment)).to.equal(true);
        expect(planarSet.has(circle)).to.equal(true);
        expect(planarSet.size).to.equal(2);
    });
    it('May delete planar objects', function () {
        let planarSet = new PlanarSet(Index);
        let segment = new Flatten.Segment(1,2,4,5);
        let circle = new Flatten.Circle(new Flatten.Point(3,3), 5);
        planarSet.add(segment);
        planarSet.add(circle);
        planarSet.delete(segment);
        expect(planarSet.has(segment)).to.equal(false);
        expect(planarSet.size).to.equal(1);
    });
    it('May not add same object twice (without error ?) ', function () {
        let planarSet = new PlanarSet(Index);
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
        let resp1 = planarSet.find(new Box(0,0,1,1));
        let resp2 = planarSet.find(new Box(3,3,3,5));
        expect(resp1.length).to.equal(1);
        expect(resp1[0]).to.equal(segment);
        expect(resp2.length).to.equal(1);
        expect(resp2[0]).to.equal(circle);
    });

});
