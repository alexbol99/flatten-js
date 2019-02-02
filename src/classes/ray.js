"use strict";

module.exports = function(Flatten) {
    let {Point, Segment, Line, Circle, Arc, Box, Vector} = Flatten;
    /**
     * Class representing a horizontal ray, used by ray shooting algorithm
     * @type {Ray}
     */
    Flatten.Ray = class Ray {
        /**
         * Construct ray by setting start point
         * @param {Point} pt - start point
         */
        constructor(...args) {
            this.pt = new Point();

            if (args.length == 0) {
                return;
            }

            if (args.length == 1 && args[0] instanceof Point) {
                this.pt = args[0].clone();
                return;
            }

            if (args.length == 2 && typeof(args[0]) == "number" && typeof(args[1]) == "number") {
                this.pt = new Point(args[0], args[1]);
                return;
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Returns copied instance of the ray object
         * @returns {Ray}
         */
        clone() {
            return new Ray(this.pt);
        }

        /**
         * Returns half-infinite bounding box of the ray
         * @returns {Box} - bounding box
         */
        get box() {
            return new Box(
                this.pt.x,
                this.pt.y,
                Number.POSITIVE_INFINITY,
                this.pt.y
            )
        }

        /**
         * Return ray start point
         * @returns {Point} - ray start point
         */
        get start() {
            return this.pt;
        }

        /**
         * Return ray normal vector (0,1) - horizontal ray
         * @returns {Vector} - ray normal vector
         */
        get norm() {
            return new Vector(0,1);
        }

        /**
         * Returns array of intersection points between ray and segment or arc
         * @param {Segment|Arc} - Shape to intersect with ray
         * @returns {Array} array of intersection points
         */
        intersect(shape) {
            if (shape instanceof Segment) {
                return this.intersectRay2Segment(this, shape);
            }

            if (shape instanceof Arc) {
                return this.intersectRay2Arc(this, shape);
            }
        }

        intersectRay2Segment(ray, segment) {
            let ip = [];

            if (ray.box.not_intersect(segment.box)) {
                return ip;
            }

            let line = new Line(ray.start, ray.norm);
            let ip_tmp = line.intersect(segment);

            for (let pt of ip_tmp) {
                if (Flatten.Utils.GE(pt.x, ray.start.x)) {
                    ip.push(pt);
                }
            }

            /* If there were two intersection points between line and ray,
            and now there is exactly one left, it means ray starts between these points
            and there is another intersection point - start of the ray */
            if (ip_tmp.length == 2 && ip.length == 1 && ray.start.on(line)) {
                ip.push(ray.start);
            }

            return ip;
        }

        intersectRay2Arc(ray, arc) {
            let ip = [];

            if (ray.box.not_intersect(arc.box)) {
                return ip;
            }

            let line = new Line(ray.start, ray.norm);
            let ip_tmp = line.intersect(arc);

            for (let pt of ip_tmp) {
                if (Flatten.Utils.GE(pt.x, ray.start.x)) {
                    ip.push(pt);
                }
            }
            return ip;
        }
    };

    Flatten.ray = (...args) => new Flatten.Ray(...args);
};