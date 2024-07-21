'use strict';

import { expect } from 'chai';
import {parseWKT, isWktString} from "../../src/utils/parseWKT";
import {Point, Multiline, Polygon} from "../../index";

const wktPoint = "POINT (30 10)"
const wktMultipoint = "MULTIPOINT (10 40, 40 30, 20 20, 30 10)"
const wktLinestring = "LINESTRING (30 10, 10 30, 40 40)"
const wktMultilineString = "MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))"
const wktPolygon = "POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))"
const wktMultipolygon = "MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))"
const geometryCollection = "GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10 40), POLYGON ((40 40, 20 45, 45 30, 40 40)))"

describe('#SVGAttributes', function() {
    it('May check if string starts with one of keywords', function () {
        expect(isWktString(wktPoint)).to.be.true;
        expect(isWktString(wktMultipoint)).to.be.true;
        expect(isWktString(wktLinestring)).to.be.true;
        expect(isWktString(wktMultilineString)).to.be.true;
        expect(isWktString(wktPolygon)).to.be.true;
        expect(isWktString(wktMultipolygon)).to.be.true;
        expect(isWktString(geometryCollection)).to.be.true;
    });
    it('May parse wkt point', function () {
        let shape= parseWKT(wktPoint);
        expect(shape).to.be.instanceof(Point)
    });
    it('May parse wkt multipoint', function () {
        let arr= parseWKT(wktMultipoint);
        expect(arr).to.be.instanceof(Array)
        expect(arr.every(res => res instanceof Point)).to.be.true
        expect(arr.length).to.equal(4);
    });
    it('May parse wkt linestring', function () {
        let shape= parseWKT(wktLinestring);
        expect(shape).to.be.instanceof(Multiline)
    });
    it('May parse wkt multilinestring', function () {
        let arr= parseWKT(wktMultilineString);
        expect(arr).to.be.instanceof(Array)
        expect(arr.every(res => res instanceof Multiline)).to.be.true
        expect(arr.length).to.equal(2);
    });
    it('May parse wkt polygon', function () {
        let polygon= parseWKT(wktPolygon);
        expect(polygon).to.be.instanceof(Polygon)
        expect(polygon.faces.size).to.be.equal(2);
        expect([...polygon.faces][0].orientation()).to.not.equal([...polygon.faces][1].orientation());
    });
    it('May parse wkt multipolygon', function () {
        let polygon= parseWKT(wktMultipolygon);
        expect(polygon).to.be.instanceof(Polygon)
        expect(polygon.faces.size).to.be.equal(3);
    });
    it('May parse wkt geometry collection', function () {
        let arr= parseWKT(geometryCollection);
        expect(arr).to.be.instanceof(Array)
        expect(arr.length).to.be.equal(3);
        expect(arr[0]).to.be.instanceof(Point)
        expect(arr[1]).to.be.instanceof(Multiline)
        expect(arr[2]).to.be.instanceof(Polygon)
    });
});
