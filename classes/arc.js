/**
 * Created by Alex Bol on 3/10/2017.
 */

"use strict";

module.exports = function(Flatten) {
    /**
     * Class representing a circlular arc
     * @type {Arc}
     */
    Flatten.Arc = class Arc {
        /**
         *
         * @param {Point} pc - arc center
         * @param {number} r - arc radius
         * @param {number} startAngle - start angle in radians from 0 to 2*PI
         * @param {number} endAngle - end angle in radians from 0 to 2*PI
         * @param counterClockwise - arc direction, true - clockwise, false - counter clockwise
         */
        constructor(pc=new Flatten.Point(), r=1, startAngle=0, endAngle=2*Math.PI, counterClockwise=true) {
            this.pc = pc.clone();
            this.r = r;
            this.startAngle = startAngle;
            this.endAngle = endAngle;
            this.counterClockwise = counterClockwise;
        }

        /**
         * Return new instance of arc
         * @returns {Arc}
         */
        clone() {
            return new Flatten.Arc(this.pc.clone(), this.r, this.startAngle, this.endAngle, this.counterClockwise);
        }

        /**
         * Get sweep angle in radians. Sweep angle is non-negative number from 0 to 2*PI
         * @returns {number}
         */
        get sweep() {
            if (Flatten.Utils.EQ(this.startAngle, this.endAngle))
                return 0.0;                    // or Flatten.PIx2 ? - no zero arcs
            if (this.counterClockwise) {
                return (Flatten.Utils.GT(this.endAngle, this.startAngle) ?
                    this.endAngle - this.startAngle : this.endAngle - this.startAngle + Flatten.PIx2);
            } else {
                return (Flatten.Utils.GT(this.startAngle, this.endAngle) ?
                    this.startAngle - this.endAngle : this.startAngle - this.endAngle + Flatten.PIx2);
            }
        }

        /**
         * Get start point of arc
         * @returns {Point}
         */
        get start() {
            let p0 = new Flatten.Point(this.r,0);
            return p0.rotate(this.startAngle, this.pc);
        }

        /**
         * Get end point of arc
         * @returns {Point}
         */
        get end() {
            let p0 = new Flatten.Point(this.r,0);
            return p0.rotate(this.endAngle, this.pc);
        }

        /**
         * Get arc length
         * @returns {number}
         */
        get length() {
            return Math.abs(this.sweep*this.r);
        }

        /**
         * Get bounding box of arc
         * @returns {Box}
         */
        get box() {
            let xs,ys,xe,ye;
            let dxs,dys,dxe,dye;
            let xmin,ymin,xmax,ymax;
            let quads, quade, quad;
            let xc = this.pc.x;
            let yc = this.pc.y;
            let r = this.r;

            let ps = this.start;
            let pe = this.end;

            let box = new Flatten.Box();

            /* order (xs, xe) and (ys, ye) always clockwise */
            if(this.counterClockwise){
                xs = pe.x ; ys = pe.y ;
                xe = ps.x ; ye = ps.y ;
            } else {
                xs = ps.x ; ys =ps.y ;
                xe = pe.x ; ye = pe.y ;
            }
            dxs = xs-xc ; dys = ys-yc ;
            dxe = xe-xc ; dye = ye-yc ;

            xmin = xc-r ; ymin = yc-r ;
            xmax = xc+r ; ymax = yc+r ;

            xmin = Math.min(xmin,xs) ; xmin = Math.min(xmin,xe);
            xmax = Math.max(xmax,xs) ; xmax = Math.max(xmax,xe);
            ymin = Math.min(ymin,ys) ; ymin = Math.min(ymin,ye);
            ymax = Math.max(ymax,ys) ; ymax = Math.max(ymax,ye);

            /* Calculate the quadrant for each point */
            /*
             *           |
             *         1 | 0
             *       ----------
             *         2 | 3
             *           |
             */
            quads = (dxs >= 0 ? (dys >= 0 ? 0 : 3) : (dys >= 0 ? 1 : 2));
            quade = (dxe >= 0 ? (dye >= 0 ? 0 : 3) : (dye >= 0 ? 1 : 2));

            /* There are 16 combinations of start-end configurations */
            /* The more complex ones are when both points are in the
             * same quadrant (They require additional conditions).
             * Remember that we converted everything to clockwise !
             */

            quad = (quads << 2) + quade ;

            switch(quad){
                case 0 :
                    /* From quadrant 0 to 0 */
                    if(xs < xe || ys > ye){
                        box.set(xs,ye,xe,ys);
                    } else {
                        box.set(xmin,ymin,xmax,ymax);
                    }
                    break ;
                case 1 :
                    /* From quadrant 0 to 1 */
                    box.set(xmin,ymin,xmax,Math.max(ys,ye));
                    break ;
                case 2 :
                    /* From quadrant 0 to 2 */
                    box.set(xe,ymin,xmax,ys);
                    break ;
                case 3 :
                    /* From quadrant 0 to 3 */
                    box.set(Math.min(xs,xe),ye,xmax,ys);
                    break ;
                case 4 :
                    /* From quadrant 1 to 0 */
                    box.set(xs,Math.min(ys,ye),xe,ymax);
                    break ;
                case 5 :
                    /* From quadrant 1 to 1 */
                    if(xs < xe || ys < ye){
                        box.set(xs,ys,xe,ye);
                    } else {
                        box.set(xmin,ymin,xmax,ymax);
                    }
                    break ;
                case 6 :
                    /* From quadrant 1 to 2 */
                    box.set(Math.min(xs,xe),ymin,xmax,ymax);
                    break ;
                case 7 :
                    /* From quadrant 1 to 3 */
                    box.set(xs,ye,xmax,ymax);
                    break ;
                case 8 :
                    /* From quadrant 2 to 0 */
                    box.set(xmin,ys,xe,ymax);
                    break ;
                case 9 :
                    /* From quadrant 2 to 1 */
                    box.set(xmin,ys,Math.max(xs,xe),ye);
                    break ;
                case 10 :
                    /* From quadrant 2 to 2 */
                    if(xs > xe || ys < ye){
                        box.set(xe,ys,xs,ye);
                    } else {
                        box.set(xmin,ymin,xmax,ymax);
                    }
                    break ;
                case 11 :
                    /* From quadrant 2 to 3 */
                    box.set(xmin,Math.min(ys,ye),xmax,ymax);
                    break ;
                case 12 :
                    /* From quadrant 3 to 0 */
                    box.set(xmin,ymin,Math.max(xs,xe),ymax);
                    break ;
                case 13 :
                    /* From quadrant 3 to 1 */
                    box.set(xmin,ymin,xs,ye);
                    break ;
                case 14 :
                    /* From quadrant 3 to 2 */
                    box.set(xe,ymin,xs,Math.max(ys,ye));
                    break ;
                case 15 :
                    /* From quadrant 3 to 3 */
                    if(xs > xe || ys > ye){
                        box.set(xe,ye,xs,ys);
                    } else {
                        box.set(xmin,ymin,xmax,ymax);
                    }
                    break ;
            }
            return box;
        }

        /**
         * Returns true if arc contains point
         * @param {Point} pt - point to test
         * @returns {boolean}
         */
        contains(pt) {
            // first check if  point on circle (pc,r)
            if (!Flatten.Utils.EQ(this.pc.distanceTo(pt), this.r))
                return false;

            // point on circle

            if (pt.equalTo(this.start))
                return true;

            let angle = new Flatten.Vector(this.pc, pt).slope;
            let test_arc = new Flatten.Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise);
            return Flatten.Utils.LE(test_arc.length, this.length);
        }

        /**
         * Returns array of intersection points between arc and other shape
         * @param shape
         * @returns {*}
         */
        intersect(shape) {
            if (shape instanceof Flatten.Line) {
                return shape.intersect(this);
            }
            if (shape instanceof Flatten.Circle) {
                return Arc.intersectArc2Circle(this, shape);
            }
            if (shape instanceof Flatten.Segment) {
                return shape.intersect(this);
            }
            if (shape instanceof Flatten.Arc) {
                return Arc.intersectArc2Arc(this, shape);
            }
        }

        distanceToPoint(pt) {
            let circle = new Flatten.Circle(this.pc, this.r);
            let distToCircle = pt.distanceTo(circle);
            let distToStart = pt.distanceTo(this.start);
            let distToEnd = pt.distanceTo(this.end);
            return Math.min(distToCircle, Math.min(distToStart, distToEnd));
        }

        static intersectArc2Arc(arc1, arc2) {
            var ip = [];

            if (arc1.box.notIntersect(arc2.box)) {
                return ip;
            }

            // Special case: overlapping arcs
            // May return up to 4 intersection points
            if (arc1.pc.equalTo(arc2.pc) && Flatten.Utils.EQ(arc1.r, arc2.r)) {
                let pt;

                pt = arc1.start;
                if (pt.on(arc2))
                    ip.push(pt);

                pt = arc1.end;
                if (pt.on(arc2))
                    ip.push(pt);

                pt = arc2.start;
                if (pt.on(arc1)) ip.push(pt);

                pt = arc2.end;
                if (pt.on(arc1)) ip.push(pt);

                return ip;
            }

            // Common case
            let circle1 = new Flatten.Circle(arc1.pc, arc1.r);
            let circle2 = new Flatten.Circle(arc2.pc, arc2.r);
            let ip_tmp =  circle1.intersect(circle2);
            for (let pt of ip_tmp) {
                if (pt.on(arc1) && pt.on(arc2)) {
                    ip.push(pt);
                }
            }
            return ip;
        }

        static intersectArc2Circle(arc, circle) {
            let ip = [];

            if (arc.box.notIntersect(circle.box)) {
                return ip;
            }

            // Case when arc center incident to circle center
            // Return arc's end points as 2 intersection points
            if (circle.pc.equalTo(arc.pc) && Flatten.Utils.EQ(circle.r, arc.r)) {
                ip.push(arc.start);
                ip.push(arc.end);
                return ip;
            }

            // Common case
            let circle1 = circle;
            let circle2 = new Flatten.Circle(arc.pc, arc.r);
            let ip_tmp = circle1.intersect(circle2);
            for (let pt of ip_tmp) {
                if (pt.on(arc)) {
                    ip.push(pt);
                }
            }
            return ip;
        }

        svg(stroke="black", strokeWidth="1") {
            let largeArcFlag = this.sweep <= Math.PI ? "0" : "1";
            // let sweepFlag = this.counterClockwise ?
            return `<path d="M${this.start.x} ${this.start.y}
                             A ${this.r} ${this.r} 0 ${largeArcFlag} 0 ${this.end.x} ${this.end.y}"
                    stroke="${stroke}" stroke-width="${strokeWidth}"/>`
        }
    };

    /**
     * Function to create arc equivalent to "new" constructor
     * @param args
     */
    Flatten.arc = (...args) => new Flatten.Arc(...args);
};