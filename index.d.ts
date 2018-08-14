// Type definitions for flatten-js library v0.6
// Project: https://github.com/alexbol99/flatten-js
// Definitions by: Alex Bol

import IntervalTree = require("flatten-interval-tree");
/// <reference types="flatten-interval-tree" />

declare namespace Flatten {
    interface SVGAttributes {
        r?: number,
        stroke?: string | number,
        strokeWidth?: number,
        fill?: string | number,
        fillRule?: "nonzero" | "evenodd",
        fillOpacity?: number,
        id? : string,
        className?: string
    }

    type Comparable = any;      // any object that implements operators '<' and '==' and 'max'
    interface Interval {
        low: Comparable;
        high: Comparable;

        readonly  max: Comparable;

        clone(): Interval;
        less_than(other_interval: Interval) : boolean;
        equal_to(other_interval: Interval) : boolean;
        intersect(other_interval: Interval) : boolean;
        not_intersect(other_interval: Interval) : boolean;
        output() : any;
    }

    class Arc {
        constructor(
            pc?: Point,
            r?: number,
            startAngle?: number,
            endAngle?: number,
            counterClockwise?: boolean
        );

        // members
        ps: Point;
        r: Number;
        startAngle: number;
        endAngle: number;
        counterClockwise: boolean;

        // getters
        readonly start: Point;
        readonly end: Point;
        readonly center: Point;
        readonly length: number;
        readonly sweep: number;
        readonly vertices: [Point, Point];
        readonly box: Box;

        // public methods
        breakToFunctional(): Array<Arc>;
        chordHeight(): number;
        clone(): Arc;
        contains(pt: Point): boolean;
        chordHeight(): number;
        distanceTo(geom: Shape | PlanarSet): [number, Segment];
        intersect(shape: Line | Circle | Segment | Arc): Array<Point>;
        middle(): Point;
        reverse(): Arc;
        rotate(angle: number, center: Point): Arc;
        split(pt: Point): Arc[];
        svg(attrs?: SVGAttributes): string;
        tangentInEnd(): Vector;
        tangentInStart(): Vector;
        transform(matrix?: Matrix): Arc;
        translate(vec: Vector): Arc;
        translate(x:number, y:number): Arc;
    }

    class Box {
        constructor(xmin?: number, ymin?: number, xmax?: number, ymax?: number);

        //members
        xmin: number;
        ymin: number;
        xmax: number;
        ymax: number;

        // getters
        readonly center: Point;
        readonly high: any;
        readonly low: any;
        readonly max: Box;

        // public methods
        clone(): Box;
        equal_to(box: Box): boolean;
        intersect(box: Box): boolean;
        less_than(box: Box): boolean;
        merge(box: Box): Box;
        not_intersect(box: Box): boolean;
        output() : void;
        set(xmin: number, ymin: number, xmax: number, ymax: number): void;
        svg(attrs?: SVGAttributes): string;
    }

    class Circle {
        constructor(pc: Point, r: number);

        // members
        pc: Point;
        r: number;

        // getters
        readonly box: Box;
        readonly center: Point;

        // public methods
        clone(): Circle;
        contains(pt: Point): boolean;
        distanceTo(geom: Shape | PlanarSet): [number, Segment];
        intersect(shape: Line | Circle | Segment | Arc): Array<Point>;
        svg(attrs?: SVGAttributes): string;
        toArc(counterclockwise?: boolean): Arc;
    }

    class Line {
        constructor(pt?: Point, norm?: Vector);
        constructor(norm: Vector, pt: Point);
        constructor(pt1: Point, pt2: Point);

        // members
        pt: Point;
        norm: Vector;

        // getters
        readonly slope: number;
        readonly standard: [number, number, number];

        // public methods
        clone(): Line;
        contains(pt: Point): boolean;
        distanceTo(shape: Shape): [number, Segment];
        incidentTo(line: Line): boolean;
        intersect(shape: Line | Circle | Segment | Arc): Point[];
        parallelTo(line: Line): boolean;
        svg(box: Box, attrs?: SVGAttributes): string;
    }

    class Point {
        constructor(x?: number, y?: number);
        constructor(arg?: [number, number]);

