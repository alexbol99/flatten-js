// Type definitions for flatten-js library
// Project: https://github.com/alexbol99/flatten-js
// Definitions by: Alex Bol

import IntervalTree from "@flatten-js/interval-tree";
/// <reference types="@flatten-js/interval-tree" />

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
    type Value = any;

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

        comparable_max(arg1: Comparable, arg2: Comparable) : Comparable;
        comparable_less_than(arg1: Comparable, arg2: Comparable ) : boolean;
    }

    class LinkedListElement {
        next: LinkedListElement | null;
        prev: LinkedListElement | null;
    }

    class LinkedList {
        // members
        first: LinkedListElement;
        last: LinkedListElement;

        // getters
        readonly size: number;

        // public methods
        append(element: LinkedListElement): LinkedList;
        insert(newElement: LinkedListElement, prevElement: LinkedListElement): LinkedList;
        remove(element: LinkedListElement): LinkedList;
        toArray(): LinkedListElement[];
        isEmpty(): boolean;
    }

    class CircularLinkedList extends LinkedList {}

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
        intersect(shape: Shape): Array<Point>;
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
        toJSON() : Object;
    }

    class Box implements Interval {
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
        clone(): Interval;
        equal_to(box: Interval): boolean;
        intersect(box: Interval): boolean;
        less_than(box: Interval): boolean;
        merge(box: Box): Box;
        not_intersect(box: Interval): boolean;
        output() : void;
        set(xmin: number, ymin: number, xmax: number, ymax: number): void;
        svg(attrs?: SVGAttributes): string;

        comparable_max(arg1: Comparable, arg2: Comparable) : Comparable;
        comparable_less_than(arg1: Comparable, arg2: Comparable ) : boolean;
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
        contains(shape: Shape): boolean;
        distanceTo(geom: Shape | PlanarSet): [number, Segment];
        intersect(shape: Shape): Array<Point>;
        svg(attrs?: SVGAttributes): string;
        toArc(counterclockwise?: boolean): Arc;
        toJSON() : Object;
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
        intersect(shape: Shape): Point[];
        parallelTo(line: Line): boolean;
        svg(box: Box, attrs?: SVGAttributes): string;
        toJSON() : Object;
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
        toJSON() : Object;
    }

    class Ray {
        norm: Vector;

        // members
        pt: Point;
        readonly slope: number;

        // getters
        readonly start: Point;
        readonly box: Box;

        constructor(pt?: Point, norm?: Vector);

        // public methods
        clone(): Ray;

        contains(pt: Point): boolean;
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
        intersect(shape: Shape): Point[];
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
        toJSON() : Object;
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
        multiply(scalar: number): Vector;
        normalize(): Vector;
        projectionOn(v: Vector): Vector;
        rotate(angle: number): Vector;
        rotate90CCW(): Vector;
        rotate90CW(): Vector;
        subtract(v: Vector): Vector;
        toJSON() : Object;
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
        add(element: IndexableElement): this;
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

    class Face extends CircularLinkedList {
        // constructor is not documented and should not be called implicitly

        // members
        first: Edge;
        last: Edge;

        // getters
        readonly box: Box;
        readonly size: number;
        readonly edges: Edge[];

        // public methods
        append(edge: Edge): Face;
        insert(element: Edge): Face;
        remove(element: Edge): Face;
        area(): number;
        getRelation(polygon: Polygon): RelationType;
        isSimple(edges: Edge[]): boolean;
        orientation(): Flatten.ORIENTATION.PolygonOrientationType;
        reverse(): void;
        setArcLength(): void;
        signedArea(): number;
        toPolygon(): Polygon;
        svg(attrs?: SVGAttributes, pathDefined? : boolean): string;
    }

    type NumericPair = [number,number];
    type EdgeShape = Point | Segment | Arc ;
    type LoopOfShapes = Array<EdgeShape | NumericPair>;
    type MultiLoopOfShapes = Array<LoopOfShapes | Circle | Box>;

    class Polygon {
        constructor(args?: LoopOfShapes | Circle | Box | MultiLoopOfShapes);

        // members
        edges: PlanarSet;
        faces: PlanarSet;

        // getters
        readonly box: Box;
        readonly vertices: Point[];

        // public methods
        addFace(args: Array<Point> | Array<Segment | Arc> | Circle | Box): Face;
        addVertex(edge: Edge, pt: Point): Edge;
        area(): number;
        clone(): Polygon;
        contains(shape: Shape): boolean;
        deleteFace(face: Face): boolean;
        distanceTo(shape: Shape): [number, Segment];
        intersect(shape: Shape): Point[];
        isValid(): boolean;
        removeChain(face: Face, edgeFrom: Edge, edgeTo: Edge): void;
        rotate(angle?: number, center?: Point): Polygon;
        transform(matrix?: Matrix): Polygon;
        translate(vec: Vector): Polygon;
        toJSON() : Object;
        toArray() : Polygon[];
        svg(attrs?: SVGAttributes): string;
        splitToIslands() : Polygon[];
    }

    type Shape = Point | Line | Circle | Box | Segment | Arc | Polygon;

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
    var DP_TOL: number;
    function EQ_0(x: number) : boolean;
    function GT(x: number, y: number) : boolean;
    function GE(x: number, y: number) : boolean;
    function LT(x: number, y: number) : boolean;
    function LE(x: number, y: number) : boolean;
}

export default Flatten;
