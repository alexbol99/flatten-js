import * as Constants from './utils/constants';
import * as Utils from './utils/utils';
import * as Errors from './utils/errors';

let Flatten = {
    Utils: Utils,
    Errors: Errors,
    Matrix: undefined,
    Planar_set: undefined,
    Point: undefined,
    Vector: undefined,
    Line: undefined,
    Circle: undefined,
    Segment: undefined,
    Arc: undefined,
    Box: undefined,
    Edge: undefined,
    Face: undefined,
    Ray: undefined,
    Ray_shooting: undefined,
    Polygon: undefined,
    Distance: undefined,
};

for (let c in Constants) {Flatten[c] = Constants[c]}

export default Flatten;
