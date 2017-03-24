# Javascript library for 2d geometry

## Installation

    npm install --save flatten-js

## Usage

    let Flatten = require('flatten-js');

    let {point, vector, circle, line, segment, arc} = Flatten;

    let s1 = segment(10,10,200,200);
    let s2 = segment(10,160,200,30);
    let c = circle(point(200, 110), 50);
    let ip = s1.intersect(s2);

## Visualization using svg

Example above may be visualized using svg output:

    let svg=[s1, s2, c, ip[0]].reduce((acc,shape) => acc + shape.svg(),"");
    document.getElementById("graphics").innerHTML = svg;
    
![example](https://cloud.githubusercontent.com/assets/6965440/24111445/1310ceb4-0d9f-11e7-9775-2868ec5c4f21.png)
  
[![view on requirebin](http://requirebin.com/badge.png)](http://requirebin.com/?gist=2bf8335f4655f103ba500b647e70f1fc)

## Tests

Run following command in your project directory in order to install development dependencies:
    
    npm install --only=dev
    
Then you can run tests:
    
    npm test

## Documentation

Documentation may be found here https://alexbol99.github.io/flatten-js/index.html

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
