
import { expect } from 'chai';
import Flatten from '../index';
import {arrangeShape2Polygon as arrange} from '../src/algorithms/arrangement';

import {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, PlanarSet} from '../index';
import {point, vector, circle, line, segment, arc, box} from '../index';

describe('#Flatten.Arrangement', function() {
    it('Arrange is a function', function () {
        let polygon = new Polygon();
        expect(arrange).to.exist;
    });
    it('Can arrange segment in polygon triangle. Case 1. No intersection', function () {
        const polygon = new Polygon();
        const points = [point(1,1), point(5,1), point(3, 5)];
        polygon.addFace(points);
        const seg = segment(point(-5,0), point(0,7));
        const resp = arrange(seg, polygon);
        expect(resp.map(edge => edge.shape)).to.deep.equal([seg]);
        expect(resp.map(edge => edge.bv)).to.deep.equal([Flatten.OUTSIDE]);
    });
    it('Can arrange segment in polygon triangle. Case 2. Segment intersects polygon in two points', function () {
        const polygon = new Polygon();
        const points = [point(1,1), point(5,1), point(3, 5)];
        polygon.addFace(points);
        const seg = segment(point(0,2), point(6,2));
        const resp = arrange(seg, polygon);
        expect(resp.length).to.equal(3);
        expect(resp.map(edge => edge.bv)).to.deep.equal([Flatten.OUTSIDE, Flatten.INSIDE, Flatten.OUTSIDE]);
    });
    it('Can arrange segment in polygon triangle. Case 3. Segment crosses polygon in one point', function () {
        const polygon = new Polygon();
        const points = [point(1,1), point(5,1), point(3, 5)];
        polygon.addFace(points);
        const seg = segment(point(0,2), point(2,2));
        const resp = arrange(seg, polygon);
        expect(resp.length).to.equal(2);
        expect(resp.map(edge => edge.bv)).to.deep.equal([Flatten.OUTSIDE, Flatten.INSIDE]);
    });
    it('Can arrange segment in polygon triangle. Case 4. Segment touches polygon in one point', function () {
        const polygon = new Polygon();
        const points = [point(1,1), point(5,1), point(3, 5)];
        polygon.addFace(points);
        const seg = segment(point(3,5), point(5,5));
        const resp = arrange(seg, polygon);
        expect(resp.length).to.equal(1);
        expect(resp.map(edge => edge.shape)).to.deep.equal([seg]);
        expect(resp.map(edge => edge.bv)).to.deep.equal([Flatten.OUTSIDE]);
    });
    it('Can arrange segment in polygon triangle. Case 5. Segment inside polygon', function () {
        const polygon = new Polygon();
        const points = [point(1,1), point(5,1), point(3, 5)];
        polygon.addFace(points);
        const seg = segment(point(2.5,2), point(3.5,2));
        const resp = arrange(seg, polygon);
        expect(resp.length).to.equal(1);
        expect(resp.map(edge => edge.shape)).to.deep.equal([seg]);
        expect(resp.map(edge => edge.bv)).to.deep.equal([Flatten.INSIDE]);
    });
    it('Can arrange segment in polygon triangle. Case 6. Segment boundary to the edge of polygon', function () {
        const polygon = new Polygon();
        const points = [point(1,1), point(5,1), point(3, 5)];
        polygon.addFace(points);
        const seg = segment(point(0,1), point(6,1));
        const resp = arrange(seg, polygon);
        expect(resp.length).to.equal(3);
        // expect(resp.map(edge => edge.shape)).to.deep.equal([seg]);
        expect(resp.map(edge => edge.bv)).to.deep.equal([Flatten.OUTSIDE, Flatten.BOUNDARY, Flatten.OUTSIDE]);
    });
    it('Can arrange segment in polygon with hole. Case 7. Segment inside hole is OUTSIDE of polygon', function () {
        let polygon = new Polygon();
        polygon.addFace(box(0, 0, 100, 100));
        polygon.addFace(circle(point(40, 40), 20));
        const seg = segment(point(30,30), point(50,50));
        const resp = arrange(seg, polygon);
        expect(resp.length).to.equal(1);
        expect(resp.map(edge => edge.shape)).to.deep.equal([seg]);
        expect(resp.map(edge => edge.bv)).to.deep.equal([Flatten.OUTSIDE]);
    });
    it('Can arrange segment in polygon with hole. Case 8. Segment intersects hole', function () {
        let polygon = new Polygon();
        polygon.addFace(box(0, 0, 100, 100));
        polygon.addFace(circle(point(40, 40), 20));
        const seg = segment(point(10,10), point(90,90));
        const resp = arrange(seg, polygon);
        expect(resp.length).to.equal(3);
        // expect(resp.map(edge => edge.shape)).to.deep.equal([seg]);
        expect(resp.map(edge => edge.bv)).to.deep.equal([Flatten.INSIDE, Flatten.OUTSIDE, Flatten.INSIDE]);
    });
});
