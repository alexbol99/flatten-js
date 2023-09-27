import Flatten from '../flatten';
import {Matrix} from "./matrix";

/**
 * Base class representing shape
 * Implement common methods of affine transformations
 */
export class Shape {
    get name() {
        throw(Flatten.Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }

    get box() {
        throw(Flatten.Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }

    clone() {
        throw(Flatten.Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }

    /**
     * Returns new shape translated by given vector.
     * Translation vector may be also defined by a pair of numbers.
     * @param {Vector} vector - Translation vector or
     * @param {number} tx - Translation by x-axis
     * @param {number} ty - Translation by y-axis
     * @returns {Shape}
     */
    translate(...args) {
        return this.transform(new Matrix().translate(...args))
    }

    /**
     * Returns new shape rotated by given angle around given center point.
     * If center point is omitted, rotates around zero point (0,0).
     * Positive value of angle defines rotation in counterclockwise direction,
     * negative angle defines rotation in clockwise direction
     * @param {number} angle - angle in radians
     * @param {Point} [center=(0,0)] center
     * @returns {Shape}
     */
    rotate(angle, center = new Flatten.Point()) {
        return this.transform(new Matrix().rotate(angle, center.x, center.y));
    }

    /**
     * Return new shape with coordinates multiplied by scaling factor
     * @param {number} sx - x-axis scaling factor
     * @param {number} sy - y-axis scaling factor
     * @returns {Shape}
     */
    scale(sx, sy) {
        return this.transform(new Matrix().scale(sx, sy));
    }

    transform(...args) {
        throw(Flatten.Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }

    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON() {
        return Object.assign({}, this, {name: this.name});
    }

    svg(attrs = {}) {
        throw(Flatten.Errors.CANNOT_INVOKE_ABSTRACT_METHOD);
    }
}