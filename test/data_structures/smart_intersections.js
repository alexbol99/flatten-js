import {expect} from 'chai';
import {Polygon, Utils, BOUNDARY, OVERLAP_SAME, OVERLAP_OPPOSITE} from '../../index';
import {addToIntPoints, sortIntersections, splitByIntersections, setOverlappingFlags}
    from '../../src/data_structures/smart_intersections';

describe('Smart intersections: overlap tolerance', function() {
    let tolerance;
    beforeEach(function() {
        tolerance = Utils.getTolerance();
        Utils.setTolerance(1e-6);
    });
    afterEach(function() {
        Utils.setTolerance(tolerance);
    });

    for (const offset of [0.0000009, 0.000002]) {
        for (const opposite of [false, true]) {
            for (const swap of [false, true]) {
                it(`Compares endpoint tolerance before length: offset=${offset}, opposite=${opposite}, swapped=${swap}`, function() {
                    let a = new Polygon([[0, 0], [2, 2], [0, 2]]);
                    let b = new Polygon(opposite ?
                        [[2 + offset, 2 + offset], [0, 0], [0, 2]] :
                        [[0, 0], [2 + offset, 2 + offset], [0, 2]]);
                    if (swap) [a, b] = [b, a];
                    const edge1 = [...a.faces][0].first;
                    const edge2 = [...b.faces][0].first;
                    const intersections = {int_points1: [], int_points2: []};
                    addToIntPoints(edge1, edge1.start, intersections.int_points1);
                    addToIntPoints(edge1, edge1.end, intersections.int_points1);
                    addToIntPoints(edge2, opposite ? edge2.end : edge2.start, intersections.int_points2);
                    addToIntPoints(edge2, opposite ? edge2.start : edge2.end, intersections.int_points2);
                    sortIntersections(intersections);
                    splitByIntersections(a, intersections.int_points1_sorted);
                    splitByIntersections(b, intersections.int_points2_sorted);
                    edge1.bv = edge2.bv = BOUNDARY;

                    // Coordinate differences fit the tolerance in the first case,
                    // although their combined effect on diagonal length does not.
                    expect(Utils.EQ(edge1.length, edge2.length)).to.be.false;
                    setOverlappingFlags(intersections);
                    const expected = offset < Utils.getTolerance() ?
                        (opposite ? OVERLAP_OPPOSITE : OVERLAP_SAME) : undefined;
                    expect(edge1.overlap).to.equal(expected);
                    expect(edge2.overlap).to.equal(expected);
                });
            }
        }
    }
});
