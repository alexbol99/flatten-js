import Flatten = require("../../index");

declare const polygon: Flatten.Polygon;
declare const face: Flatten.Face;

const isOuter: boolean = polygon.isOuter(face);
void isOuter;
