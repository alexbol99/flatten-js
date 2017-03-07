/**
 * Created by Alex Bol on 2/18/2017.
 */
'use strict';

let Utils = require("./utils/utils");
let Errors = require("./utils/errors");
let ClassPoint = require("./classes/point");
let ClassVector = require("./classes/vector");
let ClassLine = require("./classes/line");
let ClassCircle = require("./classes/circle");
let ClassBox = require("./classes/box");

/**
 * FlattenJS - library for 2d geometry
 * @type {Flatten}
 */
let Flatten = class Flatten {
    constructor() {
        this.version =  "0.0.1";
        this.DP_TOL = Utils.DP_TOL;
        this.Utils = Utils;
        this.Errors = Errors;
    }
    registerClass(className) {
        className(this);
    }
};

let f = new Flatten();

f.registerClass(ClassPoint);
f.registerClass(ClassVector);
f.registerClass(ClassLine);
f.registerClass(ClassCircle);
f.registerClass(ClassBox);

module.exports = f; // new Flatten();
