/**
 * Created by Alex Bol on 2/18/2017.
 */
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = require("./utils/utils");
var Errors = require("./utils/errors");

/**
 * FlattenJS - library for 2d geometry
 * @type {Flatten}
 */
var Flatten = function Flatten() {
    _classCallCheck(this, Flatten);

    this.version = "0.0.1";
    this.DP_TOL = Utils.DP_TOL;
    this.CCW = true;
    this.CW = false;
    this.ORIENTATION = { CCW: -1, CW: 1, NOT_ORIENTABLE: 0 };
    this.PIx2 = 2 * Math.PI;
    this.PI_2 = 0.5 * Math.PI;
    this.Utils = Utils;
    this.Errors = Errors;
};

var f = new Flatten();

require("./data_structures/planar_set")(f);
require("./classes/point")(f);
require("./classes/vector")(f);
require("./classes/line")(f);
require("./classes/circle")(f);
require("./classes/segment")(f);
require("./classes/arc")(f);
require("./classes/box")(f);
require("./classes/edge")(f);
require("./classes/face")(f);
require("./classes/polygon")(f);

module.exports = f;
