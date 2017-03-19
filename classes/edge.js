/**
 * Created by Alex Bol on 3/17/2017.
 */

module.exports = function(Flatten) {
    Flatten.Edge = class Edge {
        constructor(shape) {
            this.shape = shape;
            this.next;
            this.prev;
        }

        get start() {
            return this.shape.start;
        }

        get end() {
            return this.shape.end;
        }

        get length() {
            return this.shape.length;
        }

    };
};