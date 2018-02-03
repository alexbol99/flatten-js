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
                return 0.0;
            if (Flatten.Utils.EQ(Math.abs(this.startAngle - this.endAngle), Flatten.PIx2)) {
                return Flatten.PIx2;
            }
            let sweep;
            if (this.counterClockwise) {
                sweep = Flatten.Utils.GT(this.endAngle, this.startAngle) ?
                    this.endAngle - this.startAngle : this.endAngle - this.startAngle + Flatten.PIx2;
            } else {
                sweep = Flatten.Utils.GT(this.startAngle, this.endAngle) ?
                    this.startAngle - this.endAngle : this.startAngle - this.endAngle + Flatten.PIx2;
            }

            if ( Flatten.Utils.GT(sweep, Flatten.PIx2) ) {
                sweep -= Flatten.PIx2;
            }
            if ( Flatten.Utils.LT(sweep, 0) ) {
                sweep += Flatten.PIx2;
            }
            return sweep;
        }

        /**
         * Get start point of arc
         * @returns {Point}
         */
        get start() {
            let p0 = new Flatten.Point(this.pc.x + this.r, this.pc.y);
            return p0.rotate(this.startAngle, this.pc);
        }

        /**
         * Get end point of arc
         * @returns {Point}
         */
        get end() {
            let p0 = new Flatten.Point(this.pc.x + this.r, this.pc.y);
            return p0.rotate(this.endAngle, this.pc);
        }

        /**
         * Get center of arc
         * @returns {Point}
         */
        get center() {
            return this.pc.clone();
        }

        get vertices() {
            return [this.start.clone(), this.end.clone()];
        }

        /**
         * Get arc length
         * @returns {number}
         */
        get length() {
            return Math.abs(this.sweep*this.r);
        }

        /**
         * Get bounding box of the arc
         * @returns {Box}
         */
        get box() {
            let func_arcs = this.breakToFunctional();
            let box = func_arcs.reduce( (acc, arc) => acc.merge(arc.start.box), new Flatten.Box() );
            box = box.merge(this.end.box);
            return box;
        }

        /**
         * Returns true if arc contains point
         * @param {Point} pt - point to test
         * @returns {boolean}
         */
        contains(pt) {
            // first check if  point on circle (pc,r)
            if (!Flatten.Utils.EQ(this.pc.distanceTo(pt)[0], this.r))
                return false;

            // point on circle

            if (pt.equalTo(this.start))
                return true;

            let angle = new Flatten.Vector(this.pc, pt).slope;
            let test_arc = new Flatten.Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise);
            return Flatten.Utils.LE(test_arc.length, this.length);
        }

        /**
         * When given point belongs to arc, return array of two arcs split by this point
         * @param pt
         * @returns {Arc[]}
         */
        split(pt) {
            if (!this.contains(pt))
                return [];

            if (Flatten.Utils.EQ_0(this.sweep))
                return [this];

            if (this.start.equalTo(pt) || this.end.equalTo(pt))
                return [this];

            let angle = new Flatten.Vector(this.pc, pt).slope;

            return [
                new Flatten.Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise),
                new Flatten.Arc(this.pc, this.r, angle, this.endAngle, this.counterClockwise)
            ]
        }

        /**
         * Return middle point of the arc
         * @returns {Point}
         */
        middle() {
            let endAngle = this.counterClockwise === Flatten.CCW ? this.startAngle + this.sweep/2 : this.startAngle - this.sweep/2;
            let arc = new Flatten.Arc(this.pc, this.r, this.startAngle, endAngle, this.counterClockwise);
            return arc.end;
        }

        /**
         * Returns chord height ("sagitta") of the arc
         * @returns {number}
         */
        chordHeight() {
            return  (1.0 - Math.cos(Math.abs(this.sweep/2.0))) * this.r;
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

        /**
         * Calculate distance and shortest segment from arc to shape
         * @param shape
         * @returns {Number | Segment} - distance and shortest segment from arc to shape
         */
        distanceTo(shape) {
            let {Distance} = Flatten;

            if (shape instanceof Flatten.Point) {
                let [dist, shortest_segment] = Distance.point2arc(shape, this);
                shortest_segment = shortest_segment.swap();
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Circle) {
                let [dist, shortest_segment] = Distance.arc2circle(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Line) {
                let [dist, shortest_segment] = Distance.arc2line(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Segment) {
                let [dist, shortest_segment] = Distance.segment2arc(shape, this);
                shortest_segment = shortest_segment.swap();
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Arc) {
                let [dist, shortest_segment] = Distance.arc2arc(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Polygon) {
                let [dist, shortest_segment] = Distance.shape2polygon(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.PlanarSet) {
                let [dist, shortest_segment] = Distance.shape2planarSet(this, shape);
                return [dist, shortest_segment];
            }
        }

        /**
         * Returns array of sub-arcs broken in extreme point 0, pi/2, pi, 3*pi/2
         * @returns {Array}
         */
        breakToFunctional() {
            let func_arcs_array = [];
            let angles = [0, Math.PI/2, 2*Math.PI/2, 3*Math.PI/2];
            let pts = [
                this.pc.translate(this.r,0),
                this.pc.translate(0,this.r),
                this.pc.translate(-this.r,0),
                this.pc.translate(0,-this.r)
            ];

            // If arc contains extreme point,
            // create test arc started at start point and ended at this extreme point
            let test_arcs = [];
            for (let i=0; i < 4; i++) {
                if (pts[i].on(this)) {
                    test_arcs.push(new Flatten.Arc(this.pc, this.r, this.startAngle, angles[i], this.counterClockwise));
                }
            }

            if (test_arcs.length == 0) {                  // arc does contain any extreme point
                func_arcs_array.push(this.clone());
            }
            else {                                        // arc passes extreme point
                // sort these arcs by length
                test_arcs.sort((arc1, arc2) => arc1.length - arc2.length);

                for (let i = 0; i < test_arcs.length; i++) {
                    let prev_arc = func_arcs_array.length > 0 ? func_arcs_array[func_arcs_array.length - 1] : undefined;
                    let new_arc;
                    if (prev_arc) {
                        new_arc = new Flatten.Arc(this.pc, this.r, prev_arc.endAngle, test_arcs[i].endAngle, this.counterClockwise);
                    }
                    else {
                        new_arc = new Flatten.Arc(this.pc, this.r, this.startAngle, test_arcs[i].endAngle, this.counterClockwise);
                    }
                    if (!Flatten.Utils.EQ_0(new_arc.length)) {
                        func_arcs_array.push(new_arc.clone());
                    }
                }

                // add last sub arc
                let prev_arc = func_arcs_array.length > 0 ? func_arcs_array[func_arcs_array.length - 1] : undefined;
                let new_arc;
                if (prev_arc) {
                    new_arc = new Flatten.Arc(this.pc, this.r, prev_arc.endAngle, this.endAngle, this.counterClockwise);
                }
                else {
                    new_arc = new Flatten.Arc(this.pc, this.r, this.startAngle, this.endAngle, this.counterClockwise);
                }
                if (!Flatten.Utils.EQ_0(new_arc.length)) {
                    func_arcs_array.push(new_arc.clone());
                }
            }
            return func_arcs_array;
        }

        /**
         * Return tangent unit vector in the start point in the direction from start to end
         * @returns {Vector} - tangent vector in start point
         */
        tangentInStart() {
            let vec = new Flatten.Vector(this.pc, this.start);
            let angle = this.counterClockwise ? Math.PI/2. : -Math.PI/2.;
            let tangent = vec.rotate(angle).normalize();
            return tangent;
        }

        /**
         * Return tangent unit vector in the end point in the direction from end to start
         * @returns {Vector} - tangent vector in end point
         */
        tangentInEnd() {
            let vec = new Flatten.Vector(this.pc, this.end);
            let angle = this.counterClockwise ? -Math.PI/2. : Math.PI/2.;
            let tangent = vec.rotate(angle).normalize();
            return tangent;
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

        definiteIntegral(ymin=0) {
            let f_arcs = this.breakToFunctional();
            let area = f_arcs.reduce( (acc, arc) => acc + arc.circularSegmentDefiniteIntegral(ymin), 0.0 );
            return area;
        }

        circularSegmentDefiniteIntegral(ymin) {
            let line = new Flatten.Line(this.start, this.end);
            let onLeftSide = this.pc.leftTo(line);
            let segment = new Flatten.Segment(this.start, this.end);
            let areaTrapez = segment.definiteIntegral(ymin);
            let areaCircularSegment = this.circularSegmentArea();
            let area = onLeftSide ? areaTrapez - areaCircularSegment : areaTrapez + areaCircularSegment;
            return area;
        }

        circularSegmentArea() {
            return (0.5*this.r*this.r*(this.sweep - Math.sin(this.sweep)))
        }

        /**
         * Return string to draw arc in svg
         * @param attrs - json structure with any attributes allowed to svg path element,
         * like "stroke", "strokeWidth", "fill"
         * Defaults are stroke:"black", strokeWidth:"3", fill:"none"
         * @returns {string}
         */
        svg(attrs = {stroke:"black", strokeWidth:"3", fill:"none"}) {
            let largeArcFlag = this.sweep <= Math.PI ? "0" : "1";
            let sweepFlag = this.counterClockwise ? "1" : "0";
            let {stroke, strokeWidth, fill} = attrs;

            if (Flatten.Utils.EQ(this.sweep, 2*Math.PI)) {
                let circle = new Flatten.Circle(this.pc, this.r);
                return circle.svg(attrs);
            }
            else {
                return `\n<path d="M${this.start.x},${this.start.y}
                             A${this.r},${this.r} 0 ${largeArcFlag},${sweepFlag} ${this.end.x},${this.end.y}"
                    stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}"/>`
            }
        }
    };

    /**
     * Function to create arc equivalent to "new" constructor
     * @param args
     */
    Flatten.arc = (...args) => new Flatten.Arc(...args);
};