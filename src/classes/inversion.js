/**
 * Created by Alex Bol on 3/7/2017.
 */
"use strict";

module.exports = function(Flatten) {
    Flatten.Inversion = class Inversion {
        constructor(...args) {
            this.pc = new Flatten.Point();
            this.r = 1;
            if (args.length === 1 && typeof args[0] === Flatten.Circle) {
                this.pc = args[0].pc.clone();
                this.r = args[0].r;
            }
            else if (args.length === 2 &&
                typeof args[0] === Flatten.Point && isNumber(args[1])) {
                this.pc = args[0].clone();
                this.r = args[1].r;
            }
        }
        op(shape) {
            let dist, shortest_segment;
            let dx, dy;
            let s;
            let v;
            let r;
            let d;
            let pt;
            let pc;

            if (shape instanceof Flatten.Line) {
                [dist, shortest_segment] = this.pc.distanceTo(shape);
                if (Flatten.Utils.EQ_0(dist)) {   // Line passing through inversion center, is mapping to itself
                    return shape.clone();
                }
                else {                           // Line not passing through inversion center is mapping into circle
                    r = this.r * this.r / (2 * dist);
                    v = new Flatten.Vector(this.pc, shortest_segment.end);
                    v = v.multiply(r / dist);
                    return new Flatten.Circle(this.pc.translate(v), r);
                }
            }
            else if (shape instanceof Flatten.Circle) {
                [dist, shortest_segment] = this.pc.distanceTo(shape.pc);
                if (Flatten.Utils.EQ(dist, shape.r)) {  // Circle passing through inversion center mapped into line
                    d = this.r * this.r / (2*shape.r);
                    v = new Flatten.Vector(shape.pc, this.pc);
                    v = v.normalize();
                    pt = this.pc.translate(v.multiply(d));
                    return new Flatten.Line(pt, v);
                }
                else {                           // Circle not passing through inversion center - map into another circle */
                    /* Taken from http://mathworld.wolfram.com */

                    dx = shape.pc.x - this.pc.x;
                    dy = shape.pc.y - this.pc.y;

                    s = this.r * this.r / (dx * dx + dy * dy - shape.r * shape.r);

                    pc.x = this.pc.x + s * dx;
                    pc.y = this.pc.y + s * dy;

                    return new Flatten.Circle(pc, ABS(s) * shape.r);
                }
            }
        }
    };
};