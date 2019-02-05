/**
 * Created by Alex Bol on 2/19/2017.
 */

export default class Errors {
    static get ILLEGAL_PARAMETERS() {
        return new ReferenceError('Illegal Parameters');
    }
    static get ZERO_DIVISION() {
        return new Error('Zero division');
    }
}
// export const ILLEGAL_PARAMETERS = new ReferenceError('Illegal Parameters');
// export const ZERO_DIVISION = new Error('Zero division');
