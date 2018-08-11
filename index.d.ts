interface Flatten {
    segment(ps: Flatten.Point, pe: Flatten.Point): Flatten.Segment;
    Segment: Flatten.Segment;

    circle(pc: Flatten.Point, r: number): Flatten.Circle;
    Circle: Flatten.Circle;

    point(x: number, y: number): Flatten.Point;
    Point: Flatten.Point;

    Box: Flatten.Box;
}

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

declare namespace Utils {
    const DP_TOL: number;
    function EQ_0(x: number) : boolean;
    function GT(x: number, y: number) : boolean;
    function GE(x: number, y: number) : boolean;
    function LT(x: number, y: number) : boolean;
    function LE(x: number, y: number) : boolean;
}

declare namespace Flatten {
    class Arc {
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
        readonly vertices: [Point, Point]
        readonly box: Box;

        breakToFunctional(): Array<Arc>;
        chordHeight(): number;
        clone(): Arc;
        contains(pt: Point): boolean;
        chordHeight(): number;
        distanceTo(shape: Shape): [number, Segment];
        intersect(shape: Shape): Array<Point>;
        middle(): Point;
        reverse(): Arc;
        rotate(angle: number, center: Point): Arc;
        split(pt: Point): Array<Arc>;
        svg(attrs?: SVGAttributes): string;
        tangentInEnd(): Vector;
        tangentInStart(): Vector;
        transform(matrix?: Matrix): Arc;
        translate(vec: Vector): Arc;
        translate(x:number, y:number): Arc;
    }

    class Box {
        constructor(xmin: number, ymin: number, xmax: number, ymax: number);

        center: Point;
        high: any;
        low: any;
        max: Box;
        xmin: number;
        xmax: number;
        ymin: number;
        ymax: number;

        clone(): Box;
        equalTo(box: Box): boolean;
        intersect(box: Box): boolean;
        less_than(box: Box): boolean;
        merge(box: Box): Box;
        notIntersect(box: Box): boolean;
        set(xmin: number, ymin: number, xmax: number, ymax: number): void;
        svg(attrs?: SVGAttributes): string;
    }

    class Circle {
        constructor(pc: Point, r: number);

        box: Box;
        center: Point;
        pc: Point;
        r: number;

        clone(): Circle;
        contains(pt: Point): boolean;
        distanceTo(shape: Shape): [number, Segment];
        intersect(shape: Shape): Array<Point>;
        svg(attrs?: SVGAttributes): string;
        toArc(counterclockwise: boolean): Arc;
    }

    class Edge {
        constructor(shape: Segment | Arc);

        shape: Segment | Arc;
        arc_length: number;
        face: Face;
        next: Edge;
        prev: Edge;

        bvStart: boolean;
        bvEnd: boolean;
        // TODO: Represent Flatten.OVERLAP_SAME and Flatten.OVERLAP_OPPOSITE
        overlap: "same" | "opposite";

        readonly start: Point;
        readonly end: Point;
        readonly length: number;
        readonly box: Box;

        contains(pt: Point): boolean;
        middle(): Point;

        // TODO: Should be one of FLatten.INSIDE, Flatten.OUTSDIE< or Flatten>BOUNDARY.
        setInclusion(polygon: Polygon): void;
        setOverlap(edge: Edge) : void;
    }

    class Face {
        first: Edge;
        last: Edge;
        edges: Edge[];

        readonly box: Box;
        readonly size: number;

        append(edges: PlanarSet, edge: Edge): void;
        area(): number;

        // TODO: impelemnt options here.
        getRelation(polygon: Polygon): void;
        insert(edges: PlanarSet, newEdge: Edge, edgeBefore: Edge): void;
        isEmpty(): boolean;
        isSimple(edges: Edge[]): boolean;
        orientation(): number;
        remove(edges: PlanarSet, edge: Edge): void;
        reverse(): void;
        setArcLength(): void;
        signedArea(): number;
        svg(attrs?: SVGAttributes, pathDefined? : boolean): string;
    }

