/**
 * Created by Alex Bol on 2/20/2017.
 */
"use strict";

module.exports = function(Flatten) {
    /**
     * Class representing a line
     * @type {Line}
     */
    Flatten.Line = class Line {
        /**
         * Line may be constructed by point and normal vector or by two points that a line passes through
         * @param {Point} pt - point that a line passes through
         * @param {Vector} norm - normal vector to a line
         */
        constructor(...args) {
            this.pt = new Flatten.Point();
            this.norm = new Flatten.Vector(0,1);

            if (args.length == 0) {
                return;
            }

            if (args.length == 2) {
                let a1 = args[0];
                let a2 = args[1];

                if (a1 instanceof Flatten.Point && a2 instanceof Flatten.Point) {
                    this.pt = a1;
                    this.norm = Line.points2norm(a1, a2);
                    return;
                }

                if (a1 instanceof Flatten.Point && a2 instanceof Flatten.Vector) {
                    if (Flatten.Utils.EQ_0(a2.x) && Flatten.Utils.EQ_0(a2.y)) {
                        throw Flatten.Errors.ILLEGAL_PARAMETERS;
                    }
                    this.pt = a1.clone();
                    this.norm = a2.clone();
                    return;
                }

                if (a1 instanceof Flatten.Vector && a2 instanceof Flatten.Point) {
                    if (Flatten.Utils.EQ_0(a1.x) && Flatten.Utils.EQ_0(a1.y)) {
                        throw Flatten.Errors.ILLEGAL_PARAMETERS;
                    }
                    this.pt = a2.clone();
                    this.norm = a1.clone();
                    return;
                }
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Method clone returns new instance of Line
         * @returns {Line}
         */
        clone() {
            return new Flatten.Line(this.pt, this.norm);
        }

        /**
         * Returns slope of the line - angle in radians between line and axe y
         * @returns {number}
         */
        slope() {
            let vec = new Flatten.Vector(this.norm.y, -this.norm.x);
            return vec.slope();
        }

        /**
         * Returns true if point belongs to line
         * @param {Point} pt
         * @returns {boolean}
         */
        contains(pt) {
            if (this.pt.equalTo(pt)) {
                return true;
            }
            /* Line contains point if vector to point is orthogonal to the line normal vector */
            let vec = new Flatten.Vector(this.pt, pt);
            return Flatten.Utils.EQ_0(this.norm.dot(vec));
        }

        static points2norm(pt1, pt2) {
            if (pt1.equalTo(pt2)) {
                throw Flatten.Errors.ILLEGAL_PARAMETERS;
            }
            let vec = new Flatten.Vector(pt1, pt2);
            return vec.rotate(Math.PI/2);
        }
    }
};
