[![npm version](https://badge.fury.io/js/flatten-js.svg)](https://badge.fury.io/js/flatten-js)
[![Build Status](https://travis-ci.org/alexbol99/flatten-js.svg?branch=master)](https://travis-ci.org/alexbol99/flatten-js)
[![Coverage Status](https://coveralls.io/repos/github/alexbol99/flatten-js/badge.svg?branch=master)](https://coveralls.io/github/alexbol99/flatten-js?branch=master)

# Javascript library for 2d geometry

FlattenJS is a javascript library (less than 50 Kb minified) for manipulating abstract geometrical shapes like point, vector, line, segment,
circle, arc and polygon. Shapes may be organized into Planar Set - searchable container which support spatial queries.

FlattenJS provides a lot of useful methods and algorithms like finding intersections, checking inclusion, calculating distance, and more.
Polygon model is rather comprehensive and supports multi polygons with many islands and holes. Edges of polygon may be circular arcs or segments.
Some algorithms like [Boolean Operations](https://github.com/alexbol99/flatten-boolean-op) and [Offset](https://github.com/alexbol99/flatten-offset),
implemented in separate packages.     
 
This library designed to work in any modern browser as well as under nodejs.
It is written in plain javascript with es6 syntax elements.
You can use es5 precompiled bundled package (added in v0.6.2) if you need to support old browsers.

TypeScript users may take advantage of static type checking with typescript definition file index.d.ts included into the package.

FlattenJS does not concern too much about visualization.
Anyway, all objects have svg() methods, that returns a string which may be inserted into SVG container. 
This works pretty well together with  [d3js](https://d3js.org/) library. But it is definitely possible to create bridges to other graphic libraries.

The best way to start working with FlattenJS is to use awesome [Observable](https://beta.observablehq.com/) javascript interactive notebooks.
There are several FlattenJS tutorials published in Observable Notebooks, see below.

Full documentation may be found [here](https://alexbol99.github.io/flatten-js/index.html)

## Installation

    npm install --save flatten-js

## Usage

Package may be required in different ways:

##### Require as es6 module:
```javascript
    import Flatten from 'flatten-js';
```

##### Require as CommonJS package (nodejs) 
```javascript
    const Flatten = require('flatten-js');
```

##### Require minified package precompiled into UMD format.
 [Observable](https://beta.observablehq.com/) notebooks requires this format.

```javascript
    const Flatten = require('flatten-js.umd.min.js');
```

##### Require precompiled to es5 package in Commonjs2 format.

```javascript
    import Flatten from "flatten-js/dist/flatten.commonjs2"
```
This package is not minified.

This is the way you have to consume the package for [React](https://reactjs.org/) library, at least when you use
[create-react-library](https://github.com/facebook/create-react-app) starter kit:
```
""
    Some third-party packages don't compile their code to ES5 before publishing to npm.
    This often causes problems in the ecosystem because neither browsers (except for most modern versions)
    nor some tools currently support all ES6 features.
    We recommend to publish code on npm as ES5 at least for a few more years.
""    
```
You can see example of **FlattenJS + React** usage in [flatten-react-demo](https://github.com/alexbol99/flatten-react-demo) project.
It is live [here](https://alexbol99.github.io/flatten-react-demo/). 
Just clone it from the GitHub, install dependencies and start working using *npm start* or
compile it to production using *npm run build*.

## Example

After module required, you can create some construction:
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


