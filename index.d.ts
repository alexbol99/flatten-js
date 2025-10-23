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
        toArray(start?: LinkedListElement, end?: LinkedListElement): LinkedListElement[];
        isEmpty(): boolean;
        static testInfiniteLoop(first: LinkedListElement): undefined;
    }

    class CircularLinkedList extends LinkedList {}

    type DE9IM_element = Array<AnyShape> | undefined;
    /* Impossible to set length for tuple ? Really ? */
    type DE9IM_matrix = [
        DE9IM_element,DE9IM_element,DE9IM_element,
        DE9IM_element,DE9IM_element,DE9IM_element,
        DE9IM_element,DE9IM_element,DE9IM_element
    ];

    class DE9IM {
        // member
        m: DE9IM_matrix;

        get I2I();
        set I2I(geom: Array<AnyShape>);

        get I2B();
        set I2B(geom: Array<AnyShape>);

        get I2E();
        set I2E(geom: Array<AnyShape>);

        get B2I();
        set B2I(geom: Array<AnyShape>);

        get B2B();
        set B2B(geom: Array<AnyShape>);

        get B2E();
        set B2E(geom: Array<AnyShape>);

        get E2I();
        set E2I(geom: Array<AnyShape>);

        get E2B();
        set E2B(geom: Array<AnyShape>);

        get E2E();
        set E2E(geom: Array<AnyShape>);

        toString() : string;
    }

    const CCW = true;
    const CW = false;

    class Shape {
        translate(vec: Vector): Shape;
        translate(x:number, y:number): Shape;
        rotate(angle: number, center?: Point): Shape;
        scale(scaleX: number, scaleY: number) : Shape;
        transform(matrix: Matrix): Shape;
    }
    class Arc extends Shape {
        counterClockwise: boolean;

        // members
        ps: Point;
        r: number;
        startAngle: number;
        endAngle: number;

        constructor(
            pc?: Point,
            r?: number,
            startAngle?: number,
            endAngle?: number,
            counterClockwise?: boolean
        );

        // getters
        readonly start: Point;
        readonly end: Point;
        readonly center: Point;
        readonly length: number;
        readonly sweep: number;
        readonly vertices: [Point, Point];
        readonly box: Box;

        // public methods
        clone(): Arc;
        contains(pt: Point): boolean;
        split(pt: Point): [Arc | undefined, Arc | undefined];
        middle(): Point;
        pointAtLength(length: number): Point|null;
        chordHeight(): number;
        intersect(shape: AnyShape): Array<Point>;
        distanceTo(geom: AnyShape | PlanarSet): [number, Segment];
        breakToFunctional(): Array<Arc>;
        tangentInEnd(): Vector;
        tangentInStart(): Vector;
        reverse(): Arc;
        translate(vec: Vector): Arc;
        translate(x:number, y:number): Arc;
        rotate(angle: number, center?: Point): Arc;
        scale(scaleX: number, scaleY: number) : Arc;
        transform(matrix: Matrix): Arc;
        sortPoints(pts: Array<Point>): Array<Point>;
        toJSON() : Object;
        svg(attrs?: SVGAttributes): string;
    }

    class Box extends Shape implements Interval {
        constructor(xmin?: number, ymin?: number, xmax?: number, ymax?: number);

        //members
        xmin: number;
        ymin: number;
        xmax: number;
        ymax: number;

        // getters
        readonly center: Point;
        readonly high: Point;
        readonly low: Point;
        readonly max: Box;
        readonly width: number;
        readonly height: number;

        // public methods
        clone(): Box;
        not_intersect(box: Box): boolean;
        intersect(box: Box): boolean;
        contains(shape: AnyShape): boolean;
        distanceTo(shape: AnyShape): [number, Point];
        merge(box: Box): Box;
        less_than(box: Box): boolean;
        equal_to(box: Box): boolean;
        set(xmin: number, ymin: number, xmax: number, ymax: number): void;
        extend(extension: number): Box;
        toPoints() : Array<Point>;
        toSegments() : Array<Segment>;
        translate(vec: Vector): Box;
        translate(x:number, y:number): Box;
        rotate(angle: number, center?: Point): never;
        scale(scaleX: number, scaleY: number) : Box;
        transform(matrix: Matrix): Box;
        output(): Box;         // required by base type Interval
        svg(attrs?: SVGAttributes): string;

        comparable_max(arg1: Comparable, arg2: Comparable) : Comparable;
        comparable_less_than(arg1: Comparable, arg2: Comparable ) : boolean;
    }

    class Circle extends Shape {
        constructor(pc: Point, r: number);

        // members
        pc: Point;
        r: number;

        // getters
        readonly box: Box;
        readonly center: Point;

        // public methods
        clone(): Circle;
        contains(shape: AnyShape): boolean;
        toArc(counterclockwise?: boolean): Arc;
        intersect(shape: AnyShape): Array<Point>;
        distanceTo(geom: AnyShape | PlanarSet): [number, Segment];
        translate(vec: Vector): Circle;
        translate(x:number, y:number): Circle;
        rotate(angle: number, center?: Point): Circle;
        scale(scaleX: number, scaleY: number) : Circle | never;
        transform(matrix: Matrix): Circle;
        toJSON() : Object;
        svg(attrs?: SVGAttributes): string;
    }

    class Line extends Shape {
        constructor(pt?: Point, norm?: Vector);
        constructor(norm: Vector, pt: Point);
        constructor(pt1: Point, pt2: Point);

        // members
        pt: Point;
        norm: Vector;

        // getters
        readonly start: undefined;
        readonly end: undefined;
        readonly box: Box;
        readonly length: number;
        readonly slope: number;
        readonly standard: [number, number, number];

        // public methods
        clone(): Line;
        parallelTo(line: Line): boolean;
        incidentTo(line: Line): boolean;
        contains(pt: Point): boolean;
        coord(pt: Point): number;
        intersect(shape: AnyShape): Point[];
        distanceTo(shape: AnyShape): [number, Segment];
        split(pt: Point | Point[]): AnyShape[];
        sortPoints(points: Point[]): Point[];
        translate(vec: Vector): Line;
        translate(x:number, y:number): Line;
        rotate(angle: number, center?: Point): Line;
        scale(scaleX: number, scaleY: number) : Line;
        transform(matrix: Matrix): Line;
        toJSON() : Object;
        svg(box: Box, attrs?: SVGAttributes): string;
    }

    class Point extends Shape {
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
        equalTo(pt: Point): boolean;
        lessThan(pt: Point): boolean;
        translate(vec: Vector): Point;
        translate(x: number, y: number): Point;
        rotate(angle: number, center?: Point): Point;
        scale(scaleX: number, scaleY: number) : Point;
        transform(matrix: Matrix): Point;
        projectionOn(line: Line): Point;
        distanceTo(geom: AnyShape | PlanarSet): [number, Segment];
        leftTo(line: Line): boolean;
        on(shape: Point | AnyShape): boolean;
        toJSON() : Object;
        svg(attrs?: SVGAttributes): string;
    }

    class Ray extends Shape {
        // members
        pt: Point;
        norm: Vector;

        // getters
        readonly start: Point;
        readonly box: Box;
        readonly slope: number;

        constructor(pt?: Point, norm?: Vector);

        // public methods
        clone(): Ray;
        contains(pt: Point): boolean;
        split(pt: Point): AnyShape[];
        intersect(shape: AnyShape): Point[];
        translate(vec: Vector): Ray;
        translate(x:number, y:number): Ray;
        rotate(angle: number, center?: Point): Ray;
        scale(scaleX: number, scaleY: number) : Ray;
        transform(matrix: Matrix): Ray;
        svg(box: Box, attrs?: SVGAttributes): string;
    }

    class Segment extends Shape {
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
        equalTo(seg: Segment): boolean;
        contains(pt: Point): boolean;
        intersect(shape: AnyShape): Point[];
        distanceTo(shape: AnyShape): [number, Segment];
        tangentInStart(): Vector;
        tangentInEnd(): Vector;
        reverse(): Segment;
        split(pt: Point): [Segment|null,Segment|null];
        middle(): Point;
        pointAtLength(length: number): Point|null;
        translate(vec: Vector): Segment;
        translate(x:number, y:number): Segment;
        rotate(angle: number, center?: Point): Segment;
        scale(scaleX: number, scaleY: number) : Segment;
        transform(matrix: Matrix): Segment;
        isZeroLength(): boolean;
        sortPoints(points: Array<Point>) : Array<Point>;
        toJSON() : Object;
        svg(attrs?: SVGAttributes): string;
    }

    class Vector extends Shape {
        constructor(x?: number, y?: number);
        constructor(ps: Point, pe: Point);
        constructor(v: Vector);
        constructor(segment: Segment);

        // members
        x: number;
        y: number;

        // getters
        readonly length: number;
        readonly slope: number;

        // public methods
        clone(): Vector;
        isZeroLength(): boolean;
        equalTo(v: Vector): boolean;
        multiply(scalar: number): Vector;
        dot(v: Vector): number;
        cross(v: Vector): number;
        normalize(): Vector;
        rotate(angle: number): Vector;
        rotate90CCW(): Vector;
        rotate90CW(): Vector;
        translate(vec: Vector): Vector;
        translate(x:number, y:number): Vector;
        rotate(angle: number, center?: Point): Vector;
        scale(scaleX: number, scaleY: number) : Vector;
        transform(matrix: Matrix): Vector;
        invert(): Vector;
        add(v: Vector): Vector;
        subtract(v: Vector): Vector;
        angleTo(v: Vector): number;
        projectionOn(v: Vector): Vector;
        toJSON() : Object;
    }

    type AffineMatrix3x3 = [
        [number, number, number],
        [number, number, number],
        [0, 0, 1]
    ]

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
        fromMatrix3x3(matrix: AffineMatrix3x3): Matrix;
        toMatrix3x3(): AffineMatrix3x3;
        equalTo(matrix: Matrix): boolean;
        multiply(matrix: Matrix): Matrix;
        rotate(angle: number, centerX?: number, centerY?: number): Matrix;
        scale(sx: number, sy: number): Matrix;
        transform(vector: [number,number]): [number, number];
        translate(tx: number, ty: number): Matrix;
        translate(vector: Vector) : Matrix;
    }

    type PlanarSetEntry = AnyShape | {key: Box, value: AnyShape}

    // @ts-ignore (Set)
    class PlanarSet extends Set {
        // @ts-ignore (Set)
        constructor(shapes?: PlanarSetEntry[] | Set<PlanarSetEntry>);

        // members
        index: IntervalTree;

        // public methods
        add(element: PlanarSetEntry): this;
        delete(element: PlanarSetEntry): boolean;
        clear() : void;
        hit(pt: Point): AnyShape[];
        search(box: Box): AnyShape[];
        svg(): string;
    }


    const INSIDE = 1;
    const OUTSIDE = 0;
    const BOUNDARY = 2;
    enum EdgeRelationType {INSIDE, OUTSIDE, BOUNDARY}
    const OVERLAP_SAME = 1;
    const OVERLAP_OPPOSITE = 2;
    enum EdgeOverlappingType {OVERLAP_SAME, OVERLAP_OPPOSITE}

    // Base class Edge for PolygonEdge and MultilineEdge
    class Edge {
        // members
        shape: any

        constructor(shape: any);
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
        readonly isSegment: boolean;
        readonly isArc: boolean;
        readonly isLine: boolean;
        readonly isRay: boolean

        // public methods
        contains(pt: Point): boolean;
        middle(): Point;
        pointAtLength(length: number): Point|null;
        setInclusion(polygon: Polygon): EdgeRelationType;
        setOverlap(edge: Edge) : EdgeOverlappingType;
    }

    class PolygonEdge extends Edge {
        shape: Segment | Arc;
        constructor(shape: Segment | Arc);
    }

    class Face extends CircularLinkedList {
        // constructor is not documented and should not be called implicitly

        // members
        first: PolygonEdge;
        last: PolygonEdge;

        // getters
        readonly box: Box;
        readonly size: number;
        readonly length: number;
        readonly perimeter: number;
        readonly edges: PolygonEdge[];
        readonly vertices: Point[];
        readonly shapes: Array<Segment | Arc>

        // public methods
        append(edge: PolygonEdge): Face;
        insert(element: PolygonEdge): Face;
        remove(element: PolygonEdge): Face;
        reverse(): void;
        setArcLength(): void;
        area(): number;
        signedArea(): number;
        orientation(): Flatten.ORIENTATION.PolygonOrientationType;
        isSimple(edges: PolygonEdge[]): boolean;
        findEdgeByPoint(pt: Point): PolygonEdge | undefined;
        pointAtLength(length: number): Point|null;
        toPolygon(): Polygon;
        svg(attrs?: SVGAttributes, pathDefined? : boolean): string;
    }

    type NumericPair = [number,number];
    type ConstructorEdgeShape = Point | Segment | Arc ;
    type LoopOfShapes = Array<ConstructorEdgeShape | NumericPair>;
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
        clone(): Polygon;
        isEmpty(): boolean;
        isValid(): boolean;
        area(): number;
        addFace(args: Array<Point> | Array<Segment | Arc> | Circle | Box): Face;
        addFace(edge_from: Edge, edge_to: Edge): Face;
        deleteFace(face: Face): boolean;
        recreateFaces(): void;
        removeChain(face: Face, edgeFrom: PolygonEdge, edgeTo: PolygonEdge): void;
        addVertex(pt: Point, edge: PolygonEdge): PolygonEdge;
        removeEndVertex(edge: Edge): void;
        cut(multiline: Multiline): Polygon;
        cutWithLine(line: Line): Polygon;
        findEdgeByPoint(pt: Point): PolygonEdge | undefined;
        splitToIslands() : Polygon[];
        rearrange() : Polygon;
        orientation(): Flatten.ORIENTATION.PolygonOrientationType;
        isOuter(): boolean;
        isMultiPolygon(): boolean;
        reverse(): Polygon;
        contains(shape: AnyShape): boolean;
        distanceTo(shape: AnyShape): [number, Segment];
        intersect(shape: AnyShape): Point[];
        rotate(angle?: number, center?: Point): Polygon;
        scale(sx: number, sy: number): Polygon;
        transform(matrix?: Matrix): Polygon;
        translate(vec: Vector): Polygon;
        toJSON() : Object;
        toArray() : Polygon[];
        svg(attrs?: SVGAttributes): string;
        dpath(): string;
    }

    type MultilineEdgeShape = Segment | Arc | Ray | Line;
    type MultilineShapes = Array<MultilineEdgeShape> | [Line]

    class MultilineEdge extends Edge {
        shape: MultilineEdgeShape;          // there may be only one line edge and only terminal ray edges
        constructor(shape: MultilineEdgeShape);
    }

    class Multiline extends LinkedList {
        constructor(args?: MultilineShapes);

        // getters
        get edges() : MultilineEdge[];
        get vertices(): Point[];
        get box(): Box;
        get length(): number;

        clone(): Multiline;
        addVertex(pt: Point, edge: MultilineEdge): MultilineEdge;
        split(ip: Point[]) : Multiline;
        pointAtLength(length: number): Point|null;
        findEdgeByPoint(pt: Point): MultilineEdge | undefined;
        contains(shape: AnyShape): boolean;
        distanceTo(shape: AnyShape): [number, Segment];
        intersect(shape: AnyShape): Point[];
        rotate(angle?: number, center?: Point): Multiline;
        transform(matrix?: Matrix): Multiline;
        translate(vec: Vector): Multiline;
        toShapes(): MultilineShapes;
        toJSON() : Object;
        svg(attrs?: SVGAttributes): string;
        dpath(): string;
    }

    class Inversion {
        circle: Circle;              // inversion circle
        constructor(circle: Circle);
        get inversion_circle() : Circle;
        inverse(Point: Point) : Point;
        inverse(Line: Line) : Line | Circle;
        inverse(Circle: Circle) : Line | Circle;
    }

    class Errors {
        readonly ILLEGAL_PARAMETERS: ReferenceError;
        readonly ZERO_DIVISION: Error;
        readonly UNRESOLVED_BOUNDARY_CONFLICT: Error;
        readonly INFINITE_LOOP: Error;
        readonly CANNOT_COMPLETE_BOOLEAN_OPERATION: Error;
        readonly CANNOT_INVOKE_ABSTRACT_METHOD: Error;
        readonly OPERATION_IS_NOT_SUPPORTED: Error;
    }

    type AnyShape = Point | Vector | Line | Ray | Circle | Box | Segment | Arc | Polygon | Multiline;

    function point(x?: number, y?: number): Point;
    function point(arr?: [number, number]): Point;
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
    function isWktString(wkt: string): boolean;
    function parseWKT(wkt: string): Point | Point[] | Multiline | Multiline[] | Polygon | null ;
}

