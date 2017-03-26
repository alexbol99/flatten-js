[![npm version](https://badge.fury.io/js/flatten-js.svg)](https://badge.fury.io/js/flatten-js)
[![Build Status](https://travis-ci.org/alexbol99/flatten-js.svg?branch=master)](https://travis-ci.org/alexbol99/flatten-js)

# Javascript library for 2d geometry

Flatten-js is a javascript library for manipulating abstract geometrical objects like point, vector, segment, line,
circle, circular arc. It implements polygon model where polygon may be comprised from a number of islands with holes.
The code have no dependencies and may be used on client side as well as on server side under NodeJS.
The code is written using ES6 javascript standard.

## Installation

    npm install --save flatten-js

## Usage

    // require package
    let Flatten = require('flatten-js');

    // 1st option - functional style, use it like pt = point(20,30)
    let {point, vector, circle, line, segment, arc, face} = Flatten;

    // 2nd option - es6 class style, use it like pt = new Point(20,30)
    let {Point, Vector, Circle, Line, Segment, Arc, Polygon} = Flatten;

    // now you may create simple construction and call methods
    let s1 = segment(10,10,200,200);
    let s2 = segment(10,160,200,30);
    let c = circle(point(200, 110), 50);
    let ip = s1.intersect(s2);

    // visualize using svg output
    let svg=[s1, s2, c, ip[0]].reduce((acc,shape) => acc + shape.svg(),"");
    document.getElementById("graphics").innerHTML = svg;
    
![example](https://cloud.githubusercontent.com/assets/6965440/24111445/1310ceb4-0d9f-11e7-9775-2868ec5c4f21.png)
  
View on requirebin http://requirebin.com/?gist=2bf8335f4655f103ba500b647e70f1fc

    // simple example of polygon

    // points will be used as vertices to create a face comprised from segments only
    let vertices1 = [point(50,50), point(50,250), point(250, 250), point(250,50)];
    let vertices2 = [point(100,100), point(200,100), point(200, 200), point(100,200)];

    // arcs will be used as edges to create a face that may be comprised from segments and arcs
    let arcs = [
        arc(point(100,100), 50, 0, Math.PI/2, true),
        arc(point(100,200), 50, -Math.PI/2, 0, true),
        arc(point(200,200), 50, Math.PI, 3*Math.PI/2, true),
        arc(point(200,100), 50, Math.PI/2, Math.PI, true),
    ];

    // create empty polygon
    let polygon = new Polygon();

    // then add faces
    polygon.addFace(vertices1);
    polygon.addFace(vertices2);
    polygon.addFace(arcs);

    // visualize using svg output
    document.getElementById("graphics").innerHTML = polygon.svg();

![example3](https://cloud.githubusercontent.com/assets/6965440/24312130/3c56c9da-10e8-11e7-9461-3406525e0473.png)

View on requirebin http://requirebin.com/?gist=8506659e6fa0876cda9cea15bfaf2dc9

## Tests

Run following command in your project directory in order to install development dependencies:
    
    npm install --only=dev
    
Then you can run tests:
    
    npm test

## Documentation

Documentation may be found here https://alexbol99.github.io/flatten-js/index.html

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
