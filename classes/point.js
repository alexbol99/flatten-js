/**
 * Created by Alex Bol on 2/18/2017.
 */

let RegisterPoint = function(Flatten) {
    Flatten.Point = class Point {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        /**
         *
         * @returns {Point|*}
         */
        clone() {
            return new Flatten.Point(this.x, this.y);
        }

        equalTo(pt) {
            return Flatten.Utils.EQ(this.x, pt.x) && Flatten.Utils.EQ(this.y, pt.y);
        }

        rotate(angle, anchor = {x:0, y:0}) {
            var x_rot = anchor.x + (this.x - anchor.x) * Math.cos(angle) - (this.y - anchor.y) * Math.sin(angle);
            var y_rot = anchor.y + (this.x - anchor.x) * Math.sin(angle) + (this.y - anchor.y) * Math.cos(angle);

            return new Flatten.Point(x_rot, y_rot);
        }

        translate(...args) {
            if (args.length == 0) {
                return this.clone();
            }

            if (args.length == 1 && (args[0] instanceof Flatten.Vector)) {
                return new Flatten.Point(this.x + args[0].x, this.y + args[0].y);
            }

            if (args.length == 2 && typeof(args[0]) == "number" && typeof(args[1]) == "number") {
                return new Flatten.Point(this.x + args[0], this.y + args[1]);
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

    };

};

module.exports = RegisterPoint;