declare namespace Flatten.ORIENTATION {
    const CCW: -1;
    const CW: 1;
    const NOT_ORIENTABLE: 0;
    enum PolygonOrientationType {CCW, CW, NOT_ORIENTABLE}
}

declare namespace Flatten.Utils {
    function getTolerance() : number;
    function setTolerance(tolerance: number): void;
    function EQ(x: number, y: number) : boolean;
    function EQ_0(x: number) : boolean;
    function GT(x: number, y: number) : boolean;
    function GE(x: number, y: number) : boolean;
    function LT(x: number, y: number) : boolean;
    function LE(x: number, y: number) : boolean;
}

declare namespace Flatten.BooleanOperations {
    function unify(polygon1: Polygon, polygon2: Polygon): Polygon;
    function subtract(polygon1: Polygon, polygon2: Polygon): Polygon;
    function intersect(polygon1: Polygon, polygon2: Polygon): Polygon;
    function innerClip(polygon1: Polygon, polygon2: Polygon): [AnyShape[], AnyShape[]];
    function outerClip(polygon1: Polygon, polygon2: Polygon): AnyShape[];
    function calculateIntersections(polygon1: Polygon, polygon2: Polygon): [Point[],Point[]];
}

declare namespace Flatten.Relations {
    function relate(shape1: AnyShape, shape2: AnyShape): DE9IM;
    function equal(shape1: AnyShape, shape2: AnyShape): boolean;
    function intersect(shape1: AnyShape, shape2: AnyShape): boolean;
    function touch(shape1: AnyShape, shape2: AnyShape): boolean;
    function disjoint(shape1: AnyShape, shape2: AnyShape): boolean;
    function inside(shape1: AnyShape, shape2: AnyShape): boolean;
    function covered(shape1: AnyShape, shape2: AnyShape): boolean;
    function cover(shape1: AnyShape, shape2: AnyShape): boolean;
}

export = Flatten;
export as namespace Flatten;

