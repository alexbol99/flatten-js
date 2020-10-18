/**
 * Created by Alex Bol on 2/18/2017.
 */

import * as Flatten from './src/flatten';
export * from './src/flatten'

import {
  getTolerance, setTolerance
} from './src/utils/utils'

 Object.defineProperty(Flatten, 'DP_TOL', {
 get: getTolerance,
 set: setTolerance
});

export default Flatten;
