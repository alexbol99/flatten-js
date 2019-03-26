/**
 * Created by Alex Bol on 2/19/2017.
 */

/**
 * Class of system errors
 */
class Errors {
    /**
     * Throw error ILLEGAL_PARAMETERS when cannot instantiate from given parameter
     * @returns {ReferenceError}
     * @constructor
     */
    static get ILLEGAL_PARAMETERS() {
        return new ReferenceError('Illegal Parameters');
    }

    /**
     * Throw error ZERO_DIVISION to catch situation of zero division
     * @returns {Error}
     * @constructor
     */
    static get ZERO_DIVISION() {
        return new Error('Zero division');
    }
}

export default Errors;
