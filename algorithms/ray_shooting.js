
"use strict";

module.exports = function(Flatten) {
    let {Polgon, Point, Segment, Arc, Line, Ray} = Flatten;

    Flatten.ray_shoot = function(polygon, point) {
        let contains = false;

        if (!(polygon instanceof Polygon && point instanceof Point)) {
            throw Flatten.Errors.ILLEGAL_PARAMETERS;
        }

        // 1. Quick reject
        if (polygon.box.notIntersect(point.box)) {
            return Flatten.OUTSIDE;
        }

        let ray = new Ray(point);
        let line = new Line(ray.pt, ray.norm);

        // 2. Locate relevant edges of the polygon
        let resp_edges = polygon.edges.search(ray.box);

        if (resp_edges.length == 0) {
            return Flatten.OUTSIDE;
        }

        // 3. Calculate intersections
        let intersections = [];
        for (let edge of resp_edges) {
            for (let ip of ray.intersect(edge.shape)) {

                // If intersection is equal to query point than point lays on boundary
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
        intersections.sort( (i1, i2) => {
            if (Flatten.LT(i1.pt.x, i2.pt.x)) {
                return -1;
            }
            if (Flatten.GT(i1.pt.x, i2.pt.x)) {
                return -1;
            }
            return 0;
        });

        // 5. Count real intersections, exclude touching
        let counter = 0;

        for (let i=0; i < intersections.length; i++) {
            let intersection = intersections[i];
            if (intersection.pt.equalTo(intersection.edge.shape.start)) {

            }
            else if (intersection.pt.equalTo(intersection.edge.shape.end)) {

            }
            else {
                if (intersection.edge.shape instanceof Segment) {
                    counter++;
                }
                else {

                }
            }
        }

        // 6. Odd or even?
        return contains;
    };
};