/**
 * Created by Alex Bol on 2/18/2017.
 */

import {DP_TOL} from "./constants";

export const DECIMALS = 3;

/**
 * Returns *true* if value comparable to zero
 * @return {boolean}
 */
export function EQ_0(x) {
    return ((x) < DP_TOL && (x) > -DP_TOL);
}

/**
 * Returns *true* if two values are equal up to DP_TOL
 * @return {boolean}
 */
export function EQ(x, y) {
    return ((x) - (y) < DP_TOL && (x) - (y) > -DP_TOL);
}

/**
 * Returns *true* if first argument greater than second argument up to DP_TOL
 * @return {boolean}
 */
export function GT(x, y) {
    return ((x) - (y) > DP_TOL);
}

/**
 * Returns *true* if first argument greater than or equal to second argument up to DP_TOL
 * @return {boolean}
 */
export function GE(x, y) {
    return ((x) - (y) > -DP_TOL);
}

/**
 * Returns *true* if first argument less than second argument up to DP_TOL
 * @return {boolean}
 */
export function LT(x, y) {
    return ((x) - (y) < -DP_TOL)
}

/**
 * Returns *true* if first argument less than or equal to second argument up to DP_TOL
 * @return {boolean}
 */
export function LE(x, y) {
    return ((x) - (y) < DP_TOL);
}
