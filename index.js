/**
 * Created by Alex Bol on 2/18/2017.
 */
'use strict';

let Utils = require("./utils/utils");
let Errors = require("./utils/errors");
let RegisterPoint = require("./classes/point");
let RegisterVector = require("./classes/vector");

let Flatten = {
    version: "0.0.1",
    DP_TOL: Utils.DP_TOL,
    Utils: Utils,
    Errors: Errors
};

// let f = new Flatten();
RegisterPoint(Flatten);
RegisterVector(Flatten);

module.exports = Flatten; // new Flatten();
