[![npm version](https://badge.fury.io/js/flatten-js.svg)](https://badge.fury.io/js/flatten-js)
[![Build Status](https://travis-ci.org/alexbol99/flatten-js.svg?branch=master)](https://travis-ci.org/alexbol99/flatten-js)
[![Coverage Status](https://coveralls.io/repos/github/alexbol99/flatten-js/badge.svg?branch=master)](https://coveralls.io/github/alexbol99/flatten-js?branch=master)

# Javascript library for 2d geometry

Flatten-js is a small javascript library (about 45 Kb minified) for manipulating abstract geometrical objects like point, vector, line, segment,
circle, arc and polygon. The library works in any modern browsers as well as under nodejs.

## Installation

    npm install --save flatten-js

## Usage

```javascript
    // require package
    let Flatten = require('flatten-js');

    // extract object creators
    let {point, circle, segment} = Flatten;

    // make some construction
    let s1 = segment(10,10,200,200);
    let s2 = segment(10,160,200,30);
    let c = circle(point(200, 110), 50);
    let ip = s1.intersect(s2);

    // visualize using svg output
    let svg=[s1, s2, c, ip[0]].reduce((acc,shape) => acc + shape.svg(),"");
    document.getElementById("graphics").innerHTML = svg;
```

![example](https://cloud.githubusercontent.com/assets/6965440/24111445/1310ceb4-0d9f-11e7-9775-2868ec5c4f21.png)
  
Play with this code on requirebin http://requirebin.com/?gist=2bf8335f4655f103ba500b647e70f1fc

## First project

Check out this [flatten-js-test](https://github.com/alexbol99/flatten-js-test) from git to create your first project using **flatten-js** library.
Flatten-js-test has zero configuration, it works "as is" without transpiling in any modern browser.

## Documentation

Documentation may be found here https://alexbol99.github.io/flatten-js/index.html

## Library

### Shapes
Flatten-js library provides support for the following shapes in 2d:
* Point
* Vector
* Line
* Circle
* Segment
* Arc
* Polygon

Beyond of some trivial methods shape classes implement several common methods and queries:
* Points location test
* Intersection between shapes
* Distance to other shape

They also expose *box* property - axis aligned bounding box (AABB)
needed for search tree index construction


Shapes may be created using constructor:
```javascript
let c = new Circle( new Point(30,40), 100 );
```
or in functional form:
```javascript
let c = circle( point(30,40), 100 );
```
### Planar Set
Planar Set is a container of shapes.
It is implemented as an extension of the javascript Set object with the search tree index.<br/>
Any object added to Planar Set container have to expose *box* property,
where *box* should be an instance of the **Flatten.Box** class or implement special interface.<br/>
Planar Set provides range search query to locate shapes which
bounding boxes are intersected with the query box. 

Example:

```javascript
let planarSet = new PlanarSet();
let segment = new Segment(1,1,2,2);
let circle = new Circle(new Point(3,3), 1);
planarSet.add(segment);
planarSet.add(circle);
let resp = planarSet.search(new Box(2,2,3,3));
console.log(resp.length);   // expected to be 2
```

### Polygon
Polygon is a collection of closed loops, called **faces**.<br/>
Each face is a continuous closed chain of **edges**.<br/>
Edge may be either **segment** or **arc**.<br/>
Faces may contain each other as well as be disjoint. If internal face has a direction opposite
to the direction of containing face, it will be treated as a *hole*.<br/>

By definition, *faces* and *edges* are instances of PlanarSet, which means they are searchable containers
 that enable range search queries.

#### Polygon construction
Polygon is constructing by adding faces. To create a new face, one needs to transfer an array
representing closed chain of edges. If chain has no arcs, it may be also an array of points
representing vertices of the face.
```javascript
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
```
#### Traversing faces and edges
As being elements of Set containers, polygon's faces and edges may be traversed as regular set elements.
Face implements *next* iterator, so if one needs to traverse edges of the specific face,
it may be done in the following way:
```javascript
for (let face of polygon.faces) {
    for (let edge of face) {              // sic!
        console.log(edge.shape.length);   // do something
    }
}
``` 
From the other hand, edges in the face form a circular bidirectional linked list,
so if more controlled iteration needed, one can use the following form:
```javascript
for (let face of polygon.faces) {
    let edge = face.first;
    do {
        console.log(edge.shape.length);   // do something
        edge = edge.next;
    } while (edge != face.first)
}
```
#### Specific polygon methods
There are several other methods specific for polygon and its faces
* `face.area()` - Returns area of the face
* `face.isSimple()` - Returns *true* if polygon has no self-intersections
* `face.getOrientation()` - Returns direction of the face - clockwise or counterclockwise
* `polygon.area()` - Returns area of the polygon. If polygon has holes,
their area is taken as negative. 

## Visualization
This library does not concern about visualization.
Anyway, all classes, including PlanarSet, have `svg()` method, that returns a string which may be inserted into
defined SVG element, like this:
```javascript
// visualize using svg output
document.getElementById("graphics").innerHTML = polygon.svg();
```
## Tests

The project has comprehensive set of unit tests. If someone wants to play with then,
he (or she) may check out this project, install dependencies,
 including dev dependencies (chai/mocha) and then run 
```
npm test
```    


## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
