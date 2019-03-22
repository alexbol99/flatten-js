[![npm version](https://badge.fury.io/js/%40flatten-js%2Fcore.svg)](https://badge.fury.io/js/%40flatten-js%2Fcore)
[![Build Status](https://travis-ci.org/alexbol99/flatten-js.svg?branch=master)](https://travis-ci.org/alexbol99/flatten-js)
[![Coverage Status](https://coveralls.io/repos/github/alexbol99/flatten-js/badge.svg?branch=master)](https://coveralls.io/github/alexbol99/flatten-js?branch=master)

# Javascript library for 2d geometry

**flatten-js** is a javascript library for manipulating abstract geometrical shapes like point, vector, line, segment,
circle, arc and polygon. Shapes may be organized into Planar Set - searchable container which support spatial queries.

**flatten-js** provides a lot of useful methods and algorithms like finding intersections, checking inclusion, calculating distance, applying
affine transformations, performing boolean operations and more.

Library consists of several packages, published under scope **@flatten-js/**:

| Name        | Description  |
| ------------- |:-------------:|
| [@flatten-js/core](https://www.npmjs.com/package/@flatten-js/core)                   | Basic classes and operations
| [@flatten-js/interval-tree](https://www.npmjs.com/package/@flatten-js/interval-tree) | Interval binary search tree 
| [@flatten-js/boolean-op](https://www.npmjs.com/package/@flatten-js/boolean-op)    | Boolean operations


NOTE: Package [flatten-js](https://www.npmjs.com/package/flatten-js) is not supported and will be deprecated soon.

Library provides different entry points suitable for various targets.
TypeScript users may take advantage of static type checking with typescript definition file index.d.ts included into the package.

**flatten-js** does not concern too much about visualization.
Anyway, all classes have svg() methods, that returns a string which may be inserted into SVG container. 
This works pretty well together with  [d3js](https://d3js.org/) library. But it is definitely possible to create bridges to other graphic libraries.

The best way to start working with FlattenJS is to use awesome [Observable](https://beta.observablehq.com/) javascript interactive notebooks.
There are several tutorials published in Observable Notebooks, see below.

Full documentation may be found here: [https://alexbol99.github.io/flatten-js/index.html](https://alexbol99.github.io/flatten-js/index.html)

## Contacts

Follow me on Twitter [@alex_bol_](https://twitter.com/alex_bol_)

## Installation

    npm install --save @flatten-js/core

## Usage

```javascript
import {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Matrix, PlanarSet} from '@flatten-js/core';
```

It is possible to import Flatten namespace as default import, and then destruct all classes from it. 
```javascript
import Flatten from '@flatten-js/core'
const {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Matrix, PlanarSet} = Flatten;
```

Some classes have shortcuts to avoid annoying *new* constructor:
```javascript
import {point, vector, circle, line, segment, arc, ray, matrix} from '@flatten-js/core';
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

## Tutorials

1. [![Getting Started](https://user-images.githubusercontent.com/6965440/41164953-0e3700b6-6b45-11e8-982f-de3c5bc2012d.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-getting-started)
2. [![Messing Around](https://user-images.githubusercontent.com/6965440/41164955-0e6019ec-6b45-11e8-9501-1565ccd75e0d.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-messing-around)
3. [![Planar Set](https://user-images.githubusercontent.com/6965440/41164948-0dde3b66-6b45-11e8-8a1a-b70f4ad228c1.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-planar-set)
4. [![polygons](https://user-images.githubusercontent.com/6965440/41164949-0e0ccd1e-6b45-11e8-9400-009c8ba6e7e3.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-polygons)


