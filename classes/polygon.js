/**
 * Created by Alex Bol on 3/15/2017.
 */

"use strict";

module.exports = function(Flatten) {
    let {Edge, Face, PlanarSet} = Flatten;
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
         *
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