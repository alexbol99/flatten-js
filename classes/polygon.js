/**
 * Created by Alex Bol on 3/15/2017.
 */

"use strict";

module.exports = function(Flatten) {
    let {Edge, Face, PlanarSet, Box} = Flatten;
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
         *     polygon.addFace(Points|Segments|Arcs[])
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
         * Get bounding box of the polygon
         * @returns {Box}
         */
        get box() {
            return [...this.faces].reduce( (acc, face) => acc.merge(face.box), new Box() );
        }

        /**
         * Return array of vertices
         * @returns {Array}
         */
        get vertices() {
            return [...this.edges].map( edge => edge.start);
        }

        /**
         * Add new face to polygon
         * @param {Points[]|Segments|Arcs[]} args - list of points or list of shapes (segments and arcs)
         * which comprise a closed loop
         * @returns {Face}
         */
        addFace(...args) {
            let face = new Face(this, args);
            this.faces.add(face);
            return face;
        }

        /**
         * Delete existing face from polygon
         * @param {Face}
         * @returns {boolean|*}
         */
        deleteFace(face) {
            for (let edge of face) {
                let deleted = this.edges.delete(edge);
            }
            let deleted = this.faces.delete(face);
            return deleted;
        }

        /**
         * Create new copied instance of the polygon
         * @returns {Polygon}
         */
        clone() {
            let polygon = new Polygon();
            for (let face of this.faces) {
                let shapes = [];
                for (let edge of face) {
                    shapes.push(edge.shape.clone());
                }
                polygon.addFace(shapes);
            }
            return polygon;
        }

        /**
         * Returns area of the polygon. Area of an island will be added, area of a hole will be subtracted
         * @returns {number}
         */
        area() {
            let signedArea = [...this.faces].reduce((acc,face) => acc + face.signedArea(), 0);
            return Math.abs(signedArea);
        }

        /**
         * Return string to draw polygon in svg
         * @param attrs  - json structure with any attributes allowed to svg path element,
         * like "stroke", "strokeWidth", "fill", "fillRule"
         * Defaults are stroke:"black", strokeWidth:"3", fill:"lightcyan", fillRule:"evenodd"
         * @returns {string}
         */
        svg(attrs = {stroke:"black", strokeWidth:"3", fill:"lightcyan", fillRule:"evenodd"}) {
            let {stroke, strokeWidth, fill, fillRule} = attrs;
            let svgStr = `\n<path stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" fill-rule="${fillRule}" d="`;
            for (let face of this.faces) {
                svgStr += face.svg();
            }
            svgStr += `">\n</path>`;

            return svgStr;
        }
    }
};