        // members
        x: number;
        y: number;

        //getters
        readonly box: Box;
        readonly vertices: [Point];

        // public methods
        clone(): Point;
        distanceTo(geom: Shape | PlanarSet): [number, Segment];
        equalTo(pt: Point): boolean;
        leftTo(line: Line): boolean;
        lessThan(pt: Point): boolean;
        on(shape: Point | Shape): boolean;
        projectionOn(line: Line): Point;
        rotate(angle: number, center?: Point): Point;
        svg(attrs?: SVGAttributes): string;
        transform(matrix: Matrix): Point;
        translate(vec: Vector): Point;
        translate(x: number, y: number): Point;
    }

    class Ray {
        constructor(pt: Point);

        // members
        pt: Point;

        // getters
        readonly start: Point;
        readonly box: Box;
        readonly norm: Vector;

        // public methods
        clone(): Ray;
        intersect(shape: Segment | Arc): Point[];
    }

    class Segment {
        constructor(ps?: Point, pe?: Point);

        // members
        ps: Point;
        pe: Point;

        // getters
        readonly start: Point;
        readonly end: Point;
        readonly box: Box;
        readonly length: number;
        readonly slope: number;
        readonly vertices: [Point, Point];

        // public methods
        clone(): Segment;
        contains(pt: Point): boolean;
        distanceTo(shape: Shape): [number, Segment];
        equalTo(seg: Segment): boolean;
        intersect(shape: Line | Circle | Segment | Arc): Point[];
        isZeroLength(): boolean;
        middle(): Point;
        reverse(): Segment;
        rotate(angle: number, center?: Point): Segment;
        split(pt: Point): Segment[];
        tangentInStart(): Vector;
        tangentInEnd(): Vector;
        transform(matrix: Matrix): Segment;
        translate(vec: Vector): Segment;
        translate(x: number, y: number): Segment;
        svg(attrs?: SVGAttributes): string;
    }

    class Vector {
        constructor(x?: number, y?: number);
        constructor(ps: Point, pe: Point);

        // members
        x: number;
        y: number;

        // getters
        readonly length: number;
        readonly slope: number;

        // public methods
        add(v: Vector): Vector;
        angleTo(v: Vector): number;
        clone(): Vector;
        cross(v: Vector): number;
        dot(v: Vector): number;
        equalTo(v: Vector): boolean;
        invert(): Vector;
        multiple(scalar: number): Vector;
        normalize(): Vector;
        projectionOn(v: Vector): Vector;
        rotate(angle: number): Vector;
        rotate90CCW(): Vector;
        rotate90CW(): Vector;
        subtract(v: Vector): Vector;
    }

    class Matrix {
        constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);

        // members
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;

