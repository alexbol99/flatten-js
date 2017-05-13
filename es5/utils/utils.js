"use strict";

/**
 * Created by Alex Bol on 2/18/2017.
 */

var DP_TOL = 0.000001;
var DECIMALS = 3;

module.exports = {
  DP_TOL: DP_TOL,
  /**
   * @return {boolean}
   */
  EQ_0: function EQ_0(x) {
    return x < DP_TOL && x > -DP_TOL;
  },
  /**
   * @return {boolean}
   */
  EQ: function EQ(x, y) {
    return x - y < DP_TOL && x - y > -DP_TOL;
  },
  /**
   * @return {boolean}
   */
  GT: function GT(x, y) {
    return x - y > DP_TOL;
  },
  /**
   * @return {boolean}
   */
  GE: function GE(x, y) {
    return x - y > -DP_TOL;
  },
  /**
   * @return {boolean}
   */
  LT: function LT(x, y) {
    return x - y < -DP_TOL;
  },
  /**
   * @return {boolean}
   */
  LE: function LE(x, y) {
    return x - y < DP_TOL;
  }
};