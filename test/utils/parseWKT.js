'use strict';

import { expect } from 'chai';
import {parseWKT, isWktString, Point, Multiline, Polygon} from "../../index";

const wktPoint = "POINT (30 10)"
const wktMultipoint = "MULTIPOINT (10 40, 40 30, 20 20, 30 10)"
const wktLinestring = "LINESTRING (30 10, 10 30, 40 40)"
const wktMultilineString = "MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))"
const wktPolygon = "POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))"
const wktMultipolygon = "MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))"
const geometryCollection = "GEOMETRYCOLLECTION (POINT (0 0), LINESTRING (0 0, 1440 900), POLYGON ((0 0, 0 1024, 1024 1024, 1024 0, 0 0)))"
const geometryCollection2 = "GEOMETRYCOLLECTION (POINT (0 0), LINESTRING (0 0, 1440 900), POLYGON ((0 0, 0 1024, 1024 1024, 1024 0, 0 0)))"

const mp = "MULTIPOLYGON (((137399.5114952398 58503.91149523979, 137399.5 58504.145486221285, 137399.5 58579.854513778715, 137399.5114952398 58580.08850476021, 137399.7454862211 58580.1, 137474.7545137789 58580.1, 137474.9885047602 58580.08850476021, 137475 58579.854513778715, 137475 58504.145486221285, 137474.9885047602 58503.91149523979, 137474.7545137789 58503.9, 137399.7454862211 58503.9, 137399.5114952398 58503.91149523979)), ((138334.5114952398 58503.91149523979, 138334.5 58504.145486221285, 138334.5 58579.854513778715, 138334.5114952398 58580.08850476021, 138334.7454862211 58580.1, 138409.7545137789 58580.1, 138409.9885047602 58580.08850476021, 138410 58579.854513778715, 138410 58504.145486221285, 138409.9885047602 58503.91149523979, 138409.7545137789 58503.9, 138334.7454862211 58503.9, 138334.5114952398 58503.91149523979)), ((137399.5114952398 59443.611495239784, 137399.5 59443.84548622128, 137399.5 59519.55451377872, 137399.5114952398 59519.78850476022, 137399.7454862211 59519.8, 137474.7545137789 59519.8, 137474.9885047602 59519.78850476022, 137475 59519.55451377872, 137475 59443.84548622128, 137474.9885047602 59443.611495239784, 137474.7545137789 59443.6, 137399.7454862211 59443.6, 137399.5114952398 59443.611495239784)), ((138334.5114952398 59443.611495239784, 138334.5 59443.84548622128, 138334.5 59519.55451377872, 138334.5114952398 59519.78850476022, 138334.7454862211 59519.8, 138409.7545137789 59519.8, 138409.9885047602 59519.78850476022, 138410 59519.55451377872, 138410 59443.84548622128, 138409.9885047602 59443.611495239784, 138409.7545137789 59443.6, 138334.7454862211 59443.6, 138334.5114952398 59443.611495239784)), ((137399.5114952398 60404.81149523979, 137399.5 60405.04548622129, 137399.5 60480.65451377872, 137399.5114952398 60480.888504760216, 137399.7454862211 60480.9, 137474.7545137789 60480.9, 137474.9885047602 60480.888504760216, 137475 60480.65451377872, 137475 60405.04548622129, 137474.9885047602 60404.81149523979, 137474.7545137789 60404.8, 137399.7454862211 60404.8, 137399.5114952398 60404.81149523979)), ((138334.5114952398 60404.81149523979, 138334.5 60405.04548622129, 138334.5 60480.65451377872, 138334.5114952398 60480.888504760216, 138334.7454862211 60480.9, 138409.7545137789 60480.9, 138409.9885047602 60480.888504760216, 138410 60480.65451377872, 138410 60405.04548622129, 138409.9885047602 60404.81149523979, 138409.7545137789 60404.8, 138334.7454862211 60404.8, 138334.5114952398 60404.81149523979)), ((137399.5114952398 61345.41149523979, 137399.5 61345.645486221285, 137399.5 61421.354513778715, 137399.5114952398 61421.58850476021, 137399.7454862211 61421.6, 137474.7545137789 61421.6, 137474.9885047602 61421.58850476021, 137475 61421.354513778715, 137475 61345.645486221285, 137474.9885047602 61345.41149523979, 137474.7545137789 61345.4, 137399.7454862211 61345.4, 137399.5114952398 61345.41149523979)), ((138334.5114952398 61345.41149523979, 138334.5 61345.645486221285, 138334.5 61421.354513778715, 138334.5114952398 61421.58850476021, 138334.7454862211 61421.6, 138409.7545137789 61421.6, 138409.9885047602 61421.58850476021, 138410 61421.354513778715, 138410 61345.645486221285, 138409.9885047602 61345.41149523979, 138409.7545137789 61345.4, 138334.7454862211 61345.4, 138334.5114952398 61345.41149523979)), ((139292.2114952398 58503.91149523979, 139292.2 58504.145486221285, 139292.2 58579.854513778715, 139292.2114952398 58580.08850476021, 139292.4454862211 58580.1, 139367.3545137789 58580.1, 139367.5885047602 58580.08850476021, 139367.6 58579.854513778715, 139367.6 58504.145486221285, 139367.5885047602 58503.91149523979, 139367.3545137789 58503.9, 139292.4454862211 58503.9, 139292.2114952398 58503.91149523979)), ((140239.0114952398 58503.91149523979, 140239 58504.145486221285, 140239 58579.854513778715, 140239.0114952398 58580.08850476021, 140239.2454862211 58580.1, 140314.2545137789 58580.1, 140314.4885047602 58580.08850476021, 140314.5 58579.854513778715, 140314.5 58504.145486221285, 140314.4885047602 58503.91149523979, 140314.2545137789 58503.9, 140239.2454862211 58503.9, 140239.0114952398 58503.91149523979)), ((139292.2114952398 59443.611495239784, 139292.2 59443.84548622128, 139292.2 59519.55451377872, 139292.2114952398 59519.78850476022, 139292.4454862211 59519.8, 139367.3545137789 59519.8, 139367.5885047602 59519.78850476022, 139367.6 59519.55451377872, 139367.6 59443.84548622128, 139367.5885047602 59443.611495239784, 139367.3545137789 59443.6, 139292.4454862211 59443.6, 139292.2114952398 59443.611495239784)), ((140239.0114952398 59443.611495239784, 140239 59443.84548622128, 140239 59519.55451377872, 140239.0114952398 59519.78850476022, 140239.2454862211 59519.8, 140314.2545137789 59519.8, 140314.4885047602 59519.78850476022, 140314.5 59519.55451377872, 140314.5 59443.84548622128, 140314.4885047602 59443.611495239784, 140314.2545137789 59443.6, 140239.2454862211 59443.6, 140239.0114952398 59443.611495239784)), ((139292.2114952398 60404.81149523979, 139292.2 60405.04548622129, 139292.2 60480.65451377872, 139292.2114952398 60480.888504760216, 139292.4454862211 60480.9, 139367.3545137789 60480.9, 139367.5885047602 60480.888504760216, 139367.6 60480.65451377872, 139367.6 60405.04548622129, 139367.5885047602 60404.81149523979, 139367.3545137789 60404.8, 139292.4454862211 60404.8, 139292.2114952398 60404.81149523979)), ((140239.0114952398 60404.81149523979, 140239 60405.04548622129, 140239 60480.65451377872, 140239.0114952398 60480.888504760216, 140239.2454862211 60480.9, 140314.2545137789 60480.9, 140314.4885047602 60480.888504760216, 140314.5 60480.65451377872, 140314.5 60405.04548622129, 140314.4885047602 60404.81149523979, 140314.2545137789 60404.8, 140239.2454862211 60404.8, 140239.0114952398 60404.81149523979)), ((139292.2114952398 61345.41149523979, 139292.2 61345.645486221285, 139292.2 61421.354513778715, 139292.2114952398 61421.58850476021, 139292.4454862211 61421.6, 139367.3545137789 61421.6, 139367.5885047602 61421.58850476021, 139367.6 61421.354513778715, 139367.6 61345.645486221285, 139367.5885047602 61345.41149523979, 139367.3545137789 61345.4, 139292.4454862211 61345.4, 139292.2114952398 61345.41149523979)), ((140239.0114952398 61345.41149523979, 140239 61345.645486221285, 140239 61421.354513778715, 140239.0114952398 61421.58850476021, 140239.2454862211 61421.6, 140314.2545137789 61421.6, 140314.4885047602 61421.58850476021, 140314.5 61421.354513778715, 140314.5 61345.645486221285, 140314.4885047602 61345.41149523979, 140314.2545137789 61345.4, 140239.2454862211 61345.4, 140239.0114952398 61345.41149523979)))"

