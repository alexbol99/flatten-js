/**
 * Created by Alex Bol on 2/18/2017.
 */

/**
 * Global constant DP_TOL is used for comparison of floating point numbers.
 * It is set to 0.000001.
 * @type {number}
 */
const DP_TOL = 0.000001;
const DECIMALS = 3;

module.exports = {
    DP_TOL: DP_TOL,
    /**
     * Returns *true* if value comparable to zero
     * @return {boolean}
     */
    EQ_0: function(x) {
        return ( (x) < DP_TOL && (x) > -DP_TOL );
    },
    /**
     * Returns *true* if two values are equal up to DP_TOL
     * @return {boolean}
     */
    EQ: function(x,y) {
        return ( (x)-(y) <  DP_TOL && (x)-(y) > -DP_TOL );
    },
    /**
     * Returns *true* if first argument greater than second argument up to DP_TOL
     * @return {boolean}
     */
    GT: (x,y) => {
        return ( (x)-(y) >  DP_TOL );
    },
    /**
     * Returns *true* if first argument greater than or equal to second argument up to DP_TOL
     * @return {boolean}
     */
    GE: (x,y) => {
        return ( (x)-(y) > -DP_TOL );
    },
    /**
     * Returns *true* if first argument less than second argument up to DP_TOL
     * @return {boolean}
     */
    LT: (x,y) => {
        return ( (x)-(y) < -DP_TOL )
    },
    /**
     * Returns *true* if first argument less than or equal to second argument up to DP_TOL
     * @return {boolean}
     */
    LE: (x,y) => {
        return ( (x)-(y) <  DP_TOL );
    }
};
