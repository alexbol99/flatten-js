/**
 * Created by Alex Bol on 2/18/2017.
 */

const DP_TOL = 0.000001;

module.exports = {
    DP_TOL: DP_TOL,
    /**
     * @return {boolean}
     */
    EQ_0: function(x) {
        return ( (x) < DP_TOL && (x) > -DP_TOL );
    },
    /**
     * @return {boolean}
     */
    EQ: function(x,y) {
        return ( (x)-(y) <  DP_TOL && (x)-(y) > -DP_TOL );
    },
    /**
     * @return {boolean}
     */
    GT: (x,y) => {
        return ( (x)-(y) >  DP_TOL );
    },
    /**
     * @return {boolean}
     */
    GE: (x,y) => {
        return ( (x)-(y) > -DP_TOL );
    },
    /**
     * @return {boolean}
     */
    LT: (x,y) => {
        return ( (x)-(y) < -DP_TOL )
    },
    /**
     * @return {boolean}
     */
    LE: (x,y) => {
        return ( (x)-(y) <  DP_TOL );
    }
};
