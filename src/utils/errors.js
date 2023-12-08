/**
 * Created by Alex Bol on 2/19/2017.
 */

import Flatten from "../flatten";

/**
 * Class of system errors
 */
export class Errors {
    constructor() {
        this.dummy = 0
    }

    /**
     * Throw error ILLEGAL_PARAMETERS when cannot instantiate from given parameter
     * @returns {ReferenceError}
     */
    static get ILLEGAL_PARAMETERS() {
        return new ReferenceError('Illegal Parameters');
    }

    /**
     * Throw error ZERO_DIVISION to catch situation of zero division
     * @returns {Error}
     */
    static get ZERO_DIVISION() {
        return new Error('Zero division');
    }

    /**
     * Error to throw from BooleanOperations module in case when fixBoundaryConflicts not capable to fix it
     * @returns {Error}
     */
    static get UNRESOLVED_BOUNDARY_CONFLICT() {
        return new Error('Unresolved boundary conflict in boolean operation');
    }

    /**
     * Error to throw from LinkedList:testInfiniteLoop static method
     * in case when circular loop detected in linked list
     * @returns {Error}
     */
    static get INFINITE_LOOP() {
        return new Error('Infinite loop');
    }

    static get CANNOT_COMPLETE_BOOLEAN_OPERATION() {
        return new Error('Cannot complete boolean operation')
    }

    static get CANNOT_INVOKE_ABSTRACT_METHOD() {
        return new Error('Abstract method cannot be invoked');
    }

    static get OPERATION_IS_NOT_SUPPORTED() {
        return new Error('Operation is not supported')
    }
}

Flatten.Errors = Errors;
