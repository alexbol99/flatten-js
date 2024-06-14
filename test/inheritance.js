"use strict";

import { expect } from "chai";
import Flatten from "../index";

describe("#Flatten.inheritance", function () {
  class Arc extends Flatten.Arc {}
  class Box extends Flatten.Box {}
  class Circle extends Flatten.Circle {}
  class Line extends Flatten.Line {}
  class Matrix extends Flatten.Matrix {}
  class Multiline extends Flatten.Multiline {}
  class Point extends Flatten.Point {}
  class Polygon extends Flatten.Polygon {}
  class Ray extends Flatten.Ray {}
  class Segment extends Flatten.Segment {}
  class Vector extends Flatten.Vector {}

  const testClasses = {
    Arc,
    Box,
    Circle,
    Line,
    Matrix,
    Multiline,
    Point,
    Polygon,
    Ray,
    Segment,
    Vector,
  };

  for (let className in testClasses) {
    it(`allows ${className} inheritance`, function () {
      const theClass = testClasses[className];
      const instance = theClass === Box ? new theClass(0, 0, 1, 1) : new theClass();
      expect(instance.clone()).to.be.instanceof(theClass);
      if (instance.translate) {
        expect(instance.translate(new Vector(1, 1))).to.be.instanceof(theClass);
      }
      if (instance.merge) {
        expect(instance.merge(instance.clone())).to.be.instanceof(theClass);
      }
      if (instance.rotate && className != 'Box') {
        expect(instance.rotate(Math.PI)).to.be.instanceof(theClass);
      }
      // Matrix.transform() expects Vector
      if (instance.transform && className != "Matrix") {
        expect(instance.transform(Flatten.matrix())).to.be.instanceof(theClass);
      }
    });
  }

  it("allows deep inheritance", function () {
    const center = new Point();
    const arc = new Arc(center);
    expect(arc.clone().pc).to.be.instanceof(Point);
    const segment = new Segment(new Point(10, 10), new Point(20, 10));
    expect(segment.end).to.be.instanceof(Point);
    expect(segment.clone().end).to.be.instanceof(Point);
    const poly = new Polygon([arc, segment]);
    let instance = poly.clone();
    for (let edge of instance.edges) {
      if (edge.shape instanceof Flatten.Segment) {
        expect(edge.shape).to.be.instanceof(Segment);
        expect(edge.shape.end).to.be.instanceof(Point);
      } else {
        expect(edge.shape).to.be.instanceof(Arc);
        expect(edge.shape.pc).to.be.instanceof(Point);
      }
    }
  });
});
