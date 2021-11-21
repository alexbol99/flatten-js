/**
 * Created by Alex Bol on 2/18/2017.
 */

import Flatten from './src/flatten';
import * as Utils from "./src/utils/utils";
import * as Errors from "./src/utils/errors";
import * as BooleanOperations from './src/algorithms/boolean_op';
import * as Relations from './src/algorithms/relation';

export {Utils, Errors};
export {Matrix, matrix} from './src/classes/matrix';
export {PlanarSet} from './src/data_structures/planar_set';
export {Point, point} from './src/classes/point';
export {Vector, vector} from './src/classes/vector';
export {Segment, segment} from './src/classes/segment';
export {Line, line} from './src/classes/line';
export {Circle, circle} from './src/classes/circle';
export {Arc, arc} from './src/classes/arc';
export {Box, box} from './src/classes/box';
export {Edge} from './src/classes/edge';
export {Face} from './src/classes/face';
export {Ray, ray} from './src/classes/ray';
export {ray_shoot} from './src/algorithms/ray_shooting';
export {Multiline, multiline} from './src/classes/multiline';
export {Polygon, polygon} from './src/classes/polygon';
export {Inversion, inversion} from './src/classes/inversion';
export {Distance} from './src/algorithms/distance';
export {BooleanOperations};
export {Relations};

Flatten.BooleanOperations = BooleanOperations;
Flatten.Relations = Relations;

export {CCW, CW, ORIENTATION, INSIDE, OUTSIDE, BOUNDARY} from './src/utils/constants';

export default Flatten;
