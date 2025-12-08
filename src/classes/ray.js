"use strict";

import Flatten from '../flatten';
import * as Intersection from "../algorithms/intersection";
import {Shape} from "./shape";
import {Errors} from "../utils/errors";
import {vector} from './vector'

/**
 * Class representing a ray (a half-infinite line).
 * @type {Ray}
 */
export class Ray extends Shape {
    /**
     * Ray may be constructed by setting an <b>origin</b> point and a <b>normal</b> vector, so that any point <b>x</b>
     * on a ray fit an equation: <br />
     *  (<b>x</b> - <b>origin</b>) * <b>vector</b> = 0 <br />
     * Ray defined by constructor is a right semi-infinite line with respect to the normal vector <br/>
     * If normal vector is omitted ray is considered horizontal (normal vector is (0,1)). <br/>
     * Don't be confused: direction of the normal vector is orthogonal to the ray <br/>
     * @param {Point} pt - start point
     * @param {Vector} norm - normal vector
     */
    constructor(...args) {
        super()
        this.pt = new Flatten.Point();
        this.norm = new Flatten.Vector(0,1);

        if (args.length === 0) {
            return;
        }

        if (args.length >= 1 && args[0] instanceof Flatten.Point) {
            this.pt = args[0].clone();
        }

        if (args.length === 1) {
            return;
        }

        if (args.length === 2 && args[1] instanceof Flatten.Vector) {
            this.norm = args[1].clone();
            return;
        }

        throw Errors.ILLEGAL_PARAMETERS;
    }

    /**
     * Return new cloned instance of ray
     * @returns {Ray}
     */
    clone() {
        return new Ray(this.pt, this.norm);
    }

    /**
     * Slope of the ray - angle in radians between ray and axe x from 0 to 2PI
     * @returns {number} - slope of the line
     */
    get slope() {
        let vec = new Flatten.Vector(this.norm.y, -this.norm.x);
        return vec.slope;
    }

    /**
     * Returns half-infinite bounding box of the ray
     * @returns {Box} - bounding box
     */
    get box() {
        let slope = this.slope;
        return new Flatten.Box(
            slope > Math.PI/2 && slope < 3*Math.PI/2 ? Number.NEGATIVE_INFINITY : this.pt.x,
            slope >= 0 && slope <= Math.PI ? this.pt.y : Number.NEGATIVE_INFINITY,
            slope >= Math.PI/2 && slope <= 3*Math.PI/2 ? this.pt.x : Number.POSITIVE_INFINITY,
            slope >= Math.PI && slope <= 2*Math.PI || slope === 0 ? this.pt.y : Number.POSITIVE_INFINITY
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
     * Ray has no end point?
     * @returns {undefined}
     */
    get end() {return undefined;}

    /**
     * Return positive infinity number as length
     * @returns {number}
     */
    get length() {return Number.POSITIVE_INFINITY;}

    /**
     * Returns true if point belongs to ray
     * @param {Point} pt Query point
     * @returns {boolean}
     */
    contains(pt) {
        if (this.pt.equalTo(pt)) {
            return true;
        }
        /* Ray contains point if vector to point is orthogonal to the ray normal vector
            and cross product from vector to point is positive */
        let vec = new Flatten.Vector(this.pt, pt);
        return Flatten.Utils.EQ_0(this.norm.dot(vec)) && Flatten.Utils.GE(vec.cross(this.norm),0);
    }

    /**
     * Return coordinate of the point that lies on the ray in the transformed
     * coordinate system where center is the projection of the point(0,0) to
     * the line containing this ray and axe y is collinear to the normal vector. <br/>
     * This method assumes that point lies on the ray
     * @param {Point} pt - point on a ray
     * @returns {number}
     */
    coord(pt) {
        return vector(pt.x, pt.y).cross(this.norm);
    }

    /**
     * Split ray with point and return array of segment and new ray
     * @param {Point} pt
     * @returns [Segment,Ray]
     */
    split(pt) {
        if (!this.contains(pt))
            return [];

        if (this.pt.equalTo(pt)) {
            return [this]
        }

        return [
            new Flatten.Segment(this.pt, pt),
            new Flatten.Ray(pt, this.norm)
        ]
    }

    /**
     * Returns array of intersection points between ray and another shape
     * @param {Shape} shape - Shape to intersect with ray
     * @returns {Point[]} array of intersection points
     */
    intersect(shape) {
        if (shape instanceof Flatten.Point) {
            return this.contains(shape) ? [shape] : [];
        }

        if (shape instanceof Flatten.Segment) {
            return Intersection.intersectRay2Segment(this, shape);
        }

        if (shape instanceof Flatten.Arc) {
            return Intersection.intersectRay2Arc(this, shape);
        }

        if (shape instanceof Flatten.Line) {
            return Intersection.intersectRay2Line(this, shape);
        }

        if (shape instanceof Flatten.Ray) {
            return Intersection.intersectRay2Ray(this, shape)
        }

        if (shape instanceof Flatten.Circle) {
            return Intersection.intersectRay2Circle(this, shape);
        }

        if (shape instanceof Flatten.Box) {
            return Intersection.intersectRay2Box(this, shape);
        }

        if (shape instanceof Flatten.Polygon) {
            return  Intersection.intersectRay2Polygon(this, shape);
        }

        if (shape instanceof Flatten.Multiline) {
            return Intersection.intersectShape2Multiline(this, shape);
        }
    }

    /**
     * Return new line rotated by angle
     * @param {number} angle - angle in radians
     * @param {Point} center - center of rotation
     */
    rotate(angle, center = new Flatten.Point()) {
        return new Flatten.Ray(
            this.pt.rotate(angle, center),
            this.norm.rotate(angle)
        )
    }

    /**
     * Return new ray transformed by affine transformation matrix
     * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
     * @returns {Ray}
     */
    transform(m) {
        return new Flatten.Ray(
            this.pt.transform(m),
            this.norm.clone()
        )
    }

    get name() {
        return "ray"
    }

    /**
     * Return string to draw svg segment representing ray inside given box
     * @param {Box} box Box representing drawing area
     * @param {Object} attrs - an object with attributes of svg segment element
     */
    svg(box, attrs = {}) {
        let line = new Flatten.Line(this.pt, this.norm);
        let ip = Intersection.intersectLine2Box(line, box);
        ip = ip.filter( pt => this.contains(pt) );
        if (ip.length === 0 || ip.length === 2)
            return "";
        let segment = new Flatten.Segment(this.pt, ip[0]);
        return segment.svg(attrs);
    }

}

Flatten.Ray = Ray;

export const ray = (...args) => new Flatten.Ray(...args);
Flatten.ray = ray;
