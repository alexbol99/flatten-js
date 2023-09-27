/**
 * Created by Alex Bol on 2/18/2017.
 */

/**
 * Floating point comparison tolerance.
 * Default value is 0.000001 (10e-6)
 * @type {number}
 */
let DP_TOL = 0.000001;

/**
 * Set new floating point comparison tolerance
 * @param {number} tolerance
 */
export function setTolerance(tolerance) {DP_TOL = tolerance;}

/**
 * Get floating point comparison tolerance
 * @returns {number}
 */
export function getTolerance() {return DP_TOL;}

export const DECIMALS = 3;

/**
 * Returns *true* if value comparable to zero
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export function EQ_0(x) {
    return (x < DP_TOL && x > -DP_TOL);
}

/**
 * Returns *true* if two values are equal up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export function EQ(x, y) {
    return (x - y < DP_TOL && x - y > -DP_TOL);
}

/**
 * Returns *true* if first argument greater than second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export function GT(x, y) {
    return (x - y > DP_TOL);
}

/**
 * Returns *true* if first argument greater than or equal to second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function GE(x, y) {
    return (x - y > -DP_TOL);
}

/**
 * Returns *true* if first argument less than second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export function LT(x, y) {
    return (x - y < -DP_TOL)
}

/**
 * Returns *true* if first argument less than or equal to second argument up to DP_TOL
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
export function LE(x, y) {
    return (x - y < DP_TOL);
}
