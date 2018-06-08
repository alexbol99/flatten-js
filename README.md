[![npm version](https://badge.fury.io/js/flatten-js.svg)](https://badge.fury.io/js/flatten-js)
[![Build Status](https://travis-ci.org/alexbol99/flatten-js.svg?branch=master)](https://travis-ci.org/alexbol99/flatten-js)
[![Coverage Status](https://coveralls.io/repos/github/alexbol99/flatten-js/badge.svg?branch=master)](https://coveralls.io/github/alexbol99/flatten-js?branch=master)

# Javascript library for 2d geometry

FlattenJS is a small javascript library (about 45 Kb minified) for manipulating abstract geometrical objects like point, vector, line, segment,
circle, arc and polygon. Shapes may be organized into Planar Set - searchable container which support spatial queries.

FlattenJS provides a lot of useful methods and algorithms like finding intersections, checking inclusion, calculating distance, and more.
Polygon model is rather comprehensive and supports multi polygons with many islands and holes. Edges of polygon may be circular arcs.
Some algorithms like [Boolean Operations](https://github.com/alexbol99/flatten-boolean-op) and [Offset](https://github.com/alexbol99/flatten-offset),
implemented in separate packages.     
 
This library works in any modern browser as well as under nodejs.
But may be the best way to start working with FlattebJS is to use awesome [Observable](https://beta.observablehq.com/) javascript interactive notebooks. <br/>
There are several FlattenJS tutorials published in Observable Notebooks, see below.  

FlattenJS does not concern too much about visualization.
Anyway, all objects have svg() method, that returns a string which may be inserted into SVG container. 
This works pretty well together with  [d3js](https://d3js.org/) library. But it is definitely possible to create bridges to other graphic libraries.

Full documentation may be found [here](https://alexbol99.github.io/flatten-js/index.html)

## Installation

    npm install --save flatten-js

## Usage

Require full package:
```javascript
    let Flatten = require('flatten-js');
```

Or require minified package
```javascript
    let Flatten = require('flatten-js.umd.min.js');
```

Also in es6 style:
```javascript
    import Flatten from 'flatten-js';
```

Then create some construction:
```javascript
    // extract object creators
    let {point, circle, segment} = Flatten;

    // make some construction
    let s1 = segment(10,10,200,200);
    let s2 = segment(10,160,200,30);
    let c = circle(point(200, 110), 50);
    let ip = s1.intersect(s2);
```

You may test the code above also in [NPM RunKit](https://npm.runkit.com/flatten-js)

## Tutorials

1. [![Getting Started](https://user-images.githubusercontent.com/6965440/41164953-0e3700b6-6b45-11e8-982f-de3c5bc2012d.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-getting-started)
2. [![Messing Around](https://user-images.githubusercontent.com/6965440/41164955-0e6019ec-6b45-11e8-9501-1565ccd75e0d.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-messing-around)
3. [![Planar Set](https://user-images.githubusercontent.com/6965440/41164948-0dde3b66-6b45-11e8-8a1a-b70f4ad228c1.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-planar-set)
4. [![polygons](https://user-images.githubusercontent.com/6965440/41164949-0e0ccd1e-6b45-11e8-9400-009c8ba6e7e3.PNG)](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-polygons)

## Contacts

Follow me on [Twitter](https://twitter.com/alex_bol_)


