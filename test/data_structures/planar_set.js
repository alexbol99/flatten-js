/**
 * Created by Alex Bol on 3/21/2017.
 */

'use strict';

import { expect } from 'chai';
import Flatten from '../../index';

import {Point, Segment, Circle, Box, PlanarSet, Distance} from '../../index';
import {point, segment, vector, circle} from '../../index';

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
        let segment = new Segment(1,2,4,5);
        let circle = new Circle(new Point(3,3), 5);
        planarSet.add(segment);
        planarSet.add(circle);
        expect(planarSet.has(segment)).to.equal(true);
        expect(planarSet.has(circle)).to.equal(true);
        expect(planarSet.size).to.equal(2);
    });
    it('May delete planar objects', function () {
        let planarSet = new PlanarSet();
        let segment = new Segment(1,2,4,5);
        let circle = new Circle(new Point(3,3), 5);
        planarSet.add(segment);
        planarSet.add(circle);
        planarSet.delete(segment);
        expect(planarSet.has(segment)).to.equal(false);
        expect(planarSet.size).to.equal(1);
    });
    it('May not add same object twice (without error ?) ', function () {
        let planarSet = new PlanarSet();
        let segment = new Segment(1,2,4,5);
        planarSet.add(segment);
        planarSet.add(segment);
        expect(planarSet.size).to.equal(1);
    });
    it('May update planar objects', function() {
        let planarSet = new PlanarSet();
        let segment = new Segment(1,2,4,5);
        let circle = new Circle(new Point(3,3), 5);
        planarSet.add(segment);
        planarSet.add(circle);

        // Update == delete and add
        planarSet.delete(segment);
        segment.pe.x = 3;
        segment.pe.y = 4;
        planarSet.add(segment);

        expect(planarSet.has(segment)).to.equal(true);
        expect(planarSet.size).to.equal(2);
    });
    it('May find planar objects in given box 1', function () {
        let planarSet = new PlanarSet();
        let segment = new Segment(1,1,2,2);
        let circle = new Circle(new Point(3,3), 1);
        planarSet.add(segment);
        planarSet.add(circle);
        let resp = planarSet.search(new Box(0,0,1,1));
        expect(resp.length).to.equal(1);
        expect(resp[0]).to.equal(segment);
    });
    it('May find planar objects in given box 2', function () {
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
    it('May keep same black height after add many items', function() {
        let random = function(min, max) { return Math.floor(Math.random() * max) + min;}

        let shapeSet = new PlanarSet();

        for (let i = 0; i < 1000; i++) {
            let ps = point(random(1,600), random(1,600));
            let pe = ps.translate(random(50,100), random(50, 100));
            shapeSet.add(segment(ps, pe));
        }

        let height = (tree) => {
            return tree.testBlackHeightProperty(tree.root);
        };

        expect(height(shapeSet.index)).to.be.within(7,8);
    });

    it('May calculate distance between shape and planar set', function () {

        let points = [
            point(100, 20),
            point(250, 75),
            point(350, 75),
            point(300, 270),
            point(170, 200),
            point(120, 350),
            point(70, 120)
        ];

        let circles = points.map( point => circle(point, 50));

        let set = new PlanarSet();
        for (let circle of circles) {
            set.add(circle);
        }

        let pt = point(300,200);

        let [dist, shortest_segment] = Flatten.Distance.shape2planarSet(pt, set);
        expect(dist).to.equal(20);
    });
    it('May clean planar set', function () {

        let points = [
            point(100, 20),
            point(250, 75),
            point(350, 75),
            point(300, 270),
            point(170, 200),
            point(120, 350),
            point(70, 120)
        ];

        let circles = points.map( point => circle(point, 50));

        let set = new PlanarSet();
        for (let circle of circles) {
            set.add(circle);
        }
        expect(set.size).to.equal(7);

        set.clear();
        expect(set.size).to.equal(0);
    });
    it('May perform hit test and return shapes under given point', function () {

        let points = [
            point(100, 20),
            point(250, 75),
            point(350, 75),
            point(300, 270),
            point(170, 200),
            point(120, 350),
            point(70, 120)
        ];

        let circles = points.map( point => circle(point, 50));

        let planarSet = new PlanarSet();
        for (let circle of circles) {
            planarSet.add(circle);
        }

        let resp = planarSet.hit(point(340,250));

        expect(resp.length).to.equal(1);
    });

    it('May create svg content string', function () {
        let planarSet = new PlanarSet();
        let segment = new Segment(1,1,2,2);
        let circle = new Circle(new Point(3,3), 1);
        planarSet.add(segment);
        planarSet.add(circle);

        expect(planarSet.svg()).to.exist;
    });


    // it('May give same result as search without index', function() {
    //     let random = function(min, max) { return Math.floor(Math.random() * max) + min;}
    //
    //     let shapeSet = new PlanarSet();
    //
    //     for (let i = 0; i < 1000; i++) {
    //         let ps = point(random(1,600), random(1,600));
    //         let pe = ps.translate(random(50,100), random(50, 100));
    //         shapeSet.add(segment(ps, pe));
    //     }
    //
    //     for (let shape of shapeSet) {
    //         let resp = shapeSet.search(shape.box);
    //
    //         let respSet = new PlanarSet();
    //         for (let shape_tmp of resp) { respSet.add(shape_tmp) }
    //
    //         for (let other_shape of shapeSet) {
    //             if (other_shape.box.intersect(shape.box) && !respSet.has(other_shape) ) {
    //                 throw new Error('Bad index');
    //             }
    //         }
    //     }
    //     expect(true).to.be.true;
    // });
    // it('May find intersections between many segments less than in a 1 sec', function() {
    //     let random = function(min, max) { return Math.floor(Math.random() * max) + min;}
    //
    //     let shapeSet = new PlanarSet();
    //     let ipSet = new PlanarSet();
    //
    //     for (let i = 0; i < 10000; i++) {
    //         let ps = point(random(1,6000), random(1,6000));
    //         let pe = ps.translate(random(50,100), random(50, 100));
    //         shapeSet.add(segment(ps, pe));
    //     }
    //
    //     let t1 = now();
    //     for (let shape of shapeSet) {
    //         for (let other_shape of shapeSet.search(shape.box)) {
    //         // for (let other_shape of shapeSet) {
    //             if (other_shape == shape) continue;
    //             for (let ip of shape.intersect(other_shape)) {
    //                 ipSet.add(ip);
    //             }
    //         }
    //     }
    //     let t2 = now();
    //     console.log(`${ipSet.size} intersections found. Elapsed time ${(t2-t1).toFixed(1)} msec`);
    //
    //     expect(t2-t1).to.be.below(1000);
    // })
});
