'use strict';

import Flatten from "./index.js";
import IntervalTree = require("flatten-interval-tree");

const {Point, Circle, Line, Segment, Arc, Box, Ray, Polygon} = Flatten;
const { Vector, Matrix, PlanarSet} = Flatten;
const {point, circle, line, segment, arc} = Flatten;

{
    const pt0: Flatten.Point = new Point();
    const pt1: Flatten.Point = new Point(1, 2);
    const pt2: Flatten.Point = new Point([1, 2]);

    point();
    point(1,2);
    point([1,2]);

    const x: number = pt0.x;
    const y: number = pt0.y;
    const b: Flatten.Box = pt0.box;
    const v: Flatten.Point[] = pt0.vertices;
    const [dist, seg] : [number, Flatten.Segment] = pt0.distanceTo(pt1);
    const eq: boolean = pt0.equalTo(pt1);
    const pt3: Flatten.Point = pt0.transform(new Flatten.Matrix());
    const pt4: Flatten.Point = pt0.rotate(Math.PI);
    const pt5: Flatten.Point = pt0.rotate(Math.PI,new Point(3,4));
    const pt6: Flatten.Point = pt0.translate(new Vector(1,1));
    const pt7: Flatten.Point = pt0.translate(2,3);
    const pt8: Flatten.Point = pt0.transform(new Matrix());
    const bon: boolean = pt0.on(new Circle(point(),5));
    const svg0: string = pt0.svg();
    const svg1: string = pt0.svg({fill: "green",id:"one"});
}
