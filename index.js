/**
 * Created by Alex Bol on 2/18/2017.
 */
'use strict';

let Utils = require("./utils/utils");
let Point = require("./classes/point");

const Flatten = class Flatten {
    constructor() {
        this.version = "0.0.1";
        this.Point = Point;
    }

    get DP_TOL() {
        return Utils.DP_TOL;
    }
};

module.exports = new Flatten();
