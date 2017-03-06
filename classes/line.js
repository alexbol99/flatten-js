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
            /**
             * Point a line passes through
             * @type {Point}
             */
            this.pt = new Flatten.Point();
            /**
             * Normal unit vector to a line
             * @type {Vector}
             */
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

        /**
         * Returns array of intersection points if intersection exists or zero-length array otherwise
         * @param {Shape} shape - shape to intersect with
         * @returns {Point[]}
         */
        intersect(shape) {
            if (shape instanceof Flatten.Line) {
                return Line.intersectLine2Line(this, shape);
            }
        }

        static points2norm(pt1, pt2) {
            if (pt1.equalTo(pt2)) {
                throw Flatten.Errors.ILLEGAL_PARAMETERS;
            }
            let vec = new Flatten.Vector(pt1, pt2);
            return vec.rotate(Math.PI/2);
        }

        static intersectLine2Line(line1, line2) {
            let ip = [];

            let A1 = line1.norm.x;
            let B1 = line1.norm.y;
            let C1 = line1.norm.dot(line1.pt);

            let A2 = line2.norm.x;
            let B2 = line2.norm.y;
            let C2 = line2.norm.dot(line2.pt);

            /* Cramer's rule */
            let det = A1*B2 - B1*A2;
            let detX = C1*B2 - B1*C2;
            let detY = A1*C2 - C1*A2;

            if (!Flatten.Utils.EQ_0(det)) {
                let new_ip = new Flatten.Point( detX/det, detY/det );
                ip.push(new_ip);
            }
            return ip;
        }
    }
};
