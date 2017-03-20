/**
 * Created by Alex Bol on 3/15/2017.
 */

"use strict";

let PlanarSet = require('../data_structures/planar_set');

module.exports = function(Flatten) {
    let {Edge, Face} = Flatten;
    /**
     * Class representing a polygon.<br/>
     * Polygon in FlattenJS is a multipolygon comprised from a set of faces<br/>
     * Face, in turn, is a closed loop of edges, which can be a segment or a circular arc<br/>
     * @type {Polygon}
     */
    Flatten.Polygon = class Polygon {
        /**
         * Constructor creates new instance of polygon.<br/>
         * New polygon is empty. Add new face to the polygon using method <br/>
         * <code>
         *     polygon.add(face)
         * </code>
         */
        constructor() {
            /**
             * Set of faces (closed loops), may be empty
             * @type {PlanarSet}
             */
            this.faces = new PlanarSet();
            /**
             * Set of edges. Usually is not used directly. Better access edges via faces
             * @type {PlanarSet}
             */
            this.edges = new PlanarSet();
        }

        /**
         *
         * @param {Points[]|Segments|Arcs[]} args - list of points or list of shapes (segments and arcs)
         * which comprise a closed loop
         * @returns {*}
         */
        addFace(...args) {
            let face = new Face(this, args);
            this.faces.add(face);
            return this;
        }
    }
};