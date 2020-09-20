(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global['@flatten-js/core'] = {}));
}(this, function (exports) { 'use strict';

    /**
     * Global constant CCW defines counter clockwise direction of arc
     * @type {boolean}
     */
    const CCW = true;

    /**
     * Global constant CW defines clockwise direction of arc
     * @type {boolean}
     */
    const CW = false;

    /**
     * Defines orientation for face of the polygon: clockwise, counter clockwise
     * or not orientable in the case of self-intersection
     * @type {{CW: number, CCW: number, NOT_ORIENTABLE: number}}
     */
    const ORIENTATION = {CCW:-1, CW:1, NOT_ORIENTABLE: 0};

    const PIx2 = 2 * Math.PI;

    const INSIDE = 1;
    const OUTSIDE = 0;
    const BOUNDARY = 2;
    const CONTAINS = 3;
    const INTERLACE = 4;

    const OVERLAP_SAME = 1;
    const OVERLAP_OPPOSITE = 2;

    var Constants = /*#__PURE__*/Object.freeze({
        CCW: CCW,
        CW: CW,
        ORIENTATION: ORIENTATION,
        PIx2: PIx2,
        INSIDE: INSIDE,
        OUTSIDE: OUTSIDE,
        BOUNDARY: BOUNDARY,
        CONTAINS: CONTAINS,
        INTERLACE: INTERLACE,
        OVERLAP_SAME: OVERLAP_SAME,
        OVERLAP_OPPOSITE: OVERLAP_OPPOSITE
    });

    /**
     * Created by Alex Bol on 2/18/2017.
     */


    /**
     * DP_TOL is used for comparison of floating point numbers.
     * It is set to 0.000001.
     * @type {number}
     */
    var DP_TOL = 0.000001;
    function setTolerance(tolerance) {DP_TOL = tolerance;}
    function getTolerance() {return DP_TOL;}

    const DECIMALS = 3;

    /**
     * Returns *true* if value comparable to zero
     * @return {boolean}
     */
    function EQ_0(x) {
        return ((x) < DP_TOL && (x) > -DP_TOL);
    }

    /**
     * Returns *true* if two values are equal up to DP_TOL
     * @return {boolean}
     */
    function EQ(x, y) {
        return ((x) - (y) < DP_TOL && (x) - (y) > -DP_TOL);
    }

    /**
     * Returns *true* if first argument greater than second argument up to DP_TOL
     * @return {boolean}
     */
    function GT(x, y) {
        return ((x) - (y) > DP_TOL);
    }

    /**
     * Returns *true* if first argument greater than or equal to second argument up to DP_TOL
     * @return {boolean}
     */
    function GE(x, y) {
        return ((x) - (y) > -DP_TOL);
    }

    /**
     * Returns *true* if first argument less than second argument up to DP_TOL
     * @return {boolean}
     */
    function LT(x, y) {
        return ((x) - (y) < -DP_TOL)
    }

    /**
     * Returns *true* if first argument less than or equal to second argument up to DP_TOL
     * @return {boolean}
     */
    function LE(x, y) {
        return ((x) - (y) < DP_TOL);
    }

    var Utils = /*#__PURE__*/Object.freeze({
        setTolerance: setTolerance,
        getTolerance: getTolerance,
        DECIMALS: DECIMALS,
        EQ_0: EQ_0,
        EQ: EQ,
        GT: GT,
        GE: GE,
        LT: LT,
        LE: LE
    });

    /**
     * Created by Alex Bol on 2/19/2017.
     */

    /**
     * Class of system errors
     */
    class Errors {
        /**
         * Throw error ILLEGAL_PARAMETERS when cannot instantiate from given parameter
         * @returns {ReferenceError}
         */
        static get ILLEGAL_PARAMETERS() {
            return new ReferenceError('Illegal Parameters');
        }

        /**
         * Throw error ZERO_DIVISION to catch situation of zero division
         * @returns {Error}
         */
        static get ZERO_DIVISION() {
            return new Error('Zero division');
        }

        /**
         * Error to throw from BooleanOperations module in case when fixBoundaryConflicts not capable to fix it
         * @returns {Error}
         */
        static get UNRESOLVED_BOUNDARY_CONFLICT() {
            return new Error('Unresolved boundary conflict in boolean operation');
        }

        /**
         * Error to throw from LinkedList:testInfiniteLoop static method
         * in case when circular loop detected in linked list
         * @returns {Error}
         */
        static get INFINITE_LOOP() {
            return new Error('Infinite loop');
        }
    }

    var errors = /*#__PURE__*/Object.freeze({
        default: Errors
    });

    let Flatten = {
        Utils: Utils,
        Errors: Errors,
        Matrix: undefined,
        Planar_set: undefined,
        Point: undefined,
        Vector: undefined,
        Line: undefined,
        Circle: undefined,
        Segment: undefined,
        Arc: undefined,
        Box: undefined,
        Edge: undefined,
        Face: undefined,
        Ray: undefined,
        Ray_shooting: undefined,
        Multiline: undefined,
        Polygon: undefined,
        Distance: undefined,
    };

    for (let c in Constants) {Flatten[c] = Constants[c];}

    Object.defineProperty(Flatten, 'DP_TOL', {
        get:function(){return getTolerance()}, 
        set:function(value){setTolerance(value);}
    });

    /**
     * Class implements bidirectional non-circular linked list. <br/>
     * LinkedListElement - object of any type that has properties next and prev.
     */
    class LinkedList {
        constructor(first, last) {
            this.first = first;
            this.last = last || this.first;
        }

        /**
         * Throw an error if circular loop detected in the linked list
         * @param {LinkedListElement} first element to start iteration
         * @throws {Flatten.Errors.INFINITE_LOOP}
         */
        static testInfiniteLoop(first) {
            let edge = first;
            let controlEdge = first;
            do {
                if (edge != first && edge === controlEdge) {
                    throw Flatten.Errors.INFINITE_LOOP;  // new Error("Infinite loop")
                }
                edge = edge.next;
                controlEdge = controlEdge.next.next;
            } while (edge != first)
        }

        /**
         * Return number of elements in the list
         * @returns {number}
         */
        get size() {
            let counter = 0;
            for (let edge of this) {
                counter++;
            }
            return counter;
        }

        /**
         * Return array of elements from start to end,
         * If start or end not defined, take first as start, last as end
         * @returns {Array}
         */
        toArray(start=undefined, end=undefined) {
            let elements = [];
            let from = start || this.first;
            let to = end || this.last;
            let element = from;
            if (element === undefined) return elements;
            do {
                elements.push(element);
                element = element.next;
            } while (element !== to.next);
            return elements;
        }


        /**
         * Append new element to the end of the list
         * @param {LinkedListElement} element
         * @returns {LinkedList}
         */
        append(element) {
            if (this.isEmpty()) {
                this.first = element;
            } else {
                element.prev = this.last;
                this.last.next = element;
            }

            // update edge to be last
            this.last = element;

            // nullify non-circular links
            this.last.next = undefined;
            this.first.prev = undefined;
            return this;
        }

        /**
         * Insert new element to the list after elementBefore
         * @param {LinkedListElement} newElement
         * @param {LinkedListElement} elementBefore
         * @returns {LinkedList}
         */
        insert(newElement, elementBefore) {
            if (this.isEmpty()) {
                this.first = newElement;
                this.last = newElement;
            }
            else if (elementBefore === null || elementBefore === undefined) {
                newElement.next = this.first;
                this.first.prev = newElement;
                this.first = newElement;
            }
            else {
                /* set links to new element */
                let elementAfter = elementBefore.next;
                elementBefore.next = newElement;
                if (elementAfter) elementAfter.prev = newElement;

                /* set links from new element */
                newElement.prev = elementBefore;
                newElement.next = elementAfter;

                /* extend list if new element added after the last element */
                if (this.last === elementBefore)
                    this.last = newElement;
            }
            // nullify non-circular links
            this.last.next = undefined;
            this.first.prev = undefined;
            return this;
        }

        /**
         * Remove element from the list
         * @param {LinkedListElement} element
         * @returns {LinkedList}
         */
        remove(element) {
            // special case if last edge removed
            if (element === this.first && element === this.last) {
                this.first = undefined;
                this.last = undefined;
            } else {
                // update linked list
                if (element.prev) element.prev.next = element.next;
                if (element.next) element.next.prev = element.prev;
                // update first if need
                if (element === this.first) {
                    this.first = element.next;
                }
                // update last if need
                if (element === this.last) {
                    this.last = element.prev;
                }
            }
            return this;
        }

        /**
         * Return true if list is empty
         * @returns {boolean}
         */
        isEmpty() {
            return this.first === undefined;
        }

        [Symbol.iterator]() {
            let value = undefined;
            return {
                next: () => {
                    value = value ? value.next : this.first;
                    return {value: value, done: value === undefined};
                }
            };
        };
    }

    /**
     * Created by Alex Bol on 12/02/2018.
     */

    let {INSIDE: INSIDE$1, OUTSIDE: OUTSIDE$1, BOUNDARY: BOUNDARY$1, OVERLAP_SAME: OVERLAP_SAME$1, OVERLAP_OPPOSITE: OVERLAP_OPPOSITE$1} = Flatten;

    const NOT_VERTEX = 0;
    const START_VERTEX = 1;
    const END_VERTEX = 2;

    const BOOLEAN_UNION = 1;
    const BOOLEAN_INTERSECT = 2;
    const BOOLEAN_SUBTRACT = 3;


    /**
     * Unify two polygons polygons and returns new polygon. <br/>
     * Point belongs to the resulted polygon if it belongs to the first OR to the second polygon
     * @param {Polygon} polygon1 - first operand
     * @param {Polygon} polygon2 - second operand
     * @returns {Polygon}
     */
    function unify(polygon1, polygon2) {
        let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2, BOOLEAN_UNION, true);
        return res_poly;
    }

    /**
     * Subtract second polygon from the first and returns new polygon
     * Point belongs to the resulted polygon if it belongs to the first polygon AND NOT to the second polygon
     * @param {Polygon} polygon1 - first operand
     * @param {Polygon} polygon2 - second operand
     * @returns {Polygon}
     */
    function subtract(polygon1, polygon2) {
        let polygon2_tmp = polygon2.clone();
        let polygon2_reversed = polygon2_tmp.reverse();
        let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2_reversed, BOOLEAN_SUBTRACT, true);
        return res_poly;
    }

    /**
     * Intersect two polygons and returns new polygon
     * Point belongs to the resultes polygon is it belongs to the first AND to the second polygon
     * @param {Polygon} polygon1 - first operand
     * @param {Polygon} polygon2 - second operand
     * @returns {Polygon}
     */
    function intersect(polygon1, polygon2) {
        let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2, BOOLEAN_INTERSECT, true);
        return res_poly;
    }

    /**
     * Returns boundary of intersection between two polygons as two arrays of shapes (Segments/Arcs) <br/>
     * The first array are shapes from the first polygon, the second array are shapes from the second
     * @param {Polygon} polygon1 - first operand
     * @param {Polygon} polygon2 - second operand
     * @returns {Shape[][]}
     */
    function innerClip(polygon1, polygon2) {
        let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2, BOOLEAN_INTERSECT, false);

        let clip_shapes1 = [];
        for (let face of res_poly.faces) {
            clip_shapes1 = [...clip_shapes1, ...[...face.edges].map(edge => edge.shape)];
        }
        let clip_shapes2 = [];
        for (let face of wrk_poly.faces) {
            clip_shapes2 = [...clip_shapes2, ...[...face.edges].map(edge => edge.shape)];
        }
        return [clip_shapes1, clip_shapes2];
    }

    /**
     * Returns boundary of subtraction of the second polygon from first polygon as array of shapes
     * @param {Polygon} polygon1 - first operand
     * @param {Polygon} polygon2 - second operand
     * @returns {Shape[]}
     */
    function outerClip(polygon1, polygon2) {
        let [res_poly, wrk_poly] = booleanOpBinary(polygon1, polygon2, BOOLEAN_SUBTRACT, false);

        let clip_shapes1 = [];
        for (let face of res_poly.faces) {
            clip_shapes1 = [...clip_shapes1, ...[...face.edges].map(edge => edge.shape)];
        }

        return clip_shapes1;
    }

    /**
     * Returns intersection points between boundaries of two polygons as two array of points <br/>
     * Points in the first array belong to first polygon, points from the second - to the second.
     * Points in each array are ordered according to the direction of the correspondent polygon
     * @param {Polygon} polygon1 - first operand
     * @param {Polygon} polygon2 - second operand
     * @returns {Point[][]}
     */
    function calculateIntersections(polygon1, polygon2) {
        let res_poly = polygon1.clone();
        let wrk_poly = polygon2.clone();

        // get intersection points
        let intersections = getIntersections(res_poly, wrk_poly);

        // sort intersection points
        sortIntersections(intersections);

        // split by intersection points
        splitByIntersections(res_poly, intersections.int_points1_sorted);
        splitByIntersections(wrk_poly, intersections.int_points2_sorted);

        // filter duplicated intersection points
        filterDuplicatedIntersections(intersections);

        let ip_sorted1 = intersections.int_points1_sorted.map( int_point => int_point.pt);
        let ip_sorted2 = intersections.int_points2_sorted.map( int_point => int_point.pt);
        return [ip_sorted1, ip_sorted2];
    }

    function filterNotRelevantEdges(res_poly, wrk_poly, intersections, op) {
        // keep not intersected faces for further remove and merge
        let notIntersectedFacesRes = getNotIntersectedFaces(res_poly, intersections.int_points1);
        let notIntersectedFacesWrk = getNotIntersectedFaces(wrk_poly, intersections.int_points2);

        // calculate inclusion flag for not intersected faces
        calcInclusionForNotIntersectedFaces(notIntersectedFacesRes, wrk_poly);
        calcInclusionForNotIntersectedFaces(notIntersectedFacesWrk, res_poly);

        // initialize inclusion flags for edges incident to intersections
        initializeInclusionFlags(intersections.int_points1);
        initializeInclusionFlags(intersections.int_points2);

        // calculate inclusion flags only for edges incident to intersections
        calculateInclusionFlags(intersections.int_points1, wrk_poly);
        calculateInclusionFlags(intersections.int_points2, res_poly);

        // fix boundary conflicts
        while (fixBoundaryConflicts(res_poly, wrk_poly, intersections.int_points1, intersections.int_points1_sorted, intersections.int_points2, intersections));
        // while (fixBoundaryConflicts(wrk_poly, res_poly, intersections.int_points2, intersections.int_points2_sorted, intersections.int_points1, intersections));

        // Set overlapping flags for boundary chains: SAME or OPPOSITE
        setOverlappingFlags(intersections);

        // remove not relevant chains between intersection points
        removeNotRelevantChains(res_poly, op, intersections.int_points1_sorted, true);
        removeNotRelevantChains(wrk_poly, op, intersections.int_points2_sorted, false);

        // remove not relevant not intersected faces from res_polygon and wrk_polygon
        // if op == UNION, remove faces that are included in wrk_polygon without intersection
        // if op == INTERSECT, remove faces that are not included into wrk_polygon
        removeNotRelevantNotIntersectedFaces(res_poly, notIntersectedFacesRes, op, true);
        removeNotRelevantNotIntersectedFaces(wrk_poly, notIntersectedFacesWrk, op, false);
    }

    function swapLinksAndRestore(res_poly, wrk_poly, intersections, op) {

        // add edges of wrk_poly into the edge container of res_poly
        copyWrkToRes(res_poly, wrk_poly, op, intersections.int_points2);

        // swap links from res_poly to wrk_poly and vice versa
        swapLinks(res_poly, wrk_poly, intersections);

        // remove old faces
        removeOldFaces(res_poly, intersections.int_points1);
        removeOldFaces(wrk_poly, intersections.int_points2);

        // restore faces
        restoreFaces(res_poly, intersections.int_points1, intersections.int_points2);
        restoreFaces(res_poly, intersections.int_points2, intersections.int_points1);

        // merge relevant not intersected faces from wrk_polygon to res_polygon
        // mergeRelevantNotIntersectedFaces(res_poly, wrk_poly);
    }


    function booleanOpBinary(polygon1, polygon2, op, restore)
    {
        let res_poly = polygon1.clone();
        let wrk_poly = polygon2.clone();

        // get intersection points
        let intersections = getIntersections(res_poly, wrk_poly);

        // sort intersection points
        sortIntersections(intersections);

        // split by intersection points
        splitByIntersections(res_poly, intersections.int_points1_sorted);
        splitByIntersections(wrk_poly, intersections.int_points2_sorted);

        // filter duplicated intersection points
        filterDuplicatedIntersections(intersections);

        // calculate inclusion and remove not relevant edges
        filterNotRelevantEdges(res_poly, wrk_poly, intersections, op);

        if (restore) {
            swapLinksAndRestore(res_poly, wrk_poly, intersections, op);
        }

        return [res_poly, wrk_poly];
    }

    function getIntersections(polygon1, polygon2)
    {
        let intersections = {
            int_points1: [],
            int_points2: []
        };

        // calculate intersections
        for (let edge1 of polygon1.edges) {

            // request edges of polygon2 in the box of edge1
            let resp = polygon2.edges.search(edge1.box);

            // for each edge2 in response
            for (let edge2 of resp) {

                // calculate intersections between edge1 and edge2
                let ip = edge1.shape.intersect(edge2.shape);

                // for each intersection point
                for (let pt of ip) {
                    addToIntPoints(edge1, pt, intersections.int_points1);
                    addToIntPoints(edge2, pt, intersections.int_points2);
                }
            }
        }
        return intersections;
    }

    function addToIntPoints(edge, pt, int_points)
    {
        let id = int_points.length;
        let shapes = edge.shape.split(pt);

        // if (shapes.length < 2) return;
        if (shapes.length === 0) return;     // Point does not belong to edge ?

        let len = 0;
        if (shapes[0] === null) {   // point incident to edge start vertex
            len = 0;
        }
        else if (shapes[1] === null) {   // point incident to edge end vertex
            len = edge.shape.length;
        }
        else {                             // Edge was split into to edges
            len = shapes[0].length;
        }

        let is_vertex = NOT_VERTEX;
        if (EQ(len, 0)) {
            is_vertex |= START_VERTEX;
        }
        if (EQ(len, edge.shape.length)) {
            is_vertex |= END_VERTEX;
        }
        // Fix intersection point which is end point of the last edge
        let arc_length = (is_vertex & END_VERTEX) && edge.next.arc_length === 0 ? 0 : edge.arc_length + len;

        int_points.push({
            id: id,
            pt: pt,
            arc_length: arc_length,
            edge_before: edge,
            edge_after: undefined,
            face: edge.face,
            is_vertex: is_vertex
        });
    }

    function sortIntersections(intersections)
    {
        // if (intersections.int_points1.length === 0) return;

        // augment intersections with new sorted arrays
        // intersections.int_points1_sorted = intersections.int_points1.slice().sort(compareFn);
        // intersections.int_points2_sorted = intersections.int_points2.slice().sort(compareFn);
        intersections.int_points1_sorted = getSortedArray(intersections.int_points1);
        intersections.int_points2_sorted = getSortedArray(intersections.int_points2);
    }

    function getSortedArray(int_points)
    {
        let faceMap = new Map;
        let id = 0;
        // Create integer id's for faces
        for (let ip of int_points) {
            if (!faceMap.has(ip.face)) {
                faceMap.set(ip.face, id);
                id++;
            }
        }
        // Augment intersection points with face id's
        for (let ip of int_points) {
            ip.faceId = faceMap.get(ip.face);
        }
        // Clone and sort
        let int_points_sorted = int_points.slice().sort(compareFn);
        return int_points_sorted;
    }

    function compareFn(ip1, ip2)
    {
        // compare face id's
        if (ip1.faceId < ip2.faceId) {
            return -1;
        }
        if (ip1.faceId > ip2.faceId) {
            return 1;
        }
        // same face - compare arc_length
        if (ip1.arc_length < ip2.arc_length) {
            return -1;
        }
        if (ip1.arc_length > ip2.arc_length) {
            return 1;
        }
        return 0;
    }

    function splitByIntersections(polygon, int_points)
    {
        if (!int_points) return;
        for (let int_point of int_points) {
            let edge = int_point.edge_before;

            // recalculate vertex flag: it may be changed after previous split
            int_point.is_vertex = NOT_VERTEX;
            if (edge.shape.start.equalTo(int_point.pt)) {
                int_point.is_vertex |= START_VERTEX;
            }
            if (edge.shape.end.equalTo(int_point.pt)) {
                int_point.is_vertex |= END_VERTEX;
            }

            if (int_point.is_vertex & START_VERTEX) {  // nothing to split
                int_point.edge_before = edge.prev;
                int_point.is_vertex = END_VERTEX;
                continue;
            }
            if (int_point.is_vertex & END_VERTEX) {    // nothing to split
                continue;
            }

            let newEdge = polygon.addVertex(int_point.pt, edge);
            int_point.edge_before = newEdge;
        }

        for (let int_point of int_points) {
            int_point.edge_after = int_point.edge_before.next;
        }
    }

    function filterDuplicatedIntersections(intersections)
    {
        if (intersections.int_points1.length < 2) return;

        let do_squeeze = false;

        let int_point_ref1;
        let int_point_ref2;
        let int_point_cur1;
        let int_point_cur2;
        for (let i = 0; i < intersections.int_points1_sorted.length; i++) {

            if (intersections.int_points1_sorted[i].id === -1)
                continue;

            int_point_ref1 = intersections.int_points1_sorted[i];
            int_point_ref2 = intersections.int_points2[int_point_ref1.id];

            for (let j=i+1; j < intersections.int_points1_sorted.length; j++) {
                int_point_cur1 = intersections.int_points1_sorted[j];
                if (!EQ(int_point_cur1.arc_length, int_point_ref1.arc_length)) {
                    break;
                }
                if (int_point_cur1.id === -1)
                    continue;
                int_point_cur2 = intersections.int_points2[int_point_cur1.id];
                if (int_point_cur2.id === -1)
                    continue;
                if (int_point_cur1.edge_before === int_point_ref1.edge_before &&
                    int_point_cur1.edge_after === int_point_ref1.edge_after &&
                    int_point_cur2.edge_before === int_point_ref2.edge_before &&
                    int_point_cur2.edge_after === int_point_ref2.edge_after) {
                    int_point_cur1.id = -1;
                    /* to be deleted */
                    int_point_cur2.id = -1;
                    /* to be deleted */
                    do_squeeze = true;
                }
            }
        }

        int_point_ref2 = intersections.int_points2_sorted[0];
        int_point_ref1 = intersections.int_points1[int_point_ref2.id];
        for (let i = 1; i < intersections.int_points2_sorted.length; i++) {
            let int_point_cur2 = intersections.int_points2_sorted[i];

            if (int_point_cur2.id == -1) continue;
            /* already deleted */

            if (int_point_ref2.id == -1 || /* can't be reference if already deleted */
                !(EQ(int_point_cur2.arc_length, int_point_ref2.arc_length))) {
                int_point_ref2 = int_point_cur2;
                int_point_ref1 = intersections.int_points1[int_point_ref2.id];
                continue;
            }

            let int_point_cur1 = intersections.int_points1[int_point_cur2.id];
            if (int_point_cur1.edge_before === int_point_ref1.edge_before &&
                int_point_cur1.edge_after === int_point_ref1.edge_after &&
                int_point_cur2.edge_before === int_point_ref2.edge_before &&
                int_point_cur2.edge_after === int_point_ref2.edge_after) {
                int_point_cur1.id = -1;
                /* to be deleted */
                int_point_cur2.id = -1;
                /* to be deleted */
                do_squeeze = true;
            }
        }

        if (do_squeeze) {
            intersections.int_points1 = intersections.int_points1.filter((int_point) => int_point.id >= 0);
            intersections.int_points2 = intersections.int_points2.filter((int_point) => int_point.id >= 0);

            // update id's
            intersections.int_points1.forEach((int_point, index) => int_point.id = index);
            intersections.int_points2.forEach((int_point, index) => int_point.id = index);

            // re-create sorted
            intersections.int_points1_sorted = [];
            intersections.int_points2_sorted = [];
            sortIntersections(intersections);
        }
    }

    function getNotIntersectedFaces(poly, int_points)
    {
        let notIntersected = [];
        for (let face of poly.faces) {
            if (!int_points.find((ip) => ip.face === face)) {
                notIntersected.push(face);
            }
        }
        return notIntersected;
    }

    function calcInclusionForNotIntersectedFaces(notIntersectedFaces, poly2)
    {
        for (let face of notIntersectedFaces) {
            face.first.bv = face.first.bvStart = face.first.bvEnd = undefined;
            face.first.setInclusion(poly2);
        }
    }

    function initializeInclusionFlags(int_points)
    {
        for (let int_point of int_points) {
            int_point.edge_before.bvStart = undefined;
            int_point.edge_before.bvEnd = undefined;
            int_point.edge_before.bv = undefined;
            int_point.edge_before.overlap = undefined;

            int_point.edge_after.bvStart = undefined;
            int_point.edge_after.bvEnd = undefined;
            int_point.edge_after.bv = undefined;
            int_point.edge_after.overlap = undefined;
        }

        for (let int_point of int_points) {
            int_point.edge_before.bvEnd = BOUNDARY$1;
            int_point.edge_after.bvStart = BOUNDARY$1;
        }
    }

    function calculateInclusionFlags(int_points, polygon)
    {
        for (let int_point of int_points) {
            int_point.edge_before.setInclusion(polygon);
            int_point.edge_after.setInclusion(polygon);
        }
    }

    function fixBoundaryConflicts(poly1, poly2, int_points1, int_points1_sorted, int_points2, intersections )
    {
        let cur_face;
        let first_int_point_in_face_id;
        let next_int_point1;
        let num_int_points = int_points1_sorted.length;
        let iterate_more = false;

        for (let i = 0; i < num_int_points; i++) {
            let cur_int_point1 = int_points1_sorted[i];

            // Find boundary chain in the polygon1
            if (cur_int_point1.face !== cur_face) {                               // next chain started
                first_int_point_in_face_id = i; // cur_int_point1;
                cur_face = cur_int_point1.face;
            }

            // Skip duplicated points with same <x,y> in "cur_int_point1" pool
            let int_points_cur_pool_start = i;
            let int_points_cur_pool_num = intPointsPoolCount(int_points1_sorted, i, cur_face);
            let next_int_point_id;
            if (int_points_cur_pool_start + int_points_cur_pool_num < num_int_points &&
                int_points1_sorted[int_points_cur_pool_start + int_points_cur_pool_num].face === cur_face) {
                next_int_point_id = int_points_cur_pool_start + int_points_cur_pool_num;
            } else {                                         // get first point from the same face
                next_int_point_id = first_int_point_in_face_id;
            }

            // From all points with same ,x,y. in 'next_int_point1' pool choose one that
            // has same face both in res_poly and in wrk_poly
            let int_points_next_pool_num = intPointsPoolCount(int_points1_sorted, next_int_point_id, cur_face);
            next_int_point1 = null;
            for (let j=next_int_point_id; j < next_int_point_id + int_points_next_pool_num; j++) {
                let next_int_point1_tmp = int_points1_sorted[j];
                if (next_int_point1_tmp.face === cur_face &&
                    int_points2[next_int_point1_tmp.id].face === int_points2[cur_int_point1.id].face) {
                    next_int_point1 = next_int_point1_tmp;
                    break;
                }
            }
            if (next_int_point1 === null)
                continue;

            let edge_from1 = cur_int_point1.edge_after;
            let edge_to1 = next_int_point1.edge_before;

            // Case #1. One of the ends is not boundary - probably tiny edge wrongly marked as boundary
            if (edge_from1.bv === BOUNDARY$1 && edge_to1.bv != BOUNDARY$1) {
                edge_from1.bv = edge_to1.bv;
                continue;
            }

            if (edge_from1.bv != BOUNDARY$1 && edge_to1.bv === BOUNDARY$1) {
                edge_to1.bv = edge_from1.bv;
                continue;
            }

            // Set up all boundary values for middle edges. Need for cases 2 and 3
            if ( (edge_from1.bv === BOUNDARY$1 && edge_to1.bv === BOUNDARY$1 && edge_from1 != edge_to1) ||
            (edge_from1.bv === INSIDE$1 && edge_to1.bv === OUTSIDE$1  || edge_from1.bv === OUTSIDE$1 && edge_to1.bv === INSIDE$1 ) ) {
                let edge_tmp = edge_from1.next;
                while (edge_tmp != edge_to1) {
                    edge_tmp.bvStart = undefined;
                    edge_tmp.bvEnd = undefined;
                    edge_tmp.bv = undefined;
                    edge_tmp.setInclusion(poly2);
                    edge_tmp = edge_tmp.next;
                }
            }

            // Case #2. Both of the ends boundary. Check all the edges in the middle
            // If some edges in the middle are not boundary then update bv of 'from' and 'to' edges
            if (edge_from1.bv === BOUNDARY$1 && edge_to1.bv === BOUNDARY$1 && edge_from1 != edge_to1) {
                let edge_tmp = edge_from1.next;
                let new_bv;
                while (edge_tmp != edge_to1) {
                    if (edge_tmp.bv != BOUNDARY$1) {
                        if (new_bv === undefined) {        // first not boundary edge between from and to
                            new_bv = edge_tmp.bv;
                        }
                        else {                            // another not boundary edge between from and to
                            if (edge_tmp.bv != new_bv) {  // and it has different bv - can't resolve conflict
                                throw Flatten.Errors.UNRESOLVED_BOUNDARY_CONFLICT;
                            }
                        }
                    }
                    edge_tmp = edge_tmp.next;
                }

                if (new_bv != undefined) {
                    edge_from1.bv = new_bv;
                    edge_to1.bv = new_bv;
                }
                continue;         // all middle edges are boundary, proceed with this
            }

            // Case 3. One of the ends is inner, another is outer
            if (edge_from1.bv === INSIDE$1 && edge_to1.bv === OUTSIDE$1  || edge_from1.bv === OUTSIDE$1 && edge_to1.bv === INSIDE$1 ) {
                let edge_tmp = edge_from1;
                // Find missing intersection point
                while (edge_tmp != edge_to1) {
                    if (edge_tmp.bvStart === edge_from1.bv && edge_tmp.bvEnd === edge_to1.bv) {
                        let [dist, segment] = edge_tmp.shape.distanceTo(poly2);
                        if (dist < 10*Flatten.DP_TOL) {  // it should be very close
                            // let pt = edge_tmp.end;
                            // add to the list of intersections of poly1
                            addToIntPoints(edge_tmp, segment.ps, int_points1);

                            // split edge_tmp in poly1 if need
                            let int_point1 = int_points1[int_points1.length-1];
                            if (int_point1.is_vertex & START_VERTEX) {        // nothing to split
                                int_point1.edge_after = edge_tmp;
                                int_point1.edge_before = edge_tmp.prev;
                                edge_tmp.bvStart = BOUNDARY$1;
                                edge_tmp.bv = undefined;
                                edge_tmp.setInclusion(poly2);
                            }
                            else if (int_point1.is_vertex & END_VERTEX) {    // nothing to split
                                int_point1.edge_after = edge_tmp.next;
                                edge_tmp.bvEnd = BOUNDARY$1;
                                edge_tmp.bv = undefined;
                                edge_tmp.setInclusion(poly2);
                            }
                            else {        // split edge here
                                let newEdge1 = poly2.addVertex(int_point1.pt, edge_tmp);
                                int_point1.edge_before = newEdge1;
                                int_point1.edge_after = newEdge1.next;

                                newEdge1.setInclusion(poly2);

                                newEdge1.next.bvStart = BOUNDARY$1;
                                newEdge1.next.bvEnd = undefined;
                                newEdge1.next.bv = undefined;
                                newEdge1.next.setInclusion(poly2);
                            }

                            // add to the list of intersections of poly2
                            let edge2 = poly2.findEdgeByPoint(segment.pe);
                            addToIntPoints(edge2, segment.pe, int_points2);
                            // split edge2 in poly2 if need
                            let int_point2 = int_points2[int_points2.length-1];
                            if (int_point2.is_vertex & START_VERTEX) {        // nothing to split
                                int_point2.edge_after = edge2;
                                int_point2.edge_before = edge2.prev;
                            }
                            else if (int_point2.is_vertex & END_VERTEX) {    // nothing to split
                                int_point2.edge_after = edge2.next;
                            }
                            else {        // split edge here
                                // first locate int_points that may refer to edge2 as edge.after
                                // let int_point2_edge_before = int_points2.find( int_point => int_point.edge_before === edge2)
                                let int_point2_edge_after = int_points2.find( int_point => int_point.edge_after === edge2 );

                                let newEdge2 = poly2.addVertex(int_point2.pt, edge2);
                                int_point2.edge_before = newEdge2;
                                int_point2.edge_after = newEdge2.next;

                                if (int_point2_edge_after)
                                    int_point2_edge_after.edge_after = newEdge2;

                                newEdge2.bvStart = undefined;
                                newEdge2.bvEnd = BOUNDARY$1;
                                newEdge2.bv = undefined;
                                newEdge2.setInclusion(poly1);

                                newEdge2.next.bvStart = BOUNDARY$1;
                                newEdge2.next.bvEnd = undefined;
                                newEdge2.next.bv = undefined;
                                newEdge2.next.setInclusion(poly1);
                            }

                            sortIntersections(intersections);

                            iterate_more = true;
                            break;
                        }
                    }
                    edge_tmp = edge_tmp.next;
                }

                // we changed intersections inside loop, have to exit and repair again
                if (iterate_more)
                    break;

                throw Flatten.Errors.UNRESOLVED_BOUNDARY_CONFLICT;
            }
        }

        return iterate_more;
    }

    function setOverlappingFlags(intersections)
    {
        let cur_face = undefined;
        let first_int_point_in_face_id = undefined;
        let next_int_point1 = undefined;
        let num_int_points = intersections.int_points1.length;

        for (let i = 0; i < num_int_points; i++) {
            let cur_int_point1 = intersections.int_points1_sorted[i];

            // Find boundary chain in the polygon1
            if (cur_int_point1.face !== cur_face) {                               // next chain started
                first_int_point_in_face_id = i; // cur_int_point1;
                cur_face = cur_int_point1.face;
            }

            // Skip duplicated points with same <x,y> in "cur_int_point1" pool
            let int_points_cur_pool_start = i;
            let int_points_cur_pool_num = intPointsPoolCount(intersections.int_points1_sorted, i, cur_face);
            let next_int_point_id;
            if (int_points_cur_pool_start + int_points_cur_pool_num < num_int_points &&
                intersections.int_points1_sorted[int_points_cur_pool_start + int_points_cur_pool_num].face === cur_face) {
                next_int_point_id = int_points_cur_pool_start + int_points_cur_pool_num;
            } else {                                         // get first point from the same face
                next_int_point_id = first_int_point_in_face_id;
            }

            // From all points with same ,x,y. in 'next_int_point1' pool choose one that
            // has same face both in res_poly and in wrk_poly
            let int_points_next_pool_num = intPointsPoolCount(intersections.int_points1_sorted, next_int_point_id, cur_face);
            next_int_point1 = null;
            for (let j=next_int_point_id; j < next_int_point_id + int_points_next_pool_num; j++) {
                let next_int_point1_tmp = intersections.int_points1_sorted[j];
                if (next_int_point1_tmp.face === cur_face &&
                    intersections.int_points2[next_int_point1_tmp.id].face === intersections.int_points2[cur_int_point1.id].face) {
                    next_int_point1 = next_int_point1_tmp;
                    break;
                }
            }
            if (next_int_point1 === null)
                continue;

            let edge_from1 = cur_int_point1.edge_after;
            let edge_to1 = next_int_point1.edge_before;

            if (!(edge_from1.bv === BOUNDARY$1 && edge_to1.bv === BOUNDARY$1))      // not a boundary chain - skip
                continue;

            if (edge_from1 !== edge_to1)                    //  one edge chain    TODO: support complex case
                continue;

            /* Find boundary chain in polygon2 between same intersection points */
            let cur_int_point2 = intersections.int_points2[cur_int_point1.id];
            let next_int_point2 = intersections.int_points2[next_int_point1.id];

            let edge_from2 = cur_int_point2.edge_after;
            let edge_to2 = next_int_point2.edge_before;

            /* if [edge_from2..edge_to2] is not a boundary chain, invert it */
            /* check also that chain consist of one or two edges */
            if (!(edge_from2.bv === BOUNDARY$1 && edge_to2.bv === BOUNDARY$1 && edge_from2 === edge_to2)) {
                cur_int_point2 = intersections.int_points2[next_int_point1.id];
                next_int_point2 = intersections.int_points2[cur_int_point1.id];

                edge_from2 = cur_int_point2.edge_after;
                edge_to2 = next_int_point2.edge_before;
            }

            if (!(edge_from2.bv === BOUNDARY$1 && edge_to2.bv === BOUNDARY$1 && edge_from2 === edge_to2))
                continue;                           // not an overlapping chain - skip   TODO: fix boundary conflict

            // Set overlapping flag - one-to-one case
            edge_from1.setOverlap(edge_from2);
        }
    }

    function removeNotRelevantChains(polygon, op, int_points, is_res_polygon)
    {
        if (!int_points) return;
        let cur_face = undefined;
        let first_int_point_in_face_num = undefined;
        let int_point_current;
        let int_point_next;

        for (let i = 0; i < int_points.length; i++) {
            int_point_current = int_points[i];

            if (int_point_current.face !== cur_face) {   // next face started
                first_int_point_in_face_num = i;
                cur_face = int_point_current.face;
            }

            if (cur_face.isEmpty())                // ??
                continue;

            // Get next int point from the same face that current

            // Count how many duplicated points with same <x,y> in "points from" pool ?
            let int_points_from_pull_start = i;
            let int_points_from_pull_num = intPointsPoolCount(int_points, i, cur_face);
            let next_int_point_num;
            if (int_points_from_pull_start + int_points_from_pull_num < int_points.length &&
                int_points[int_points_from_pull_start + int_points_from_pull_num].face === int_point_current.face) {
                next_int_point_num = int_points_from_pull_start + int_points_from_pull_num;
            } else {                                         // get first point from the same face
                next_int_point_num = first_int_point_in_face_num;
            }
            int_point_next = int_points[next_int_point_num];

            /* Count how many duplicated points with same <x,y> in "points to" pull ? */
            let int_points_to_pull_start = next_int_point_num;
            let int_points_to_pull_num = intPointsPoolCount(int_points, int_points_to_pull_start, cur_face);


            let edge_from = int_point_current.edge_after;
            let edge_to = int_point_next.edge_before;

            if ((edge_from.bv === INSIDE$1 && edge_to.bv === INSIDE$1 && op === BOOLEAN_UNION) ||
                (edge_from.bv === OUTSIDE$1 && edge_to.bv === OUTSIDE$1 && op === BOOLEAN_INTERSECT) ||
                ((edge_from.bv === OUTSIDE$1 || edge_to.bv === OUTSIDE$1) && op === BOOLEAN_SUBTRACT && !is_res_polygon) ||
                ((edge_from.bv === INSIDE$1 || edge_to.bv === INSIDE$1) && op === BOOLEAN_SUBTRACT && is_res_polygon) ||
                (edge_from.bv === BOUNDARY$1 && edge_to.bv === BOUNDARY$1 && (edge_from.overlap & OVERLAP_SAME$1) && is_res_polygon) ||
                (edge_from.bv === BOUNDARY$1 && edge_to.bv === BOUNDARY$1 && (edge_from.overlap & OVERLAP_OPPOSITE$1))) {

                polygon.removeChain(cur_face, edge_from, edge_to);

                /* update all points in "points from" pull */
                for (let k = int_points_from_pull_start; k < int_points_from_pull_start + int_points_from_pull_num; k++) {
                    int_point_current.edge_after = undefined;
                }

                /* update all points in "points to" pull */
                for (let k = int_points_to_pull_start; k < int_points_to_pull_start + int_points_to_pull_num; k++) {
                    int_point_next.edge_before = undefined;
                }
            }

            /* skip to the last point in "points from" group */
            i += int_points_from_pull_num - 1;
        }
    }
    function intPointsPoolCount(int_points, cur_int_point_num, cur_face)
    {
        let int_point_current;
        let int_point_next;

        let int_points_pool_num = 1;

        if (int_points.length == 1) return 1;

        int_point_current = int_points[cur_int_point_num];

        for (let i = cur_int_point_num + 1; i < int_points.length; i++) {
            if (int_point_current.face != cur_face) {      /* next face started */
                break;
            }

            int_point_next = int_points[i];

            if (!(int_point_next.pt.equalTo(int_point_current.pt) &&
                int_point_next.edge_before === int_point_current.edge_before &&
                int_point_next.edge_after === int_point_current.edge_after)) {
                break;         /* next point is different - break and exit */
            }

            int_points_pool_num++;     /* duplicated intersection point - increase counter */
        }
        return int_points_pool_num;
    }

    function copyWrkToRes(res_polygon, wrk_polygon, op, int_points)
    {
        for (let face of wrk_polygon.faces) {
            for (let edge of face) {
                res_polygon.edges.add(edge);
            }
            // If union - add face from wrk_polygon that is not intersected with res_polygon
            if ( /*(op === BOOLEAN_UNION || op == BOOLEAN_SUBTRACT) &&*/
                int_points.find((ip) => (ip.face === face)) === undefined) {
                res_polygon.addFace(face.first, face.last);
            }
        }
    }

    function swapLinks(res_polygon, wrk_polygon, intersections)
    {
        if (intersections.int_points1.length === 0) return;

        for (let i = 0; i < intersections.int_points1.length; i++) {
            let int_point1 = intersections.int_points1[i];
            let int_point2 = intersections.int_points2[i];

            // Simple case - find continuation on the other polygon

            // Process edge from res_polygon
            if (int_point1.edge_before !== undefined && int_point1.edge_after === undefined) {    // swap need
                if (int_point2.edge_before === undefined && int_point2.edge_after !== undefined) {  // simple case
                    // Connect edges
                    int_point1.edge_before.next = int_point2.edge_after;
                    int_point2.edge_after.prev = int_point1.edge_before;

                    // Fill in missed links in intersection points
                    int_point1.edge_after = int_point2.edge_after;
                    int_point2.edge_before = int_point1.edge_before;
                }
            }
            // Process edge from wrk_polygon
            if (int_point2.edge_before !== undefined && int_point2.edge_after === undefined) {    // swap need
                if (int_point1.edge_before === undefined && int_point1.edge_after !== undefined) {  // simple case
                    // Connect edges
                    int_point2.edge_before.next = int_point1.edge_after;
                    int_point1.edge_after.prev = int_point2.edge_before;

                    // Complete missed links
                    int_point2.edge_after = int_point1.edge_after;
                    int_point1.edge_before = int_point2.edge_before;
                }
            }

            // Continuation not found - complex case
            // Continuation will be found on the same polygon.
            // It happens when intersection point is actually touching point
            // Polygon1
            if (int_point1.edge_before !== undefined && int_point1.edge_after === undefined) {    // still swap need
                for (let int_point of intersections.int_points1_sorted) {
                    if (int_point === int_point1) continue;     // skip same
                    if (int_point.edge_before === undefined && int_point.edge_after !== undefined) {
                        if (int_point.pt.equalTo(int_point1.pt)) {
                            // Connect edges
                            int_point1.edge_before.next = int_point.edge_after;
                            int_point.edge_after.prev = int_point1.edge_before;

                            // Complete missed links
                            int_point1.edge_after = int_point.edge_after;
                            int_point.edge_before = int_point1.edge_before;
                        }
                    }
                }
            }
            // Polygon2
            if (int_point2.edge_before !== undefined && int_point2.edge_after === undefined) {    // still swap need
                for (let int_point of intersections.int_points2_sorted) {
                    if (int_point === int_point2) continue;     // skip same
                    if (int_point.edge_before === undefined && int_point.edge_after !== undefined) {
                        if (int_point.pt.equalTo(int_point2.pt)) {
                            // Connect edges
                            int_point2.edge_before.next = int_point.edge_after;
                            int_point.edge_after.prev = int_point2.edge_before;

                            // Complete missed links
                            int_point2.edge_after = int_point.edge_after;
                            int_point.edge_before = int_point2.edge_before;
                        }
                    }
                }
            }
        }
        // Sanity check that no dead ends left
    }

    function removeOldFaces(polygon, int_points)
    {
        for (let int_point of int_points) {
            polygon.faces.delete(int_point.face);
            int_point.face = undefined;
            if (int_point.edge_before)
                int_point.edge_before.face = undefined;
            if (int_point.edge_after)
                int_point.edge_after.face = undefined;
        }
    }

    function restoreFaces(polygon, int_points, other_int_points)
    {
        // For each intersection point - create new face
        for (let int_point of int_points) {
            if (int_point.edge_before === undefined || int_point.edge_after === undefined)  // completely deleted
                continue;
            if (int_point.face)            // already restored
                continue;

            if (int_point.edge_after.face || int_point.edge_before.face)        // Face already created. Possible case in duplicated intersection points
                continue;

            let first = int_point.edge_after;      // face start
            let last = int_point.edge_before;      // face end;

            LinkedList.testInfiniteLoop(first);    // check and throw error if infinite loop found

            let face = polygon.addFace(first, last);

            // Mark intersection points from the newly create face
            // to avoid multiple creation of the same face
            // Face was assigned to each edge of new face in addFace function
            for (let int_point_tmp of int_points) {
                if (int_point_tmp.edge_before && int_point_tmp.edge_after &&
                    int_point_tmp.edge_before.face === face && int_point_tmp.edge_after.face === face) {
                    int_point_tmp.face = face;
                }
            }
            // Mark other intersection points as well
            for (let int_point_tmp of other_int_points) {
                if (int_point_tmp.edge_before && int_point_tmp.edge_after &&
                    int_point_tmp.edge_before.face === face && int_point_tmp.edge_after.face === face) {
                    int_point_tmp.face = face;
                }
            }
        }
    }

    function removeNotRelevantNotIntersectedFaces(polygon, notIntersectedFaces, op, is_res_polygon)
    {
        for (let face of notIntersectedFaces) {
            let rel = face.first.bv;
            if (op === BOOLEAN_UNION && rel === INSIDE$1 ||
                op === BOOLEAN_SUBTRACT && rel === INSIDE$1 && is_res_polygon ||
                op === BOOLEAN_SUBTRACT && rel === OUTSIDE$1 && !is_res_polygon ||
                op === BOOLEAN_INTERSECT && rel === OUTSIDE$1) {

                polygon.deleteFace(face);
            }
        }
    }

    var BooleanOperations = /*#__PURE__*/Object.freeze({
        BOOLEAN_UNION: BOOLEAN_UNION,
        BOOLEAN_INTERSECT: BOOLEAN_INTERSECT,
        BOOLEAN_SUBTRACT: BOOLEAN_SUBTRACT,
        unify: unify,
        subtract: subtract,
        intersect: intersect,
        innerClip: innerClip,
        outerClip: outerClip,
        calculateIntersections: calculateIntersections,
        addToIntPoints: addToIntPoints,
        getSortedArray: getSortedArray,
        splitByIntersections: splitByIntersections,
        filterDuplicatedIntersections: filterDuplicatedIntersections,
        removeNotRelevantChains: removeNotRelevantChains,
        removeOldFaces: removeOldFaces,
        restoreFaces: restoreFaces
    });

    /*
        Dimensionally extended 9-intersected model
        See https://en.wikipedia.org/wiki/DE-9IM for more details
     */
    // const DISJOINT = RegExp('FF.FF....');
    const EQUAL = RegExp('T.F..FFF.|T.F...F..');
    const INTERSECT = RegExp('T........|.T.......|...T.....|....T....');
    const TOUCH = RegExp('FT.......|F..T.....|F...T....');
    const INSIDE$2 = RegExp('T.F..F...');
    const COVERED = RegExp('T.F..F...|.TF..F...|..FT.F...|..F.TF...');

    class DE9IM {
        /**
         * Create new instance of DE9IM matrix
         */
        constructor() {
            /**
             * Array representing 3x3 intersection matrix
             * @type {Shape[]}
             */
            this.m = new Array(9).fill(undefined);
        }

        /**
         * Get Interior To Interior intersection
         * @returns {Shape[] | undefined}
         */
        get I2I() {
            return this.m[0];
        }

        /**
         * Set Interior To Interior intersection
         * @param geom
         */
        set I2I(geom) {
            this.m[0] = geom;
        }

        /**
         * Get Interior To Boundary intersection
         * @returns {Shape[] | undefined}
         */
        get I2B() {
            return this.m[1];
        }

        /**
         * Set Interior to Boundary intersection
         * @param geomc
         */
        set I2B(geom) {
            this.m[1] = geom;
        }

        /**
         * Get Interior To Exterior intersection
         * @returns {Shape[] | undefined}
         */
        get I2E() {
            return this.m[2];
        }

        /**
         * Set Interior to Exterior intersection
         * @param geom
         */
        set I2E(geom) {
            this.m[2] = geom;
        }

        /**
         * Get Boundary To Interior intersection
         * @returns {Shape[] | undefined}
         */
        get B2I() {
            return this.m[3];
        }

        /**
         * Set Boundary to Interior intersection
         * @param geom
         */
        set B2I(geom) {
            this.m[3] = geom;
        }

        /**
         * Get Boundary To Boundary intersection
         * @returns {Shape[] | undefined}
         */
        get B2B() {
            return this.m[4];
        }

        /**
         * Set Boundary to Boundary intersection
         * @param geom
         */
        set B2B(geom) {
            this.m[4] = geom;
        }

        /**
         * Get Boundary To Exterior intersection
         * @returns {Shape[] | undefined}
         */
        get B2E() {
            return this.m[5];
        }

        /**
         * Set Boundary to Exterior intersection
         * @param geom
         */
        set B2E(geom) {
            this.m[5] = geom;
        }

        /**
         * Get Exterior To Interior intersection
         * @returns {Shape[] | undefined}
         */
        get E2I() {
            return this.m[6];
        }

        /**
         * Set Exterior to Interior intersection
         * @param geom
         */
        set E2I(geom) {
            this.m[6] = geom;
        }

        /**
         * Get Exterior To Boundary intersection
         * @returns {Shape[] | undefined}
         */
        get E2B() {
            return this.m[7];
        }

        /**
         * Set Exterior to Boundary intersection
         * @param geom
         */
        set E2B(geom) {
            this.m[7] = geom;
        }

        /**
         * Get Exterior to Exterior intersection
         * @returns {Shape[] | undefined}
         */
        get E2E() {
            return this.m[8];
        }

        /**
         * Set Exterior to Exterior intersection
         * @param geom
         */
        set E2E(geom) {
            this.m[8] = geom;
        }

        /**
         * Return de9im matrix as string where<br/>
         * - intersection is 'T'<br/>
         * - not intersected is 'F'<br/>
         * - not relevant is '*'<br/>
         * For example, string 'FF**FF****' means 'DISJOINT'
         * @returns {string}
         */
        toString() {
            return this.m.map( e => {
                if (e instanceof Array && e.length > 0) {
                    return 'T'
                }
                else if (e instanceof Array && e.length === 0) {
                    return 'F'
                }
                else {
                    return '*'
                }
            }).join("")
        }

        equal() {
            return EQUAL.test(this.toString());
        }

        intersect() {
            return INTERSECT.test(this.toString());
        }

        touch() {
            return TOUCH.test(this.toString());
        }

        inside() {
            return INSIDE$2.test(this.toString());
        }

        covered() {
            return COVERED.test(this.toString());
        }
    }

    /**
     * Intersection
     *
     * */

    function intersectLine2Line(line1, line2) {
        let ip = [];

        let [A1, B1, C1] = line1.standard;
        let [A2, B2, C2] = line2.standard;

        /* Cramer's rule */
        let det = A1 * B2 - B1 * A2;
        let detX = C1 * B2 - B1 * C2;
        let detY = A1 * C2 - C1 * A2;

        if (!Flatten.Utils.EQ_0(det)) {
            let x, y;

            if (B1 === 0) {        // vertical line x  = C1/A1, where A1 == +1 or -1
                x = C1/A1;
                y = detY / det;
            }
            else if (B2 === 0) {   // vertical line x = C2/A2, where A2 = +1 or -1
                x = C2/A2;
                y = detY / det;
            }
            else if (A1 === 0) {   // horizontal line y = C1/B1, where B1 = +1 or -1
                x = detX / det;
                y = C1/B1;
            }
            else if (A2 === 0) {   // horizontal line y = C2/B2, where B2 = +1 or -1
                x = detX / det;
                y = C2/B2;
            }
            else {
                x = detX / det;
                y = detY / det;
            }

            ip.push(new Flatten.Point(x, y));
        }

        return ip;
    }

    function intersectLine2Circle(line, circle) {
        let ip = [];
        let prj = circle.pc.projectionOn(line);            // projection of circle center on line
        let dist = circle.pc.distanceTo(prj)[0];           // distance from circle center to projection

        if (Flatten.Utils.EQ(dist, circle.r)) {            // line tangent to circle - return single intersection point
            ip.push(prj);
        } else if (Flatten.Utils.LT(dist, circle.r)) {       // return two intersection points
            let delta = Math.sqrt(circle.r * circle.r - dist * dist);
            let v_trans, pt;

            v_trans = line.norm.rotate90CCW().multiply(delta);
            pt = prj.translate(v_trans);
            ip.push(pt);

            v_trans = line.norm.rotate90CW().multiply(delta);
            pt = prj.translate(v_trans);
            ip.push(pt);
        }
        return ip;
    }

    function intersectLine2Box(line, box) {
        let ips = [];
        for (let seg of box.toSegments()) {
            let ips_tmp = intersectSegment2Line(seg, line);
            for (let pt of ips_tmp) {
                if (!ptInIntPoints(pt, ips)) {
                    ips.push(pt);
                }
            }
        }
        return ips;
    }

    function intersectLine2Arc(line, arc) {
        let ip = [];

        if (intersectLine2Box(line, arc.box).length === 0) {
            return ip;
        }

        let circle = new Flatten.Circle(arc.pc, arc.r);
        let ip_tmp = intersectLine2Circle(line, circle);
        for (let pt of ip_tmp) {
            if (pt.on(arc)) {
                ip.push(pt);
            }
        }

        return ip;
    }

    function intersectSegment2Line(seg, line) {
        let ip = [];

        // Boundary cases
        if (seg.ps.on(line)) {
            ip.push(seg.ps);
        }
        // If both ends lay on line, return two intersection points
        if (seg.pe.on(line) && !seg.isZeroLength()) {
            ip.push(seg.pe);
        }

        if (ip.length > 0) {
            return ip;          // done, intersection found
        }

        // If zero-length segment and nothing found, return no intersections
        if (seg.isZeroLength()) {
            return ip;
        }

        // Not a boundary case, check if both points are on the same side and
        // hence there is no intersection
        if (seg.ps.leftTo(line) && seg.pe.leftTo(line) ||
            !seg.ps.leftTo(line) && !seg.pe.leftTo(line)) {
            return ip;
        }

        // Calculate intersection between lines
        let line1 = new Flatten.Line(seg.ps, seg.pe);
        return intersectLine2Line(line1, line);
    }

    function intersectSegment2Segment(seg1, seg2) {
        let ip = [];

        // quick reject
        if (seg1.box.not_intersect(seg2.box)) {
            return ip;
        }

        // Special case of seg1 zero length
        if (seg1.isZeroLength()) {
            if (seg1.ps.on(seg2)) {
                ip.push(seg1.ps);
            }
            return ip;
        }

        // Special case of seg2 zero length
        if (seg2.isZeroLength()) {
            if (seg2.ps.on(seg1)) {
                ip.push(seg2.ps);
            }
            return ip;
        }

        // Neither seg1 nor seg2 is zero length
        let line1 = new Flatten.Line(seg1.ps, seg1.pe);
        let line2 = new Flatten.Line(seg2.ps, seg2.pe);

        // Check overlapping between segments in case of incidence
        // If segments touching, add one point. If overlapping, add two points
        if (line1.incidentTo(line2)) {
            if (seg1.ps.on(seg2)) {
                ip.push(seg1.ps);
            }
            if (seg1.pe.on(seg2)) {
                ip.push(seg1.pe);
            }
            if (seg2.ps.on(seg1) && !seg2.ps.equalTo(seg1.ps) && !seg2.ps.equalTo(seg1.pe)) {
                ip.push(seg2.ps);
            }
            if (seg2.pe.on(seg1) && !seg2.pe.equalTo(seg1.ps) && !seg2.pe.equalTo(seg1.pe)) {
                ip.push(seg2.pe);
            }
        } else {                /* not incident - parallel or intersect */
            // Calculate intersection between lines
            let new_ip = intersectLine2Line(line1, line2);
            if (new_ip.length > 0 && new_ip[0].on(seg1) && new_ip[0].on(seg2)) {
                ip.push(new_ip[0]);
            }

            // Fix missing intersection
            // const tol = 10*Flatten.DP_TOL;
            // if (ip.length === 0 && new_ip.length > 0 && (new_ip[0].distanceTo(seg1)[0] < tol || new_ip[0].distanceTo(seg2)[0] < tol) ) {
            //     if (seg1.start.distanceTo(seg2)[0] < tol) {
            //         ip.push(new_ip[0]);
            //     }
            //     else if (seg1.end.distanceTo(seg2)[0] < tol) {
            //         ip.push(new_ip[0]);
            //     }
            //     else if (seg2.start.distanceTo(seg1)[0] < tol) {
            //         ip.push(new_ip[0]);
            //     }
            //     else if (seg2.end.distanceTo(seg1)[0] < tol) {
            //         ip.push(new_ip[0]);
            //     }
            // }
        }

        return ip;
    }

    function intersectSegment2Circle(segment, circle) {
        let ips = [];

        if (segment.box.not_intersect(circle.box)) {
            return ips;
        }

        // Special case of zero length segment
        if (segment.isZeroLength()) {
            let [dist, shortest_segment] = segment.ps.distanceTo(circle.pc);
            if (Flatten.Utils.EQ(dist, circle.r)) {
                ips.push(segment.ps);
            }
            return ips;
        }

        // Non zero-length segment
        let line = new Flatten.Line(segment.ps, segment.pe);

        let ips_tmp = intersectLine2Circle(line, circle);

        for (let ip of ips_tmp) {
            if (ip.on(segment)) {
                ips.push(ip);
            }
        }

        return ips;
    }

    function intersectSegment2Arc(segment, arc) {
        let ip = [];

        if (segment.box.not_intersect(arc.box)) {
            return ip;
        }

        // Special case of zero-length segment
        if (segment.isZeroLength()) {
            if (segment.ps.on(arc)) {
                ip.push(segment.ps);
            }
            return ip;
        }

        // Non-zero length segment
        let line = new Flatten.Line(segment.ps, segment.pe);
        let circle = new Flatten.Circle(arc.pc, arc.r);

        let ip_tmp = intersectLine2Circle(line, circle);

        for (let pt of ip_tmp) {
            if (pt.on(segment) && pt.on(arc)) {
                ip.push(pt);
            }
        }
        return ip;

    }

    function intersectSegment2Box(segment, box) {
        let ips = [];
        for (let seg of box.toSegments()) {
            let ips_tmp = intersectSegment2Segment(seg, segment);
            for (let ip of ips_tmp) {
                ips.push(ip);
            }
        }
        return ips;
    }

    function intersectCircle2Circle(circle1, circle2) {
        let ip = [];

        if (circle1.box.not_intersect(circle2.box)) {
            return ip;
        }

        let vec = new Flatten.Vector(circle1.pc, circle2.pc);

        let r1 = circle1.r;
        let r2 = circle2.r;

        // Degenerated circle
        if (Flatten.Utils.EQ_0(r1) || Flatten.Utils.EQ_0(r2))
            return ip;

        // In case of equal circles return one leftmost point
        if (Flatten.Utils.EQ_0(vec.x) && Flatten.Utils.EQ_0(vec.y) && Flatten.Utils.EQ(r1, r2)) {
            ip.push(circle1.pc.translate(-r1, 0));
            return ip;
        }

        let dist = circle1.pc.distanceTo(circle2.pc)[0];

        if (Flatten.Utils.GT(dist, r1 + r2))               // circles too far, no intersections
            return ip;

        if (Flatten.Utils.LT(dist, Math.abs(r1 - r2)))     // one circle is contained within another, no intersections
            return ip;

        // Normalize vector.
        vec.x /= dist;
        vec.y /= dist;

        let pt;

        // Case of touching from outside or from inside - single intersection point
        // TODO: check this specifically not sure if correct
        if (Flatten.Utils.EQ(dist, r1 + r2) || Flatten.Utils.EQ(dist, Math.abs(r1 - r2))) {
            pt = circle1.pc.translate(r1 * vec.x, r1 * vec.y);
            ip.push(pt);
            return ip;
        }

        // Case of two intersection points

        // Distance from first center to center of common chord:
        //   a = (r1^2 - r2^2 + d^2) / 2d
        // Separate for better accuracy
        let a = (r1 * r1) / (2 * dist) - (r2 * r2) / (2 * dist) + dist / 2;

        let mid_pt = circle1.pc.translate(a * vec.x, a * vec.y);
        let h = Math.sqrt(r1 * r1 - a * a);
        // let norm;

        // norm = vec.rotate90CCW().multiply(h);
        pt = mid_pt.translate(vec.rotate90CCW().multiply(h));
        ip.push(pt);

        // norm = vec.rotate90CW();
        pt = mid_pt.translate(vec.rotate90CW().multiply(h));
        ip.push(pt);

        return ip;
    }

    function intersectCircle2Box(circle, box) {
        let ips = [];
        for (let seg of box.toSegments()) {
            let ips_tmp = intersectSegment2Circle(seg, circle);
            for (let ip of ips_tmp) {
                ips.push(ip);
            }
        }
        return ips;
    }

    function intersectArc2Arc(arc1, arc2) {
        var ip = [];

        if (arc1.box.not_intersect(arc2.box)) {
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
        let ip_tmp = circle1.intersect(circle2);
        for (let pt of ip_tmp) {
            if (pt.on(arc1) && pt.on(arc2)) {
                ip.push(pt);
            }
        }
        return ip;
    }

    function intersectArc2Circle(arc, circle) {
        let ip = [];

        if (arc.box.not_intersect(circle.box)) {
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
        let ip_tmp = intersectCircle2Circle(circle1, circle2);
        for (let pt of ip_tmp) {
            if (pt.on(arc)) {
                ip.push(pt);
            }
        }
        return ip;
    }

    function intersectArc2Box(arc, box) {
        let ips = [];
        for (let seg of box.toSegments()) {
            let ips_tmp = intersectSegment2Arc(seg, arc);
            for (let ip of ips_tmp) {
                ips.push(ip);
            }
        }
        return ips;
    }

    function intersectEdge2Segment(edge, segment) {
        return edge.isSegment() ? intersectSegment2Segment(edge.shape, segment) : intersectSegment2Arc(segment, edge.shape);
    }

    function intersectEdge2Arc(edge, arc) {
        return edge.isSegment() ? intersectSegment2Arc(edge.shape, arc) : intersectArc2Arc(edge.shape, arc);
    }

    function intersectEdge2Line(edge, line) {
        return edge.isSegment() ? intersectSegment2Line(edge.shape, line) : intersectLine2Arc(line, edge.shape);
    }

    function intersectEdge2Circle(edge, circle) {
        return edge.isSegment() ? intersectSegment2Circle(edge.shape, circle) : intersectArc2Circle(edge.shape, circle);
    }

    function intersectSegment2Polygon(segment, polygon) {
        let ip = [];

        for (let edge of polygon.edges) {
            for (let pt of intersectEdge2Segment(edge, segment)) {
                ip.push(pt);
            }
        }

        return ip;
    }

    function intersectArc2Polygon(arc, polygon) {
        let ip = [];

        for (let edge of polygon.edges) {
            for (let pt of intersectEdge2Arc(edge, arc)) {
                ip.push(pt);
            }
        }

        return ip;
    }

    function intersectLine2Polygon(line, polygon) {
        let ip = [];

        if (polygon.isEmpty()) {
            return ip;
        }

        for (let edge of polygon.edges) {
            for (let pt of intersectEdge2Line(edge, line)) {
                if (!ptInIntPoints(pt, ip)) {
                    ip.push(pt);
                }
            }
        }

        return ip;
    }

    function intersectCircle2Polygon(circle, polygon) {
        let ip = [];

        if (polygon.isEmpty()) {
            return ip;
        }

        for (let edge of polygon.edges) {
            for (let pt of intersectEdge2Circle(edge, circle)) {
                ip.push(pt);
            }
        }

        return ip;
    }

    function intersectEdge2Edge(edge1, edge2) {
        const shape1 = edge1.shape;
        const shape2 = edge2.shape;
        return edge1.isSegment() ?
            (edge2.isSegment() ? intersectSegment2Segment(shape1, shape2) : intersectSegment2Arc(shape1, shape2)) :
            (edge2.isSegment() ? intersectSegment2Arc(shape2, shape1) : intersectArc2Arc(shape1, shape2));
    }

    function intersectEdge2Polygon(edge, polygon) {
        let ip = [];

        if (polygon.isEmpty() || edge.shape.box.not_intersect(polygon.box)) {
            return ip;
        }

        let resp_edges = polygon.edges.search(edge.shape.box);

        for (let resp_edge of resp_edges) {
            for (let pt of intersectEdge2Edge(edge, resp_edge)) {
                ip.push(pt);
            }
        }

        return ip;
    }

    function intersectPolygon2Polygon(polygon1, polygon2) {
        let ip = [];

        if (polygon1.isEmpty() || polygon2.isEmpty()) {
            return ip;
        }

        if (polygon1.box.not_intersect(polygon2.box)) {
            return ip;
        }

        for (let edge1 of polygon1.edges) {
            for (let pt of intersectEdge2Polygon(edge1, polygon2)) {
                ip.push(pt);
            }
        }

        return ip;
    }

    function intersectShape2Polygon(shape, polygon) {
        if (shape instanceof Flatten.Line) {
            return intersectLine2Polygon(shape, polygon);
        }
        else if (shape instanceof Flatten.Segment) {
            return intersectSegment2Polygon(shape, polygon);
        }
        else if (shape instanceof Flatten.Arc) {
            return intersectArc2Polygon(shape, polygon);
        }
        else {
            return [];
        }
    }

    function ptInIntPoints(new_pt, ip) {
        return ip.some( pt => pt.equalTo(new_pt) )
    }

    /**
     * Class Multiline represent connected path of [edges]{@link Flatten.Edge}, where each edge may be
     * [segment]{@link Flatten.Segment}, [arc]{@link Flatten.Arc}, [line]{@link Flatten.Line} or [ray]{@link Flatten.Ray}
     */
    class Multiline extends LinkedList {
        constructor(...args) {
            super();

            if (args.length === 0) {
                return;
            }

            if (args.length == 1) {
                if (args[0] instanceof Array) {
                    let shapes = args[0];
                    if (shapes.length == 0)
                        return;

                    // TODO: more strict validation:
                    // there may be only one line
                    // only first and last may be rays
                    let validShapes = shapes.every((shape) => {
                        return shape instanceof Flatten.Segment ||
                            shape instanceof Flatten.Arc ||
                            shape instanceof Flatten.Ray ||
                            shape instanceof Flatten.Line
                    });

                    for (let shape of shapes) {
                        let edge = new Flatten.Edge(shape);
                        this.append(edge);
                    }
                }
            }
        }

        /**
         * (Getter) Return array of edges
         * @returns {Edge[]}
         */
        get edges() {
            return [...this];
        }

        /**
         * (Getter) Return bounding box of the multiline
         * @returns {Box}
         */
        get box() {
            return this.edges.reduce( (acc,edge) => acc = acc.merge(edge.box), new Flatten.Box() );
        }

        /**
         * (Getter) Returns array of vertices
         * @returns {Point[]}
         */
        get vertices() {
            let v = this.edges.map(edge => edge.start);
            v.push(this.last.end);
            return v;
        }

        /**
         * Return new cloned instance of Multiline
         * @returns {Multiline}
         */
        clone() {
            return new Multiline(this.toShapes());
        }

        /**
         * Split edge and add new vertex, return new edge inserted
         * @param {Point} pt - point on edge that will be added as new vertex
         * @param {Edge} edge - edge to split
         * @returns {Edge}
         */
        addVertex(pt, edge) {
            let shapes = edge.shape.split(pt);
            // if (shapes.length < 2) return;

            if (shapes[0] === null)   // point incident to edge start vertex, return previous edge
               return edge.prev;

            if (shapes[1] === null)   // point incident to edge end vertex, return edge itself
               return edge;

            let newEdge = new Flatten.Edge(shapes[0]);
            let edgeBefore = edge.prev;

            /* Insert first split edge into linked list after edgeBefore */
            this.insert(newEdge, edgeBefore);     // edge.face ?

            // Update edge shape with second split edge keeping links
            edge.shape = shapes[1];

            return newEdge;
        }

        /**
         * Split edges of multiline with intersection points and return mutated multiline
         * @param {Point[]} ip - array of points to be added as new vertices
         * @returns {Multiline}
         */
        split(ip) {
            for (let pt of ip) {
                let edge = this.findEdgeByPoint(pt);
                this.addVertex(pt, edge);
            }
            return this;
        }

        /**
         * Returns edge which contains given point
         * @param {Point} pt
         * @returns {Edge}
         */
        findEdgeByPoint(pt) {
            let edgeFound;
            for (let edge of this) {
                if (edge.shape.contains(pt)) {
                    edgeFound = edge;
                    break;
                }
            }
            return edgeFound;
        }

        /**
         * Returns new multiline translated by vector vec
         * @param {Vector} vec
         * @returns {Multiline}
         */
        translate(vec) {
            return new Multiline(this.edges.map( edge => edge.shape.translate(vec)));
        }

        /**
         * Return new multiline rotated by given angle around given point
         * If point omitted, rotate around origin (0,0)
         * Positive value of angle defines rotation counter clockwise, negative - clockwise
         * @param {number} angle - rotation angle in radians
         * @param {Point} center - rotation center, default is (0,0)
         * @returns {Multiline} - new rotated polygon
         */
        rotate(angle = 0, center = new Flatten.Point()) {
            return new Multiline(this.edges.map( edge => edge.shape.rotate(angle, center) ));
        }

        /**
         * Return new multiline transformed using affine transformation matrix
         * Method does not support unbounded shapes
         * @param {Matrix} matrix - affine transformation matrix
         * @returns {Multiline} - new multiline
         */
        transform(matrix = new Flatten.Matrix()) {
            return new Multiline(this.edges.map( edge => edge.shape.transform(matrix)));
        }

        /**
         * Transform multiline into array of shapes
         * @returns {Shape[]}
         */
        toShapes() {
            return this.edges.map(edge => edge.shape.clone())
        }

        /**
         * This method returns an object that defines how data will be
         * serialized when called JSON.stringify() method
         * @returns {Object}
         */
        toJSON() {
            return this.edges.map(edge => edge.toJSON());
        }

        /**
         * Return string to draw multiline in svg
         * @param attrs  - an object with attributes for svg path element,
         * like "stroke", "strokeWidth", "fill", "fillRule", "fillOpacity"
         * Defaults are stroke:"black", strokeWidth:"1", fill:"lightcyan", fillRule:"evenodd", fillOpacity: "1"
         * TODO: support infinite Ray and Line
         * @returns {string}
         */
        svg(attrs = {}) {
            let {stroke, strokeWidth, fill, fillRule, fillOpacity, id, className} = attrs;
            let id_str = (id && id.length > 0) ? `id="${id}"` : "";
            let class_str = (className && className.length > 0) ? `class="${className}"` : "";

            let svgStr = `\n<path stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "lightcyan"}" fill-rule="${fillRule || "evenodd"}" fill-opacity="${fillOpacity || 1.0}" ${id_str} ${class_str} d="`;
            svgStr += `\nM${this.first.start.x},${this.first.start.y}`;
            for (let edge of this) {
                svgStr += edge.svg();
            }
            svgStr += ` z`;
            svgStr += `" >\n</path>`;

            return svgStr;
        }
    }

    Flatten.Multiline = Multiline;

    /**
     * Shortcut function to create multiline
     * @param args
     */
    const multiline = (...args) => new Flatten.Multiline(...args);
    Flatten.multiline = multiline;

    /**
     * @module RayShoot
     */

    /**
     * Implements ray shooting algorithm. Returns relation between point and polygon: inside, outside or boundary
     * @param {Polgon} polygon - polygon to test
     * @param {Point} point - point to test
     * @returns {Flatten.Inside|Flatten.OUTSIDE|Flatten.Boundary}
     */
    function ray_shoot(polygon, point) {
        let contains = undefined;

        // if (!(polygon instanceof Polygon && point instanceof Point)) {
        //     throw Flatten.Errors.ILLEGAL_PARAMETERS;
        // }

        // 1. Quick reject
        if (polygon.box.not_intersect(point.box)) {
            return Flatten.OUTSIDE;
        }

        let ray = new Flatten.Ray(point);
        let line = new Flatten.Line(ray.pt, ray.norm);

        // 2. Locate relevant edges of the polygon
        let resp_edges = polygon.edges.search(ray.box);

        if (resp_edges.length == 0) {
            return Flatten.OUTSIDE;
        }

        // 3. Calculate intersections
        let intersections = [];
        for (let edge of resp_edges) {
            for (let ip of ray.intersect(edge.shape)) {

                // If intersection is equal to query point then point lays on boundary
                if (ip.equalTo(point)) {
                    return Flatten.BOUNDARY;
                }

                intersections.push({
                    pt: ip,
                    edge: edge
                });
            }
        }

        // 4. Sort intersection in x-ascending order
        intersections.sort((i1, i2) => {
            if (LT(i1.pt.x, i2.pt.x)) {
                return -1;
            }
            if (GT(i1.pt.x, i2.pt.x)) {
                return 1;
            }
            return 0;
        });

        // 5. Count real intersections, exclude touching
        let counter = 0;

        for (let i = 0; i < intersections.length; i++) {
            let intersection = intersections[i];
            if (intersection.pt.equalTo(intersection.edge.shape.start)) {
                /* skip same point between same edges if already counted */
                if (i > 0 && intersection.pt.equalTo(intersections[i - 1].pt) &&
                    intersection.edge.prev === intersections[i - 1].edge) {
                    continue;
                }
                let prev_edge = intersection.edge.prev;
                while (EQ_0(prev_edge.length)) {
                    prev_edge = prev_edge.prev;
                }
                let prev_tangent = prev_edge.shape.tangentInEnd();
                let prev_point = intersection.pt.translate(prev_tangent);

                let cur_tangent = intersection.edge.shape.tangentInStart();
                let cur_point = intersection.pt.translate(cur_tangent);

                let prev_on_the_left = prev_point.leftTo(line);
                let cur_on_the_left = cur_point.leftTo(line);

                if ((prev_on_the_left && !cur_on_the_left) || (!prev_on_the_left && cur_on_the_left)) {
                    counter++;
                }
            } else if (intersection.pt.equalTo(intersection.edge.shape.end)) {
                /* skip same point between same edges if already counted */
                if (i > 0 && intersection.pt.equalTo(intersections[i - 1].pt) &&
                    intersection.edge.next === intersections[i - 1].edge) {
                    continue;
                }
                let next_edge = intersection.edge.next;
                while (EQ_0(next_edge.length)) {
                    next_edge = next_edge.next;
                }
                let next_tangent = next_edge.shape.tangentInStart();
                let next_point = intersection.pt.translate(next_tangent);

                let cur_tangent = intersection.edge.shape.tangentInEnd();
                let cur_point = intersection.pt.translate(cur_tangent);

                let next_on_the_left = next_point.leftTo(line);
                let cur_on_the_left = cur_point.leftTo(line);

                if ((next_on_the_left && !cur_on_the_left) || (!next_on_the_left && cur_on_the_left)) {
                    counter++;
                }
            } else {        /* intersection point is not a coincident with a vertex */
                if (intersection.edge.shape instanceof Flatten.Segment) {
                    counter++;
                } else {
                    /* Check if ray does not touch the curve in the extremal (top or bottom) point */
                    let box = intersection.edge.shape.box;
                    if (!(EQ(intersection.pt.y, box.ymin) ||
                        EQ(intersection.pt.y, box.ymax))) {
                        counter++;
                    }
                }
            }
        }

        // 6. Odd or even?
        contains = counter % 2 == 1 ? Flatten.INSIDE : Flatten.OUTSIDE;

        return contains;
    }

    /*
        Calculate relationship between two shapes and return result in the form of
        Dimensionally Extended nine-Intersection Matrix (https://en.wikipedia.org/wiki/DE-9IM)
     */

    /**
     * Returns true if shapes are topologically equal:  their interiors intersect and
     * no part of the interior or boundary of one geometry intersects the exterior of the other
     * @param shape1
     * @param shape2
     * @returns {boolean}
     */
    function equal(shape1, shape2) {
        return relate(shape1, shape2).equal();
    }

    /**
     * Returns true if shapes have at least one point in common, same as "not disjoint"
     * @param shape1
     * @param shape2
     * @returns {boolean}
     */
    function intersect$1(shape1, shape2) {
        return relate(shape1, shape2).intersect();
    }

    /**
     * Returns true if shapes have at least one point in common, but their interiors do not intersect
     * @param shape1
     * @param shape2
     * @returns {boolean}
     */
    function touch(shape1, shape2) {
        return relate(shape1, shape2).touch();
    }

    /**
     * Returns true if shapes have no points in common neither in interior nor in boundary
     * @param shape1
     * @param shape2
     * @returns {boolean}
     */
    function disjoint(shape1, shape2) {
        return !intersect$1(shape1, shape2);
    }

    /**
     * Returns true shape1 lies in the interior of shape2
     * @param shape1
     * @param shape2
     * @returns {boolean}
     */
    function inside(shape1, shape2) {
        return relate(shape1, shape2).inside();
    }

    /**
     * Returns true if every point in shape1 lies in the interior or on the boundary of shape2
     * @param shape1
     * @param shape2
     * @returns {boolean}
     */
    function covered(shape1, shape2) {
        return  relate(shape1, shape2).covered();
    }

    /**
     * Returns true shape1's interior contains shape2 <br/>
     * Same as inside(shape2, shape1)
     * @param shape1
     * @param shape2
     * @returns {boolean}
     */
    function contain(shape1, shape2) {
        return inside(shape2, shape1);
    }

    /**
     * Returns true shape1's cover shape2, same as shape2 covered by shape1
     * @param shape1
     * @param shape2
     * @returns {boolean}
     */
    function cover(shape1, shape2) {
        return covered(shape2, shape1);
    }

    /**
     * Returns relation between two shapes as intersection 3x3 matrix, where each
     * element contains relevant intersection as array of shapes.
     * If there is no intersection, element contains empty array
     * If intersection is irrelevant it left undefined. (For example, intersection
     * between two exteriors is usually irrelevant)
     * @param shape1
     * @param shape2
     * @returns {DE9IM}
     */
    function relate(shape1, shape2) {
        if (shape1 instanceof Flatten.Line && shape2 instanceof Flatten.Line) {
            return relateLine2Line(shape1,  shape2);
        }
        else if (shape1 instanceof Flatten.Line && shape2 instanceof Flatten.Circle) {
            return relateLine2Circle(shape1, shape2);
        }
        else if (shape1 instanceof Flatten.Line && shape2 instanceof Flatten.Box) {
            return relateLine2Box(shape1, shape2);
        }
        else if ( shape1 instanceof Flatten.Line  && shape2 instanceof Flatten.Polygon) {
            return relateLine2Polygon(shape1, shape2);
        }
        else if ( (shape1 instanceof Flatten.Segment || shape1 instanceof Flatten.Arc)  && shape2 instanceof Flatten.Polygon) {
            return relateShape2Polygon(shape1, shape2);
        }
        else if ( (shape1 instanceof Flatten.Segment || shape1 instanceof Flatten.Arc)  &&
            (shape2 instanceof Flatten.Circle || shape2 instanceof Flatten.Box) ) {
            return relateShape2Polygon(shape1, new Flatten.Polygon(shape2));
        }
        else if (shape1 instanceof Flatten.Polygon && shape2 instanceof Flatten.Polygon) {
            return relatePolygon2Polygon(shape1, shape2);
        }
        else if ((shape1 instanceof Flatten.Circle || shape1 instanceof Flatten.Box) &&
            (shape2 instanceof  Flatten.Circle || shape2 instanceof Flatten.Box)) {
            return relatePolygon2Polygon(new Flatten.Polygon(shape1), new Flatten.Polygon(shape2));
        }
        else if ((shape1 instanceof Flatten.Circle || shape1 instanceof Flatten.Box) && shape2 instanceof Flatten.Polygon) {
            return relatePolygon2Polygon(new Flatten.Polygon(shape1), shape2);
        }
        else if (shape1 instanceof Flatten.Polygon && (shape2 instanceof Flatten.Circle || shape2 instanceof Flatten.Box)) {
            return relatePolygon2Polygon(shape1, new Flatten.Polygon(shape2));
        }
    }

    function relateLine2Line(line1, line2) {
        let denim = new DE9IM();
        let ip = intersectLine2Line(line1, line2);
        if (ip.length === 0) {       // parallel or equal ?
            if (line1.contains(line2.pt) && line2.contains(line1.pt)) {
                denim.I2I = [line1];   // equal  'T.F...F..'  - no boundary
                denim.I2E = [];
                denim.E2I = [];
            }
            else {                     // parallel - disjoint 'FFTFF*T**'
                denim.I2I = [];
                denim.I2E = [line1];
                denim.E2I = [line2];
            }
        }
        else {                       // intersect   'T********'
            denim.I2I = ip;
            denim.I2E = line1.split(ip);
            denim.E2I = line2.split(ip);
        }
        return denim;
    }

    function relateLine2Circle(line,circle) {
        let denim = new DE9IM();
        let ip = intersectLine2Circle(line, circle);
        if (ip.length === 0) {
            denim.I2I = [];
            denim.I2B = [];
            denim.I2E = [line];
            denim.E2I = [circle];
        }
        else if (ip.length === 1) {
            denim.I2I = [];
            denim.I2B = ip;
            denim.I2E = line.split(ip);

            denim.E2I = [circle];
        }
        else {       // ip.length == 2
            let multiline = new Multiline([line]);
            let ip_sorted = line.sortPoints(ip);
            multiline.split(ip_sorted);
            let splitShapes = multiline.toShapes();

            denim.I2I = [splitShapes[1]];
            denim.I2B = ip_sorted;
            denim.I2E = [splitShapes[0], splitShapes[2]];

            denim.E2I = new Flatten.Polygon([circle.toArc()]).cut(multiline);
        }

        return denim;
    }

    function relateLine2Box(line, box) {
        let denim = new DE9IM();
        let ip = intersectLine2Box(line, box);
        if (ip.length === 0) {
            denim.I2I = [];
            denim.I2B = [];
            denim.I2E = [line];

            denim.E2I = [box];
        }
        else if (ip.length === 1) {
            denim.I2I = [];
            denim.I2B = ip;
            denim.I2E = line.split(ip);

            denim.E2I = [box];
        }
        else {                     // ip.length == 2
            let multiline = new Multiline([line]);
            let ip_sorted = line.sortPoints(ip);
            multiline.split(ip_sorted);
            let splitShapes = multiline.toShapes();

            /* Are two intersection points on the same segment of the box boundary ? */
            if (box.toSegments().some( segment => segment.contains(ip[0]) && segment.contains(ip[1]) )) {
                denim.I2I = [];                         // case of touching
                denim.I2B = [splitShapes[1]];
                denim.I2E = [splitShapes[0], splitShapes[2]];

                denim.E2I = [box];
            }
            else {                                       // case of intersection
                denim.I2I = [splitShapes[1]];            // [segment(ip[0], ip[1])];
                denim.I2B = ip_sorted;
                denim.I2E = [splitShapes[0], splitShapes[2]];

                denim.E2I = new Flatten.Polygon(box.toSegments()).cut(multiline);
            }
        }
        return denim;
    }

    function relateLine2Polygon(line, polygon) {
        let denim = new DE9IM();
        let ip = intersectLine2Polygon(line, polygon);
        let multiline = new Multiline([line]);
        let ip_sorted = ip.length > 0 ? ip.slice() : line.sortPoints(ip);

        multiline.split(ip_sorted);

        [...multiline].forEach(edge => edge.setInclusion(polygon));

        denim.I2I = [...multiline].filter(edge => edge.bv === Flatten.INSIDE).map(edge => edge.shape);
        denim.I2B = [...multiline].slice(1).map( (edge) => edge.bv === Flatten.BOUNDARY ? edge.shape : edge.shape.start );
        denim.I2E = [...multiline].filter(edge => edge.bv === Flatten.OUTSIDE).map(edge => edge.shape);

        denim.E2I = polygon.cut(multiline);

        return denim;
    }

    function relateShape2Polygon(shape, polygon) {
        let denim = new DE9IM();
        let ip = intersectShape2Polygon(shape, polygon);
        let ip_sorted = ip.length > 0 ? ip.slice() : shape.sortPoints(ip);

        let multiline = new Multiline([shape]);
        multiline.split(ip_sorted);

        [...multiline].forEach(edge => edge.setInclusion(polygon));

        denim.I2I = [...multiline].filter(edge => edge.bv === Flatten.INSIDE).map(edge => edge.shape);
        denim.I2B = [...multiline].slice(1).map( (edge) => edge.bv === Flatten.BOUNDARY ? edge.shape : edge.shape.start );
        denim.I2E = [...multiline].filter(edge => edge.bv === Flatten.OUTSIDE).map(edge => edge.shape);


        denim.B2I = [];
        denim.B2B = [];
        denim.B2E = [];
        for (let pt of [shape.start, shape.end]) {
            switch (ray_shoot(polygon, pt)) {
                case Flatten.INSIDE:
                    denim.B2I.push(pt);
                    break;
                case Flatten.BOUNDARY:
                    denim.B2B.push(pt);
                    break;
                case Flatten.OUTSIDE:
                    denim.B2E.push(pt);
                    break;
                default:
                    break;
            }
        }

        // denim.E2I  TODO: calculate, not clear what is expected result

        return denim;
    }

    function relatePolygon2Polygon(polygon1, polygon2) {
        let denim = new DE9IM();

        let [ip_sorted1, ip_sorted2] = calculateIntersections(polygon1, polygon2);
        let boolean_intersection = intersect(polygon1, polygon2);
        let boolean_difference1 = subtract(polygon1, polygon2);
        let boolean_difference2 = subtract(polygon2, polygon1);
        let [inner_clip_shapes1, inner_clip_shapes2] = innerClip(polygon1, polygon2);
        let outer_clip_shapes1 = outerClip(polygon1, polygon2);
        let outer_clip_shapes2 = outerClip(polygon2, polygon1);

        denim.I2I = boolean_intersection.isEmpty() ? [] : [boolean_intersection];
        denim.I2B = inner_clip_shapes2;
        denim.I2E = boolean_difference1.isEmpty() ? [] : [boolean_difference1];

        denim.B2I = inner_clip_shapes1;
        denim.B2B = ip_sorted1;
        denim.B2E = outer_clip_shapes1;

        denim.E2I = boolean_difference2.isEmpty() ? [] : [boolean_difference2];
        denim.E2B = outer_clip_shapes2;
        // denim.E2E    not relevant meanwhile

        return denim;
    }

    var Relations = /*#__PURE__*/Object.freeze({
        equal: equal,
        intersect: intersect$1,
        touch: touch,
        disjoint: disjoint,
        inside: inside,
        covered: covered,
        contain: contain,
        cover: cover,
        relate: relate
    });

    /**
     * Class representing an affine transformation 3x3 matrix:
     * <pre>
     *      [ a  c  tx
     * A =    b  d  ty
     *        0  0  1  ]
     * </pre
     * @type {Matrix}
     */
    class Matrix {
        /**
         * Construct new instance of affine transformation matrix <br/>
         * If parameters omitted, construct identity matrix a = 1, d = 1
         * @param {number} a - position(0,0)   sx*cos(alpha)
         * @param {number} b - position (0,1)  sx*sin(alpha)
         * @param {number} c - position (1,0)  -sy*sin(alpha)
         * @param {number} d - position (1,1)  sy*cos(alpha)
         * @param {number} tx - position (2,0) translation by x
         * @param {number} ty - position (2,1) translation by y
         */
        constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }

        /**
         * Return new cloned instance of matrix
         * @return {Matrix}
         **/
        clone() {
            return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
        };

        /**
         * Transform vector [x,y] using transformation matrix. <br/>
         * Vector [x,y] is an abstract array[2] of numbers and not a FlattenJS object <br/>
         * The result is also an abstract vector [x',y'] = A * [x,y]:
         * <code>
         * [x'       [ ax + by + tx
         *  y'   =     cx + dy + ty
         *  1]                    1 ]
         * </code>
         * @param {number[]} vector - array[2] of numbers
         * @returns {number[]} transformation result - array[2] of numbers
         */
        transform(vector) {
            return [
                vector[0] * this.a + vector[1] * this.c + this.tx,
                vector[0] * this.b + vector[1] * this.d + this.ty
            ]
        };

        /**
         * Returns result of multiplication of this matrix by other matrix
         * @param {Matrix} other_matrix - matrix to multiply by
         * @returns {Matrix}
         */
        multiply(other_matrix) {
            return new Matrix(
                this.a * other_matrix.a + this.c * other_matrix.b,
                this.b * other_matrix.a + this.d * other_matrix.b,
                this.a * other_matrix.c + this.c * other_matrix.d,
                this.b * other_matrix.c + this.d * other_matrix.d,
                this.a * other_matrix.tx + this.c * other_matrix.ty + this.tx,
                this.b * other_matrix.tx + this.d * other_matrix.ty + this.ty
            )
        };

        /**
         * Return new matrix as a result of multiplication of the current matrix
         * by the matrix(1,0,0,1,tx,ty)
         * @param {number} tx - translation by x
         * @param {number} ty - translation by y
         * @returns {Matrix}
         */
        translate(...args) {
            let tx, ty;
            if (args.length == 1 && (args[0] instanceof Flatten.Vector)) {
                tx = args[0].x;
                ty = args[0].y;
            } else if (args.length == 2 && typeof (args[0]) == "number" && typeof (args[1]) == "number") {
                tx = args[0];
                ty = args[1];
            } else {
                throw Flatten.Errors.ILLEGAL_PARAMETERS;
            }
            return this.multiply(new Matrix(1, 0, 0, 1, tx, ty))
        };

        /**
         * Return new matrix as a result of multiplication of the current matrix
         * by the matrix that defines rotation by given angle (in radians) around
         * point (0,0) in counter clockwise direction
         * @param {number} angle - angle in radians
         * @returns {Matrix}
         */
        rotate(angle) {
            let cos = Math.cos(angle);
            let sin = Math.sin(angle);
            return this.multiply(new Matrix(cos, sin, -sin, cos, 0, 0));
        };

        /**
         * Return new matrix as a result of multiplication of the current matrix
         * by the matrix (sx,0,0,sy,0,0) that defines scaling
         * @param {number} sx
         * @param {number} sy
         * @returns {Matrix}
         */
        scale(sx, sy) {
            return this.multiply(new Matrix(sx, 0, 0, sy, 0, 0));
        };

        /**
         * Returns true if two matrix are equal parameter by parameter
         * @param {Matrix} matrix - other matrix
         * @returns {boolean} true if equal, false otherwise
         */
        equalTo(matrix) {
            if (!Flatten.Utils.EQ(this.tx, matrix.tx)) return false;
            if (!Flatten.Utils.EQ(this.ty, matrix.ty)) return false;
            if (!Flatten.Utils.EQ(this.a, matrix.a)) return false;
            if (!Flatten.Utils.EQ(this.b, matrix.b)) return false;
            if (!Flatten.Utils.EQ(this.c, matrix.c)) return false;
            if (!Flatten.Utils.EQ(this.d, matrix.d)) return false;
            return true;
        };
    }
    Flatten.Matrix = Matrix;
    /**
     * Function to create matrix equivalent to "new" constructor
     * @param args
     */
    const matrix = (...args) => new Flatten.Matrix(...args);
    Flatten.matrix = matrix;

    /**
     * Created by Alex Bol on 4/1/2017.
     */

    /**
     * Interval is a pair of numbers or a pair of any comparable objects on which may be defined predicates
     * *equal*, *less* and method *max(p1, p1)* that returns maximum in a pair.
     * When interval is an object rather than pair of numbers, this object should have properties *low*, *high*, *max*
     * and implement methods *less_than(), equal_to(), intersect(), not_intersect(), clone(), output()*.
     * Two static methods *comparable_max(), comparable_less_than()* define how to compare values in pair. <br/>
     * This interface is described in typescript definition file *index.d.ts*
     *
     * Axis aligned rectangle is an example of such interval.
     * We may look at rectangle as an interval between its low left and top right corners.
     * See **Box** class in [flatten-js](https://github.com/alexbol99/flatten-js) library as the example
     * of Interval interface implementation
     * @type {Interval}
     */
    const Interval = class Interval {
        /**
         * Accept two comparable values and creates new instance of interval
         * Predicate Interval.comparable_less(low, high) supposed to return true on these values
         * @param low
         * @param high
         */
        constructor(low, high) {
            this.low = low;
            this.high = high;
        }

        /**
         * Clone interval
         * @returns {Interval}
         */
        clone() {
            return new Interval(this.low, this.high);
        }

        /**
         * Propery max returns clone of this interval
         * @returns {Interval}
         */
        get max() {
            return this.clone();   // this.high;
        }

        /**
         * Predicate returns true is this interval less than other interval
         * @param other_interval
         * @returns {boolean}
         */
        less_than(other_interval) {
            return this.low < other_interval.low ||
                this.low == other_interval.low && this.high < other_interval.high;
        }

        /**
         * Predicate returns true is this interval equals to other interval
         * @param other_interval
         * @returns {boolean}
         */
        equal_to(other_interval) {
            return this.low == other_interval.low && this.high == other_interval.high;
        }

        /**
         * Predicate returns true if this interval intersects other interval
         * @param other_interval
         * @returns {boolean}
         */
        intersect(other_interval) {
            return !this.not_intersect(other_interval);
        }

        /**
         * Predicate returns true if this interval does not intersect other interval
         * @param other_interval
         * @returns {boolean}
         */
        not_intersect(other_interval) {
            return (this.high < other_interval.low || other_interval.high < this.low);
        }

        /**
         * Returns new interval merged with other interval
         * @param {Interval} interval - Other interval to merge with
         * @returns {Interval}
         */
        merge(other_interval) {
            return new Interval(
                this.low === undefined ? other_interval.low : Math.min(this.low, other_interval.low),
                this.high === undefined ? other_interval.high : Math.max(this.high, other_interval.high)
            );
        }

        /**
         * Returns how key should return
         */
        output() {
            return [this.low, this.high];
        }

        /**
         * Function returns maximum between two comparable values
         * @param interval1
         * @param interval2
         * @returns {Interval}
         */
        static comparable_max(interval1, interval2) {
            return interval1.merge(interval2);
        }

        /**
         * Predicate returns true if first value less than second value
         * @param val1
         * @param val2
         * @returns {boolean}
         */
        static comparable_less_than(val1, val2 ) {
            return val1 < val2;
        }
    };

    /**
     * Created by Alex Bol on 3/28/2017.
     */

    // module.exports = {
    //     RB_TREE_COLOR_RED: 0,
    //     RB_TREE_COLOR_BLACK: 1
    // };

    const RB_TREE_COLOR_RED = 0;
    const RB_TREE_COLOR_BLACK = 1;

    /**
     * Created by Alex Bol on 4/1/2017.
     */

    class Node {
        constructor(key = undefined, value = undefined,
                    left = null, right = null, parent = null, color = RB_TREE_COLOR_BLACK) {
            this.left = left;                     // reference to left child node
            this.right = right;                   // reference to right child node
            this.parent = parent;                 // reference to parent node
            this.color = color;

            this.item = {key: key, value: value};   // key is supposed to be instance of Interval

            /* If not, this should by an array of two numbers */
            if (key && key instanceof Array && key.length == 2) {
                if (!Number.isNaN(key[0]) && !Number.isNaN(key[1])) {
                    this.item.key = new Interval(Math.min(key[0], key[1]), Math.max(key[0], key[1]));
                }
            }

            this.max = this.item.key ? this.item.key.max : undefined;
        }

        isNil() {
            return (this.item.key === undefined && this.item.value === undefined &&
                this.left === null && this.right === null && this.color === RB_TREE_COLOR_BLACK);
        }

        less_than(other_node) {
            // if tree stores only keys
            if (this.item.value === this.item.key && other_node.item.value === other_node.item.key) {
                return this.item.key.less_than(other_node.item.key);
            }
            else {    // if tree stores keys and values
                let value_less_than = this.item.value && other_node.item.value && this.item.value.less_than ? this.item.value.less_than(other_node.item.value) :
                    this.item.value < other_node.item.value;
                return this.item.key.less_than(other_node.item.key) ||
                    this.item.key.equal_to((other_node.item.key)) && value_less_than;
            }

            // if (this.item.value && other_node.item.value) {
            //     let item_less_than = this.item.value.less_than ? this.item.value.less_than(other_node.item.value) :
            //         this.item.value < other_node.item.value;
            //     return this.item.key.less_than(other_node.item.key) ||
            //         this.item.key.equal_to((other_node.item.key)) && item_less_than;
            // }
            // else {
            //     return this.item.key.less_than(other_node.item.key);
            // }
        }

        equal_to(other_node) {
            // if tree stores only keys
            if (this.item.value === this.item.key && other_node.item.value === other_node.item.key) {
                return this.item.key.equal_to(other_node.item.key);
            }
            else {    // if tree stores keys and values
                let value_equal = this.item.value && other_node.item.value && this.item.value.equal_to ? this.item.value.equal_to(other_node.item.value) :
                    this.item.value == other_node.item.value;
                return this.item.key.equal_to(other_node.item.key) && value_equal;
            }

            // let value_equal = true;
            // if (this.item.value && other_node.item.value) {
            //     value_equal = this.item.value.equal_to ? this.item.value.equal_to(other_node.item.value) :
            //         this.item.value == other_node.item.value;
            // }
            // return this.item.key.equal_to(other_node.item.key) && value_equal;
        }

        intersect(other_node) {
            return this.item.key.intersect(other_node.item.key);
        }

        copy_data(other_node) {
            this.item.key = other_node.item.key.clone();
            this.item.value = other_node.item.value && other_node.item.value.clone ? other_node.item.value.clone() : other_node.item.value;
        }

        update_max() {
            // use key (Interval) max property instead of key.high
            this.max = this.item.key ? this.item.key.max : undefined;
            if (this.right && this.right.max) {
                const comparable_max = this.item.key.constructor.comparable_max;  // static method
                this.max = comparable_max(this.max, this.right.max);
            }
            if (this.left && this.left.max) {
                const comparable_max = this.item.key.constructor.comparable_max;  // static method
                this.max = comparable_max(this.max, this.left.max);
            }
        }

        // Other_node does not intersect any node of left subtree, if this.left.max < other_node.item.key.low
        not_intersect_left_subtree(search_node) {
            const comparable_less_than = this.item.key.constructor.comparable_less_than;  // static method
            let high = this.left.max.high !== undefined ? this.left.max.high : this.left.max;
            return comparable_less_than(high, search_node.item.key.low);
        }

        // Other_node does not intersect right subtree if other_node.item.key.high < this.right.key.low
        not_intersect_right_subtree(search_node) {
            const comparable_less_than = this.item.key.constructor.comparable_less_than;  // static method
            let low = this.right.max.low !== undefined ? this.right.max.low : this.right.item.key.low;
            return comparable_less_than(search_node.item.key.high, low);
        }
    }

    /**
     * Created by Alex Bol on 3/31/2017.
     */

    // const nil_node = new Node();

    /**
     * Implementation of interval binary search tree <br/>
     * Interval tree stores items which are couples of {key:interval, value: value} <br/>
     * Interval is an object with high and low properties or simply pair [low,high] of numeric values <br />
     * @type {IntervalTree}
     */
    class IntervalTree {
        /**
         * Construct new empty instance of IntervalTree
         */
        constructor() {
            this.root = null;
            this.nil_node = new Node();
        }

        /**
         * Returns number of items stored in the interval tree
         * @returns {number}
         */
        get size() {
            let count = 0;
            this.tree_walk(this.root, () => count++);
            return count;
        }

        /**
         * Returns array of sorted keys in the ascending order
         * @returns {Array}
         */
        get keys() {
            let res = [];
            this.tree_walk(this.root, (node) => res.push(
                node.item.key.output ? node.item.key.output() : node.item.key
            ));
            return res;
        }

        /**
         * Return array of values in the ascending keys order
         * @returns {Array}
         */
        get values() {
            let res = [];
            this.tree_walk(this.root, (node) => res.push(node.item.value));
            return res;
        }

        /**
         * Returns array of items (<key,value> pairs) in the ascended keys order
         * @returns {Array}
         */
        get items() {
            let res = [];
            this.tree_walk(this.root, (node) => res.push({
                key: node.item.key.output ? node.item.key.output() : node.item.key,
                value: node.item.value
            }));
            return res;
        }

        /**
         * Returns true if tree is empty
         * @returns {boolean}
         */
        isEmpty() {
            return (this.root == null || this.root == this.nil_node);
        }

        /**
         * Insert new item into interval tree
         * @param {Interval} key - interval object or array of two numbers [low, high]
         * @param {any} value - value representing any object (optional)
         * @returns {Node} returns reference to inserted node as an object {key:interval, value: value}
         */
        insert(key, value = key) {
            if (key === undefined) return;
            let insert_node = new Node(key, value, this.nil_node, this.nil_node, null, RB_TREE_COLOR_RED);
            this.tree_insert(insert_node);
            this.recalc_max(insert_node);
            return insert_node;
        }

        /**
         * Returns true if item {key,value} exist in the tree
         * @param {Interval} key - interval correspondent to keys stored in the tree
         * @param {any} value - value object to be checked
         * @returns {boolean} true if item {key, value} exist in the tree, false otherwise
         */
        exist(key, value = key) {
            let search_node = new Node(key, value);
            return this.tree_search(this.root, search_node) ? true : false;
        }

        /**
         * Remove entry {key, value} from the tree
         * @param {Interval} key - interval correspondent to keys stored in the tree
         * @param {any} value - value object
         * @returns {boolean} true if item {key, value} deleted, false if not found
         */
        remove(key, value = key) {
            let search_node = new Node(key, value);
            let delete_node = this.tree_search(this.root, search_node);
            if (delete_node) {
                this.tree_delete(delete_node);
            }
            return delete_node;
        }

        /**
         * Returns array of entry values which keys intersect with given interval <br/>
         * If no values stored in the tree, returns array of keys which intersect given interval
         * @param {Interval} interval - search interval, or array [low, high]
         * @param outputMapperFn(value,key) - optional function that maps (value, key) to custom output
         * @returns {Array}
         */
        search(interval, outputMapperFn = (value, key) => value === key ? key.output() : value) {
            let search_node = new Node(interval);
            let resp_nodes = [];
            this.tree_search_interval(this.root, search_node, resp_nodes);
            return resp_nodes.map(node => outputMapperFn(node.item.value, node.item.key))
        }

        /**
         * Tree visitor. For each node implement a callback function. <br/>
         * Method calls a callback function with two parameters (key, value)
         * @param visitor(key,value) - function to be called for each tree item
         */
        forEach(visitor) {
            this.tree_walk(this.root, (node) => visitor(node.item.key, node.item.value));
        }

        /** Value Mapper. Walk through every node and map node value to another value
        * @param callback(value,key) - function to be called for each tree item
        */
        map(callback) {
            const tree = new IntervalTree();
            this.tree_walk(this.root, (node) => tree.insert(node.item.key, callback(node.item.value, node.item.key)));
            return tree;
        }

        recalc_max(node) {
            let node_current = node;
            while (node_current.parent != null) {
                node_current.parent.update_max();
                node_current = node_current.parent;
            }
        }

        tree_insert(insert_node) {
            let current_node = this.root;
            let parent_node = null;

            if (this.root == null || this.root == this.nil_node) {
                this.root = insert_node;
            }
            else {
                while (current_node != this.nil_node) {
                    parent_node = current_node;
                    if (insert_node.less_than(current_node)) {
                        current_node = current_node.left;
                    }
                    else {
                        current_node = current_node.right;
                    }
                }

                insert_node.parent = parent_node;

                if (insert_node.less_than(parent_node)) {
                    parent_node.left = insert_node;
                }
                else {
                    parent_node.right = insert_node;
                }
            }

            this.insert_fixup(insert_node);
        }

    // After insertion insert_node may have red-colored parent, and this is a single possible violation
    // Go upwords to the root and re-color until violation will be resolved
        insert_fixup(insert_node) {
            let current_node;
            let uncle_node;

            current_node = insert_node;
            while (current_node != this.root && current_node.parent.color == RB_TREE_COLOR_RED) {
                if (current_node.parent == current_node.parent.parent.left) {   // parent is left child of grandfather
                    uncle_node = current_node.parent.parent.right;              // right brother of parent
                    if (uncle_node.color == RB_TREE_COLOR_RED) {             // Case 1. Uncle is red
                        // re-color father and uncle into black
                        current_node.parent.color = RB_TREE_COLOR_BLACK;
                        uncle_node.color = RB_TREE_COLOR_BLACK;
                        current_node.parent.parent.color = RB_TREE_COLOR_RED;
                        current_node = current_node.parent.parent;
                    }
                    else {                                                    // Case 2 & 3. Uncle is black
                        if (current_node == current_node.parent.right) {     // Case 2. Current if right child
                            // This case is transformed into Case 3.
                            current_node = current_node.parent;
                            this.rotate_left(current_node);
                        }
                        current_node.parent.color = RB_TREE_COLOR_BLACK;    // Case 3. Current is left child.
                        // Re-color father and grandfather, rotate grandfather right
                        current_node.parent.parent.color = RB_TREE_COLOR_RED;
                        this.rotate_right(current_node.parent.parent);
                    }
                }
                else {                                                         // parent is right child of grandfather
                    uncle_node = current_node.parent.parent.left;              // left brother of parent
                    if (uncle_node.color == RB_TREE_COLOR_RED) {             // Case 4. Uncle is red
                        // re-color father and uncle into black
                        current_node.parent.color = RB_TREE_COLOR_BLACK;
                        uncle_node.color = RB_TREE_COLOR_BLACK;
                        current_node.parent.parent.color = RB_TREE_COLOR_RED;
                        current_node = current_node.parent.parent;
                    }
                    else {
                        if (current_node == current_node.parent.left) {             // Case 5. Current is left child
                            // Transform into case 6
                            current_node = current_node.parent;
                            this.rotate_right(current_node);
                        }
                        current_node.parent.color = RB_TREE_COLOR_BLACK;    // Case 6. Current is right child.
                        // Re-color father and grandfather, rotate grandfather left
                        current_node.parent.parent.color = RB_TREE_COLOR_RED;
                        this.rotate_left(current_node.parent.parent);
                    }
                }
            }

            this.root.color = RB_TREE_COLOR_BLACK;
        }

        tree_delete(delete_node) {
            let cut_node;   // node to be cut - either delete_node or successor_node  ("y" from 14.4)
            let fix_node;   // node to fix rb tree property   ("x" from 14.4)

            if (delete_node.left == this.nil_node || delete_node.right == this.nil_node) {  // delete_node has less then 2 children
                cut_node = delete_node;
            }
            else {                                                    // delete_node has 2 children
                cut_node = this.tree_successor(delete_node);
            }

            // fix_node if single child of cut_node
            if (cut_node.left != this.nil_node) {
                fix_node = cut_node.left;
            }
            else {
                fix_node = cut_node.right;
            }

            // remove cut_node from parent
            /*if (fix_node != this.nil_node) {*/
                fix_node.parent = cut_node.parent;
            /*}*/

            if (cut_node == this.root) {
                this.root = fix_node;
            }
            else {
                if (cut_node == cut_node.parent.left) {
                    cut_node.parent.left = fix_node;
                }
                else {
                    cut_node.parent.right = fix_node;
                }
                cut_node.parent.update_max();        // update max property of the parent
            }

            this.recalc_max(fix_node);              // update max property upward from fix_node to root

            // COPY DATA !!!
            // Delete_node becomes cut_node, it means that we cannot hold reference
            // to node in outer structure and we will have to delete by key, additional search need
            if (cut_node != delete_node) {
                delete_node.copy_data(cut_node);
                delete_node.update_max();           // update max property of the cut node at the new place
                this.recalc_max(delete_node);       // update max property upward from delete_node to root
            }

            if (/*fix_node != this.nil_node && */cut_node.color == RB_TREE_COLOR_BLACK) {
                this.delete_fixup(fix_node);
            }
        }

        delete_fixup(fix_node) {
            let current_node = fix_node;
            let brother_node;

            while (current_node != this.root && current_node.parent != null && current_node.color == RB_TREE_COLOR_BLACK) {
                if (current_node == current_node.parent.left) {          // fix node is left child
                    brother_node = current_node.parent.right;
                    if (brother_node.color == RB_TREE_COLOR_RED) {   // Case 1. Brother is red
                        brother_node.color = RB_TREE_COLOR_BLACK;         // re-color brother
                        current_node.parent.color = RB_TREE_COLOR_RED;    // re-color father
                        this.rotate_left(current_node.parent);
                        brother_node = current_node.parent.right;                      // update brother
                    }
                    // Derive to cases 2..4: brother is black
                    if (brother_node.left.color == RB_TREE_COLOR_BLACK &&
                        brother_node.right.color == RB_TREE_COLOR_BLACK) {  // case 2: both nephews black
                        brother_node.color = RB_TREE_COLOR_RED;              // re-color brother
                        current_node = current_node.parent;                  // continue iteration
                    }
                    else {
                        if (brother_node.right.color == RB_TREE_COLOR_BLACK) {   // case 3: left nephew red, right nephew black
                            brother_node.color = RB_TREE_COLOR_RED;          // re-color brother
                            brother_node.left.color = RB_TREE_COLOR_BLACK;   // re-color nephew
                            this.rotate_right(brother_node);
                            brother_node = current_node.parent.right;                     // update brother
                            // Derive to case 4: left nephew black, right nephew red
                        }
                        // case 4: left nephew black, right nephew red
                        brother_node.color = current_node.parent.color;
                        current_node.parent.color = RB_TREE_COLOR_BLACK;
                        brother_node.right.color = RB_TREE_COLOR_BLACK;
                        this.rotate_left(current_node.parent);
                        current_node = this.root;                         // exit from loop
                    }
                }
                else {                                             // fix node is right child
                    brother_node = current_node.parent.left;
                    if (brother_node.color == RB_TREE_COLOR_RED) {   // Case 1. Brother is red
                        brother_node.color = RB_TREE_COLOR_BLACK;         // re-color brother
                        current_node.parent.color = RB_TREE_COLOR_RED;    // re-color father
                        this.rotate_right(current_node.parent);
                        brother_node = current_node.parent.left;                        // update brother
                    }
                    // Go to cases 2..4
                    if (brother_node.left.color == RB_TREE_COLOR_BLACK &&
                        brother_node.right.color == RB_TREE_COLOR_BLACK) {   // case 2
                        brother_node.color = RB_TREE_COLOR_RED;             // re-color brother
                        current_node = current_node.parent;                              // continue iteration
                    }
                    else {
                        if (brother_node.left.color == RB_TREE_COLOR_BLACK) {  // case 3: right nephew red, left nephew black
                            brother_node.color = RB_TREE_COLOR_RED;            // re-color brother
                            brother_node.right.color = RB_TREE_COLOR_BLACK;    // re-color nephew
                            this.rotate_left(brother_node);
                            brother_node = current_node.parent.left;                        // update brother
                            // Derive to case 4: right nephew black, left nephew red
                        }
                        // case 4: right nephew black, left nephew red
                        brother_node.color = current_node.parent.color;
                        current_node.parent.color = RB_TREE_COLOR_BLACK;
                        brother_node.left.color = RB_TREE_COLOR_BLACK;
                        this.rotate_right(current_node.parent);
                        current_node = this.root;                               // force exit from loop
                    }
                }
            }

            current_node.color = RB_TREE_COLOR_BLACK;
        }

        tree_search(node, search_node) {
            if (node == null || node == this.nil_node)
                return undefined;

            if (search_node.equal_to(node)) {
                return node;
            }
            if (search_node.less_than(node)) {
                return this.tree_search(node.left, search_node);
            }
            else {
                return this.tree_search(node.right, search_node);
            }
        }

        // Original search_interval method; container res support push() insertion
        // Search all intervals intersecting given one
        tree_search_interval(node, search_node, res) {
            if (node != null && node != this.nil_node) {
                // if (node->left != this.nil_node && node->left->max >= low) {
                if (node.left != this.nil_node && !node.not_intersect_left_subtree(search_node)) {
                    this.tree_search_interval(node.left, search_node, res);
                }
                // if (low <= node->high && node->low <= high) {
                if (node.intersect(search_node)) {
                    res.push(node);
                }
                // if (node->right != this.nil_node && node->low <= high) {
                if (node.right != this.nil_node && !node.not_intersect_right_subtree(search_node)) {
                    this.tree_search_interval(node.right, search_node, res);
                }
            }
        }

        local_minimum(node) {
            let node_min = node;
            while (node_min.left != null && node_min.left != this.nil_node) {
                node_min = node_min.left;
            }
            return node_min;
        }

        // not in use
        local_maximum(node) {
            let node_max = node;
            while (node_max.right != null && node_max.right != this.nil_node) {
                node_max = node_max.right;
            }
            return node_max;
        }

        tree_successor(node) {
            let node_successor;
            let current_node;
            let parent_node;

            if (node.right != this.nil_node) {
                node_successor = this.local_minimum(node.right);
            }
            else {
                current_node = node;
                parent_node = node.parent;
                while (parent_node != null && parent_node.right == current_node) {
                    current_node = parent_node;
                    parent_node = parent_node.parent;
                }
                node_successor = parent_node;
            }
            return node_successor;
        }

        //           |            right-rotate(T,y)       |
        //           y            ---------------.       x
        //          / \                                  / \
        //         x   c          left-rotate(T,x)      a   y
        //        / \             <---------------         / \
        //       a   b                                    b   c

        rotate_left(x) {
            let y = x.right;

            x.right = y.left;           // b goes to x.right

            if (y.left != this.nil_node) {
                y.left.parent = x;     // x becomes parent of b
            }
            y.parent = x.parent;       // move parent

            if (x == this.root) {
                this.root = y;           // y becomes root
            }
            else {                        // y becomes child of x.parent
                if (x == x.parent.left) {
                    x.parent.left = y;
                }
                else {
                    x.parent.right = y;
                }
            }
            y.left = x;                 // x becomes left child of y
            x.parent = y;               // and y becomes parent of x

            if (x != null && x != this.nil_node) {
                x.update_max();
            }

            y = x.parent;
            if (y != null && y != this.nil_node) {
                y.update_max();
            }
        }

        rotate_right(y) {
            let x = y.left;

            y.left = x.right;           // b goes to y.left

            if (x.right != this.nil_node) {
                x.right.parent = y;        // y becomes parent of b
            }
            x.parent = y.parent;          // move parent

            if (y == this.root) {        // x becomes root
                this.root = x;
            }
            else {                        // y becomes child of x.parent
                if (y == y.parent.left) {
                    y.parent.left = x;
                }
                else {
                    y.parent.right = x;
                }
            }
            x.right = y;                 // y becomes right child of x
            y.parent = x;               // and x becomes parent of y

            if (y != null && y != this.nil_node) {
                y.update_max();
            }

            x = y.parent;
            if (x != null && x != this.nil_node) {
                x.update_max();
            }
        }

        tree_walk(node, action) {
            if (node != null && node != this.nil_node) {
                this.tree_walk(node.left, action);
                // arr.push(node.toArray());
                action(node);
                this.tree_walk(node.right, action);
            }
        }

        /* Return true if all red nodes have exactly two black child nodes */
        testRedBlackProperty() {
            let res = true;
            this.tree_walk(this.root, function (node) {
                if (node.color == RB_TREE_COLOR_RED) {
                    if (!(node.left.color == RB_TREE_COLOR_BLACK && node.right.color == RB_TREE_COLOR_BLACK)) {
                        res = false;
                    }
                }
            });
            return res;
        }

        /* Throw error if not every path from root to bottom has same black height */
        testBlackHeightProperty(node) {
            let height = 0;
            let heightLeft = 0;
            let heightRight = 0;
            if (node.color == RB_TREE_COLOR_BLACK) {
                height++;
            }
            if (node.left != this.nil_node) {
                heightLeft = this.testBlackHeightProperty(node.left);
            }
            else {
                heightLeft = 1;
            }
            if (node.right != this.nil_node) {
                heightRight = this.testBlackHeightProperty(node.right);
            }
            else {
                heightRight = 1;
            }
            if (heightLeft != heightRight) {
                throw new Error('Red-black height property violated');
            }
            height += heightLeft;
            return height;
        };
    }

    /**
     * Created by Alex Bol on 3/12/2017.
     */

    /**
     * Class representing a planar set - a generic container with ability to keep and retrieve shapes and
     * perform spatial queries. Planar set is an extension of Set container, so it supports
     * Set properties and methods
     */
    class PlanarSet extends Set {
        /**
         * Create new empty instance of PlanarSet
         */
        constructor() {
            super();
            this.index = new IntervalTree();
        }

        /**
         * Add new shape to planar set and to its spatial index.<br/>
         * If shape already exist, it will not be added again.
         * This happens with no error, it is possible to use <i>size</i> property to check if
         * a shape was actually added.<br/>
         * Method returns planar set object updated and may be chained
         * @param {Shape} shape - shape to be added, should have valid <i>box</i> property
         * @returns {PlanarSet}
         */
        add(shape) {
            let size = this.size;
            super.add(shape);
            // size not changed - item not added, probably trying to add same item twice
            if (this.size > size) {
                let node = this.index.insert(shape.box, shape);
            }
            return this;         // in accordance to Set.add interface
        }

        /**
         * Delete shape from planar set. Returns true if shape was actually deleted, false otherwise
         * @param {Shape} shape - shape to be deleted
         * @returns {boolean}
         */
        delete(shape) {
            let deleted = super.delete(shape);
            if (deleted) {
                this.index.remove(shape.box, shape);
            }
            return deleted;
        }

        /**
         * Clear planar set
         */
        clear() {
            super.clear();
            this.index = new IntervalTree();
        }

        /**
         * 2d range search in planar set.<br/>
         * Returns array of all shapes in planar set which bounding box is intersected with query box
         * @param {Box} box - query box
         * @returns {Shapes[]}
         */
        search(box) {
            let resp = this.index.search(box);
            return resp;
        }

        /**
         * Point location test. Returns array of shapes which contains given point
         * @param {Point} point - query point
         * @returns {Array}
         */
        hit(point) {
            let box = new Flatten.Box(point.x - 1, point.y - 1, point.x + 1, point.y + 1);
            let resp = this.index.search(box);
            return resp.filter((shape) => point.on(shape));
        }

        /**
         * Returns svg string to draw all shapes in planar set
         * @returns {String}
         */
        svg() {
            let svgcontent = [...this].reduce((acc, shape) => acc + shape.svg(), "");
            return svgcontent;
        }
    }

    Flatten.PlanarSet = PlanarSet;

    /**
     * Created by Alex Bol on 2/18/2017.
     */

    /**
     *
     * Class representing a point
     * @type {Point}
     */
    class Point {
        /**
         * Point may be constructed by two numbers, or by array of two numbers
         * @param {number} x - x-coordinate (float number)
         * @param {number} y - y-coordinate (float number)
         */
        constructor(...args) {
            /**
             * x-coordinate (float number)
             * @type {number}
             */
            this.x = 0;
            /**
             * y-coordinate (float number)
             * @type {number}
             */
            this.y = 0;

            if (args.length === 0) {
                return;
            }

            if (args.length === 1 && args[0] instanceof Array && args[0].length === 2) {
                let arr = args[0];
                if (typeof (arr[0]) == "number" && typeof (arr[1]) == "number") {
                    this.x = arr[0];
                    this.y = arr[1];
                    return;
                }
            }

            if (args.length === 1 && args[0] instanceof Object && args[0].name === "point") {
                let {x, y} = args[0];
                this.x = x;
                this.y = y;
                return;
            }

            if (args.length === 2) {
                if (typeof (args[0]) == "number" && typeof (args[1]) == "number") {
                    this.x = args[0];
                    this.y = args[1];
                    return;
                }
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;

        }

        /**
         * Returns bounding box of a point
         * @returns {Box}
         */
        get box() {
            return new Flatten.Box(this.x, this.y, this.x, this.y);
        }

        /**
         * Return new cloned instance of point
         * @returns {Point}
         */
        clone() {
            return new Flatten.Point(this.x, this.y);
        }

        get vertices() {
            return [this.clone()];
        }

        /**
         * Returns true if points are equal up to [Flatten.Utils.DP_TOL]{@link DP_TOL} tolerance
         * @param {Point} pt Query point
         * @returns {boolean}
         */
        equalTo(pt) {
            return Flatten.Utils.EQ(this.x, pt.x) && Flatten.Utils.EQ(this.y, pt.y);
        }

        /**
         * Defines predicate "less than" between points. Returns true if the point is less than query points, false otherwise <br/>
         * By definition point1 < point2 if {point1.y < point2.y || point1.y == point2.y && point1.x < point2.x <br/>
         * Numeric values compared with [Flatten.Utils.DP_TOL]{@link DP_TOL} tolerance
         * @param {Point} pt Query point
         * @returns {boolean}
         */
        lessThan(pt) {
            if (Flatten.Utils.LT(this.y, pt.y))
                return true;
            if (Flatten.Utils.EQ(this.y, pt.y) && Flatten.Utils.LT(this.x, pt.x))
                return true;
            return false;
        }

        /**
         * Returns new point rotated by given angle around given center point.
         * If center point is omitted, rotates around zero point (0,0).
         * Positive value of angle defines rotation in counter clockwise direction,
         * negative angle defines rotation in clockwise clockwise direction
         * @param {number} angle - angle in radians
         * @param {Point} [center=(0,0)] center
         * @returns {Point}
         */
        rotate(angle, center = {x: 0, y: 0}) {
            var x_rot = center.x + (this.x - center.x) * Math.cos(angle) - (this.y - center.y) * Math.sin(angle);
            var y_rot = center.y + (this.x - center.x) * Math.sin(angle) + (this.y - center.y) * Math.cos(angle);

            return new Flatten.Point(x_rot, y_rot);
        }

        /**
         * Returns new point translated by given vector.
         * Translation vector may by also defined by a pair of numbers.
         * @param {Vector} vector - Translation vector defined as Flatten.Vector or
         * @param {number|number} - Translation vector defined as pair of numbers
         * @returns {Point}
         */
        translate(...args) {
            if (args.length == 1 &&
                (args[0] instanceof Flatten.Vector || !isNaN(args[0].x) && !isNaN(args[0].y))) {
                return new Flatten.Point(this.x + args[0].x, this.y + args[0].y);
            }

            if (args.length == 2 && typeof (args[0]) == "number" && typeof (args[1]) == "number") {
                return new Flatten.Point(this.x + args[0], this.y + args[1]);
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Return new point transformed by affine transformation matrix m
         * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
         * @returns {Point}
         */
        transform(m) {
            // let [x,y] = m.transform([this.x,this.y]);
            return new Flatten.Point(m.transform([this.x, this.y]))
        }

        /**
         * Returns projection point on given line
         * @param {Line} line Line this point be projected on
         * @returns {Point}
         */
        projectionOn(line) {
            if (this.equalTo(line.pt))                   // this point equal to line anchor point
                return this.clone();

            let vec = new Flatten.Vector(this, line.pt);
            if (Flatten.Utils.EQ_0(vec.cross(line.norm)))    // vector to point from anchor point collinear to normal vector
                return line.pt.clone();

            let dist = vec.dot(line.norm);             // signed distance
            let proj_vec = line.norm.multiply(dist);
            return this.translate(proj_vec);
        }

        /**
         * Returns true if point belongs to the "left" semi-plane, which means, point belongs to the same semi plane where line normal vector points to
         * Return false if point belongs to the "right" semi-plane or to the line itself
         * @param {Line} line Query line
         * @returns {boolean}
         */
        leftTo(line) {
            let vec = new Flatten.Vector(line.pt, this);
            let onLeftSemiPlane = Flatten.Utils.GT(vec.dot(line.norm), 0);
            return onLeftSemiPlane;
        }

        /**
         * Calculate distance and shortest segment from point to shape and return as array [distance, shortest segment]
         * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
         * @returns {number} distance from point to shape
         * @returns {Segment} shortest segment between point and shape (started at point, ended at shape)
         */
        distanceTo(shape) {
            if (shape instanceof Point) {
                let dx = shape.x - this.x;
                let dy = shape.y - this.y;
                return [Math.sqrt(dx * dx + dy * dy), new Flatten.Segment(this, shape)];
            }

            if (shape instanceof Flatten.Line) {
                return Flatten.Distance.point2line(this, shape);
            }

            if (shape instanceof Flatten.Circle) {
                return Flatten.Distance.point2circle(this, shape);
            }

            if (shape instanceof Flatten.Segment) {
                return Flatten.Distance.point2segment(this, shape);
            }

            if (shape instanceof Flatten.Arc) {
                // let [dist, ...rest] = Distance.point2arc(this, shape);
                // return dist;
                return Flatten.Distance.point2arc(this, shape);
            }

            if (shape instanceof Flatten.Polygon) {
                // let [dist, ...rest] = Distance.point2polygon(this, shape);
                // return dist;
                return Flatten.Distance.point2polygon(this, shape);
            }

            if (shape instanceof Flatten.PlanarSet) {
                return Flatten.Distance.shape2planarSet(this, shape);
            }
        }

        /**
         * Returns true if point is on a shape, false otherwise
         * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon
         * @returns {boolean}
         */
        on(shape) {
            if (shape instanceof Flatten.Point) {
                return this.equalTo(shape);
            }

            if (shape instanceof Flatten.Line) {
                return shape.contains(this);
            }

            if (shape instanceof Flatten.Circle) {
                return shape.contains(this);
            }

            if (shape instanceof Flatten.Segment) {
                return shape.contains(this);
            }

            if (shape instanceof Flatten.Arc) {
                return shape.contains(this);
            }

            if (shape instanceof Flatten.Polygon) {
                return shape.contains(this);
            }
        }

        /**
         * This method returns an object that defines how data will be
         * serialized when called JSON.stringify() method
         * @returns {Object}
         */
        toJSON() {
            return Object.assign({}, this, {name: "point"});
        }

        /**
         * Return string to draw point in svg as circle with radius "r" <br/>
         * Accept any valid attributes of svg elements as svg object
         * Defaults attribues are: <br/>
         * {
         *    r:"3",
         *    stroke:"black",
         *    strokeWidth:"1",
         *    fill:"red"
         * }
         * @param {Object} attrs - Any valid attributes of svg circle element, like "r", "stroke", "strokeWidth", "fill"
         * @returns {String}
         */
        svg(attrs = {}) {
            let {r, stroke, strokeWidth, fill, id, className} = attrs;
            // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
            let id_str = (id && id.length > 0) ? `id="${id}"` : "";
            let class_str = (className && className.length > 0) ? `class="${className}"` : "";
            return `\n<circle cx="${this.x}" cy="${this.y}" r="${r || 3}" stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "red"}" ${id_str} ${class_str} />`;
        }

    }
    Flatten.Point = Point;
    /**
     * Function to create point equivalent to "new" constructor
     * @param args
     */
    const point = (...args) => new Flatten.Point(...args);
    Flatten.point = point;

    // export {Point};

    /**
     * Created by Alex Bol on 2/19/2017.
     */

    /**
     * Class representing a vector
     * @type {Vector}
     */
    class Vector {
        /**
         * Vector may be constructed by two points, or by two float numbers,
         * or by array of two numbers
         * @param {Point} ps - start point
         * @param {Point} pe - end point
         */
        constructor(...args) {
            /**
             * x-coordinate of a vector (float number)
             * @type {number}
             */
            this.x = 0;
            /**
             * y-coordinate of a vector (float number)
             * @type {number}
             */
            this.y = 0;

            /* return zero vector */
            if (args.length === 0) {
                return;
            }

            if (args.length === 1 && args[0] instanceof Array && args[0].length === 2) {
                let arr = args[0];
                if (typeof (arr[0]) == "number" && typeof (arr[1]) == "number") {
                    this.x = arr[0];
                    this.y = arr[1];
                    return;
                }
            }

            if (args.length === 1 && args[0] instanceof Object && args[0].name === "vector") {
                let {x, y} = args[0];
                this.x = x;
                this.y = y;
                return;
            }

            if (args.length === 2) {
                let a1 = args[0];
                let a2 = args[1];

                if (typeof (a1) == "number" && typeof (a2) == "number") {
                    this.x = a1;
                    this.y = a2;
                    return;
                }

                if (a1 instanceof Flatten.Point && a2 instanceof Flatten.Point) {
                    this.x = a2.x - a1.x;
                    this.y = a2.y - a1.y;
                    return;
                }

            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Method clone returns new instance of Vector
         * @returns {Vector}
         */
        clone() {
            return new Flatten.Vector(this.x, this.y);
        }

        /**
         * Slope of the vector in radians from 0 to 2PI
         * @returns {number}
         */
        get slope() {
            let angle = Math.atan2(this.y, this.x);
            if (angle < 0) angle = 2 * Math.PI + angle;
            return angle;
        }

        /**
         * Length of vector
         * @returns {number}
         */
        get length() {
            return Math.sqrt(this.dot(this));
        }

        /**
         * Returns true if vectors are equal up to [DP_TOL]{@link http://localhost:63342/flatten-js/docs/global.html#DP_TOL}
         * tolerance
         * @param {Vector} v
         * @returns {boolean}
         */
        equalTo(v) {
            return Flatten.Utils.EQ(this.x, v.x) && Flatten.Utils.EQ(this.y, v.y);
        }

        /**
         * Returns new vector multiplied by scalar
         * @param {number} scalar
         * @returns {Vector}
         */
        multiply(scalar) {
            return (new Flatten.Vector(scalar * this.x, scalar * this.y));
        }

        /**
         * Returns scalar product (dot product) of two vectors <br/>
         * <code>dot_product = (this * v)</code>
         * @param {Vector} v Other vector
         * @returns {number}
         */
        dot(v) {
            return (this.x * v.x + this.y * v.y);
        }

        /**
         * Returns vector product (cross product) of two vectors <br/>
         * <code>cross_product = (this x v)</code>
         * @param {Vector} v Other vector
         * @returns {number}
         */
        cross(v) {
            return (this.x * v.y - this.y * v.x);
        }

        /**
         * Returns unit vector.<br/>
         * Throw error if given vector has zero length
         * @returns {Vector}
         */
        normalize() {
            if (!Flatten.Utils.EQ_0(this.length)) {
                return (new Flatten.Vector(this.x / this.length, this.y / this.length));
            }
            throw Flatten.Errors.ZERO_DIVISION;
        }

        /**
         * Returns new vector rotated by given angle,
         * positive angle defines rotation in counter clockwise direction,
         * negative - in clockwise direction
         * @param {number} angle - Angle in radians
         * @returns {Vector}
         */
        rotate(angle) {
            let point = new Flatten.Point(this.x, this.y);
            let rpoint = point.rotate(angle);
            return new Flatten.Vector(rpoint.x, rpoint.y);
        }

        /**
         * Returns vector rotated 90 degrees counter clockwise
         * @returns {Vector}
         */
        rotate90CCW() {
            return new Flatten.Vector(-this.y, this.x);
        };

        /**
         * Returns vector rotated 90 degrees clockwise
         * @returns {Vector}
         */
        rotate90CW() {
            return new Flatten.Vector(this.y, -this.x);
        };

        /**
         * Return inverted vector
         * @returns {Vector}
         */
        invert() {
            return new Flatten.Vector(-this.x, -this.y);
        }

        /**
         * Return result of addition of other vector to this vector as a new vector
         * @param {Vector} v Other vector
         * @returns {Vector}
         */
        add(v) {
            return new Flatten.Vector(this.x + v.x, this.y + v.y);
        }

        /**
         * Return result of subtraction of other vector from current vector as a new vector
         * @param {Vector} v Another vector
         * @returns {Vector}
         */
        subtract(v) {
            return new Flatten.Vector(this.x - v.x, this.y - v.y);
        }

        /**
         * Return angle between this vector and other vector. <br/>
         * Angle is measured from 0 to 2*PI in the counter clockwise direction
         * from current vector to other.
         * @param {Vector} v Another vector
         * @returns {number}
         */
        angleTo(v) {
            let norm1 = this.normalize();
            let norm2 = v.normalize();
            let angle = Math.atan2(norm1.cross(norm2), norm1.dot(norm2));
            if (angle < 0) angle += 2 * Math.PI;
            return angle;
        }

        /**
         * Return vector projection of the current vector on another vector
         * @param {Vector} v Another vector
         * @returns {Vector}
         */
        projectionOn(v) {
            let n = v.normalize();
            let d = this.dot(n);
            return n.multiply(d);
        }

        /**
         * This method returns an object that defines how data will be
         * serialized when called JSON.stringify() method
         * @returns {Object}
         */
        toJSON() {
            return Object.assign({}, this, {name: "vector"});
        }
    }
    Flatten.Vector = Vector;

    /**
     * Function to create vector equivalent to "new" constructor
     * @param args
     */
    const vector = (...args) => new Flatten.Vector(...args);
    Flatten.vector = vector;

    /**
     * Created by Alex Bol on 3/10/2017.
     */

    /**
     * Class representing a segment
     * @type {Segment}
     */
    class Segment {
        /**
         *
         * @param {Point} ps - start point
         * @param {Point} pe - end point
         */
        constructor(...args) {
            /**
             * Start point
             * @type {Point}
             */
            this.ps = new Flatten.Point();
            /**
             * End Point
             * @type {Point}
             */
            this.pe = new Flatten.Point();

            if (args.length === 0) {
                return;
            }

            if (args.length === 1 && args[0] instanceof Array && args[0].length === 4) {
                let coords = args[0];
                this.ps = new Flatten.Point(coords[0], coords[1]);
                this.pe = new Flatten.Point(coords[2], coords[3]);
                return;
            }

            if (args.length === 1 && args[0] instanceof Object && args[0].name === "segment") {
                let {ps, pe} = args[0];
                this.ps = new Flatten.Point(ps.x, ps.y);
                this.pe = new Flatten.Point(pe.x, pe.y);
                return;
            }

            if (args.length === 2 && args[0] instanceof Flatten.Point && args[1] instanceof Flatten.Point) {
                this.ps = args[0].clone();
                this.pe = args[1].clone();
                return;
            }

            if (args.length === 4) {
                this.ps = new Flatten.Point(args[0], args[1]);
                this.pe = new Flatten.Point(args[2], args[3]);
                return;
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Return new cloned instance of segment
         * @returns {Segment}
         */
        clone() {
            return new Flatten.Segment(this.start, this.end);
        }

        /**
         * Start point
         * @returns {Point}
         */
        get start() {
            return this.ps;
        }

        /**
         * End point
         * @returns {Point}
         */
        get end() {
            return this.pe;
        }


        /**
         * Returns array of start and end point
         * @returns [Point,Point]
         */
        get vertices() {
            return [this.ps.clone(), this.pe.clone()];
        }

        /**
         * Length of a segment
         * @returns {number}
         */
        get length() {
            return this.start.distanceTo(this.end)[0];
        }

        /**
         * Slope of the line - angle to axe x in radians from 0 to 2PI
         * @returns {number}
         */
        get slope() {
            let vec = new Flatten.Vector(this.start, this.end);
            return vec.slope;
        }

        /**
         * Bounding box
         * @returns {Box}
         */
        get box() {
            return new Flatten.Box(
                Math.min(this.start.x, this.end.x),
                Math.min(this.start.y, this.end.y),
                Math.max(this.start.x, this.end.x),
                Math.max(this.start.y, this.end.y)
            )
        }

        /**
         * Returns true if equals to query segment, false otherwise
         * @param {Seg} seg - query segment
         * @returns {boolean}
         */
        equalTo(seg) {
            return this.ps.equalTo(seg.ps) && this.pe.equalTo(seg.pe);
        }

        /**
         * Returns true if segment contains point
         * @param {Point} pt Query point
         * @returns {boolean}
         */
        contains(pt) {
            return Flatten.Utils.EQ_0(this.distanceToPoint(pt));
        }

        /**
         * Returns array of intersection points between segment and other shape
         * @param {Shape} shape - Shape of the one of supported types <br/>
         * @returns {Point[]}
         */
        intersect(shape) {
            if (shape instanceof Flatten.Point) {
                return this.contains(shape) ? [shape] : [];
            }

            if (shape instanceof Flatten.Line) {
                return intersectSegment2Line(this, shape);
            }

            if (shape instanceof Flatten.Segment) {
                return  intersectSegment2Segment(this, shape);
            }

            if (shape instanceof Flatten.Circle) {
                return intersectSegment2Circle(this, shape);
            }

            if (shape instanceof Flatten.Box) {
                return intersectSegment2Box(this, shape);
            }

            if (shape instanceof Flatten.Arc) {
                return intersectSegment2Arc(this, shape);
            }

            if (shape instanceof Flatten.Polygon) {
                return  intersectSegment2Polygon(this, shape);
            }
        }

        /**
         * Calculate distance and shortest segment from segment to shape and return as array [distance, shortest segment]
         * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
         * @returns {number} distance from segment to shape
         * @returns {Segment} shortest segment between segment and shape (started at segment, ended at shape)
         */
        distanceTo(shape) {
            if (shape instanceof Flatten.Point) {
                let [dist, shortest_segment] = Flatten.Distance.point2segment(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Circle) {
                let [dist, shortest_segment] = Flatten.Distance.segment2circle(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Line) {
                let [dist, shortest_segment] = Flatten.Distance.segment2line(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Segment) {
                let [dist, shortest_segment] = Flatten.Distance.segment2segment(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Arc) {
                let [dist, shortest_segment] = Flatten.Distance.segment2arc(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Polygon) {
                let [dist, shortest_segment] = Flatten.Distance.shape2polygon(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.PlanarSet) {
                let [dist, shortest_segment] = Flatten.Distance.shape2planarSet(this, shape);
                return [dist, shortest_segment];
            }
        }

        /**
         * Returns unit vector in the direction from start to end
         * @returns {Vector}
         */
        tangentInStart() {
            let vec = new Flatten.Vector(this.start, this.end);
            return vec.normalize();
        }

        /**
         * Return unit vector in the direction from end to start
         * @returns {Vector}
         */
        tangentInEnd() {
            let vec = new Flatten.Vector(this.end, this.start);
            return vec.normalize();
        }

        /**
         * Returns new segment with swapped start and end points
         * @returns {Segment}
         */
        reverse() {
            return new Segment(this.end, this.start);
        }

        /**
         * When point belongs to segment, return array of two segments split by given point,
         * if point is inside segment. Returns clone of this segment if query point is incident
         * to start or end point of the segment. Returns empty array if point does not belong to segment
         * @param {Point} pt Query point
         * @returns {Segment[]}
         */
        split(pt) {
            if (this.start.equalTo(pt))
                return [null, this.clone()];

            if (this.end.equalTo(pt))
                return [this.clone(), null];

            return [
                new Flatten.Segment(this.start, pt),
                new Flatten.Segment(pt, this.end)
            ]
        }

        /**
         * Return middle point of the segment
         * @returns {Point}
         */
        middle() {
            return new Flatten.Point((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2);
        }

        distanceToPoint(pt) {
            let [dist, ...rest] = Flatten.Distance.point2segment(pt, this);
            return dist;
        };

        definiteIntegral(ymin = 0.0) {
            let dx = this.end.x - this.start.x;
            let dy1 = this.start.y - ymin;
            let dy2 = this.end.y - ymin;
            return (dx * (dy1 + dy2) / 2);
        }

        /**
         * Returns new segment translated by vector vec
         * @param {Vector} vec
         * @returns {Segment}
         */
        translate(...args) {
            return new Segment(this.ps.translate(...args), this.pe.translate(...args));
        }

        /**
         * Return new segment rotated by given angle around given point
         * If point omitted, rotate around origin (0,0)
         * Positive value of angle defines rotation counter clockwise, negative - clockwise
         * @param {number} angle - rotation angle in radians
         * @param {Point} center - center point, default is (0,0)
         * @returns {Segment}
         */
        rotate(angle = 0, center = new Flatten.Point()) {
            let m = new Flatten.Matrix();
            m = m.translate(center.x, center.y).rotate(angle).translate(-center.x, -center.y);
            return this.transform(m);
        }

        /**
         * Return new segment transformed using affine transformation matrix
         * @param {Matrix} matrix - affine transformation matrix
         * @returns {Segment} - transformed segment
         */
        transform(matrix = new Flatten.Matrix()) {
            return new Segment(this.ps.transform(matrix), this.pe.transform(matrix))
        }

        /**
         * Returns true if segment start is equal to segment end up to DP_TOL
         * @returns {boolean}
         */
        isZeroLength() {
            return this.ps.equalTo(this.pe)
        }

        /**
         * Sort given array of points from segment start to end, assuming all points lay on the segment
         * @param {Point[]} - array of points
         * @returns {Point[]} new array sorted
         */
        sortPoints(pts) {
            let line = new Flatten.Line(this.start, this.end);
            return line.sortPoints(pts);
        }

        /**
         * This method returns an object that defines how data will be
         * serialized when called JSON.stringify() method
         * @returns {Object}
         */
        toJSON() {
            return Object.assign({}, this, {name: "segment"});
        }

        /**
         * Return string to draw segment in svg
         * @param {Object} attrs - an object with attributes for svg path element,
         * like "stroke", "strokeWidth" <br/>
         * Defaults are stroke:"black", strokeWidth:"1"
         * @returns {string}
         */
        svg(attrs = {}) {
            let {stroke, strokeWidth, id, className} = attrs;
            // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
            let id_str = (id && id.length > 0) ? `id="${id}"` : "";
            let class_str = (className && className.length > 0) ? `class="${className}"` : "";

            return `\n<line x1="${this.start.x}" y1="${this.start.y}" x2="${this.end.x}" y2="${this.end.y}" stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" ${id_str} ${class_str} />`;

        }

    }
    Flatten.Segment = Segment;
    /**
     * Shortcut method to create new segment
     */
    const segment = (...args) => new Flatten.Segment(...args);
    Flatten.segment = segment;

    /**
     * Created by Alex Bol on 2/20/2017.
     */

    let {vector: vector$1} = Flatten;

    /**
     * Class representing a line
     * @type {Line}
     */
    class Line {
        /**
         * Line may be constructed by point and normal vector or by two points that a line passes through
         * @param {Point} pt - point that a line passes through
         * @param {Vector|Point} norm - normal vector to a line or second point a line passes through
         */
        constructor(...args) {
            /**
             * Point a line passes through
             * @type {Point}
             */
            this.pt = new Flatten.Point();
            /**
             * Normal vector to a line <br/>
             * Vector is normalized (length == 1)<br/>
             * Direction of the vector is chosen to satisfy inequality norm * p >= 0
             * @type {Vector}
             */
            this.norm = new Flatten.Vector(0, 1);

            if (args.length == 0) {
                return;
            }

            if (args.length == 1 && args[0] instanceof Object && args[0].name === "line") {
                let {pt, norm} = args[0];
                this.pt = new Flatten.Point(pt);
                this.norm = new Flatten.Vector(norm);
                return;
            }

            if (args.length == 2) {
                let a1 = args[0];
                let a2 = args[1];

                if (a1 instanceof Flatten.Point && a2 instanceof Flatten.Point) {
                    this.pt = a1;
                    this.norm = Line.points2norm(a1, a2);
                    if (this.norm.dot(vector$1(this.pt.x,this.pt.y)) >= 0) {
                        this.norm.invert();
                    }
                    return;
                }

                if (a1 instanceof Flatten.Point && a2 instanceof Flatten.Vector) {
                    if (Flatten.Utils.EQ_0(a2.x) && Flatten.Utils.EQ_0(a2.y)) {
                        throw Flatten.Errors.ILLEGAL_PARAMETERS;
                    }
                    this.pt = a1.clone();
                    this.norm = a2.clone();
                    this.norm = this.norm.normalize();
                    if (this.norm.dot(vector$1(this.pt.x,this.pt.y)) >= 0) {
                        this.norm.invert();
                    }
                    return;
                }

                if (a1 instanceof Flatten.Vector && a2 instanceof Flatten.Point) {
                    if (Flatten.Utils.EQ_0(a1.x) && Flatten.Utils.EQ_0(a1.y)) {
                        throw Flatten.Errors.ILLEGAL_PARAMETERS;
                    }
                    this.pt = a2.clone();
                    this.norm = a1.clone();
                    this.norm = this.norm.normalize();
                    if (this.norm.dot(vector$1(this.pt.x,this.pt.y)) >= 0) {
                        this.norm.invert();
                    }
                    return;
                }
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Return new cloned instance of line
         * @returns {Line}
         */
        clone() {
            return new Flatten.Line(this.pt, this.norm);
        }

        /* The following methods need for implementation of Edge interface
        /**
         * Line has no start point
         * @returns {undefined}
         */
        get start() {return undefined;}

        /**
         * Line has no end point
         */
        get end() {return undefined;}

        /**
         * Return positive infinity number as length
         * @returns {number}
         */
        get length() {return Number.POSITIVE_INFINITY;}

        /**
         * Returns infinite box
         * @returns {Box}
         */
        get box() {
            return new Flatten.Box(
                Number.NEGATIVE_INFINITY,
                Number.NEGATIVE_INFINITY,
                Number.POSITIVE_INFINITY,
                Number.POSITIVE_INFINITY
            )
        }

        /**
         * Middle point is undefined
         * @returns {undefined}
         */
        get middle() {return undefined}

        /**
         * Slope of the line - angle in radians between line and axe x from 0 to 2PI
         * @returns {number} - slope of the line
         */
        get slope() {
            let vec = new Flatten.Vector(this.norm.y, -this.norm.x);
            return vec.slope;
        }

        /**
         * Get coefficients [A,B,C] of a standard line equation in the form Ax + By = C
         * @code [A, B, C] = line.standard
         * @returns {number[]} - array of coefficients
         */
        get standard() {
            let A = this.norm.x;
            let B = this.norm.y;
            let C = this.norm.dot(this.pt);

            return [A, B, C];
        }

        /**
         * Return true if parallel or incident to other line
         * @param {Line} other_line - line to check
         * @returns {boolean}
         */
        parallelTo(other_line) {
            return Flatten.Utils.EQ_0(this.norm.cross(other_line.norm));
        }

        /**
         * Returns true if incident to other line
         * @param {Line} other_line - line to check
         * @returns {boolean}
         */
        incidentTo(other_line) {
            return this.parallelTo(other_line) && this.pt.on(other_line);
        }

        /**
         * Returns true if point belongs to line
         * @param {Point} pt Query point
         * @returns {boolean}
         */
        contains(pt) {
            if (this.pt.equalTo(pt)) {
                return true;
            }
            /* Line contains point if vector to point is orthogonal to the line normal vector */
            let vec = new Flatten.Vector(this.pt, pt);
            return Flatten.Utils.EQ_0(this.norm.dot(vec));
        }

        /**
         * Return coordinate of the point that lays on the line in the transformed
         * coordinate system where center is the projection of the point(0,0) to
         * the line and axe y is collinear to the normal vector. <br/>
         * This method assumes that point lays on the line and does not check it
         * @param {Point} pt - point on line
         * @returns {number}
         */
        coord(pt) {
            return vector$1(pt.x, pt.y).cross(this.norm);
        }

        /**
         * Returns array of intersection points
         * @param {Shape} shape - shape to intersect with
         * @returns {Point[]}
         */
        intersect(shape) {
            if (shape instanceof Flatten.Point) {
                return this.contains(shape) ? [shape] : [];
            }

            if (shape instanceof Flatten.Line) {
                return intersectLine2Line(this, shape);
            }

            if (shape instanceof Flatten.Circle) {
                return intersectLine2Circle(this, shape);
            }

            if (shape instanceof Flatten.Box) {
                return intersectLine2Box(this, shape);
            }

            if (shape instanceof Flatten.Segment) {
                return intersectSegment2Line(shape, this);
            }

            if (shape instanceof Flatten.Arc) {
                return intersectLine2Arc(this, shape);
            }

            if (shape instanceof Flatten.Polygon) {
                return  intersectLine2Polygon(this, shape);
            }

        }

        /**
         * Calculate distance and shortest segment from line to shape and returns array [distance, shortest_segment]
         * @param {Shape} shape Shape of the one of the types Point, Circle, Segment, Arc, Polygon
         * @returns {Number}
         * @returns {Segment}
         */
        distanceTo(shape) {
            if (shape instanceof Flatten.Point) {
                let [distance, shortest_segment] = Flatten.Distance.point2line(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [distance, shortest_segment];
            }

            if (shape instanceof Flatten.Circle) {
                let [distance, shortest_segment] = Flatten.Distance.circle2line(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [distance, shortest_segment];
            }

            if (shape instanceof Flatten.Segment) {
                let [distance, shortest_segment] = Flatten.Distance.segment2line(shape, this);
                return [distance, shortest_segment.reverse()];
            }

            if (shape instanceof Flatten.Arc) {
                let [distance, shortest_segment] = Flatten.Distance.arc2line(shape, this);
                return [distance, shortest_segment.reverse()];
            }

            if (shape instanceof Flatten.Polygon) {
                let [distance, shortest_segment] = Flatten.Distance.shape2polygon(this, shape);
                return [distance, shortest_segment];
            }
        }

        /**
         * Split line with array of points and return array of shapes
         * Assumed that all points lay on the line
         * @param {Point[]}
         * @returns {Shape[]}
         */
        split(pt) {
            if (pt instanceof Flatten.Point) {
                return [new Flatten.Ray(pt, this.norm.invert()), new Flatten.Ray(pt, this.norm)]
            }
            else {
                let multiline = new Flatten.Multiline([this]);
                let sorted_points = this.sortPoints(pt);
                multiline.split(sorted_points);
                return multiline.toShapes();
            }
        }

        /**
         * Sort given array of points that lay on line with respect to coordinate on a line
         * The method assumes that points lay on the line and does not check this
         * @param {Point[]} pts - array of points
         * @returns {Point[]} new array sorted
         */
        sortPoints(pts) {
            return pts.slice().sort( (pt1, pt2) => {
                if (this.coord(pt1) < this.coord(pt2)) {
                    return -1;
                }
                if (this.coord(pt1) > this.coord(pt2)) {
                    return 1;
                }
                return 0;
            })
        }

        /**
         * This method returns an object that defines how data will be
         * serialized when called JSON.stringify() method
         * @returns {Object}
         */
        toJSON() {
            return Object.assign({}, this, {name: "line"});
        }

        /**
         * Return string to draw svg segment representing line inside given box
         * @param {Box} box Box representing drawing area
         * @param {Object} attrs - an object with attributes of svg circle element
         */
        svg(box, attrs = {}) {
            let ip = intersectLine2Box(this, box);
            if (ip.length === 0)
                return "";
            let ps = ip[0];
            let pe = ip.length == 2 ? ip[1] : ip.find(pt => !pt.equalTo(ps));
            if (pe === undefined) pe = ps;
            let segment = new Flatten.Segment(ps, pe);
            return segment.svg(attrs);
        }

        static points2norm(pt1, pt2) {
            if (pt1.equalTo(pt2)) {
                throw Flatten.Errors.ILLEGAL_PARAMETERS;
            }
            let vec = new Flatten.Vector(pt1, pt2);
            let unit = vec.normalize();
            return unit.rotate90CCW();
        }
    }
    Flatten.Line = Line;
    /**
     * Function to create line equivalent to "new" constructor
     * @param args
     */
    const line = (...args) => new Flatten.Line(...args);
    Flatten.line = line;

    /**
     * Created by Alex Bol on 3/6/2017.
     */

    /**
     * Class representing a circle
     * @type {Circle}
     */
    class Circle {
        /**
         *
         * @param {Point} pc - circle center point
         * @param {number} r - circle radius
         */
        constructor(...args) {
            /**
             * Circle center
             * @type {Point}
             */
            this.pc = new Flatten.Point();
            /**
             * Circle radius
             * @type {number}
             */
            this.r = 1;

            if (args.length == 1 && args[0] instanceof Object && args[0].name === "circle") {
                let {pc, r} = args[0];
                this.pc = new Flatten.Point(pc);
                this.r = r;
                return;
            } else {
                let [pc, r] = [...args];
                if (pc && pc instanceof Flatten.Point) this.pc = pc.clone();
                if (r !== undefined) this.r = r;
                return;
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Return new cloned instance of circle
         * @returns {Circle}
         */
        clone() {
            return new Flatten.Circle(this.pc.clone(), this.r);
        }

        /**
         * Circle center
         * @returns {Point}
         */
        get center() {
            return this.pc;
        }

        /**
         * Circle bounding box
         * @returns {Box}
         */
        get box() {
            return new Flatten.Box(
                this.pc.x - this.r,
                this.pc.y - this.r,
                this.pc.x + this.r,
                this.pc.y + this.r
            );
        }

        /**
         * Return true if circle contains shape: no point of shape lies outside of the circle
         * @param {Shape} shape - test shape
         * @returns {boolean}
         */
        contains(shape) {
            if (shape instanceof Flatten.Point) {
                return Flatten.Utils.LE(shape.distanceTo(this.center)[0], this.r);
            }

            if (shape instanceof Flatten.Segment) {
                return Flatten.Utils.LE(shape.start.distanceTo(this.center)[0], this.r) &&
                    Flatten.Utils.LE(shape.end.distanceTo(this.center)[0], this.r);
            }

            if (shape instanceof Flatten.Arc) {
                return this.intersect(shape).length === 0 &&
                    Flatten.Utils.LE(shape.start.distanceTo(this.center)[0], this.r) &&
                    Flatten.Utils.LE(shape.end.distanceTo(this.center)[0], this.r);
            }

            if (shape instanceof Flatten.Circle) {
                return this.intersect(shape).length === 0 &&
                    Flatten.Utils.LE(shape.r, this.r) &&
                    Flatten.Utils.LE(shape.center.distanceTo(this.center)[0], this.r);
            }

            /* TODO: box, polygon */
        }

        /**
         * Transform circle to closed arc
         * @param {boolean} counterclockwise
         * @returns {Arc}
         */
        toArc(counterclockwise = true) {
            return new Flatten.Arc(this.center, this.r, Math.PI, -Math.PI, counterclockwise);
        }

        /**
         * Returns array of intersection points between circle and other shape
         * @param {Shape} shape Shape of the one of supported types
         * @returns {Point[]}
         */
        intersect(shape) {
            if (shape instanceof Flatten.Point) {
                return this.contains(shape) ? [shape] : [];
            }
            if (shape instanceof Flatten.Line) {
                return intersectLine2Circle(shape, this);
            }

            if (shape instanceof Flatten.Segment) {
                return intersectSegment2Circle(shape, this);
            }

            if (shape instanceof Flatten.Circle) {
                return intersectCircle2Circle(shape, this);
            }

            if (shape instanceof Flatten.Box) {
                return intersectCircle2Box(this, shape);
            }

            if (shape instanceof Flatten.Arc) {
                return intersectArc2Circle(shape, this);
            }
            if (shape instanceof Flatten.Polygon) {
                return intersectCircle2Polygon(this, shape);
            }
        }

        /**
         * Calculate distance and shortest segment from circle to shape and return array [distance, shortest segment]
         * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
         * @returns {number} distance from circle to shape
         * @returns {Segment} shortest segment between circle and shape (started at circle, ended at shape)

         */
        distanceTo(shape) {
            if (shape instanceof Flatten.Point) {
                let [distance, shortest_segment] = Flatten.Distance.point2circle(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [distance, shortest_segment];
            }

            if (shape instanceof Flatten.Circle) {
                let [distance, shortest_segment] = Flatten.Distance.circle2circle(this, shape);
                return [distance, shortest_segment];
            }

            if (shape instanceof Flatten.Line) {
                let [distance, shortest_segment] = Flatten.Distance.circle2line(this, shape);
                return [distance, shortest_segment];
            }

            if (shape instanceof Flatten.Segment) {
                let [distance, shortest_segment] = Flatten.Distance.segment2circle(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [distance, shortest_segment];
            }

            if (shape instanceof Flatten.Arc) {
                let [distance, shortest_segment] = Flatten.Distance.arc2circle(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [distance, shortest_segment];
            }

            if (shape instanceof Flatten.Polygon) {
                let [distance, shortest_segment] = Flatten.Distance.shape2polygon(this, shape);
                return [distance, shortest_segment];
            }

            if (shape instanceof Flatten.PlanarSet) {
                let [dist, shortest_segment] = Flatten.Distance.shape2planarSet(this, shape);
                return [dist, shortest_segment];
            }
        }

        /**
         * This method returns an object that defines how data will be
         * serialized when called JSON.stringify() method
         * @returns {Object}
         */
        toJSON() {
            return Object.assign({}, this, {name: "circle"});
        }

        /**
         * Return string to draw circle in svg
         * @param {Object} attrs - an object with attributes of svg circle element,
         * like "stroke", "strokeWidth", "fill" <br/>
         * Defaults are stroke:"black", strokeWidth:"1", fill:"none"
         * @returns {string}
         */
        svg(attrs = {}) {
            let {stroke, strokeWidth, fill, fillOpacity, id, className} = attrs;
            // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
            let id_str = (id && id.length > 0) ? `id="${id}"` : "";
            let class_str = (className && className.length > 0) ? `class="${className}"` : "";

            return `\n<circle cx="${this.pc.x}" cy="${this.pc.y}" r="${this.r}" stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "none"}" fill-opacity="${fillOpacity || 1.0}" ${id_str} ${class_str} />`;
        }

    }
    Flatten.Circle = Circle;
    /**
     * Shortcut to create new circle
     * @param args
     */
    const circle = (...args) => new Flatten.Circle(...args);
    Flatten.circle = circle;

    /**
     * Created by Alex Bol on 3/10/2017.
     */

    /**
     * Class representing a circular arc
     * @type {Arc}
     */
    class Arc {
        /**
         *
         * @param {Point} pc - arc center
         * @param {number} r - arc radius
         * @param {number} startAngle - start angle in radians from 0 to 2*PI
         * @param {number} endAngle - end angle in radians from 0 to 2*PI
         * @param {boolean} counterClockwise - arc direction, true - clockwise, false - counter clockwise
         */
        constructor(...args) {
            /**
             * Arc center
             * @type {Point}
             */
            this.pc = new Flatten.Point();
            /**
             * Arc radius
             * @type {number}
             */
            this.r = 1;
            /**
             * Arc start angle in radians
             * @type {number}
             */
            this.startAngle = 0;
            /**
             * Arc end angle in radians
             * @type {number}
             */
            this.endAngle = 2 * Math.PI;
            /**
             * Arc orientation
             * @type {boolean}
             */
            this.counterClockwise = Flatten.CCW;

            if (args.length == 0)
                return;

            if (args.length == 1 && args[0] instanceof Object && args[0].name === "arc") {
                let {pc, r, startAngle, endAngle, counterClockwise} = args[0];
                this.pc = new Flatten.Point(pc.x, pc.y);
                this.r = r;
                this.startAngle = startAngle;
                this.endAngle = endAngle;
                this.counterClockwise = counterClockwise;
                return;
            } else {
                let [pc, r, startAngle, endAngle, counterClockwise] = [...args];
                if (pc && pc instanceof Flatten.Point) this.pc = pc.clone();
                if (r !== undefined) this.r = r;
                if (startAngle !== undefined) this.startAngle = startAngle;
                if (endAngle !== undefined) this.endAngle = endAngle;
                if (counterClockwise !== undefined) this.counterClockwise = counterClockwise;
                return;
            }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Return new cloned instance of arc
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

            if (Flatten.Utils.GT(sweep, Flatten.PIx2)) {
                sweep -= Flatten.PIx2;
            }
            if (Flatten.Utils.LT(sweep, 0)) {
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
            return Math.abs(this.sweep * this.r);
        }

        /**
         * Get bounding box of the arc
         * @returns {Box}
         */
        get box() {
            let func_arcs = this.breakToFunctional();
            let box = func_arcs.reduce((acc, arc) => acc.merge(arc.start.box), new Flatten.Box());
            box = box.merge(this.end.box);
            return box;
        }

        /**
         * Returns true if arc contains point, false otherwise
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
         * When given point belongs to arc, return array of two arcs split by this point. If points is incident
         * to start or end point of the arc, return clone of the arc. If point does not belong to the arcs, return
         * empty array.
         * @param {Point} pt Query point
         * @returns {Arc[]}
         */
        split(pt) {
            if (this.start.equalTo(pt))
                return [null, this.clone()];

            if (this.end.equalTo(pt))
                return [this.clone(), null];

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
            let endAngle = this.counterClockwise ? this.startAngle + this.sweep / 2 : this.startAngle - this.sweep / 2;
            let arc = new Flatten.Arc(this.pc, this.r, this.startAngle, endAngle, this.counterClockwise);
            return arc.end;
        }

        /**
         * Returns chord height ("sagitta") of the arc
         * @returns {number}
         */
        chordHeight() {
            return (1.0 - Math.cos(Math.abs(this.sweep / 2.0))) * this.r;
        }

        /**
         * Returns array of intersection points between arc and other shape
         * @param {Shape} shape Shape of the one of supported types <br/>
         * @returns {Points[]}
         */
        intersect(shape) {
            if (shape instanceof Flatten.Point) {
                return this.contains(shape) ? [shape] : [];
            }
            if (shape instanceof Flatten.Line) {
                return intersectLine2Arc(shape, this);
            }
            if (shape instanceof Flatten.Circle) {
                return intersectArc2Circle(this, shape);
            }
            if (shape instanceof Flatten.Segment) {
                return intersectSegment2Arc(shape, this);
            }
            if (shape instanceof Flatten.Box) {
                return intersectArc2Box(this, shape);
            }
            if (shape instanceof Flatten.Arc) {
                return intersectArc2Arc(this, shape);
            }
            if (shape instanceof Flatten.Polygon) {
                return intersectArc2Polygon(this, shape);
            }
        }

        /**
         * Calculate distance and shortest segment from arc to shape and return array [distance, shortest segment]
         * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
         * @returns {number} distance from arc to shape
         * @returns {Segment} shortest segment between arc and shape (started at arc, ended at shape)

         */
        distanceTo(shape) {
            if (shape instanceof Flatten.Point) {
                let [dist, shortest_segment] = Flatten.Distance.point2arc(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Circle) {
                let [dist, shortest_segment] = Flatten.Distance.arc2circle(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Line) {
                let [dist, shortest_segment] = Flatten.Distance.arc2line(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Segment) {
                let [dist, shortest_segment] = Flatten.Distance.segment2arc(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Arc) {
                let [dist, shortest_segment] = Flatten.Distance.arc2arc(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Polygon) {
                let [dist, shortest_segment] = Flatten.Distance.shape2polygon(this, shape);
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.PlanarSet) {
                let [dist, shortest_segment] = Flatten.Distance.shape2planarSet(this, shape);
                return [dist, shortest_segment];
            }
        }

        /**
         * Breaks arc in extreme point 0, pi/2, pi, 3*pi/2 and returns array of sub-arcs
         * @returns {Arcs[]}
         */
        breakToFunctional() {
            let func_arcs_array = [];
            let angles = [0, Math.PI / 2, 2 * Math.PI / 2, 3 * Math.PI / 2];
            let pts = [
                this.pc.translate(this.r, 0),
                this.pc.translate(0, this.r),
                this.pc.translate(-this.r, 0),
                this.pc.translate(0, -this.r)
            ];

            // If arc contains extreme point,
            // create test arc started at start point and ended at this extreme point
            let test_arcs = [];
            for (let i = 0; i < 4; i++) {
                if (pts[i].on(this)) {
                    test_arcs.push(new Flatten.Arc(this.pc, this.r, this.startAngle, angles[i], this.counterClockwise));
                }
            }

            if (test_arcs.length == 0) {                  // arc does contain any extreme point
                func_arcs_array.push(this.clone());
            } else {                                        // arc passes extreme point
                // sort these arcs by length
                test_arcs.sort((arc1, arc2) => arc1.length - arc2.length);

                for (let i = 0; i < test_arcs.length; i++) {
                    let prev_arc = func_arcs_array.length > 0 ? func_arcs_array[func_arcs_array.length - 1] : undefined;
                    let new_arc;
                    if (prev_arc) {
                        new_arc = new Flatten.Arc(this.pc, this.r, prev_arc.endAngle, test_arcs[i].endAngle, this.counterClockwise);
                    } else {
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
                } else {
                    new_arc = new Flatten.Arc(this.pc, this.r, this.startAngle, this.endAngle, this.counterClockwise);
                }
                // It could be 2*PI when occasionally start = 0 and end = 2*PI but this is not valid for breakToFunctional
                if (!Flatten.Utils.EQ_0(new_arc.length) && !Flatten.Utils.EQ(new_arc.sweep, 2*Math.PI)) {
                    func_arcs_array.push(new_arc.clone());
                }
            }
            return func_arcs_array;
        }

        /**
         * Return tangent unit vector in the start point in the direction from start to end
         * @returns {Vector}
         */
        tangentInStart() {
            let vec = new Flatten.Vector(this.pc, this.start);
            let angle = this.counterClockwise ? Math.PI / 2. : -Math.PI / 2.;
            let tangent = vec.rotate(angle).normalize();
            return tangent;
        }

        /**
         * Return tangent unit vector in the end point in the direction from end to start
         * @returns {Vector}
         */
        tangentInEnd() {
            let vec = new Flatten.Vector(this.pc, this.end);
            let angle = this.counterClockwise ? -Math.PI / 2. : Math.PI / 2.;
            let tangent = vec.rotate(angle).normalize();
            return tangent;
        }

        /**
         * Returns new arc with swapped start and end angles and reversed direction
         * @returns {Arc}
         */
        reverse() {
            return new Flatten.Arc(this.pc, this.r, this.endAngle, this.startAngle, !this.counterClockwise);
        }

        /**
         * Returns new arc translated by vector vec
         * @param {Vector} vec
         * @returns {Segment}
         */
        translate(...args) {
            let arc = this.clone();
            arc.pc = this.pc.translate(...args);
            return arc;
        }

        /**
         * Return new segment rotated by given angle around given point
         * If point omitted, rotate around origin (0,0)
         * Positive value of angle defines rotation counter clockwise, negative - clockwise
         * @param {number} angle - rotation angle in radians
         * @param {Point} center - center point, default is (0,0)
         * @returns {Arc}
         */
        rotate(angle = 0, center = new Flatten.Point()) {
            let m = new Flatten.Matrix();
            m = m.translate(center.x, center.y).rotate(angle).translate(-center.x, -center.y);
            return this.transform(m);
        }

        /**
         * Return new arc transformed using affine transformation matrix <br/>
         * Note, that non-equal scaling by x and y (matrix[0] != matrix[3]) produce illegal result
         * TODO: support non-equal scaling arc to ellipse or throw exception ?
         * @param {Matrix} matrix - affine transformation matrix
         * @returns {Arc}
         */
        transform(matrix = new Flatten.Matrix()) {
            let newStart = this.start.transform(matrix);
            let newEnd = this.end.transform(matrix);
            let newCenter = this.pc.transform(matrix);
            let arc = Flatten.Arc.arcSE(newCenter, newStart, newEnd, this.counterClockwise);
            return arc;
        }

        static arcSE(center, start, end, counterClockwise) {
            let {vector} = Flatten;
            let startAngle = vector(center, start).slope;
            let endAngle = vector(center, end).slope;
            if (Flatten.Utils.EQ(startAngle, endAngle)) {
                endAngle += 2 * Math.PI;
                counterClockwise = true;
            }
            let r = vector(center, start).length;

            return new Flatten.Arc(center, r, startAngle, endAngle, counterClockwise);
        }

        definiteIntegral(ymin = 0) {
            let f_arcs = this.breakToFunctional();
            let area = f_arcs.reduce((acc, arc) => acc + arc.circularSegmentDefiniteIntegral(ymin), 0.0);
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
            return (0.5 * this.r * this.r * (this.sweep - Math.sin(this.sweep)))
        }

        /**
         * Sort given array of points from arc start to end, assuming all points lay on the arc
         * @param {Point[]} array of points
         * @returns {Point[]} new array sorted
         */
        sortPoints(pts) {
            let {vector} = Flatten;
            return pts.slice().sort( (pt1, pt2) => {
                let slope1 = vector(this.pc, pt1).slope;
                let slope2 = vector(this.pc, pt2).slope;
                if (slope1 < slope2) {
                    return -1;
                }
                if (slope1 > slope2) {
                    return 1;
                }
                return 0;
            })
        }

        /**
         * This method returns an object that defines how data will be
         * serialized when called JSON.stringify() method
         * @returns {Object}
         */
        toJSON() {
            return Object.assign({}, this, {name: "arc"});
        }

        /**
         * Return string to draw arc in svg
         * @param {Object} attrs - an object with attributes of svg path element,
         * like "stroke", "strokeWidth", "fill" <br/>
         * Defaults are stroke:"black", strokeWidth:"1", fill:"none"
         * @returns {string}
         */
        svg(attrs = {}) {
            let largeArcFlag = this.sweep <= Math.PI ? "0" : "1";
            let sweepFlag = this.counterClockwise ? "1" : "0";
            let {stroke, strokeWidth, fill, id, className} = attrs;
            // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
            let id_str = (id && id.length > 0) ? `id="${id}"` : "";
            let class_str = (className && className.length > 0) ? `class="${className}"` : "";

            if (Flatten.Utils.EQ(this.sweep, 2 * Math.PI)) {
                let circle = new Flatten.Circle(this.pc, this.r);
                return circle.svg(attrs);
            } else {
                return `\n<path d="M${this.start.x},${this.start.y}
                             A${this.r},${this.r} 0 ${largeArcFlag},${sweepFlag} ${this.end.x},${this.end.y}"
                    stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "none"}" ${id_str} ${class_str} />`
            }
        }

    }
    Flatten.Arc = Arc;
    /**
     * Function to create arc equivalent to "new" constructor
     * @param args
     */
    const arc = (...args) => new Flatten.Arc(...args);
    Flatten.arc = arc;

    /**
     * Created by Alex Bol on 3/7/2017.
     */

    /**
     * Class Box represent bounding box of the shape
     * @type {Box}
     */
    class Box {
        /**
         *
         * @param {number} xmin - minimal x coordinate
         * @param {number} ymin - minimal y coordinate
         * @param {number} xmax - maximal x coordinate
         * @param {number} ymax - maximal y coordinate
         */
        constructor(xmin = undefined, ymin = undefined, xmax = undefined, ymax = undefined) {
            /**
             * Minimal x coordinate
             * @type {number}
             */
            this.xmin = xmin;
            /**
             * Minimal y coordinate
             * @type {number}
             */
            this.ymin = ymin;
            /**
             * Maximal x coordinate
             * @type {number}
             */
            this.xmax = xmax;
            /**
             * Maximal y coordinate
             * @type {number}
             */
            this.ymax = ymax;
        }

        /**
         * Return new cloned instance of box
         * @returns {Box}
         */
        clone() {
            return new Box(this.xmin, this.ymin, this.xmax, this.ymax);
        }

        /**
         * Property low need for interval tree interface
         * @returns {Point}
         */
        get low() {
            return new Flatten.Point(this.xmin, this.ymin);
        }

        /**
         * Property high need for interval tree interface
         * @returns {Point}
         */
        get high() {
            return new Flatten.Point(this.xmax, this.ymax);
        }

        /**
         * Property max returns the box itself !
         * @returns {Box}
         */
        get max() {
            return this.clone();
        }

        /**
         * Return center of the box
         * @returns {Point}
         */
        get center() {
            return new Flatten.Point((this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2);
        }

        /**
         * Return property box like all other shapes
         * @returns {Box}
         */
        get box() {
            return this.clone();
        }

        /**
         * Returns true if not intersected with other box
         * @param {Box} other_box - other box to test
         * @returns {boolean}
         */
        not_intersect(other_box) {
            return (
                this.xmax < other_box.xmin ||
                this.xmin > other_box.xmax ||
                this.ymax < other_box.ymin ||
                this.ymin > other_box.ymax
            );
        }

        /**
         * Returns true if intersected with other box
         * @param {Box} other_box - Query box
         * @returns {boolean}
         */
        intersect(other_box) {
            return !this.not_intersect(other_box);
        }

        /**
         * Returns new box merged with other box
         * @param {Box} other_box - Other box to merge with
         * @returns {Box}
         */
        merge(other_box) {
            return new Box(
                this.xmin === undefined ? other_box.xmin : Math.min(this.xmin, other_box.xmin),
                this.ymin === undefined ? other_box.ymin : Math.min(this.ymin, other_box.ymin),
                this.xmax === undefined ? other_box.xmax : Math.max(this.xmax, other_box.xmax),
                this.ymax === undefined ? other_box.ymax : Math.max(this.ymax, other_box.ymax)
            );
        }

        /**
         * Defines predicate "less than" between two boxes. Need for interval index
         * @param {Box} other_box - other box
         * @returns {boolean} - true if this box less than other box, false otherwise
         */
        less_than(other_box) {
            if (this.low.lessThan(other_box.low))
                return true;
            if (this.low.equalTo(other_box.low) && this.high.lessThan(other_box.high))
                return true;
            return false;
        }

        /**
         * Returns true if this box is equal to other box, false otherwise
         * @param {Box} other_box - query box
         * @returns {boolean}
         */
        equal_to(other_box) {
            return (this.low.equalTo(other_box.low) && this.high.equalTo(other_box.high));
        }

        output() {
            return this.clone();
        }

        static comparable_max(box1, box2) {
            // return pt1.lessThan(pt2) ? pt2.clone() : pt1.clone();
            return box1.merge(box2);
        }

        static comparable_less_than(pt1, pt2) {
            return pt1.lessThan(pt2);
        }

        /**
         * Set new values to the box object
         * @param {number} xmin - miminal x coordinate
         * @param {number} ymin - minimal y coordinate
         * @param {number} xmax - maximal x coordinate
         * @param {number} ymax - maximal y coordinate
         */
        set(xmin, ymin, xmax, ymax) {
            this.xmin = xmin;
            this.ymin = ymin;
            this.xmax = xmax;
            this.ymax = ymax;
        }

        /**
         * Transform box into array of points from low left corner in counter clockwise
         * @returns {Point[]}
         */
        toPoints() {
            return [
                new Flatten.Point(this.xmin, this.ymin),
                new Flatten.Point(this.xmax, this.ymin),
                new Flatten.Point(this.xmax, this.ymax),
                new Flatten.Point(this.xmin, this.ymax)
            ];
        }

        /**
         * Transform box into array of segments from low left corner in counter clockwise
         * @returns {Segment[]}
         */
        toSegments() {
            let pts = this.toPoints();
            return [
                new Flatten.Segment(pts[0], pts[1]),
                new Flatten.Segment(pts[1], pts[2]),
                new Flatten.Segment(pts[2], pts[3]),
                new Flatten.Segment(pts[3], pts[0])
            ];
        }

        /**
         * Return string to draw circle in svg
         * @param {Object} attrs - an object with attributes of svg rectangle element,
         * like "stroke", "strokeWidth", "fill" <br/>
         * Defaults are stroke:"black", strokeWidth:"1", fill:"none"
         * @returns {string}
         */
        svg(attrs = {}) {
            let {stroke, strokeWidth, fill, id, className} = attrs;
            // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
            let id_str = (id && id.length > 0) ? `id="${id}"` : "";
            let class_str = (className && className.length > 0) ? `class="${className}"` : "";
            let width = this.xmax - this.xmin;
            let height = this.ymax - this.ymin;

            return `\n<rect x="${this.xmin}" y="${this.ymin}" width=${width} height=${height} stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "none"}" ${id_str} ${class_str} />`;
        };
    }
    Flatten.Box = Box;
    /**
     * Shortcut to create new circle
     * @param args
     * @returns {Box}
     */
    const box = (...args) => new Flatten.Box(...args);
    Flatten.box = box;

    /**
     * Created by Alex Bol on 3/17/2017.
     */

    /**
     * Class representing an edge of polygon. Edge shape may be Segment or Arc.
     * Each edge contains references to the next and previous edges in the face of the polygon.
     *
     * @type {Edge}
     */
    class Edge {
        /**
         * Construct new instance of edge
         * @param {Shape} shape Shape of type Segment or Arc
         */
        constructor(shape) {
            /**
             * Shape of the edge: Segment or Arc
             * @type {Segment|Arc}
             */
            this.shape = shape;
            /**
             * Pointer to the next edge in the face
             * @type {Edge}
             */
            this.next = undefined;
            /**
             * Pointer to the previous edge in the face
             * @type {Edge}
             */
            this.prev = undefined;
            /**
             * Pointer to the face containing this edge
             * @type {Face}
             */
            this.face = undefined;
            /**
             * "Arc distance" from the face start
             * @type {number}
             */
            this.arc_length = 0;
            /**
             * Start inclusion flag (inside/outside/boundary)
             * @type {*}
             */
            this.bvStart = undefined;
            /**
             * End inclusion flag (inside/outside/boundary)
             * @type {*}
             */
            this.bvEnd = undefined;
            /**
             * Edge inclusion flag (Flatten.INSIDE, Flatten.OUTSIDE, Flatten.BOUNDARY)
             * @type {*}
             */
            this.bv = undefined;
            /**
             * Overlap flag for boundary edge (Flatten.OVERLAP_SAME/Flatten.OVERLAP_OPPOSITE)
             * @type {*}
             */
            this.overlap = undefined;
        }

        /**
         * Get edge start point
         */
        get start() {
            return this.shape.start;
        }

        /**
         * Get edge end point
         */
        get end() {
            return this.shape.end;
        }

        /**
         * Get edge length
         */
        get length() {
            return this.shape.length;
        }

        /**
         * Get bounding box of the edge
         * @returns {Box}
         */
        get box() {
            return this.shape.box;
        }

        isSegment() {
            return this.shape instanceof Flatten.Segment;
        }

        isArc() {
            return this.shape instanceof Flatten.Arc;
        }

        /**
         * Get middle point of the edge
         * @returns {Point}
         */
        middle() {
            return this.shape.middle();
        }

        /**
         * Returns true if point belongs to the edge, false otherwise
         * @param {Point} pt - test point
         */
        contains(pt) {
            return this.shape.contains(pt);
        }

        /**
         * Set inclusion flag of the edge with respect to another polygon
         * Inclusion flag is one of Flatten.INSIDE, Flatten.OUTSIDE, Flatten.BOUNDARY
         * @param polygon
         */
        setInclusion(polygon) {
            if (this.bv !== undefined) return this.bv;

            if (this.shape instanceof Flatten.Line || this.shape instanceof Flatten.Ray) {
                this.bv = Flatten.OUTSIDE;
                return this.bv;
            }

            if (this.bvStart === undefined) {
                this.bvStart = ray_shoot(polygon, this.start);
            }
            if (this.bvEnd === undefined) {
                this.bvEnd = ray_shoot(polygon, this.end);
            }
            /* At least one end outside - the whole edge outside */
            if (this.bvStart === Flatten.OUTSIDE || this.bvEnd == Flatten.OUTSIDE) {
                this.bv = Flatten.OUTSIDE;
            }
            /* At least one end inside - the whole edge inside */
            else if (this.bvStart === Flatten.INSIDE || this.bvEnd == Flatten.INSIDE) {
                this.bv = Flatten.INSIDE;
            }
            /* Both are boundary - check the middle point */
            else {
                let bvMiddle = ray_shoot(polygon, this.middle());
                // let boundary = this.middle().distanceTo(polygon)[0] < 10*Flatten.DP_TOL;
                // let bvMiddle = boundary ? Flatten.BOUNDARY : ray_shoot(polygon, this.middle());
                this.bv = bvMiddle;
            }
            return this.bv;
        }

        /**
         * Set overlapping between two coincident boundary edges
         * Overlapping flag is one of Flatten.OVERLAP_SAME or Flatten.OVERLAP_OPPOSITE
         * @param edge
         */
        setOverlap(edge) {
            let flag = undefined;
            let shape1 = this.shape;
            let shape2 = edge.shape;

            if (shape1 instanceof Flatten.Segment && shape2 instanceof Flatten.Segment) {
                if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end)) {
                    flag = Flatten.OVERLAP_SAME;
                } else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start)) {
                    flag = Flatten.OVERLAP_OPPOSITE;
                }
            } else if (shape1 instanceof Flatten.Arc && shape2 instanceof Flatten.Arc) {
                if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end) && /*shape1.counterClockwise === shape2.counterClockwise &&*/
                    shape1.middle().equalTo(shape2.middle())) {
                    flag = Flatten.OVERLAP_SAME;
                } else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start) && /*shape1.counterClockwise !== shape2.counterClockwise &&*/
                    shape1.middle().equalTo(shape2.middle())) {
                    flag = Flatten.OVERLAP_OPPOSITE;
                }
            } else if (shape1 instanceof Flatten.Segment && shape2 instanceof Flatten.Arc ||
                shape1 instanceof Flatten.Arc && shape2 instanceof Flatten.Segment) {
                if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end) && shape1.middle().equalTo(shape2.middle())) {
                    flag = Flatten.OVERLAP_SAME;
                } else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start) && shape1.middle().equalTo(shape2.middle())) {
                    flag = Flatten.OVERLAP_OPPOSITE;
                }
            }

            /* Do not update overlap flag if already set on previous chain */
            if (this.overlap === undefined) this.overlap = flag;
            if (edge.overlap === undefined) edge.overlap = flag;
        }

        svg() {
            if (this.shape instanceof Flatten.Segment) {
                return ` L${this.shape.end.x},${this.shape.end.y}`;
            } else if (this.shape instanceof Flatten.Arc) {
                let arc = this.shape;
                let largeArcFlag;
                let sweepFlag = arc.counterClockwise ? "1" : "0";

                // Draw full circe arc as special case: split it into two half-circles
                if (Flatten.Utils.EQ(arc.sweep, 2 * Math.PI)) {
                    let sign = arc.counterClockwise ? 1 : -1;
                    let halfArc1 = new Flatten.Arc(arc.pc, arc.r, arc.startAngle, arc.startAngle + sign * Math.PI, arc.counterClockwise);
                    let halfArc2 = new Flatten.Arc(arc.pc, arc.r, arc.startAngle + sign * Math.PI, arc.endAngle, arc.counterClockwise);

                    largeArcFlag = "0";

                    return ` A${halfArc1.r},${halfArc1.r} 0 ${largeArcFlag},${sweepFlag} ${halfArc1.end.x},${halfArc1.end.y}
                    A${halfArc2.r},${halfArc2.r} 0 ${largeArcFlag},${sweepFlag} ${halfArc2.end.x},${halfArc2.end.y}`
                } else {
                    largeArcFlag = arc.sweep <= Math.PI ? "0" : "1";

                    return ` A${arc.r},${arc.r} 0 ${largeArcFlag},${sweepFlag} ${arc.end.x},${arc.end.y}`;
                }
            }
        }

        toJSON() {
            return this.shape.toJSON();
        }
    }
    Flatten.Edge = Edge;

    /**
     * Class implements circular bidirectional linked list <br/>
     * LinkedListElement - object of any type that has properties next and prev.
     */
    class CircularLinkedList extends LinkedList {
        constructor(first, last) {
            super(first, last);
            this.setCircularLinks();
        }

        setCircularLinks() {
            if (this.isEmpty()) return;
            this.last.next = this.first;
            this.first.prev = this.last;
        }

        [Symbol.iterator]() {
            let element = undefined;
            return {
                next: () => {
                    let value = element ? element : this.first;
                    let done = this.first ? (element ? element === this.first : false) : true;
                    element = value ? value.next : undefined;
                    return {value: value, done: done};
                }
            };
        };

        /**
         * Append new element to the end of the list
         * @param {LinkedListElement} element - new element to be appended
         * @returns {CircularLinkedList}
         */
        append(element) {
            super.append(element);
            this.setCircularLinks();
            return this;
        }

        /**
         * Insert new element to the list after elementBefore
         * @param {LinkedListElement} newElement - new element to be inserted
         * @param {LinkedListElement} elementBefore - element in the list to insert after it
         * @returns {CircularLinkedList}
         */
        insert(newElement, elementBefore) {
            super.insert(newElement, elementBefore);
            this.setCircularLinks();
            return this;
        }

        /**
         * Remove element from the list
         * @param {LinkedListElement} element - element to be removed from the list
         * @returns {CircularLinkedList}
         */
        remove(element) {
            super.remove(element);
            // this.setCircularLinks();
            return this;
        }
    }

    /**
     * Created by Alex Bol on 3/17/2017.
     */

    /**
     * Class representing a face (closed loop) in a [polygon]{@link Flatten.Polygon} object.
     * Face is a circular bidirectional linked list of [edges]{@link Flatten.Edge}.
     * Face object cannot be instantiated with a constructor.
     * Instead, use [polygon.addFace()]{@link Flatten.Polygon#addFace} method.
     * <br/>
     * Note, that face only set entry point to the linked list of edges but does not contain edges by itself.
     * Container of edges is a property of the polygon object. <br/>
     *
     * @example
     * // Face implements "next" iterator which enables to iterate edges in for loop:
     * for (let edge of face) {
     *      console.log(edge.shape.length)     // do something
     * }
     *
     * // Instead, it is possible to iterate edges as linked list, starting from face.first:
     * let edge = face.first;
     * do {
     *   console.log(edge.shape.length);   // do something
     *   edge = edge.next;
     * } while (edge != face.first)
     */
    class Face extends CircularLinkedList {
        constructor(polygon, ...args) {
            super();            // construct empty list of edges
            /**
             * Reference to the first edge in face
             */
            // this.first;
            /**
             * Reference to the last edge in face
             */
            // this.last;

            this._box = undefined;  // new Box();
            this._orientation = undefined;

            if (args.length == 0) {
                return;
            }

            /* If passed an array it supposed to be:
             1) array of shapes that performs close loop or
             2) array of points that performs set of vertices
             */
            if (args.length == 1) {
                if (args[0] instanceof Array) {
                    // let argsArray = args[0];
                    let shapes = args[0];  // argsArray[0];
                    if (shapes.length == 0)
                        return;

                    /* array of Flatten.Points */
                    if (shapes.every((shape) => {return shape instanceof Flatten.Point})) {
                        let segments = Face.points2segments(shapes);
                        this.shapes2face(polygon.edges, segments);
                    }
                    /* array of points as pairs of numbers */
                    else if (shapes.every((shape) => {return shape instanceof Array && shape.length === 2})) {
                        let points = shapes.map((shape) => new Flatten.Point(shape[0],shape[1]));
                        let segments = Face.points2segments(points);
                        this.shapes2face(polygon.edges, segments);
                    }
                    /* array of segments ot arcs */
                    else if (shapes.every((shape) => {
                        return (shape instanceof Flatten.Segment || shape instanceof Flatten.Arc)
                    })) {
                        this.shapes2face(polygon.edges, shapes);
                    }
                    // this is from JSON.parse object
                    else if (shapes.every((shape) => {
                        return (shape.name === "segment" || shape.name === "arc")
                    })) {
                        let flattenShapes = [];
                        for (let shape of shapes) {
                            let flattenShape;
                            if (shape.name === "segment") {
                                flattenShape = new Flatten.Segment(shape);
                            } else {
                                flattenShape = new Flatten.Arc(shape);
                            }
                            flattenShapes.push(flattenShape);
                        }
                        this.shapes2face(polygon.edges, flattenShapes);
                    }
                }
                /* Create new face and copy edges into polygon.edges set */
                else if (args[0] instanceof Face) {
                    let face = args[0];
                    this.first = face.first;
                    this.last = face.last;
                    for (let edge of face) {
                        polygon.edges.add(edge);
                    }
                }
                /* Instantiate face from a circle in CCW orientation */
                else if (args[0] instanceof Flatten.Circle) {
                    this.shapes2face(polygon.edges, [args[0].toArc(Flatten.CCW)]);
                }
                /* Instantiate face from a box in CCW orientation */
                else if (args[0] instanceof Flatten.Box) {
                    let box = args[0];
                    this.shapes2face(polygon.edges, [
                        new Flatten.Segment(new Flatten.Point(box.xmin, box.ymin), new Flatten.Point(box.xmax, box.ymin)),
                        new Flatten.Segment(new Flatten.Point(box.xmax, box.ymin), new Flatten.Point(box.xmax, box.ymax)),
                        new Flatten.Segment(new Flatten.Point(box.xmax, box.ymax), new Flatten.Point(box.xmin, box.ymax)),
                        new Flatten.Segment(new Flatten.Point(box.xmin, box.ymax), new Flatten.Point(box.xmin, box.ymin))
                    ]);
                }
            }
            /* If passed two edges, consider them as start and end of the face loop */
            /* THIS METHOD WILL BE USED BY BOOLEAN OPERATIONS */
            /* Assume that edges already copied to polygon.edges set in the clip algorithm !!! */
            if (args.length == 2 && args[0] instanceof Flatten.Edge && args[1] instanceof Flatten.Edge) {
                this.first = args[0];                          // first edge in face or undefined
                this.last = args[1];                           // last edge in face or undefined
                this.last.next = this.first;
                this.first.prev = this.last;

                // set arc length
                this.setArcLength();

                // this.box = this.getBox();
                // this.orientation = this.getOrientation();      // face direction cw or ccw
            }
        }

        /**
         * Return array of edges from first to last
         * @returns {Array}
         */
        get edges() {
            return this.toArray();
        }

        /**
         * Return array of shapes which comprise face
         * @returns {Array}
         */
        get shapes() {
            return this.edges.map(edge => edge.shape.clone());
        }

        /**
         * Return bounding box of the face
         * @returns {Box}
         */
        get box() {
            if (this._box === undefined) {
                let box = new Flatten.Box();
                for (let edge of this) {
                    box = box.merge(edge.box);
                }
                this._box = box;
            }
            return this._box;
        }

        static points2segments(points) {
            let segments = [];
            for (let i = 0; i < points.length; i++) {
                segments.push(new Flatten.Segment(points[i], points[(i + 1) % points.length]));
            }
            return segments;
        }

        shapes2face(edges, shapes) {
            for (let shape of shapes) {
                let edge = new Flatten.Edge(shape);
                this.append(edge);
                // this.box = this.box.merge(shape.box);
                edges.add(edge);
            }
            // this.orientation = this.getOrientation();              // face direction cw or ccw
        }

        /**
         * Append edge after the last edge of the face (and before the first edge). <br/>
         * @param {Edge} edge - Edge to be appended to the linked list
         * @returns {Face}
         */
        append(edge) {
            super.append(edge);
            // set arc length
            this.setOneEdgeArcLength(edge);
            edge.face = this;
            // edges.add(edge);      // Add new edges into edges container
            return this;
        }

        /**
         * Insert edge newEdge into the linked list after the edge edgeBefore <br/>
         * @param {Edge} newEdge - Edge to be inserted into linked list
         * @param {Edge} edgeBefore - Edge to insert newEdge after it
         * @returns {Face}
         */
        insert(newEdge, edgeBefore) {
            super.insert(newEdge, edgeBefore);
            // set arc length
            this.setOneEdgeArcLength(newEdge);
            newEdge.face = this;
            return this;
        }

        /**
         * Remove the given edge from the linked list of the face <br/>
         * @param {Edge} edge - Edge to be removed
         * @returns {Face}
         */
        remove(edge) {
            super.remove(edge);
            // Recalculate arc length
            this.setArcLength();
            return this;
        }

        /**
         * Reverse orientation of the face: first edge become last and vice a verse,
         * all edges starts and ends swapped, direction of arcs inverted. If face was oriented
         * clockwise, it becomes counter clockwise and vice versa
         */
        reverse() {
            // collect edges in revert order with reverted shapes
            let edges = [];
            let edge_tmp = this.last;
            do {
                // reverse shape
                edge_tmp.shape = edge_tmp.shape.reverse();
                edges.push(edge_tmp);
                edge_tmp = edge_tmp.prev;
            } while (edge_tmp !== this.last);

            // restore linked list
            this.first = undefined;
            this.last = undefined;
            for (let edge of edges) {
                if (this.first === undefined) {
                    edge.prev = edge;
                    edge.next = edge;
                    this.first = edge;
                    this.last = edge;
                } else {
                    // append to end
                    edge.prev = this.last;
                    this.last.next = edge;

                    // update edge to be last
                    this.last = edge;

                    // restore circular links
                    this.last.next = this.first;
                    this.first.prev = this.last;

                }
                // set arc length
                this.setOneEdgeArcLength(edge);
            }

            // Recalculate orientation, if set
            if (this._orientation !== undefined) {
                this._orientation = undefined;
                this._orientation = this.orientation();
            }
        }


        /**
         * Set arc_length property for each of the edges in the face.
         * Arc_length of the edge it the arc length from the first edge of the face
         */
        setArcLength() {
            for (let edge of this) {
                this.setOneEdgeArcLength(edge);
                edge.face = this;
            }
        }

        setOneEdgeArcLength(edge) {
            if (edge === this.first) {
                edge.arc_length = 0.0;
            } else {
                edge.arc_length = edge.prev.arc_length + edge.prev.length;
            }
        }

        /**
         * Returns the absolute value of the area of the face
         * @returns {number}
         */
        area() {
            return Math.abs(this.signedArea());
        }

        /**
         * Returns signed area of the simple face.
         * Face is simple if it has no self intersections that change its orientation.
         * Then the area will be positive if the orientation of the face is clockwise,
         * and negative if orientation is counterclockwise.
         * It may be zero if polygon is degenerated.
         * @returns {number}
         */
        signedArea() {
            let sArea = 0;
            let ymin = this.box.ymin;
            for (let edge of this) {
                sArea += edge.shape.definiteIntegral(ymin);
            }
            return sArea;
        }

        /**
         * Return face orientation: one of Flatten.ORIENTATION.CCW, Flatten.ORIENTATION.CW, Flatten.ORIENTATION.NOT_ORIENTABLE <br/>
         * According to Green theorem the area of a closed curve may be calculated as double integral,
         * and the sign of the integral will be defined by the direction of the curve.
         * When the integral ("signed area") will be negative, direction is counter clockwise,
         * when positive - clockwise and when it is zero, polygon is not orientable.
         * See {@link https://mathinsight.org/greens_theorem_find_area}
         * @returns {number}
         */
        orientation() {
            if (this._orientation === undefined) {
                let area = this.signedArea();
                if (Flatten.Utils.EQ_0(area)) {
                    this._orientation = Flatten.ORIENTATION.NOT_ORIENTABLE;
                } else if (Flatten.Utils.LT(area, 0)) {
                    this._orientation = Flatten.ORIENTATION.CCW;
                } else {
                    this._orientation = Flatten.ORIENTATION.CW;
                }
            }
            return this._orientation;
        }

        /**
         * Returns true if face of the polygon is simple (no self-intersection points found)
         * NOTE: this method is incomplete because it does not exclude touching points.
         * Self intersection test should check if polygon change orientation in the test point.
         * @param {Edges} edges - reference to polygon.edges to provide search index
         * @returns {boolean}
         */
        isSimple(edges) {
            let ip = Face.getSelfIntersections(this, edges, true);
            return ip.length == 0;
        }

        static getSelfIntersections(face, edges, exitOnFirst = false) {
            let int_points = [];

            // calculate intersections
            for (let edge1 of face) {

                // request edges of polygon in the box of edge1
                let resp = edges.search(edge1.box);

                // for each edge2 in response
                for (let edge2 of resp) {

                    // Skip itself
                    if (edge1 === edge2)
                        continue;

                    // Skip is edge2 belongs to another face
                    if (edge2.face !== face)
                        continue;

                    // Skip next and previous edge if both are segment (if one of them arc - calc intersection)
                    if (edge1.shape instanceof Flatten.Segment && edge2.shape instanceof Flatten.Segment &&
                        (edge1.next === edge2 || edge1.prev === edge2))
                        continue;

                    // calculate intersections between edge1 and edge2
                    let ip = edge1.shape.intersect(edge2.shape);

                    // for each intersection point
                    for (let pt of ip) {

                        // skip start-end connections
                        if (pt.equalTo(edge1.start) && pt.equalTo(edge2.end) && edge2 === edge1.prev)
                            continue;
                        if (pt.equalTo(edge1.end) && pt.equalTo(edge2.start) && edge2 === edge1.next)
                            continue;

                        int_points.push(pt);

                        if (exitOnFirst)
                            break;
                    }

                    if (int_points.length > 0 && exitOnFirst)
                        break;
                }

                if (int_points.length > 0 && exitOnFirst)
                    break;

            }
            return int_points;
        }

        /**
         * Returns edge which contains given point
         * @param {Point} pt - test point
         * @returns {Edge}
         */
        findEdgeByPoint(pt) {
            let edgeFound;
            for (let edge of this) {
                if (edge.shape.contains(pt)) {
                    edgeFound = edge;
                    break;
                }
            }
            return edgeFound;
        }

        /**
         * Returns new polygon created from one face
         * @returns {Polygon}
         */
        toPolygon() {
            return new Flatten.Polygon(this.shapes);
        }

        toJSON() {
            return this.edges.map(edge => edge.toJSON());
        }

        /**
         * Returns string to be assigned to "d" attribute inside defined "path"
         * @returns {string}
         */
        svg() {
            let svgStr = `\nM${this.first.start.x},${this.first.start.y}`;
            for (let edge of this) {
                svgStr += edge.svg();
            }
            svgStr += ` z`;
            return svgStr;
        }

    }
    Flatten.Face = Face;

    /**
     * Class representing a ray.
     * @type {Ray}
     */
    class Ray {
        /**
         * Ray may be constructed by setting start point and a normal vector
         * Ray goes to the right direction with respect to the normal vector
         * If normal vector is omitted ray is considered horizontal (normal vector is (0,1))
         * If started point is omitted, ray is started at zero point
         * @param {Point} pt - start point
         * @param {Vector} norm - normal vector
         */
        constructor(...args) {
            this.pt = new Flatten.Point();
            this.norm = new Flatten.Vector(0,1);

            if (args.length == 0) {
                return;
            }

            if (args.length >= 1 && args[0] instanceof Flatten.Point) {
                this.pt = args[0].clone();
            }

            if (args.length === 1) {
                return;
            }

            if (args.length === 2 && args[1] instanceof Flatten.Vector) {
                this.norm = args[1].clone();
                return;
            }

            // if (args.length == 2 && typeof (args[0]) == "number" && typeof (args[1]) == "number") {
            //     this.pt = new Flatten.Point(args[0], args[1]);
            //     return;
            // }

            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        /**
         * Return new cloned instance of ray
         * @returns {Ray}
         */
        clone() {
            return new Ray(this.pt, this.norm);
        }

        /**
         * Slope of the ray - angle in radians between ray and axe x from 0 to 2PI
         * @returns {number} - slope of the line
         */
        get slope() {
            let vec = new Flatten.Vector(this.norm.y, -this.norm.x);
            return vec.slope;
        }

        /**
         * Returns half-infinite bounding box of the ray
         * @returns {Box} - bounding box
         */
        get box() {
            let slope = this.slope;
            return new Flatten.Box(
                slope > Math.PI/2 && slope < 3*Math.PI/2 ? Number.NEGATIVE_INFINITY : this.pt.x,
                slope >= 0 && slope <= Math.PI ? this.pt.y : Number.NEGATIVE_INFINITY,
                slope >= Math.PI/2 && slope <= 3*Math.PI/2 ? this.pt.x : Number.POSITIVE_INFINITY,
                slope >= Math.PI && slope <= 2*Math.PI || slope == 0 ? this.pt.y : Number.POSITIVE_INFINITY
            )
        }

        /**
         * Return ray start point
         * @returns {Point} - ray start point
         */
        get start() {
            return this.pt;
        }

        /**
         * Ray has no end point?
         * @returns {undefined}
         */
        get end() {return undefined;}

        /**
         * Return positive infinity number as length
         * @returns {number}
         */
        get length() {return Number.POSITIVE_INFINITY;}

        /**
         * Returns true if point belongs to ray
         * @param {Point} pt Query point
         * @returns {boolean}
         */
        contains(pt) {
            if (this.pt.equalTo(pt)) {
                return true;
            }
            /* Ray contains point if vector to point is orthogonal to the ray normal vector
                and cross product from vector to point is positive */
            let vec = new Flatten.Vector(this.pt, pt);
            return Flatten.Utils.EQ_0(this.norm.dot(vec)) && Flatten.Utils.GE(vec.cross(this.norm),0);
        }

        /**
         * Split ray with point and return array of segment and new ray
         * @param {Point} pt
         * @returns [Segment,Ray]
         */
        split(pt) {
            if (!this.contains(pt))
                return [];

            if (this.pt.equalTo(pt)) {
                return [this]
            }

            return [
                new Flatten.Segment(this.pt, pt),
                new Flatten.Ray(pt, this.norm)
            ]
        }

        /**
         * Returns array of intersection points between ray and segment or arc
         * @param {Segment|Arc} - Shape to intersect with ray
         * @returns {Array} array of intersection points
         */
        intersect(shape) {
            if (shape instanceof Flatten.Segment) {
                return this.intersectRay2Segment(this, shape);
            }

            if (shape instanceof Flatten.Arc) {
                return this.intersectRay2Arc(this, shape);
            }
        }

        intersectRay2Segment(ray, segment) {
            let ip = [];

            if (ray.box.not_intersect(segment.box)) {
                return ip;
            }

            let line = new Flatten.Line(ray.start, ray.norm);
            let ip_tmp = line.intersect(segment);

            for (let pt of ip_tmp) {
                // if (Flatten.Utils.GE(pt.x, ray.start.x)) {
                if (ray.contains(pt)) {
                    ip.push(pt);
                }
            }

            /* If there were two intersection points between line and ray,
            and now there is exactly one left, it means ray starts between these points
            and there is another intersection point - start of the ray */
            if (ip_tmp.length == 2 && ip.length == 1 && ray.start.on(line)) {
                ip.push(ray.start);
            }

            return ip;
        }

        intersectRay2Arc(ray, arc) {
            let ip = [];

            if (ray.box.not_intersect(arc.box)) {
                return ip;
            }

            let line = new Flatten.Line(ray.start, ray.norm);
            let ip_tmp = line.intersect(arc);

            for (let pt of ip_tmp) {
                // if (Flatten.Utils.GE(pt.x, ray.start.x)) {
                if (ray.contains(pt)) {
                    ip.push(pt);
                }
            }
            return ip;
        }

        /**
         * Return string to draw svg segment representing ray inside given box
         * @param {Box} box Box representing drawing area
         * @param {Object} attrs - an object with attributes of svg segment element
         */
        svg(box, attrs = {}) {
            let line = new Flatten.Line(this.pt, this.norm);
            let ip = intersectLine2Box(line, box);
            ip = ip.filter( pt => this.contains(pt) );
            if (ip.length === 0 || ip.length === 2)
                return "";
            let segment = new Flatten.Segment(this.pt, ip[0]);
            return segment.svg(attrs);
        }

    }
    Flatten.Ray = Ray;

    const ray = (...args) => new Flatten.Ray(...args);
    Flatten.ray = ray;

    /**
     * Created by Alex Bol on 3/15/2017.
     */

    /**
     * Class representing a polygon.<br/>
     * Polygon in FlattenJS is a multipolygon comprised from a set of [faces]{@link Flatten.Face}. <br/>
     * Face, in turn, is a closed loop of [edges]{@link Flatten.Edge}, where edge may be segment or circular arc<br/>
     * @type {Polygon}
     */
    class Polygon {
        /**
         * Constructor creates new instance of polygon. With no arguments new polygon is empty.<br/>
         * Constructor accepts as argument array that define loop of shapes
         * or array of arrays in case of multi polygon <br/>
         * Loop may be defined in different ways: <br/>
         * - array of shapes of type Segment or Arc <br/>
         * - array of points (Flatten.Point) <br/>
         * - array of numeric pairs which represent points <br/>
         * - box or circle object <br/>
         * Alternatively, it is possible to use polygon.addFace method
         * @param {args} - array of shapes or array of arrays
         */
        constructor() {
            /**
             * Container of faces (closed loops), may be empty
             * @type {PlanarSet}
             */
            this.faces = new Flatten.PlanarSet();
            /**
             * Container of edges
             * @type {PlanarSet}
             */
            this.edges = new Flatten.PlanarSet();

            /* It may be array of something that may represent one loop (face) or
             array of arrays that represent multiple loops
             */
            let args = [...arguments];
            if (args.length === 1 &&
                ((args[0] instanceof Array && args[0].length > 0) ||
                    args[0] instanceof Flatten.Circle || args[0] instanceof Flatten.Box)) {
                let argsArray = args[0];
                if (args[0] instanceof Array && args[0].every((loop) => {return loop instanceof Array})) {
                    if  (argsArray.every( el => {return el instanceof Array && el.length === 2 && typeof(el[0]) === "number" && typeof(el[1]) === "number"} )) {
                        this.faces.add(new Flatten.Face(this, argsArray));    // one-loop polygon as array of pairs of numbers
                    }
                    else {
                        for (let loop of argsArray) {   // multi-loop polygon
                            this.faces.add(new Flatten.Face(this, loop));
                        }
                    }
                }
                else {
                    this.faces.add(new Flatten.Face(this, argsArray));    // one-loop polygon
                }
            }
        }

        /**
         * (Getter) Returns bounding box of the polygon
         * @returns {Box}
         */
        get box() {
            return [...this.faces].reduce((acc, face) => acc.merge(face.box), new Flatten.Box());
        }

        /**
         * (Getter) Returns array of vertices
         * @returns {Array}
         */
        get vertices() {
            return [...this.edges].map(edge => edge.start);
        }

        /**
         * Create new cloned instance of the polygon
         * @returns {Polygon}
         */
        clone() {
            let polygon = new Polygon();
            for (let face of this.faces) {
                polygon.addFace(face.shapes);
            }
            return polygon;
        }

        /**
         * Return true is polygon has no edges
         * @returns {boolean}
         */
        isEmpty() {
            return this.edges.size === 0;
        }

        /**
         * Return true if polygon is valid for boolean operations
         * Polygon is valid if <br/>
         * 1. All faces are simple polygons (there are no self-intersected polygons) <br/>
         * 2. All faces are orientable and there is no island inside island or hole inside hole - TODO <br/>
         * 3. There is no intersections between faces (excluding touching) - TODO <br/>
         * @returns {boolean}
         */
        isValid() {
            let valid = true;
            // 1. Polygon is invalid if at least one face is not simple
            for (let face of this.faces) {
                if (!face.isSimple(this.edges)) {
                    valid = false;
                    break;
                }
            }
            // 2. TODO: check if no island inside island and no hole inside hole
            // 3. TODO: check the there is no intersection between faces
            return valid;
        }

        /**
         * Returns area of the polygon. Area of an island will be added, area of a hole will be subtracted
         * @returns {number}
         */
        area() {
            let signedArea = [...this.faces].reduce((acc, face) => acc + face.signedArea(), 0);
            return Math.abs(signedArea);
        }

        /**
         * Add new face to polygon. Returns added face
         * @param {Points[]|Segments[]|Arcs[]|Circle|Box} args -  new face may be create with one of the following ways: <br/>
         * 1) array of points that describe closed path (edges are segments) <br/>
         * 2) array of shapes (segments and arcs) which describe closed path <br/>
         * 3) circle - will be added as counterclockwise arc <br/>
         * 4) box - will be added as counterclockwise rectangle <br/>
         * You can chain method face.reverse() is you need to change direction of the creates face
         * @returns {Face}
         */
        addFace(...args) {
            let face = new Flatten.Face(this, ...args);
            this.faces.add(face);
            return face;
        }

        /**
         * Delete existing face from polygon
         * @param {Face} face Face to be deleted
         * @returns {boolean}
         */
        deleteFace(face) {
            for (let edge of face) {
                let deleted = this.edges.delete(edge);
            }
            let deleted = this.faces.delete(face);
            return deleted;
        }

        /**
         * Delete chain of edges from the face.
         * @param {Face} face Face to remove chain
         * @param {Edge} edgeFrom Start of the chain of edges to be removed
         * @param {Edge} edgeTo End of the chain of edges to be removed
         */
        removeChain(face, edgeFrom, edgeTo) {
            // Special case: all edges removed
            if (edgeTo.next === edgeFrom) {
                this.deleteFace(face);
                return;
            }
            for (let edge = edgeFrom; edge !== edgeTo.next; edge = edge.next) {
                face.remove(edge);
                this.edges.delete(edge);      // delete from PlanarSet of edges and update index
                if (face.isEmpty()) {
                    this.deleteFace(face);    // delete from PlanarSet of faces and update index
                    break;
                }
            }
        }

        /**
         * Add point as a new vertex and split edge. Point supposed to belong to an edge.
         * When edge is split, new edge created from the start of the edge to the new vertex
         * and inserted before current edge.
         * Current edge is trimmed and updated.
         * Method returns new edge added. If no edge added, it returns edge before vertex
         * @param {Edge} edge Edge to be split with new vertex and then trimmed from start
         * @param {Point} pt Point to be added as a new vertex
         * @returns {Edge}
         */
        addVertex(pt, edge) {
            let shapes = edge.shape.split(pt);
            // if (shapes.length < 2) return;

            if (shapes[0] === null)   // point incident to edge start vertex, return previous edge
                return edge.prev;

            if (shapes[1] === null)   // point incident to edge end vertex, return edge itself
                return edge;

            let newEdge = new Flatten.Edge(shapes[0]);
            let edgeBefore = edge.prev;

            /* Insert first split edge into linked list after edgeBefore */
            edge.face.insert(newEdge, edgeBefore);

            // Insert new edge to the edges container and 2d index
            this.edges.add(newEdge);

            // Remove old edge from edges container and 2d index
            this.edges.delete(edge);

            // Update edge shape with second split edge keeping links
            edge.shape = shapes[1];

            // Add updated edge to the edges container and 2d index
            this.edges.add(edge);

            return newEdge;
        }

        /**
         * Cut polygon with line and return array of new polygons
         * @param {Multiline} multiline
         * @returns {Polygon[]}
         */
        cut(multiline) {
            let cutPolygons = [this.clone()];
            for (let edge of multiline) {
                if (edge.setInclusion(this) !== Flatten.INSIDE)
                    continue;

                let cut_edge_start = edge.shape.start;
                let cut_edge_end = edge.shape.end;

                let newCutPolygons = [];
                for (let polygon of cutPolygons) {
                    if (polygon.findEdgeByPoint(cut_edge_start) === undefined) {
                        newCutPolygons.push(polygon);
                    }
                    else {
                        let [cutPoly1, cutPoly2] = polygon.cutFace(cut_edge_start, cut_edge_end);
                        newCutPolygons.push(cutPoly1, cutPoly2);
                    }
                }
                cutPolygons = newCutPolygons;
            }
            return cutPolygons;
        }

        /**
         * Cut face of polygon with a segment between two points and create two new polygons
         * Supposed that a segments between points does not intersect any other edge
         * @param {Point} pt1
         * @param {Point} pt2
         * @returns {Polygon[]}
         */
        cutFace(pt1, pt2) {
            let edge1 = this.findEdgeByPoint(pt1);
            let edge2 = this.findEdgeByPoint(pt2);
            if (edge1.face != edge2.face) return;

            // Cut face into two and create new polygon with two faces
            let edgeBefore1 = this.addVertex(pt1, edge1);
            edge2 = this.findEdgeByPoint(pt2);
            let edgeBefore2 = this.addVertex(pt2, edge2);

            let face = edgeBefore1.face;
            let newEdge1 = new Flatten.Edge(
                new Flatten.Segment(edgeBefore1.end, edgeBefore2.end)
            );
            let newEdge2 = new Flatten.Edge(
                new Flatten.Segment(edgeBefore2.end, edgeBefore1.end)
            );

            // Swap links
            edgeBefore1.next.prev = newEdge2;
            newEdge2.next = edgeBefore1.next;

            edgeBefore1.next = newEdge1;
            newEdge1.prev = edgeBefore1;

            edgeBefore2.next.prev = newEdge1;
            newEdge1.next = edgeBefore2.next;

            edgeBefore2.next = newEdge2;
            newEdge2.prev = edgeBefore2;

            // Insert new edge to the edges container and 2d index
            this.edges.add(newEdge1);
            this.edges.add(newEdge2);

            // Add two new faces
            let face1 = this.addFace(newEdge1, edgeBefore1);
            let face2 = this.addFace(newEdge2, edgeBefore2);

            // Remove old face
            this.faces.delete(face);

            return [face1.toPolygon(), face2.toPolygon()];
        }

        /**
         * Returns the first founded edge of polygon that contains given point
         * @param {Point} pt
         * @returns {Edge}
         */
        findEdgeByPoint(pt) {
            let edge;
            for (let face of this.faces) {
                edge = face.findEdgeByPoint(pt);
                if (edge != undefined)
                    break;
            }
            return edge;
        }

        /**
         * Split polygon into array of polygons, where each polygon is an island with all
         * hole that it contains
         * @returns {Flatten.Polygon[]}
         */
        splitToIslands() {
            let polygons = this.toArray();      // split into array of one-loop polygons
            /* Sort polygons by area in descending order */
            polygons.sort( (polygon1, polygon2) => polygon2.area() - polygon1.area() );
            /* define orientation of the island by orientation of the first polygon in array */
            let orientation = [...polygons[0].faces][0].orientation();
            /* Create output array from polygons with same orientation as a first polygon (array of islands) */
            let newPolygons = polygons.filter( polygon => [...polygon.faces][0].orientation() === orientation);
            for (let polygon of polygons) {
                let face = [...polygon.faces][0];
                if (face.orientation() === orientation) continue;  // skip same orientation
                /* Proceed with opposite orientation */
                /* Look if any of island polygons contains tested polygon as a hole */
                for (let islandPolygon of newPolygons) {
                    if (face.shapes.every(shape => islandPolygon.contains(shape))) {
                        islandPolygon.addFace(face.shapes);      // add polygon as a hole in islandPolygon
                        break;
                    }
                }
            }
            // TODO: assert if not all polygons added into output
            return newPolygons;
        }

        /**
         * Reverse orientation of all faces to opposite
         * @returns {Polygon}
         */
        reverse() {
            for (let face of this.faces) {
                face.reverse();
            }
            return this;
        }

        /**
         * Returns true if polygon contains shape: no point of shape lies outside of the polygon,
         * false otherwise
         * @param {Shape} shape - test shape
         * @returns {boolean}
         */
        contains(shape) {
            if (shape instanceof Flatten.Point) {
                let rel = ray_shoot(this, shape);
                return rel === Flatten.INSIDE || rel === Flatten.BOUNDARY;
            }
            else {
                return cover(this, shape);
            }
        }

        /**
         * Return distance and shortest segment between polygon and other shape as array [distance, shortest_segment]
         * @param {Shape} shape Shape of one of the types Point, Circle, Line, Segment, Arc or Polygon
         * @returns {Number | Segment}
         */
        distanceTo(shape) {
            // let {Distance} = Flatten;

            if (shape instanceof Flatten.Point) {
                let [dist, shortest_segment] = Flatten.Distance.point2polygon(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [dist, shortest_segment];
            }

            if (shape instanceof Flatten.Circle ||
                shape instanceof Flatten.Line ||
                shape instanceof Flatten.Segment ||
                shape instanceof Flatten.Arc) {
                let [dist, shortest_segment] = Flatten.Distance.shape2polygon(shape, this);
                shortest_segment = shortest_segment.reverse();
                return [dist, shortest_segment];
            }

            /* this method is bit faster */
            if (shape instanceof Flatten.Polygon) {
                let min_dist_and_segment = [Number.POSITIVE_INFINITY, new Flatten.Segment()];
                let dist, shortest_segment;

                for (let edge of this.edges) {
                    // let [dist, shortest_segment] = Distance.shape2polygon(edge.shape, shape);
                    let min_stop = min_dist_and_segment[0];
                    [dist, shortest_segment] = Flatten.Distance.shape2planarSet(edge.shape, shape.edges, min_stop);
                    if (Flatten.Utils.LT(dist, min_stop)) {
                        min_dist_and_segment = [dist, shortest_segment];
                    }
                }
                return min_dist_and_segment;
            }
        }

        /**
         * Return array of intersection points between polygon and other shape
         * @param shape Shape of the one of supported types <br/>
         * @returns {Point[]}
         */
        intersect(shape) {
            if (shape instanceof Flatten.Point) {
                return this.contains(shape) ? [shape] : [];
            }

            if (shape instanceof Flatten.Line) {
                return intersectLine2Polygon(shape, this);
            }

            if (shape instanceof Flatten.Circle) {
                return intersectCircle2Polygon(shape, this);
            }

            if (shape instanceof Flatten.Segment) {
                return intersectSegment2Polygon(shape, this);
            }

            if (shape instanceof Flatten.Arc) {
                return intersectArc2Polygon(shape, this);
            }

            if (shape instanceof Flatten.Polygon) {
                return intersectPolygon2Polygon(shape, this);
            }
        }

        /**
         * Returns new polygon translated by vector vec
         * @param {Vector} vec
         * @returns {Polygon}
         */
        translate(vec) {
            let newPolygon = new Polygon();
            for (let face of this.faces) {
                newPolygon.addFace(face.shapes.map( shape => shape.translate(vec)));
            }
            return newPolygon;
        }

        /**
         * Return new polygon rotated by given angle around given point
         * If point omitted, rotate around origin (0,0)
         * Positive value of angle defines rotation counter clockwise, negative - clockwise
         * @param {number} angle - rotation angle in radians
         * @param {Point} center - rotation center, default is (0,0)
         * @returns {Polygon} - new rotated polygon
         */
        rotate(angle = 0, center = new Flatten.Point()) {
            let newPolygon = new Polygon();
            for (let face of this.faces) {
                newPolygon.addFace(face.shapes.map( shape => shape.rotate(angle, center)));
            }
            return newPolygon;
        }

        /**
         * Return new polygon transformed using affine transformation matrix
         * @param {Matrix} matrix - affine transformation matrix
         * @returns {Polygon} - new polygon
         */
        transform(matrix = new Flatten.Matrix()) {
            let newPolygon = new Polygon();
            for (let face of this.faces) {
                newPolygon.addFace(face.shapes.map( shape => shape.transform(matrix)));
            }
            return newPolygon;
        }

        /**
         * This method returns an object that defines how data will be
         * serialized when called JSON.stringify() method
         * @returns {Object}
         */
        toJSON() {
            return [...this.faces].map(face => face.toJSON());
        }

        /**
         * Transform all faces into array of polygons
         * @returns {Flatten.Polygon[]}
         */
        toArray() {
            return [...this.faces].map(face => face.toPolygon());
        }

        /**
         * Return string to draw polygon in svg
         * @param attrs  - an object with attributes for svg path element,
         * like "stroke", "strokeWidth", "fill", "fillRule", "fillOpacity"
         * Defaults are stroke:"black", strokeWidth:"1", fill:"lightcyan", fillRule:"evenodd", fillOpacity: "1"
         * @returns {string}
         */
        svg(attrs = {}) {
            let {stroke, strokeWidth, fill, fillRule, fillOpacity, id, className} = attrs;
            // let restStr = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
            let id_str = (id && id.length > 0) ? `id="${id}"` : "";
            let class_str = (className && className.length > 0) ? `class="${className}"` : "";

            let svgStr = `\n<path stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "lightcyan"}" fill-rule="${fillRule || "evenodd"}" fill-opacity="${fillOpacity || 1.0}" ${id_str} ${class_str} d="`;
            for (let face of this.faces) {
                svgStr += face.svg();
            }
            svgStr += `" >\n</path>`;
            return svgStr;
        }
    }

    Flatten.Polygon = Polygon;

    /**
     * Shortcut method to create new polygon
     */
    const polygon = (...args) => new Flatten.Polygon(...args);
    Flatten.polygon = polygon;

    class Distance {
        /**
         * Calculate distance and shortest segment between points
         * @param pt1
         * @param pt2
         * @returns {Number | Segment} - distance and shortest segment
         */
        static point2point(pt1, pt2) {
            return pt1.distanceTo(pt2);
        }

        /**
         * Calculate distance and shortest segment between point and line
         * @param pt
         * @param line
         * @returns {Number | Segment} - distance and shortest segment
         */
        static point2line(pt, line) {
            let closest_point = pt.projectionOn(line);
            let vec = new Flatten.Vector(pt, closest_point);
            return [vec.length, new Flatten.Segment(pt, closest_point)];
        }

        /**
         * Calculate distance and shortest segment between point and circle
         * @param pt
         * @param circle
         * @returns {Number | Segment} - distance and shortest segment
         */
        static point2circle(pt, circle) {
            let [dist2center, shortest_dist] = pt.distanceTo(circle.center);
            if (Flatten.Utils.EQ_0(dist2center)) {
                return [circle.r, new Flatten.Segment(pt, circle.toArc().start)];
            } else {
                let dist = Math.abs(dist2center - circle.r);
                let v = new Flatten.Vector(circle.pc, pt).normalize().multiply(circle.r);
                let closest_point = circle.pc.translate(v);
                return [dist, new Flatten.Segment(pt, closest_point)];
            }
        }

        /**
         * Calculate distance and shortest segment between point and segment
         * @param pt
         * @param segment
         * @returns {Number | Segment} - distance and shortest segment
         */
        static point2segment(pt, segment) {
            /* Degenerated case of zero-length segment */
            if (segment.start.equalTo(segment.end)) {
                return Distance.point2point(pt, segment.start);
            }

            let v_seg = new Flatten.Vector(segment.start, segment.end);
            let v_ps2pt = new Flatten.Vector(segment.start, pt);
            let v_pe2pt = new Flatten.Vector(segment.end, pt);
            let start_sp = v_seg.dot(v_ps2pt);
            /* dot product v_seg * v_ps2pt */
            let end_sp = -v_seg.dot(v_pe2pt);
            /* minus dot product v_seg * v_pe2pt */

            let dist;
            let closest_point;
            if (Flatten.Utils.GE(start_sp, 0) && Flatten.Utils.GE(end_sp, 0)) {    /* point inside segment scope */
                let v_unit = segment.tangentInStart(); // new Flatten.Vector(v_seg.x / this.length, v_seg.y / this.length);
                /* unit vector ||v_unit|| = 1 */
                dist = Math.abs(v_unit.cross(v_ps2pt));
                /* dist = abs(v_unit x v_ps2pt) */
                closest_point = segment.start.translate(v_unit.multiply(v_unit.dot(v_ps2pt)));
                return [dist, new Flatten.Segment(pt, closest_point)];
            } else if (start_sp < 0) {                             /* point is out of scope closer to ps */
                return pt.distanceTo(segment.start);
            } else {                                               /* point is out of scope closer to pe */
                return pt.distanceTo(segment.end);
            }
        };

        /**
         * Calculate distance and shortest segment between point and arc
         * @param pt
         * @param arc
         * @returns {Number | Segment} - distance and shortest segment
         */
        static point2arc(pt, arc) {
            let circle = new Flatten.Circle(arc.pc, arc.r);
            let dist_and_segment = [];
            let dist, shortest_segment;
            [dist, shortest_segment] = Distance.point2circle(pt, circle);
            if (shortest_segment.end.on(arc)) {
                dist_and_segment.push(Distance.point2circle(pt, circle));
            }
            dist_and_segment.push(Distance.point2point(pt, arc.start));
            dist_and_segment.push(Distance.point2point(pt, arc.end));

            Distance.sort(dist_and_segment);

            return dist_and_segment[0];
        }

        /**
         * Calculate distance and shortest segment between segment and line
         * @param seg
         * @param line
         * @returns {Number | Segment}
         */
        static segment2line(seg, line) {
            let ip = seg.intersect(line);
            if (ip.length > 0) {
                return [0, new Flatten.Segment(ip[0], ip[0])];   // distance = 0, closest point is the first point
            }
            let dist_and_segment = [];
            dist_and_segment.push(Distance.point2line(seg.start, line));
            dist_and_segment.push(Distance.point2line(seg.end, line));

            Distance.sort(dist_and_segment);
            return dist_and_segment[0];

        }

        /**
         * Calculate distance and shortest segment between two segments
         * @param seg1
         * @param seg2
         * @returns {Number | Segment} - distance and shortest segment
         */
        static segment2segment(seg1, seg2) {
            let ip = intersectSegment2Segment(seg1, seg2);
            if (ip.length > 0) {
                return [0, new Flatten.Segment(ip[0], ip[0])];   // distance = 0, closest point is the first point
            }

            // Seg1 and seg2 not intersected
            let dist_and_segment = [];
            let dist_tmp, shortest_segment_tmp;
            [dist_tmp, shortest_segment_tmp] = Distance.point2segment(seg2.start, seg1);
            dist_and_segment.push([dist_tmp, shortest_segment_tmp.reverse()]);
            [dist_tmp, shortest_segment_tmp] = Distance.point2segment(seg2.end, seg1);
            dist_and_segment.push([dist_tmp, shortest_segment_tmp.reverse()]);
            dist_and_segment.push(Distance.point2segment(seg1.start, seg2));
            dist_and_segment.push(Distance.point2segment(seg1.end, seg2));

            Distance.sort(dist_and_segment);
            return dist_and_segment[0];
        }

        /**
         * Calculate distance and shortest segment between segment and circle
         * @param seg
         * @param circle
         * @returns {Number | Segment} - distance and shortest segment
         */
        static segment2circle(seg, circle) {
            /* Case 1 Segment and circle intersected. Return the first point and zero distance */
            let ip = seg.intersect(circle);
            if (ip.length > 0) {
                return [0, new Flatten.Segment(ip[0], ip[0])];
            }

            // No intersection between segment and circle

            /* Case 2. Distance to projection of center point to line bigger than radius
             * And projection point belong to segment
              * Then measure again distance from projection to circle and return it */
            let line = new Flatten.Line(seg.ps, seg.pe);
            let [dist, shortest_segment] = Distance.point2line(circle.center, line);
            if (Flatten.Utils.GE(dist, circle.r) && shortest_segment.end.on(seg)) {
                return Distance.point2circle(shortest_segment.end, circle);
            }
            /* Case 3. Otherwise closest point is one of the end points of the segment */
            else {
                let [dist_from_start, shortest_segment_from_start] = Distance.point2circle(seg.start, circle);
                let [dist_from_end, shortest_segment_from_end] = Distance.point2circle(seg.end, circle);
                return Flatten.Utils.LT(dist_from_start, dist_from_end) ?
                    [dist_from_start, shortest_segment_from_start] :
                    [dist_from_end, shortest_segment_from_end];
            }
        }

        /**
         * Calculate distance and shortest segment between segment and arc
         * @param seg
         * @param arc
         * @returns {Number | Segment} - distance and shortest segment
         */
        static segment2arc(seg, arc) {
            /* Case 1 Segment and arc intersected. Return the first point and zero distance */
            let ip = seg.intersect(arc);
            if (ip.length > 0) {
                return [0, new Flatten.Segment(ip[0], ip[0])];
            }

            // No intersection between segment and arc
            let line = new Flatten.Line(seg.ps, seg.pe);
            let circle = new Flatten.Circle(arc.pc, arc.r);

            /* Case 2. Distance to projection of center point to line bigger than radius AND
             * projection point belongs to segment AND
               * distance from projection point to circle belongs to arc  =>
               * return this distance from projection to circle */
            let [dist_from_center, shortest_segment_from_center] = Distance.point2line(circle.center, line);
            if (Flatten.Utils.GE(dist_from_center, circle.r) && shortest_segment_from_center.end.on(seg)) {
                let [dist_from_projection, shortest_segment_from_projection] =
                    Distance.point2circle(shortest_segment_from_center.end, circle);
                if (shortest_segment_from_projection.end.on(arc)) {
                    return [dist_from_projection, shortest_segment_from_projection];
                }
            }
            /* Case 3. Otherwise closest point is one of the end points of the segment */
            let dist_and_segment = [];
            dist_and_segment.push(Distance.point2arc(seg.start, arc));
            dist_and_segment.push(Distance.point2arc(seg.end, arc));

            let dist_tmp, segment_tmp;
            [dist_tmp, segment_tmp] = Distance.point2segment(arc.start, seg);
            dist_and_segment.push([dist_tmp, segment_tmp.reverse()]);

            [dist_tmp, segment_tmp] = Distance.point2segment(arc.end, seg);
            dist_and_segment.push([dist_tmp, segment_tmp.reverse()]);

            Distance.sort(dist_and_segment);
            return dist_and_segment[0];
        }

        /**
         * Calculate distance and shortest segment between two circles
         * @param circle1
         * @param circle2
         * @returns {Number | Segment} - distance and shortest segment
         */
        static circle2circle(circle1, circle2) {
            let ip = circle1.intersect(circle2);
            if (ip.length > 0) {
                return [0, new Flatten.Segment(ip[0], ip[0])];
            }

            // Case 1. Concentric circles. Convert to arcs and take distance between two arc starts
            if (circle1.center.equalTo(circle2.center)) {
                let arc1 = circle1.toArc();
                let arc2 = circle2.toArc();
                return Distance.point2point(arc1.start, arc2.start);
            } else {
                // Case 2. Not concentric circles
                let line = new Flatten.Line(circle1.center, circle2.center);
                let ip1 = line.intersect(circle1);
                let ip2 = line.intersect(circle2);

                let dist_and_segment = [];

                dist_and_segment.push(Distance.point2point(ip1[0], ip2[0]));
                dist_and_segment.push(Distance.point2point(ip1[0], ip2[1]));
                dist_and_segment.push(Distance.point2point(ip1[1], ip2[0]));
                dist_and_segment.push(Distance.point2point(ip1[1], ip2[1]));

                Distance.sort(dist_and_segment);
                return dist_and_segment[0];
            }
        }

        /**
         * Calculate distance and shortest segment between two circles
         * @param circle
         * @param line
         * @returns {Number | Segment} - distance and shortest segment
         */
        static circle2line(circle, line) {
            let ip = circle.intersect(line);
            if (ip.length > 0) {
                return [0, new Flatten.Segment(ip[0], ip[0])];
            }

            let [dist_from_center, shortest_segment_from_center] = Distance.point2line(circle.center, line);
            let [dist, shortest_segment] = Distance.point2circle(shortest_segment_from_center.end, circle);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }

        /**
         * Calculate distance and shortest segment between arc and line
         * @param arc
         * @param line
         * @returns {Number | Segment} - distance and shortest segment
         */
        static arc2line(arc, line) {
            /* Case 1 Line and arc intersected. Return the first point and zero distance */
            let ip = line.intersect(arc);
            if (ip.length > 0) {
                return [0, new Flatten.Segment(ip[0], ip[0])];
            }

            let circle = new Flatten.Circle(arc.center, arc.r);

            /* Case 2. Distance to projection of center point to line bigger than radius AND
             * projection point belongs to segment AND
               * distance from projection point to circle belongs to arc  =>
               * return this distance from projection to circle */
            let [dist_from_center, shortest_segment_from_center] = Distance.point2line(circle.center, line);
            if (Flatten.Utils.GE(dist_from_center, circle.r)) {
                let [dist_from_projection, shortest_segment_from_projection] =
                    Distance.point2circle(shortest_segment_from_center.end, circle);
                if (shortest_segment_from_projection.end.on(arc)) {
                    return [dist_from_projection, shortest_segment_from_projection];
                }
            } else {
                let dist_and_segment = [];
                dist_and_segment.push(Distance.point2line(arc.start, line));
                dist_and_segment.push(Distance.point2line(arc.end, line));

                Distance.sort(dist_and_segment);
                return dist_and_segment[0];
            }
        }

        /**
         * Calculate distance and shortest segment between arc and circle
         * @param arc
         * @param circle2
         * @returns {Number | Segment} - distance and shortest segment
         */
        static arc2circle(arc, circle2) {
            let ip = arc.intersect(circle2);
            if (ip.length > 0) {
                return [0, new Flatten.Segment(ip[0], ip[0])];
            }

            let circle1 = new Flatten.Circle(arc.center, arc.r);

            let [dist, shortest_segment] = Distance.circle2circle(circle1, circle2);
            if (shortest_segment.start.on(arc)) {
                return [dist, shortest_segment];
            } else {
                let dist_and_segment = [];

                dist_and_segment.push(Distance.point2circle(arc.start, circle2));
                dist_and_segment.push(Distance.point2circle(arc.end, circle2));

                Distance.sort(dist_and_segment);

                return dist_and_segment[0];
            }
        }

        /**
         * Calculate distance and shortest segment between two arcs
         * @param arc1
         * @param arc2
         * @returns {Number | Segment} - distance and shortest segment
         */
        static arc2arc(arc1, arc2) {
            let ip = arc1.intersect(arc2);
            if (ip.length > 0) {
                return [0, new Flatten.Segment(ip[0], ip[0])];
            }

            let circle1 = new Flatten.Circle(arc1.center, arc1.r);
            let circle2 = new Flatten.Circle(arc2.center, arc2.r);

            let [dist, shortest_segment] = Distance.circle2circle(circle1, circle2);
            if (shortest_segment.start.on(arc1) && shortest_segment.end.on(arc2)) {
                return [dist, shortest_segment];
            } else {
                let dist_and_segment = [];

                let dist_tmp, segment_tmp;

                [dist_tmp, segment_tmp] = Distance.point2arc(arc1.start, arc2);
                if (segment_tmp.end.on(arc2)) {
                    dist_and_segment.push([dist_tmp, segment_tmp]);
                }

                [dist_tmp, segment_tmp] = Distance.point2arc(arc1.end, arc2);
                if (segment_tmp.end.on(arc2)) {
                    dist_and_segment.push([dist_tmp, segment_tmp]);
                }

                [dist_tmp, segment_tmp] = Distance.point2arc(arc2.start, arc1);
                if (segment_tmp.end.on(arc1)) {
                    dist_and_segment.push([dist_tmp, segment_tmp.reverse()]);
                }

                [dist_tmp, segment_tmp] = Distance.point2arc(arc2.end, arc1);
                if (segment_tmp.end.on(arc1)) {
                    dist_and_segment.push([dist_tmp, segment_tmp.reverse()]);
                }

                [dist_tmp, segment_tmp] = Distance.point2point(arc1.start, arc2.start);
                dist_and_segment.push([dist_tmp, segment_tmp]);

                [dist_tmp, segment_tmp] = Distance.point2point(arc1.start, arc2.end);
                dist_and_segment.push([dist_tmp, segment_tmp]);

                [dist_tmp, segment_tmp] = Distance.point2point(arc1.end, arc2.start);
                dist_and_segment.push([dist_tmp, segment_tmp]);

                [dist_tmp, segment_tmp] = Distance.point2point(arc1.end, arc2.end);
                dist_and_segment.push([dist_tmp, segment_tmp]);

                Distance.sort(dist_and_segment);

                return dist_and_segment[0];
            }
        }

        /**
         * Calculate distance and shortest segment between point and polygon
         * @param point
         * @param polygon
         * @returns {Number | Segment} - distance and shortest segment
         */
        static point2polygon(point, polygon) {
            let min_dist_and_segment = [Number.POSITIVE_INFINITY, new Flatten.Segment()];
            for (let edge of polygon.edges) {
                let [dist, shortest_segment] = (edge.shape instanceof Flatten.Segment) ?
                    Distance.point2segment(point, edge.shape) : Distance.point2arc(point, edge.shape);
                if (Flatten.Utils.LT(dist, min_dist_and_segment[0])) {
                    min_dist_and_segment = [dist, shortest_segment];
                }
            }
            return min_dist_and_segment;
        }

        static shape2polygon(shape, polygon) {
            let min_dist_and_segment = [Number.POSITIVE_INFINITY, new Flatten.Segment()];
            for (let edge of polygon.edges) {
                let [dist, shortest_segment] = shape.distanceTo(edge.shape);
                if (Flatten.Utils.LT(dist, min_dist_and_segment[0])) {
                    min_dist_and_segment = [dist, shortest_segment];
                }
            }
            return min_dist_and_segment;
        }

        /**
         * Calculate distance and shortest segment between two polygons
         * @param polygon1
         * @param polygon2
         * @returns {Number | Segment} - distance and shortest segment
         */
        static polygon2polygon(polygon1, polygon2) {
            let min_dist_and_segment = [Number.POSITIVE_INFINITY, new Flatten.Segment()];
            for (let edge1 of polygon1.edges) {
                for (let edge2 of polygon2.edges) {
                    let [dist, shortest_segment] = edge1.shape.distanceTo(edge2.shape);
                    if (Flatten.Utils.LT(dist, min_dist_and_segment[0])) {
                        min_dist_and_segment = [dist, shortest_segment];
                    }
                }
            }
            return min_dist_and_segment;
        }

        /**
         * Returns [mindist, maxdist] array of squared minimal and maximal distance between boxes
         * Minimal distance by x is
         *    (box2.xmin - box1.xmax), if box1 is left to box2
         *    (box1.xmin - box2.xmax), if box2 is left to box1
         *    0,                       if box1 and box2 are intersected by x
         * Minimal distance by y is defined in the same way
         *
         * Maximal distance is estimated as a sum of squared dimensions of the merged box
         *
         * @param box1
         * @param box2
         * @returns {Number | Number} - minimal and maximal distance
         */
        static box2box_minmax(box1, box2) {
            let mindist_x = Math.max(Math.max(box1.xmin - box2.xmax, 0), Math.max(box2.xmin - box1.xmax, 0));
            let mindist_y = Math.max(Math.max(box1.ymin - box2.ymax, 0), Math.max(box2.ymin - box1.ymax, 0));
            let mindist = mindist_x * mindist_x + mindist_y * mindist_y;

            let box = box1.merge(box2);
            let dx = box.xmax - box.xmin;
            let dy = box.ymax - box.ymin;
            let maxdist = dx * dx + dy * dy;

            return [mindist, maxdist];
        }

        static minmax_tree_process_level(shape, level, min_stop, tree) {
            // Calculate minmax distance to each shape in current level
            // Insert result into the interval tree for further processing
            // update min_stop with maxdist, it will be the new stop distance
            let mindist, maxdist;
            for (let node of level) {

                // [mindist, maxdist] = Distance.box2box_minmax(shape.box, node.max);
                // if (Flatten.Utils.GT(mindist, min_stop))
                //     continue;

                // Estimate min-max dist to the shape stored in the node.item, using node.item.key which is shape's box
                [mindist, maxdist] = Distance.box2box_minmax(shape.box, node.item.key);
                if (node.item.value instanceof Flatten.Edge) {
                    tree.insert([mindist, maxdist], node.item.value.shape);
                } else {
                    tree.insert([mindist, maxdist], node.item.value);
                }
                if (Flatten.Utils.LT(maxdist, min_stop)) {
                    min_stop = maxdist;                       // this will be the new distance estimation
                }
            }

            if (level.length === 0)
                return min_stop;

            // Calculate new level from left and right children of the current
            let new_level_left = level.map(node => node.left.isNil() ? undefined : node.left).filter(node => node !== undefined);
            let new_level_right = level.map(node => node.right.isNil() ? undefined : node.right).filter(node => node !== undefined);
            // Merge left and right subtrees and leave only relevant subtrees
            let new_level = [...new_level_left, ...new_level_right].filter(node => {
                // Node subtree quick reject, node.max is a subtree box
                let [mindist, maxdist] = Distance.box2box_minmax(shape.box, node.max);
                return (Flatten.Utils.LE(mindist, min_stop));
            });

            min_stop = Distance.minmax_tree_process_level(shape, new_level, min_stop, tree);
            return min_stop;
        }

        /**
         * Calculates sorted tree of [mindist, maxdist] intervals between query shape
         * and shapes of the planar set.
         * @param shape
         * @param set
         */
        static minmax_tree(shape, set, min_stop) {
            let tree = new IntervalTree();
            let level = [set.index.root];
            let squared_min_stop = min_stop < Number.POSITIVE_INFINITY ? min_stop * min_stop : Number.POSITIVE_INFINITY;
            squared_min_stop = Distance.minmax_tree_process_level(shape, level, squared_min_stop, tree);
            return tree;
        }

        static minmax_tree_calc_distance(shape, node, min_dist_and_segment) {
            let min_dist_and_segment_new, stop;
            if (node != null && !node.isNil()) {
                [min_dist_and_segment_new, stop] = Distance.minmax_tree_calc_distance(shape, node.left, min_dist_and_segment);

                if (stop) {
                    return [min_dist_and_segment_new, stop];
                }

                if (Flatten.Utils.LT(min_dist_and_segment_new[0], Math.sqrt(node.item.key.low))) {
                    return [min_dist_and_segment_new, true];   // stop condition
                }

                let [dist, shortest_segment] = Distance.distance(shape, node.item.value);
                // console.log(dist)
                if (Flatten.Utils.LT(dist, min_dist_and_segment_new[0])) {
                    min_dist_and_segment_new = [dist, shortest_segment];
                }

                [min_dist_and_segment_new, stop] = Distance.minmax_tree_calc_distance(shape, node.right, min_dist_and_segment_new);

                return [min_dist_and_segment_new, stop];
            }

            return [min_dist_and_segment, false];
        }

        /**
         * Calculates distance between shape and Planar Set of shapes
         * @param shape
         * @param {PlanarSet} set
         * @param {Number} min_stop
         * @returns {*}
         */
        static shape2planarSet(shape, set, min_stop = Number.POSITIVE_INFINITY) {
            let min_dist_and_segment = [min_stop, new Flatten.Segment()];
            let stop = false;
            if (set instanceof Flatten.PlanarSet) {
                let tree = Distance.minmax_tree(shape, set, min_stop);
                [min_dist_and_segment, stop] = Distance.minmax_tree_calc_distance(shape, tree.root, min_dist_and_segment);
            }
            return min_dist_and_segment;
        }

        static sort(dist_and_segment) {
            dist_and_segment.sort((d1, d2) => {
                if (Flatten.Utils.LT(d1[0], d2[0])) {
                    return -1;
                }
                if (Flatten.Utils.GT(d1[0], d2[0])) {
                    return 1;
                }
                return 0;
            });
        }

        static distance(shape1, shape2) {
            return shape1.distanceTo(shape2);
        }
    }

    Flatten.Distance = Distance;

    /**
     * Created by Alex Bol on 3/7/2017.
     */

    /**
     * Inversion is a transformation of the Euclidean plane that maps generalized circles
     * (where line is considered as a circle with infinite radius) into generalized circles
     * See also https://en.wikipedia.org/wiki/Inversive_geometry and
     * http://mathworld.wolfram.com/Inversion.html <br/>
     * Inversion also may be considered as a reflection of the point in the plane with respect
     * to inversion circle so that R^2 = OP * OP',
     * where <br/>
     * O - center of inversion circle <br/>
     * R - radius of inversion circle <br/>
     * P - point of plane <br/>
     * P' - inversion of the point P
     *
     * @param {Line | Circle} shape - shape to be transformed
     * @param {Circle} inversion_circle - inversion circle
     * @returns {Line | Circle} - result of transformation
     */
    function inverse(shape, inversion_circle) {
        let dist, shortest_segment;
        let dx, dy;
        let s;
        let v;
        let r;
        let d;
        let pt;

        if (shape instanceof Flatten.Line) {
            [dist, shortest_segment] = inversion_circle.pc.distanceTo(shape);
            if (EQ_0(dist)) {            // Line passing through inversion center, is mapping to itself
                return shape.clone();
            } else {                           // Line not passing through inversion center is mapping into circle
                r = inversion_circle.r * inversion_circle.r / (2 * dist);
                v = new Flatten.Vector(inversion_circle.pc, shortest_segment.end);
                v = v.multiply(r / dist);
                return new Flatten.Circle(inversion_circle.pc.translate(v), r);
            }
        } else if (shape instanceof Flatten.Circle) {
            [dist, shortest_segment] = inversion_circle.pc.distanceTo(shape.pc);
            if (EQ(dist, shape.r)) {     // Circle passing through inversion center mapped into line
                d = inversion_circle.r * inversion_circle.r / (2 * shape.r);
                v = new Flatten.Vector(shape.pc, inversion_circle.pc);
                v = v.normalize();
                pt = inversion_circle.pc.translate(v.multiply(d));
                return new Flatten.Line(pt, v);
            } else {                           // Circle not passing through inversion center - map into another circle */
                /* Taken from http://mathworld.wolfram.com */

                dx = shape.pc.x - inversion_circle.pc.x;
                dy = shape.pc.y - inversion_circle.pc.y;

                s = inversion_circle.r * inversion_circle.r / (dx * dx + dy * dy - shape.r * shape.r);

                let pc = new Flatten.Point(inversion_circle.pc.x + s * dx, inversion_circle.pc.y + s * dy);

                return new Flatten.Circle(pc, Math.abs(s) * shape.r);
            }
        }
    }

    /**
     * Created by Alex Bol on 2/18/2017.
     */

    Flatten.BooleanOperations = BooleanOperations;
    Flatten.Relations = Relations;

    exports.Arc = Arc;
    exports.BOUNDARY = BOUNDARY;
    exports.BooleanOperations = BooleanOperations;
    exports.Box = Box;
    exports.CCW = CCW;
    exports.CW = CW;
    exports.Circle = Circle;
    exports.Distance = Distance;
    exports.Edge = Edge;
    exports.Errors = errors;
    exports.Face = Face;
    exports.INSIDE = INSIDE;
    exports.Line = Line;
    exports.Matrix = Matrix;
    exports.Multiline = Multiline;
    exports.ORIENTATION = ORIENTATION;
    exports.OUTSIDE = OUTSIDE;
    exports.PlanarSet = PlanarSet;
    exports.Point = Point;
    exports.Polygon = Polygon;
    exports.Ray = Ray;
    exports.Relations = Relations;
    exports.Segment = Segment;
    exports.Utils = Utils;
    exports.Vector = Vector;
    exports.arc = arc;
    exports.box = box;
    exports.circle = circle;
    exports.default = Flatten;
    exports.inverse = inverse;
    exports.line = line;
    exports.matrix = matrix;
    exports.multiline = multiline;
    exports.point = point;
    exports.polygon = polygon;
    exports.ray = ray;
    exports.ray_shoot = ray_shoot;
    exports.segment = segment;
    exports.vector = vector;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
