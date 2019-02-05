
"use strict";

import Flatten from '../flatten';


/**
 * Class representing a Image shape
 * @type {Image}
 */
class Image {
    constructor() {
        this.uri = "";
        /**
         * Center in world coordinates
         * @type {Flatten.Point}
         */
        this.center = new Flatten.Point();
        /**
         * Width in world units (inch/mm)
         */
        this.width = 0;
        /**
         * Height in world units (inch/mm)
         */
        this.height = 0;
    }

    get box() {
        return new Flatten.Box(
            this.center.x - this.width / 2,
            this.center.y - this.height / 2,
            this.center.x + this.height / 2,
            this.center.y + this.height / 2
        );

    }
};
