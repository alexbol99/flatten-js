/**
 * Created by Alex Bol on 3/12/2017.
 */

"use strict";

// require("babel-polyfill");

let IntervalTree = require('flatten-interval-tree');

module.exports = function(Flatten) {
    /**
     * Class representing a planar set - a generic container with ability to keep and retrieve shapes and
     * perform spatial queries. Planar set is an extension of Set container, so it is possible to call directly
     * Set properties and methods
     */
     Flatten.PlanarSet = class PlanarSet extends Set {
        /**
         * Create new empty instance of PlanarSet
         */
        constructor() {
            super();
            this.index = new IntervalTree();
        }

        /**
         * Add new shape to planar set and to its spatial index.<br/>
         * If shape already exist, it will not be added again.
         * This happens with no error, it is possible to use <i>size</i> property to check if
         * a shape was actually added.<br/>
         * @param shape - shape to be added, should have valid <i>box</i> property
         * @returns {PlanarSet} - planar set update, so may be chained
         */
        add(shape) {
            let size = this.size;
            super.add(shape);
            // size not changed - item not added, probably trying to add same item twice
            if (this.size > size) {
                let node = this.index.insert(shape.box, shape);
            }
            return this;         // in accordance to Set.add interface
        }

        /**
         * Delete shape from planar set.
         * @param shape - shape to be deleted
         * @returns {boolean} - returns true if shape was actually deleted, false otherwise
         */
        delete(shape) {
            let deleted = super.delete(shape);
            if (deleted) {
                this.index.remove(shape.box, shape);
            }
            return deleted;
        }

        clear() {

        }

        /**
         * 2d range search in planar set.<br/>
         * Returns array of all shapes in planar set which bounding box is intersected with query box
         * @param box - query box
         * @returns {Array} - array of shapes
         */
        search(box) {
            let resp = this.index.search(box);
            return resp;
        }

        /**
         * Point hit test. Returns array of shapes which contains given point
         * @param point - query point
         * @returns {Array} - array of shapes which contains given point
         */
        hit(point) {
            let box = new Flatten.Box(point.x - 1, point.y - 1, point.x + 1, point.y + 1);
            let resp = this.index.search(box);
            return resp.filter((shape) => point.on(shape));
        }

        /**
         * Returns svg string to draw all shapes in planar set
         * @returns {String}
         */
        svg() {
            let svgcontent = [...this].reduce((acc, shape) => acc + shape.svg(), "");
            return svgcontent;
        }
    }
};

