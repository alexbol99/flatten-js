import { Multiline } from "../classes/Multiline";
import { Point } from "../classes/Point";
import { Segment } from "../classes/Segment";
import { Polygon } from "../classes/Polygon";
import Flatten from "../flatten";

// POINT (30 10)
// MULTIPOINT (10 40, 40 30, 20 20, 30 10)
// LINESTRING (30 10, 10 30, 40 40)
// MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))
// MULTILINESTRING ((8503.732 4424.547, 8963.747 3964.532), (8963.747 3964.532, 8707.468 3708.253), (8707.468 3708.253, 8247.454 4168.268), (8247.454 4168.268, 8503.732 4424.547))
// POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))
// MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))
// GEOMETRYCOLLECTION (POINT (0 0), LINESTRING (0 0, 1440 900), POLYGON ((0 0, 0 1024, 1024 1024, 1024 0, 0 0)))
// GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10 40), POLYGON ((40 40, 20 45, 45 30, 40 40)))

function parseSinglePoint(pointStr) {
    return new Point(pointStr.split(' ').map(Number))
}

function parseMultiPoint(multipointStr) {
    return multipointStr.split(', ').map(parseSinglePoint)
}

function parseLineString(lineStr) {
    const points = parseMultiPoint(lineStr)
    let segments = []
    for (let i = 0; i < points.length-1;  i++) {
        segments.push(new Segment(points[i], points[i+1]))
    }
    return new Multiline(segments)
}

function parseMultiLineString(multilineStr) {
    const lineStrings = multilineStr.replace(/\(\(/, '').replace(/\)\)$/, '').split('), (')
    return lineStrings.map(parseLineString)
}

function parseSinglePolygon(polygonStr) {
    const facesStr = polygonStr.replace(/\(\(/, '').replace(/\)\)$/, '').split('), (');
    const polygon = new Polygon()
    let orientation
    facesStr.forEach((facesStr, idx) => {
        let points = facesStr.split(', ').map(coordStr => {
            return new Point(coordStr.split(' ').map(Number))
        })
        const face = polygon.addFace(points)
        if (idx === 0) {
            orientation = face.orientation()
        }
        else {
            if (face.orientation() === orientation) {
                face.reverse()
            }
        }
    })
    return polygon
}

function parseMutliPolygon(multiPolygonString) {
    // const polygonStrings = multiPolygonString.split('?')
    // Split the string by the delimiter ")), ((" which separates the polygons
    const polygonStrings = multiPolygonString.split(/\)\), \(\(/).map(polygon => '((' + polygon + '))');

    const polygons = polygonStrings.map(parseSinglePolygon)
    const polygon = new Polygon()
    const faces = polygons.reduce((acc, polygon) => [...acc, ...polygon?.faces], [])
    faces.forEach(face => polygon.addFace([...face?.shapes]))
    return polygon;
}

function parsePolygon(wkt) {
    if (wkt.startsWith("POLYGON")) {
        const polygonStr = wkt.replace(/^POLYGON /, '');
        return parseSinglePolygon(polygonStr)
    }
    else {
        // const multiPolygonString = wkt.replace(/^MULTIPOLYGON \(/, '').replace(/\)$/, '').replace(/\)\), \(\(/,'))?((')
        const multiPolygonString = wkt.replace(/^MULTIPOLYGON \(\(\((.*)\)\)\)$/, '$1');
        return parseMutliPolygon(multiPolygonString)
    }
}

function parseArrayOfPoints(str) {
    const arr = str.split('\n').map(x => x.match(/\(([^)]+)\)/)[1])
    return arr.map(parseSinglePoint)
}

function parseArrayOfLineStrings(str) {
    const arr = str.split('\n').map(x => x.match(/\(([^)]+)\)/)[1])
    return arr.map(parseLineString).reduce((acc, x) => [...acc, ...x], [])
}

/**
 * Convert WKT string to array of Flatten shapes.
 * @param str
 * @returns {Point | Point[] | Multiline | Multiline[] | Polygon | Shape[] | null}
 */
export function parseWKT(str) {
    if (str.startsWith("POINT")) {
        const pointStr = str.replace(/^POINT \(/, '').replace(/\)$/, '')
        return parseSinglePoint(pointStr)
    }
    else if (str.startsWith("MULTIPOINT")) {
        const multiPointStr = str.replace(/^MULTIPOINT \(/, '').replace(/\)$/, '')
        return parseMultiPoint(multiPointStr)
    }
    else if (str.startsWith("LINESTRING")) {
        const lineStr = str.replace(/^LINESTRING \(/, '').replace(/\)$/, '')
        return parseLineString(lineStr)
    }
    else if (str.startsWith("MULTILINESTRING")) {
        const multilineStr = str.replace(/^MULTILINESTRING /, '')
        return parseMultiLineString(multilineStr)
    }
    else if (str.startsWith("POLYGON") || str.startsWith("MULTIPOLYGON")) {
        return parsePolygon(str)
    }
    else if (str.startsWith("GEOMETRYCOLLECTION")) {
        // const regex = /(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION) \([^\)]+\)/g
        /* Explanation:
(?<type>POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON):
This named group will capture the geometry type. The type label helps with understanding the structure but
 is not necessary unless you process the matches programmatically and want easy access to the geometry type.
\( and \): Match the opening and closing parentheses.
(?:[^\(\)]|\([^\)]*\))*: A non-capturing group that allows for:
[^\(\)]: Matching any character except parentheses, handling simple geometries.
|\([^\)]*\): Handling nested parentheses for geometries like POLYGON and MULTILINESTRING.
* after the non-capturing group: Allows for repeating the pattern zero or more times to match all contents between the outermost parentheses. */
        const regex = /(?<type>POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON) \((?:[^\(\)]|\([^\)]*\))*\)/g
        const wktArray = str.match(regex)
        if (wktArray[0].startsWith('GEOMETRYCOLLECTION')) {
            wktArray[0] = wktArray[0].replace('GEOMETRYCOLLECTION (','')
        }
        const flArray = wktArray.map(parseWKT).map(x => x instanceof Array ? x : [x])
        return flArray.reduce((acc, x) => [...acc, ...x], [])
    }
    else if (isArrayOfPoints(str)) {
        return parseArrayOfPoints(str)
    }
    else if (isArrayOfLines(str)) {
        return parseArrayOfLineStrings(str)
    }
    return []
}

function isArrayOfPoints(str) {
    return str.split('\n')?.every(str => str.includes('POINT'))
}

function isArrayOfLines(str) {
    return str.split('\n')?.every(str => str.includes('LINESTRING'))
}

/**
 * Return true if given string starts with one of WKT tags and possibly contains WKT string,
 * @param str
 * @returns {boolean}
 */
export function isWktString(str) {
    return (
        str.startsWith("POINT") || isArrayOfPoints(str) ||
        str.startsWith("LINESTRING") || isArrayOfLines(str) ||
        str.startsWith("MULTILINESTRING") ||
        str.startsWith("POLYGON") ||
        str.startsWith("MULTIPOINT") ||
        str.startsWith("MULTIPOLYGON") ||
        str.startsWith("GEOMETRYCOLLECTION")
    )
}

Flatten.isWktString = isWktString
Flatten.parseWKT = parseWKT
