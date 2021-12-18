[![npm version](https://badge.fury.io/js/%40flatten-js%2Fcore.svg)](https://badge.fury.io/js/%40flatten-js%2Fcore)
[![Build Status](https://travis-ci.org/alexbol99/flatten-js.svg?branch=master)](https://travis-ci.org/alexbol99/flatten-js)
[![Coverage Status](https://coveralls.io/repos/github/alexbol99/flatten-js/badge.svg?branch=master)](https://coveralls.io/github/alexbol99/flatten-js?branch=master)
[![](https://data.jsdelivr.com/v1/package/npm/@flatten-js/core/badge)](https://www.jsdelivr.com/package/npm/@flatten-js/core)
[![@flatten-js/core](https://snyk.io/advisor/npm-package/@flatten-js/core/badge.svg)](https://snyk.io/advisor/npm-package/@flatten-js/core)

[![Rate on Openbase](https://badges.openbase.com/js/rating/@flatten-js/core.svg)](https://openbase.com/js/@flatten-js/core?utm_source=embedded&utm_medium=badge&utm_campaign=rate-badge)

# Javascript library for 2d geometry

**flatten-js** is a javascript library for manipulating abstract geometrical shapes like point, vector, line, ray, segment,
circle, arc and polygon. Shapes may be organized into Planar Set - searchable container which support spatial queries.

**flatten-js** provides a lot of useful methods and algorithms like finding intersections, checking inclusion, calculating distance, applying
affine transformations, performing boolean operations and more.

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
* [Box (may be used as rectangle)](https://alexbol99.github.io/flatten-js/Box.html)

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
* Array of shapes (instances of Flatten.Segment or Flatten.Arc) that represent closed chains
* Array of shapes as json objects that represent closed chains 
* Array of points (Flatten.Point) that represent vertices of the polygon
* Array of numeric pairs [x,y] that represent vertices of the polygon
* Instances of Circle or Box

Polygon provides various useful methods:
* ```area``` - calculate area of a polygon
* ```addFace``` - add a new face to polygon
* ```deleteFace``` - removes face from polygon
* ```addVertex``` - split an edge of polygon adn create new vertex
* ```cut``` - cut polygon with multiline into sub-polygons
* ```findEdgeByPoint``` - find edge in polygon
* ```contains``` - test if polygon contains shape (point, segment or arc)
* ```transform``` - transform polygon using affine transformation matrix
* ```reverse``` - revert orientation of faces
* ````splitToIslands```` - split to array of islands with holes

### Multiline

Multiline represent an unclosed chain of edges of type Segment or Arc

### Planar Set

Planar Set is a container of shapes that enables spatial seach by rectangular query.

### Affine transformations

Affine transformation matrix is a 3x3 matrix of the form
```
      [ a  c  tx
 A =    b  d  ty
        0  0  1  ]
```
Where a, b, c, d, represent rotation and scaling, tx, ty represent translation.
Matrix constructor without parameters creates an identity matrix, and then
resulted matrix may be composed by chaining basic operations,
like ```translate```, ```rotate``` and ```scale```, like this:
```javascript
// Rotate segment by 45 deg around its center
let {point,segment,matrix} = Flatten;
let s = segment(point(20,30), point(60,70));
let center = s.box.center;
let angle = 45.*Math.PI/180.;
let m = matrix()
        .translate(center.x, center.y)
        .rotate(angle)
        .translate(-center.x, -center.y);
let t_s = s.transform(m);
```
### Intersection points

All classes have method ```intersect(otherShape)``` that return array of intersection points,
if two shapes intersect each other, or empty array otherwise. The is no predefined order
of intersection points in the array.

Please don't be confused, there are another two methods ```BooleanOperations.intersect()```
that performs boolean intersection of polygons and logical predicate ```Relations.intersect()```
that check if two shapes intersected or not. 

### Distance between shapes

All basic classes and polygon have method ```distanceTo(othershape)``` 
that calculate distance to other shape. Together with the distance function returns the shortest segment
between two shapes - segment between two closest point, where the first point lays
on ```this``` shape, and the second - on the other shape, see example:
```javascript
let s = segment(point(10,30), point(150, 40));
let c = circle(point(75,75),10);
let [dist,shortest_segment] = s.distanceTo(c);
```

### Intersection model (DE-9IM) 

The Dimensionally Extended nine-Intersection Model
 ([DE-9IM](https://en.wikipedia.org/wiki/DE-9IM)) is a topological model and a standard
 used to describe the spatial relations of two geometries in 2-dimensional plane.
 
 First, for every shape we define:
 * An interior
 * A boundary
 * An exterior
 
 For polygons, the interior, boundary and exterior are obvious, other types have some exclusions:
 * Point has no interior
 * Line has no boundary
 
 The DE-9IM model based on a 3×3 intersection matrix with the form:
 ```
          [ I(a) ^ I(b)   B(a) ^ I(b)   E(a) ^ I(b)
 de9im =    I(a) ^ B(b)   B(a) ^ B(b)   E(a) ^ B(b)
            I(a) ^ E(b)   B(a) ^ E(b)   E(a) ^ E(b)  ]
```

where ```a```and  ```b``` are two shapes (geometries), 

```I(), B(), E()``` denotes interior, boundary and exterior operator and

```^``` denotes operation of intersection. 
Dimension of intersection result depends on the dimension of shapes, for example,
* intersection between an interior of the line and an interior of the polygon is an
 array of segments
* intersection between an interior of the line and boundary polygon is 
an array of points (may include segments in case of touching)
* intersection between interiors of two polygons (if exists) will be
a polygon. 

DE-9IM matrix describes any possible relationships between two shapes on the plane.

DE-9IM matrix is available via method ```relate``` under namespace ```Relations```.

Each element of DE-9IM matrix is an array of the objects representing corresponding intersection.
Empty array represents case of no intersection.
If intersection is not applicable (i.e. intersection with a boundary for a line which has no boundary),
correspondent cell left undefined.

Intersection between two exteriors not calculated because usually it is meaningless.

```javascript
let {relate} = Flatten.Relations;
// 
// define two shapes: polygon1, polygon2
//
let de9im = relate(polygon1, polygon2);
//
// explore 8 of 9 fields of the de9im matrix:
// de9im.I2I  de9im.B2I  de9im.E2I
// de9im.I2B  de9im.B2B  de9im.E2B
// de9im.I2E  de9im.B2E     N/A
```

Another common way to represent DE-9IM matrix is a string where 
* ```T``` represent intersection where array is not impty
* ```F``` represent intersection where array is empty
* ```.``` means not relevant or not applicable

String may be obtained with ```de9im.toString()``` method.

### Relationship predicates

The spatial relationships between two shapes exposed via namespace `Relations`.
The spatial predicates return `true` if relationship match and `false` otherwise.
```javascript
let {intersect, disjoint, equal, touch, inside, contain, covered, cover} = Flatten.Relations;
// define shape a and shape b
let p = intersect(a, b);
console.log(p)             // true / false
```
* ```intersect``` - shapes a and b have at least one common point
* ```disjoint``` -  opposite to ```intersect```
* `equal` - shapes a and b are topologically equal
* `touch` - shapes a and b have at least one point in common but their interiors not intersect
* `inside` - shape a lies in the interior of shape b
* `contain` - shape b lies in the interior of shape b
* `covered` - every point of a lies or in the interior or on the boundary of shape b
* `covered` - every point of b lies or in the interior or on the boundary of shape a

### Boolean operations

Boolean operations on polygons available via namespace **BooleanOperations**.
Polygons in boolean operation should be valid: both operands should have same meaning of face orientation,
faces should not overlap each other and should not have self-intersections.

User is responsible to provide valid polygons, boolean operation methods do not check validity.

```javascript
let {unify, subtract, intersect, innerClip, outerClip} = BooleanOperations;
```
* `unify` - unify two polygons and return resulted polygon
* `subtract` - subtract second polygon from the first and return resulted polygon
* `intersect` - intersect two polygons and return resulted polygon
* `innerClip` - intersect two polygons and return boundary of intersection as 2 arrays.
 The first aray contains edges of the first polygon, the second - the edges of the second
* `outerClip` - clip boundary of the first polygon with the interior of the second polygon

Implementation based on Weiler-Atherton clipping algorithm,
described in the article [Hidden Surface Removal Using Polygon Area Sorting](https://www.cs.drexel.edu/~david/Classes/CS430/HWs/p214-weiler.pdf)

### Serialization

All **flatten-js** shape objects may be serialized using `JSON.stringify()` method.
`JSON.stringify` transforms object to string using `.toJSON()` formatter implemented in the class. 
`JSON.parse` restore object from a string, and then constructor can use this object to create Flatten object.
 
```javascript
let {lint, point} = Flatten;
let l = line(point(4, 0), point(0, 4));
// Serialize
let str = JSON.stringify(l);  
// Parse and reconstruct
let l_json = JSON.parse(str);
let l_parsed = line(l_json);
```

### Visualization

All classes provide `svg()` method, that create svg string that may be inserted into svg container element
in a very straightforward way:

```html
<body>
    <svg id="stage" width="500" height="500"></svg>
<script>
    const Flatten = window["@flatten-js/core"];
    const {point, circle, segment} = Flatten;

    // make some construction
    let s1 = segment(10,10,200,200);
    let s2 = segment(10,160,200,30);
    let c = circle(point(200, 110), 50);
    let ip = s1.intersect(s2);

    document.getElementById("stage").innerHTML = s1.svg() + s2.svg() + c.svg() + ip[0].svg();
</script>
</body>
```

Method `svg()` may accept as a parameter an object that enables to define
several basic attributes of svg element:
 `stroke`, `strokeWidth`, `fill`, `fillRule`, `fillOpacity`, `id` and `className`.
 If attributes not provided, method `svg()` use default values.
 

### Other packages

Other packages, published under scope **@flatten-js/**:

| Name        | Description  |
| ------------- |:-------------:|
| [@flatten-js/interval-tree](https://www.npmjs.com/package/@flatten-js/interval-tree) | Interval binary search tree 
| [@flatten-js/boolean-op](https://www.npmjs.com/package/@flatten-js/boolean-op)    | Boolean operations (deprecated, use this functionality from the core package)
| [@flatten-js/polygon-offset](https://www.npmjs.com/package/@flatten-js/polygon-offset)    | Polygon offset

## Support

<a href="https://www.buymeacoffee.com/alexbol99" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
