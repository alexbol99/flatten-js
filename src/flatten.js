export * as Utils from "./utils/utils";
export{default as Errors} from "./utils/errors";

export {Distance} from './algorithms/distance';
export {inverse} from './algorithms/inversion';
export * as Relations from './algorithms/relation';
export {ray_shoot} from './algorithms/ray_shooting';
export * as BooleanOperations from './algorithms/boolean_op'

export {PlanarSet} from './data_structures/planar_set';

export {Matrix, matrix} from './classes/matrix';
export {Point, point} from './classes/point';
export {Vector, vector} from './classes/vector';
export {Segment, segment} from './classes/segment';
export {Line, line} from './classes/line';
export {Circle, circle} from './classes/circle';
export {Arc, arc} from './classes/arc';
export {Box, box} from './classes/box';
export {Edge} from './classes/edge';
export {Face} from './classes/face';
export {Ray, ray} from './classes/ray';
export {Multiline, multiline} from './classes/multiline';
export {Polygon, polygon} from './classes/polygon';

export {
  BOUNDARY,
  CCW,
  CONTAINS,
  CW,
  INSIDE,
  INTERLACE,
  ORIENTATION,
  OUTSIDE,
  OVERLAP_OPPOSITE,
  OVERLAP_SAME,
  PIx2
} from './utils/constants';

