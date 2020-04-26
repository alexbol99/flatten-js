[![npm version](https://badge.fury.io/js/%40flatten-js%2Fcore.svg)](https://badge.fury.io/js/%40flatten-js%2Fcore)
[![Build Status](https://travis-ci.org/alexbol99/flatten-js.svg?branch=master)](https://travis-ci.org/alexbol99/flatten-js)
[![Coverage Status](https://coveralls.io/repos/github/alexbol99/flatten-js/badge.svg?branch=master)](https://coveralls.io/github/alexbol99/flatten-js?branch=master)

# Javascript library for 2d geometry

**flatten-js** is a javascript library for manipulating abstract geometrical shapes like point, vector, line, ray, segment,
circle, arc and polygon. Shapes may be organized into Planar Set - searchable container which support spatial queries.

**flatten-js** provides a lot of useful methods and algorithms like finding intersections, checking inclusion, calculating distance, applying
affine transformations, performing boolean operations and more.

Library consists of several packages, published under scope **@flatten-js/**:

| Name        | Description  |
| ------------- |:-------------:|
| [@flatten-js/core](https://www.npmjs.com/package/@flatten-js/core)                   | Basic classes and operations
| [@flatten-js/interval-tree](https://www.npmjs.com/package/@flatten-js/interval-tree) | Interval binary search tree 
| [@flatten-js/boolean-op](https://www.npmjs.com/package/@flatten-js/boolean-op)    | Boolean operations
| [@flatten-js/polygon-offset](https://www.npmjs.com/package/@flatten-js/polygon-offset)    | Polygon offset


NOTE: Package [flatten-js](https://www.npmjs.com/package/flatten-js) is not supported and will be deprecated soon.

Packages are distributed in 3 formats: commonjs, umd and es6 modules. Package.json file
provides various entry points suitable for different targets.

TypeScript users may take advantage of static type checking with typescript definition file index.d.ts included into the package.

**flatten-js** does not concern too much about visualization.
Anyway, all classes implement svg() method, that returns a string which may be inserted into SVG container. 
It works pretty well together with  [d3js](https://d3js.org/) library, but it is definitely possible to create bridges to other graphic libraries.

The best way to start working with FlattenJS is to use awesome [Observable](https://beta.observablehq.com/) javascript interactive notebooks.
Check out collection of [Tutorials](https://observablehq.com/collection/@alexbol99/flatten-js-tutorials) published in Observable Notebooks.

Full documentation may be found here: [https://alexbol99.github.io/flatten-js/index.html](https://alexbol99.github.io/flatten-js/index.html)

## Contacts

Follow me on Twitter [@alex_bol_](https://twitter.com/alex_bol_)

## Installation

    npm install --save @flatten-js/core

## Usage

```javascript
import {Point, Vector, Circle, Line, Ray, Segment, Arc, Box, Polygon, Matrix, PlanarSet} from '@flatten-js/core';
```

It is possible to import Flatten namespace as default import, and then destruct all classes from it. 
```javascript
import Flatten from '@flatten-js/core'
const {Point, Vector, Circle, Line, Ray, Segment, Arc, Box, Polygon, Matrix, PlanarSet} = Flatten;
```

Some classes have shortcuts to avoid annoying *new* constructor:
```javascript
import {point, vector, circle, line, ray, segment, arc, polygon, matrix} from '@flatten-js/core';
```

## Example

After module imported, it is possible to create some construction:
```javascript
    // extract object creators
    import {point, circle, segment} from '@flatten-js/core';

    // make some construction
    let s1 = segment(10,10,200,200);
    let s2 = segment(10,160,200,30);
    let c = circle(point(200, 110), 50);
    let ip = s1.intersect(s2);
```

You may test the code above also in [NPM RunKit](https://npm.runkit.com/@flatten-js/core)

You may also check out examples section in the code which illustrate different use cases:
* in nodejs
* in a browser using ```<script>``` tag with **unpkg.com** loader
* in a React application 

## Content of the library

### Basic shapes
**flatten-js** library implements following basic shapes:
* [Point](https://alexbol99.github.io/flatten-js/Point.html)
* [Vector](https://alexbol99.github.io/flatten-js/Vector.html)
* [Line](https://alexbol99.github.io/flatten-js/Line.html)
* [Ray](https://alexbol99.github.io/flatten-js/Ray.html)
* [Segment](https://alexbol99.github.io/flatten-js/Segment.html)
* [Arc (circular)](https://alexbol99.github.io/flatten-js/Arc.html)
* [Circle](https://alexbol99.github.io/flatten-js/Circle.html)
* [Box (may be used as rectangle)](https://alexbol99.github.io/flatten-js/Point.html)

### Polygon

[Polygon](https://alexbol99.github.io/flatten-js/Polygon.html) in **flatten-js** library is actually a multi-polygon.
Polygon is a collection of faces - 
closed oriented chains of edges, which may be of type Segment or Arc. The most external face
called island, a face included into it is called hole. Holes in turn may have inner islands,
number of inclusion levels is unlimited.
 
Orientation of islands and holes is matter for calculation
of relationships and boolean operations, holes should have orientation opposite to islands.
It means that for proper results faces in a polygon should be **orientable**: they should not have self-intersections.
Faces also should not overlap each other. Method ```isValid()``` checks if polygon fit these rules.

Constructor of the polygon object accept various inputs:
* Array of shapes (segments or arcs) that represent closed chains
* Json object that represent closed chains 
* Array of points (Flatten.Point) that represent vertices of the polygon
* Array of numeric pairs [x,y] that represent vertices of the polygon
* Instances of Circle or Box

Class Polygon provides some useful methods:
* ```area``` - calculates area of a polygon
* ```addFace``` - add new face to polygon
* ```deleteFace``` - delete face from the polygon
* ```removeChain``` - remove connected chain of edges from a face
* ```addVertex``` - split an edge and add new point as new vertex 
* ```cut``` - cut polygon with multiline
* ```findEdgeByPoint```-  find edge in polygon
* ```contains``` - test if polygon contains shape (point, segment or arc)
* ```transform``` - applies affine transformation
* ```reverse``` - reverse orientation of faces
* ```splitToIslands``` - return each island with its holes

### Multiline

Multiline represent unclosed chain of edges of type Segment or Arc.

### Planar Set

Planar Set is a container of shapes that enable spatial search by rectangular query.


### Affine transformations

Affine transformation matrix is a 3x3 matrix of the form:
```
       [ a  c  tx
  A =    b  d  ty
         0  0  1  ] 
```


where a,b,c,d represent rotation and scaling, and tx,ty - translation.
Then, transformation of the point ```p(x,y)``` is a new point ```p'(x,y)```: ```p' = A * p```

All basic shapes have method ```transform``` which accept transformation matrix as a parameter
and return transformed shape. 

Class matrix provides methods for basic affine transformations - 
```translate```, ```rotate``` and ```scale,``` which may be chained
together to compose the resulted transformation matrix.

For example, rotation of the segment around its center to 45 deg looks like this:
```javascript
let seg = segment(point(20,30), point(60,70));
let center = seg.pc;
let m = new Flatten.Matrix();
let angle =  45.0
m = m.translate(center.x, center.y).rotate(angle).translate(-center.x, -center.y);
let tSeg  seg.transform(m);
```




### Distance between shapes

### Intersection model (DE-9IM)

### Relationship predicates

### Boolean operations

### Serialization

### Visualization

## Tutorials

| | |
| ------------- |-------------:|
| [![Getting Started](https://user-images.githubusercontent.com/6965440/41164953-0e3700b6-6b45-11e8-982f-de3c5bc2012d.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-getting-started)| [![Messing Around](https://user-images.githubusercontent.com/6965440/41164955-0e6019ec-6b45-11e8-9501-1565ccd75e0d.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-messing-around) |
| [![Planar Set](https://user-images.githubusercontent.com/6965440/41164948-0dde3b66-6b45-11e8-8a1a-b70f4ad228c1.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-planar-set) | [![polygons](https://user-images.githubusercontent.com/6965440/41164949-0e0ccd1e-6b45-11e8-9400-009c8ba6e7e3.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-polygons) |



