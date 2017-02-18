/**
 * Created by Alex Bol on 2/18/2017.
 */

let Utils = require("../utils/utils");

const Point = class {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    equalTo(pt) {
        return Utils.EQ(this.x, pt.x) && Utils.EQ(this.y, pt.y);
    }
};

module.exports = Point;