  class Image {
    constructor();

    center: Point;
    height: number;
    width: number;
  }

    class Line {
        constructor(pt: Point, norm: Vector | Point);

        norm: Vector;
        pt: Point;

        readonly slope: number;
        readonly standard: [number, number, number];

        clone(): Line;
        contains(pt: Point): boolean;
        distanceTo(shape: Shape): [number, Segment];
        incidentTo(line: Line): boolean;
        intersect(shape: Shape): Point[];
        parallelTo(line: Line): boolean;
        svg(box: Box, attrs?: SVGAttributes): string;
    }

    class Point {
        constructor(x?: number, y?: number);
        constructor(arg?: [number, number]);
        x: number;
        y: number;

        readonly box: Box;             // getter
        readonly vertices: [Point];     // getter

        clone(): Point;
        distanceTo(shape: Shape): [number, Segment];
        equalTo(pt: Point): boolean;
        leftTo(line: Line): boolean;
        lessThan(pt: Point): boolean;
        on(shape: Point | Shape): boolean;
        projectionOn(line: Line): Point;
        rotate(angle: number, center: Point): Point;
        svg(attrs?: SVGAttributes): string;
        transform(matrix: Matrix): Point;
        translate(vec: Vector): Point;
        translate(x: number, y: number): Point;
    }

    class Matrix {
        constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);

        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;

        clone(): Matrix;
        equalTo(matrix: Matrix): boolean;
        multiply(matrix: Matrix): Matrix;
        rotate(angle: number): Matrix;
        scale(sx: number, sy: number): Matrix;
        transform(vector: Vector): [number, number];
        translate(tx: number, ty: number): Matrix;
    }

    // @ts-ignore
    class PlanarSet extends Set {
        constructor();

        add(shape: Shape): this;
        delete(shape: Shape): boolean;

        hit(pt: Point): Shape[];
        search(box: Box): Shape[];
        svg(): string;
    }

    class Polygon {
        constructor();

        edges: PlanarSet;
        faces: PlanarSet;

        readonly box: Box;
        readonly vertices: Point[];

        addFace(...args: Array<Point | Segment | Arc>[]): Face;
        addVertex(edge: Edge, pt: Point): Edge;
        area(): number;
        clone(): Polygon;
        contains(pt: Point): boolean;
        deleteFace(face: Face): boolean;
        distanceTo(shape: Shape): [number, Segment];
        isValid(): boolean;
        removeChain(face: Face, edgeFrom: Edge, edgeTo: Edge): void;
        rotate(angle: number, center: Point): Polygon;
        svg(attrs?: SVGAttributes): string;
        transform(matrix: Matrix): Polygon;
        translate(vec: Vector): Polygon;
    }

    class Ray {
        constructor(pt: Point);

        pt: Point;
        box: Box;
        norm: Vector;
        start: Point;

        clone(): Ray;
        intersect(shape: Segment | Arc): Point[];
    }

    class Segment {
        constructor(ps: Point, pe: Point);

        ps: Point;
        pe: Point;

        readonly start: Point;
        readonly end: Point;
        readonly box: Box;
        readonly length: number;
        readonly slope: number;
        readonly vertices: [Point, Point];

        clone(): Segment;
        contains(pt: Point): boolean;
        distanceTo(shape: Shape): [number, Segment];
        equalTo(seg: Segment): boolean;
        intersect(box: Box): boolean;
        isZeroLength(): boolean;
        middle(): Point;
        reverse(): Segment;
        rotate(angle: number, center?: Point): Segment;
        split(pt: Point): [Segment, Segment];
        svg(attrs?: SVGAttributes): string;
    }

    type Shape = Point | Arc | Segment | Circle | Line | Polygon;

    class Vector {
        constructor(ps: Point, pe: Point);
        constructor(x: number, y: number);

        length: number;
        slope: number;
        x: number;
        y: number;

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
}

export default Flatten;
