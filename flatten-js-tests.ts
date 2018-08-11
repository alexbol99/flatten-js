'use strict';

import Flatten from "./index.js";

const {Point, Box} = Flatten;

const pt0 : Flatten.Point = new Point();
const pt1 : Flatten.Point = new Point(1,2);
const pt2 : Flatten.Point = new Point([1,2]);

const x: number = pt0.x;
const y: number = pt0.y;
const b: Flatten.Box = pt0.box;
// pt0.box = new Flatten.Box(1,1,100,100);  error: do not assign to getter

const svg: string = pt0.svg({fill:"green"})

