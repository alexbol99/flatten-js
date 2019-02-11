## Version Flatten v1.0 roadmap

This will be the first official version of this package

### Usability

* I suppose there will be no breaking changes in usability
* Usage of Flaten namespace will be obsolete (while still possible), all classes will be possible to consume directly from the package:
```
import {Point, Line, Circle, Segment, Arc, Polygon} from 'flatten-js'
```
* Packages will be scoped under **@flatten/** scope, although existing packages will not be depricated yet.
For example:
```
import {Point, Line, Circle, Segment, Arc, Polygon} from '@flatten/core'
import {unify, intersect, subtract} from '@flatten/boolean'
... and more
```
I will continue release **flatten-js** package with all the packages inside. This package may become a bit heavy, so user will have a choice to install lighter combination of packages instead.

* Packages will be pre-compiled using [**rollup**](https://rollupjs.org/guide/en), supporting **esm**, **umd** and **commonjs** formats

### Functionality
I plan to add more functionality to complete topological model in the sence of [**nine-intersection model**](https://en.wikipedia.org/wiki/DE-9IM) standart, and also to add some new functionality:
* New alorithm to clip lines, segments, arcs and other shapes with polygon
* New arrangement construction algorithm based on [doubly-connected edge list](https://en.wikipedia.org/wiki/Doubly_connected_edge_list) data structure
* New class Polyline of non-closed chains of segments and arcs
* New class PointsSet with [k-d tree](https://en.wikipedia.org/wiki/K-d_tree) search 
* Equidistant and "straight" offset of polygons and polylines

### Any type of collaboration is highly welcomed!!!
