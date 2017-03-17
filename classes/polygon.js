/**
 * Created by Alex Bol on 3/15/2017.
 */

"use strict";

let PlanarSet = require('../data_structures/planar_set');

module.exports = function(Flatten) {
    let {Edge, Face} = Flatten;
    Flatten.Polygon = class Polygon {
        constructor() {
            this.faces = new PlanarSet();
            this.edges = new PlanarSet();
        }

        addFace(...args) {
            let face = new Face(this, args);
            this.faces.add(face);
            return face;
        }
    }
};