describe('#parseWKT', function() {
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
        let arr= parseWKT(geometryCollection2);
        expect(arr).to.be.instanceof(Array)
        expect(arr.length).to.be.equal(3);
        expect(arr[0]).to.be.instanceof(Point)
        expect(arr[1]).to.be.instanceof(Multiline)
        expect(arr[2]).to.be.instanceof(Polygon)
    });
    it('May parse wkt multipolygon with many faces ', function () {
        let polygon= parseWKT(mp);
        expect(polygon).to.be.instanceof(Polygon)
        expect(polygon.faces.size).to.be.equal(16);
    });

    [wktPoint, wktMultipoint, wktLinestring, wktMultilineString,
        wktPolygon, wktMultipolygon, geometryCollection2, mp].forEach(wkt => {
        ['', ' ', '  ', '\t', '\n', '\r\n'].forEach(separator => {
            it(`May parse ${wkt.split(' ')[0]} with separator ${JSON.stringify(separator)}`, function () {
                const input = wkt.replace(/([A-Z]+) \(/g, `$1${separator}(`);
                expect(isWktString(input)).to.be.true;
                expect(JSON.stringify(parseWKT(input))).to.equal(JSON.stringify(parseWKT(wkt)));
            });
        });
    });

    it('May use a compact polygon in geometric operations', function () {
        const polygon = parseWKT('POLYGON((0 0, 10 0, 10 10, 0 10, 0 0))');
        expect(polygon.vertices.length).to.equal(4);
        expect(polygon.area()).to.equal(100);
        expect(polygon.contains(new Point(5, 5))).to.be.true;
    });

    [wktMultipoint, wktLinestring, wktMultilineString, wktPolygon, wktMultipolygon, mp].forEach(wkt => {
        [',', ', ', ' ,\t', ',\n'].forEach(separator => {
            it(`May parse ${wkt.split(' ')[0]} with comma separator ${JSON.stringify(separator)}`, function () {
                const actual = parseWKT(wkt.replace(/, /g, separator));
                expect(actual).to.deep.equal(parseWKT(wkt));
            });
        });
    });

    it('Preserves line endpoints without spaces after commas', function () {
        const line = parseWKT('LINESTRING (0 0,10 10)');
        expect(line.vertices).to.deep.equal([new Point(0, 0), new Point(10, 10)]);
    });

    ['\n', '\r\n'].forEach(newline => {
        it(`Preserves indented point records separated by ${JSON.stringify(newline)}`, function () {
            const points = parseWKT(` POINT (1 2)${newline} POINT (3 4)`);
            expect(points).to.deep.equal([new Point(1, 2), new Point(3, 4)]);
        });

        it(`Preserves indented line records separated by ${JSON.stringify(newline)}`, function () {
            const edges = parseWKT(` LINESTRING (0 0,1 1,2 2)${newline} LINESTRING (3 3,4 4)`);
            expect(edges.map(edge => [edge.start, edge.end])).to.deep.equal([
                [new Point(0, 0), new Point(1, 1)],
                [new Point(1, 1), new Point(2, 2)],
                [new Point(3, 3), new Point(4, 4)]
            ]);
        });
    });

    it('Preserves newlines within a single geometry', function () {
        expect(parseWKT(' POINT\n(1\n2)')).to.deep.equal(new Point(1, 2));
        const line = parseWKT(' LINESTRING (0 0,\n1 1,\n2 2)');
        expect(line).to.be.instanceof(Multiline);
        expect(line.vertices).to.deep.equal([new Point(0, 0), new Point(1, 1), new Point(2, 2)]);
        const shapes = parseWKT('GEOMETRYCOLLECTION(\nPOINT (1 2),\nPOINT (3 4)\n)');
        expect(shapes).to.deep.equal([new Point(1, 2), new Point(3, 4)]);
    });

    ['MULTIPOINT ((1 2), (3 4))', 'MULTIPOINT((1 2),(3 4))',
        'MULTIPOINT ( ( 1 2 ) , ( 3 4 ) )'].forEach(wkt => {
        it(`Parses parenthesized coordinates in ${wkt}`, function () {
            expect(parseWKT(wkt)).to.deep.equal([new Point(1, 2), new Point(3, 4)]);
        });
    });

    it('Preserves holes when polygon coordinates and rings have compact separators', function () {
        const polygon = parseWKT('POLYGON((0 0,10 0,10 10,0 10,0 0),(2 2,4 2,4 4,2 4,2 2))');
        expect(polygon.faces.size).to.equal(2);
        expect(polygon.area()).to.equal(96);
        expect(polygon.contains(new Point(3, 3))).to.be.false;
        expect(polygon.contains(new Point(5, 5))).to.be.true;
    });

    ['POLYGON EMPTY', 'POLYGON\tEMPTY', ' POLYGON EMPTY\n'].forEach(wkt => {
        it(`Returns an empty polygon for ${JSON.stringify(wkt)}`, function () {
            const polygon = parseWKT(wkt);
            expect(polygon).to.be.instanceof(Polygon);
            expect(polygon.faces.size).to.equal(0);
            expect(polygon.edges.size).to.equal(0);
            expect(polygon.area()).to.equal(0);
        });
    });

    ['POINT', 'LINESTRING', 'MULTIPOINT', 'MULTILINESTRING', 'MULTIPOLYGON', 'GEOMETRYCOLLECTION'].forEach(type => {
        it(`Rejects ${type} EMPTY, including inside a collection`, function () {
            expect(() => parseWKT(`${type} EMPTY`)).to.throw('Empty geometry not supported');
            expect(() => parseWKT(`GEOMETRYCOLLECTION(POINT(1 2),${type} EMPTY)`))
                .to.throw('Empty geometry not supported');
        });
    });

    ['MULTIPOINT(EMPTY,(1 2))', 'MULTILINESTRING(EMPTY,(0 0,1 1))'].forEach(wkt => {
        it(`Rejects empty non-polygon members in ${wkt}`, function () {
            expect(() => parseWKT(wkt)).to.throw('Empty geometry not supported');
        });
    });

    it('Preserves an empty polygon inside a collection', function () {
        const shapes = parseWKT('GEOMETRYCOLLECTION(POLYGON EMPTY,POINT(1 2))');
        expect(shapes).to.have.length(2);
        expect(shapes[0]).to.be.instanceof(Polygon);
        expect(shapes[0].faces.size).to.equal(0);
        expect(shapes[1]).to.deep.equal(new Point(1, 2));
    });

    it('Parses a multipolygon inside a geometry collection', function () {
        const shapes = parseWKT('GEOMETRYCOLLECTION (MULTIPOLYGON (((0 0, 10 0, 10 10, 0 0))), POINT (5 5))');
        expect(shapes).to.have.length(2);
        expect(shapes[0]).to.be.instanceof(Polygon);
        expect(shapes[0].vertices).to.have.length(3);
        expect(shapes[0].area()).to.equal(50);
        expect(shapes[1]).to.deep.equal(new Point(5, 5));
    });

    it('Preserves multipolygon holes and later members in nested collections', function () {
        const multi = 'MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0),(2 2,4 2,4 4,2 4,2 2)),((20 0,30 0,30 10,20 10,20 0)))';
        const shapes = parseWKT(`GEOMETRYCOLLECTION(POINT(-1 -1),GEOMETRYCOLLECTION(${multi},MULTIPOINT((1 2),(3 4))),LINESTRING(0 0,10 10))`);
        expect(shapes).to.have.length(5);
        expect(shapes[0]).to.deep.equal(new Point(-1, -1));
        expect(shapes[1]).to.be.instanceof(Polygon);
        expect(shapes[1].faces.size).to.equal(3);
        expect(shapes[1].area()).to.equal(196);
        expect(shapes[1].contains(new Point(3, 3))).to.be.false;
        expect(shapes[1].contains(new Point(25, 5))).to.be.true;
        expect(shapes.slice(2, 4)).to.deep.equal([new Point(1, 2), new Point(3, 4)]);
        expect(shapes[4]).to.be.instanceof(Multiline);
        expect(shapes[4].vertices).to.deep.equal([new Point(0, 0), new Point(10, 10)]);
    });
});
