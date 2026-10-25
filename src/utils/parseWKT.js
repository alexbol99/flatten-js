import Flatten from "../flatten";
const {Multiline, Point, Segment, Polygon} = Flatten

// POINT (30 10)
// MULTIPOINT (10 40, 40 30, 20 20, 30 10)
// LINESTRING (30 10, 10 30, 40 40)
// MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))
// MULTILINESTRING ((8503.732 4424.547, 8963.747 3964.532), (8963.747 3964.532, 8707.468 3708.253), (8707.468 3708.253, 8247.454 4168.268), (8247.454 4168.268, 8503.732 4424.547))
// POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))
// MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))
// GEOMETRYCOLLECTION (POINT (0 0), LINESTRING (0 0, 1440 900), POLYGON ((0 0, 0 1024, 1024 1024, 1024 0, 0 0)))
// GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10 40), POLYGON ((40 40, 20 45, 45 30, 40 40)))

// Split only at the current nesting level, preserving rings and collection members.
function splitComponents(str) {
    const components = []
    let depth = 0
    let start = 0
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '(') depth++
        if (str[i] === ')') depth--
        if (depth < 0) throw Flatten.Errors.ILLEGAL_PARAMETERS
        if (str[i] === ',' && depth === 0) {
            components.push(str.slice(start, i).trim())
            start = i + 1
        }
    }
    if (depth !== 0) throw Flatten.Errors.ILLEGAL_PARAMETERS
    components.push(str.slice(start).trim())
    return components
}

function unwrap(str) {
    str = str.trim()
    if (str === 'EMPTY') throw new Error('Empty geometry not supported')
    if (!str.startsWith('(') || !str.endsWith(')')) {
        throw Flatten.Errors.ILLEGAL_PARAMETERS
    }
    return str.slice(1, -1).trim()
}

function parseSinglePoint(pointStr) {
    pointStr = pointStr.trim()
    if (pointStr === 'EMPTY') throw new Error('Empty geometry not supported')
    return new Point(pointStr.split(/\s+/).map(Number))
}

function parseMultiPoint(multipointStr) {
    return splitComponents(multipointStr).map(str =>
        parseSinglePoint(str.startsWith('(') ? unwrap(str) : str))
}

function parseLineString(lineStr) {
    const points = splitComponents(lineStr).map(parseSinglePoint)
    let segments = []
    for (let i = 0; i < points.length-1;  i++) {
        segments.push(new Segment(points[i], points[i+1]))
    }
    return new Multiline(segments)
}

function parseMultiLineString(multilineStr) {
    return splitComponents(multilineStr).map(str => parseLineString(unwrap(str)))
}

function parseSinglePolygon(polygonStr) {
    const polygon = new Polygon()
    if (polygonStr.trim() === 'EMPTY') return polygon
    const facesStr = splitComponents(unwrap(polygonStr))
    let orientation
    facesStr.forEach((faceStr, idx) => {
        const points = splitComponents(unwrap(faceStr)).map(parseSinglePoint)
        const face = polygon.addFace(points)
        if (idx === 0) {
            orientation = face.orientation()
        }
        else if (face.orientation() === orientation) {
            face.reverse()
        }
    })
    return polygon
}

function parseMultiPolygon(multiPolygonStr) {
    const polygon = new Polygon()
    splitComponents(multiPolygonStr).map(parseSinglePolygon).forEach(part => {
        part.faces.forEach(face => polygon.addFace([...face.shapes]))
    })
    return polygon
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
 * Convert WKT string to Flatten shapes. Collections are flattened into an array.
 * POLYGON EMPTY returns an empty Polygon; other EMPTY geometries are unsupported.
 * @throws {Error} Empty geometry not supported for non-polygon EMPTY geometries.
 * @param str
 * @returns {Point | Point[] | Multiline | Multiline[] | Polygon | Shape[] | null}
 */
export function parseWKT(str) {
    const geometry = str.trim().match(/^(POINT|MULTIPOINT|LINESTRING|MULTILINESTRING|POLYGON|MULTIPOLYGON|GEOMETRYCOLLECTION)\s*(EMPTY|\([\s\S]*\))$/)
    if (geometry) {
        const [, type, body] = geometry
        if (body === 'EMPTY') {
            if (type === 'POLYGON') return new Polygon()
            throw new Error('Empty geometry not supported')
        }
        const content = unwrap(body)
        switch (type) {
            case 'POINT': return parseSinglePoint(content)
            case 'MULTIPOINT': return parseMultiPoint(content)
            case 'LINESTRING': return parseLineString(content)
            case 'MULTILINESTRING': return parseMultiLineString(content)
            case 'POLYGON': return parseSinglePolygon(body)
            case 'MULTIPOLYGON': return parseMultiPolygon(content)
            case 'GEOMETRYCOLLECTION':
                return splitComponents(content).map(parseWKT).reduce((acc, shapes) => acc.concat(shapes), [])
        }
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