        // public methods
        clone(): Matrix;
        equalTo(matrix: Matrix): boolean;
        multiply(matrix: Matrix): Matrix;
        rotate(angle: number): Matrix;
        scale(sx: number, sy: number): Matrix;
        transform(vector: [number,number]): [number, number];
        translate(tx: number, ty: number): Matrix;
        translate(vector: Vector) : Matrix;
    }

    // any object that has "box" property that implements "Interval" interface may be indexable
    // all shapes has box property that fits Interval interface
    interface IndexableElement {
        box: Interval;
    }

    // @ts-ignore (Set)
    class PlanarSet extends Set {
        constructor();

        // members
        index: IntervalTree;

        // public methods
        add(element: IndexableElement): PlanarSet;
        delete(element: IndexableElement): boolean;
        clear() : void;
        hit(pt: Point): IndexableElement[];
        search(box: Box): IndexableElement[];
        svg(): string;
    }


    const INSIDE = 1;
    const OUTSIDE = 0;
    const BOUNDARY = 2;
    const CONTAINS = 3;
    const INTERLACE = 4;
    enum EdgeRelationType {INSIDE, OUTSIDE, BOUNDARY}
    enum RelationType {INSIDE, OUTSIDE, BOUNDARY, CONTAINS, INTERLACE}
    const OVERLAP_SAME = 1;
    const OVERLAP_OPPOSITE = 2;
    enum EdgeOverlappingType {OVERLAP_SAME, OVERLAP_OPPOSITE}

    class Edge {
        constructor(shape: Segment | Arc);

        // members
        shape: Segment | Arc;
        face: Face;
        next: Edge;
        prev: Edge;
        bvStart: EdgeRelationType;
        bvEnd: EdgeRelationType;
        bv: EdgeRelationType;
        overlap: EdgeOverlappingType;
        arc_length: number;

        // getters
        readonly start: Point;
        readonly end: Point;
        readonly length: number;
        readonly box: Box;

        // public methods
        isSegment() : boolean;
        isArc() : boolean;
        contains(pt: Point): boolean;
        middle(): Point;
        setInclusion(polygon: Polygon): EdgeRelationType;
        setOverlap(edge: Edge) : EdgeOverlappingType;
    }

    class Face {
        // constructor is not documented and should not be called implicitly

        // members
        first: Edge;
        last: Edge;

        // getters
        readonly box: Box;
        readonly size: number;
        readonly edges: Edge[];

        // public methods
        append(edges: PlanarSet, edge: Edge): void;
        area(): number;
        getRelation(polygon: Polygon): RelationType;
        insert(edges: PlanarSet, newEdge: Edge, edgeBefore: Edge): void;
        isEmpty(): boolean;
        isSimple(edges: Edge[]): boolean;
        orientation(): Flatten.ORIENTATION.PolygonOrientationType;
        remove(edges: PlanarSet, edge: Edge): void;
        reverse(): void;
        setArcLength(): void;
        signedArea(): number;
        svg(attrs?: SVGAttributes, pathDefined? : boolean): string;
    }


    class Polygon {
        constructor();

        // members
        edges: PlanarSet;
        faces: PlanarSet;

        // getters
        readonly box: Box;
        readonly vertices: Point[];

        // public methods
        addFace(args: Array<Point> | Array<Segment | Arc>): Face;
        addVertex(edge: Edge, pt: Point): Edge;
        area(): number;
        clone(): Polygon;
        contains(pt: Point): boolean;
        deleteFace(face: Face): boolean;
        distanceTo(shape: Shape): [number, Segment];
        isValid(): boolean;
        removeChain(face: Face, edgeFrom: Edge, edgeTo: Edge): void;
        rotate(angle?: number, center?: Point): Polygon;
        svg(attrs?: SVGAttributes): string;
        transform(matrix?: Matrix): Polygon;
        translate(vec: Vector): Polygon;
    }

    type Shape = Point | Line | Circle | Segment | Arc | Polygon;

    function point(x?: number, y?: number): Point;
    function point(arr?: [number, number]);
    function circle(pc: Point, r: number) : Circle;
    function line(pt?: Point, norm?: Vector) : Line;
    function line(norm?: Vector, pt?: Point) : Line;
    function line(pt1?: Point, pt2?: Point) : Line;
    function segment(ps?: Point, pe?: Point) : Segment;
    function segment(arr: [number, number, number, number]) : Segment;
    function segment(psx: number, psy: number, pex: number, pey: number) : Segment;
    function arc(pc?: Point, r?: number, startAngle?: number, endAngle?: number, counterClockwise?: boolean) : Arc;
    function vector(x?: number, y?: number) : Vector;
    function vector(arr: [number, number]) : Vector;
    function vector(p1: Point, p2: Point) : Vector;
    function ray(pt?: Point) : Ray;
    function ray(x: number, y: number): Ray;
    function matrix(a: number, b: number, c: number, d: number, tx: number, ty: number) : Matrix;
}

declare namespace Flatten.ORIENTATION {
    const CCW: -1;
    const CW: 1;
    const NOT_ORIENTABLE: 0;
    enum PolygonOrientationType {CCW, CW, NOT_ORIENTABLE}
}

declare namespace Flatten.Utils {
    const DP_TOL: number;
    function EQ_0(x: number) : boolean;
    function GT(x: number, y: number) : boolean;
    function GE(x: number, y: number) : boolean;
    function LT(x: number, y: number) : boolean;
    function LE(x: number, y: number) : boolean;
}

export default Flatten;
