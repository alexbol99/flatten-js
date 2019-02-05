/**
 * Created by Alex Bol on 2/18/2017.
 */

/**
 * Global constant DP_TOL is used for comparison of floating point numbers.
 * It is set to 0.000001.
 * @type {number}
 */
export const DP_TOL = 0.000001;

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
