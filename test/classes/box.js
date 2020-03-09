/**
 * Created by Alex Bol on 9/8/2017.
 */
'use strict';

import { expect } from 'chai';
import Flatten from '../../index';

import {Box} from '../../index';

describe('#Flatten.Box', function() {
    it('May create new instance of Box', function () {
        let box = new Box();
        expect(box).to.be.an.instanceof(Box);
    });
    it('Method intersect returns true if two boxes intersected', function () {
        let box1 = new Box(1, 1, 3, 3);
        let box2 = new Box(-3, -3, 2, 2);
        expect(box1.intersect(box2)).to.equal(true);
    });
    it('Method expand expands current box with other', function () {
        let box1 = new Box(1, 1, 3, 3);
        let box2 = new Box(-3, -3, 2, 2);
        expect(box1.merge(box2)).to.deep.equal({xmin:-3, ymin:-3, xmax:3, ymax:3});
    });
    it('Method svg() without parameters creates svg string with default attributes', function() {
        let box = new Box(-30, -30, 20, 20);
        let svg = box.svg();
        expect(svg.search("stroke")).to.not.equal(-1);
        expect(svg.search("stroke-width")).to.not.equal(-1);
        expect(svg.search("fill")).to.not.equal(-1);
    });
    it('Method svg() with extra parameters may add additional attributes', function() {
        let box = new Box(-30, -30, 20, 20);
        let svg = box.svg({id:"123",className:"name"});
        expect(svg.search("stroke")).to.not.equal(-1);
        expect(svg.search("stroke-width")).to.not.equal(-1);
        expect(svg.search("fill")).to.not.equal(-1);
        expect(svg.search("id")).to.not.equal(-1);
        expect(svg.search("class")).to.not.equal(-1);
    })
});

