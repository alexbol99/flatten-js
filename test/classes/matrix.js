'use strict';

import { expect } from 'chai';
import Flatten from '../../index';

import {Matrix} from '../../index';
import {matrix,point} from '../../index';

describe('#Flatten.Matrix', function() {
    it('May create new instance of Matrix', function () {
        let matrix = new Matrix();
        expect(matrix).to.be.an.instanceof(Matrix);
    });
    it('Default constructor creates identity matrix', function () {
        let matrix = new Matrix();
        expect(matrix).to.deep.equal({a:1,b:0,c:0,d:1,tx:0,ty:0});
    });
    it('Matrix can translate vector',function() {
        let m = matrix(1,0,0,1,5,10);
        let vector = [10,5];
        expect(m.transform(vector)).to.deep.equal([15,15])
    });
    it('Method translate returns translation matrix',function() {
        let m = matrix().translate(5,10);
        let vector = [10,5];
        expect(m.transform(vector)).to.deep.equal([15,15])
    });
    it('Matrix can rotate vector counter clockwise', function() {
        let cos = 0.0;
        let sin = 1.0;
        let m = matrix(cos, sin, -sin, cos, 0, 0);
        let vector = [3,0];
        expect(m.transform(vector)).to.deep.equal([0,3])
    });
    it('Method rotate returns rotation matrix to rotate around (0,0)',function() {
        let m = matrix().rotate(Math.PI/2);
        let pt = point(3,0);
        let [x,y] = m.transform([pt.x,pt.y]);
        let transformed_pt = point(x,y);
        let expected_pt = point(0,3);
        expect(transformed_pt.equalTo(expected_pt)).to.be.true;
    });
    it('Method rotate and translate may compose rotation matrix to rotate around point other than (0,0)',function() {
        let pt = point(4,1);
        let pc = point(1,1);
        let [x,y] = [pt.x, pt.y];
        // Transform coordinate origin into point x,y, then rotate, then transform origin back
        let m = matrix().translate(pc.x,pc.y).rotate(3*Math.PI/2).translate(-pc.x,-pc.y);
        [x,y] = m.transform([x,y]);
        let transformed_pt = point(x,y);
        let expected_pt = point(1,-2);
        expect(transformed_pt.equalTo(expected_pt)).to.be.true;
    });
    it('Composition of methods rotate and translate return same matrix as formula',function() {
        let angle = Math.PI/4;
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        let pc = point(10001,-555);
        // https://stackoverflow.com/questions/8275882/one-step-affine-transform-for-rotation-around-a-point
        let m = matrix().translate(pc.x,pc.y).rotate(angle).translate(-pc.x,-pc.y);
        let m1 = matrix(cos, sin, -sin, cos,
            pc.x - pc.x*cos + pc.y*sin,
            pc.y - pc.x*sin - pc.y*cos);
        expect(m.equalTo(m1)).to.be.true;
    });
    it('Matrix can scale vector', function () {
        let vector = [1,1];
        let m = matrix(10,0,0,5,0,0);
        expect(m.transform(vector)).to.deep.equal([10,5])
    });
    it('Method scale returns matrix that may scale vector',function() {
        let m = matrix().scale(5,10);
        let vector = [1,1];
        expect(m.transform(vector)).to.deep.equal([5,10])
    });
});
