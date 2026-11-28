import {expect} from 'chai';
import {Polygon, point, circle, arc, segment, BooleanOperations} from '../../index';

function checkResult(result, area, faces) {
    expect(result.area()).to.be.closeTo(area, 1e-9);
    expect(result.faces.size).to.equal(faces);
    expect(result.isValid()).to.be.true;
    let edges = 0;
    for (const face of result.faces) {
        expect(face.area()).to.be.greaterThan(0);
        for (const edge of face) {
            expect(edge.next.prev).to.equal(edge);
            expect(edge.prev.next).to.equal(edge);
            expect(edge.end.equalTo(edge.next.start)).to.be.true;
            edges++;
        }
    }
    expect(result.edges.size).to.equal(edges);
}

describe('Boolean operations with differently subdivided overlapping boundaries', function() {
    const sharedA = [[[1, 0], [3, 1], [2, 2]], [[3, 2], [3, 3], [1, 2]]];
    const sharedB = [[[3, 2], [5, 2], [5, 5], [3, 5]], [[1, 2], [3, 2], [3, 4], [1, 4]]];
    const cases = [
        {
            name: 'faces sharing an internal seam (PR #259)',
            a: () => new Polygon(sharedA), b: () => new Polygon(sharedB),
            areas: [11.5, 1, 1.5, 9], faces: [2, 1, 1, 1]
        },
        {
            name: 'adjacent outer faces with a hole',
            a: () => new Polygon([
                [[0, 0], [3, 0], [3, 4], [0, 4]], [[3, 0], [6, 0], [6, 4], [3, 4]],
                [[1, 1], [1, 2], [2, 2], [2, 1]]
            ]),
            b: () => new Polygon([[1.2, 1.2], [1.8, 1.2], [1.8, 1.8], [1.2, 1.8]]),
            areas: [23.36, 0, 23, 0.36], faces: [3, 0, 2, 1]
        },
        {
            name: 'adjacent holes preserve their orientation',
            a: () => new Polygon([
                [[0, 0], [6, 0], [6, 6], [0, 6]],
                [[1, 1], [1, 3], [2, 3], [2, 1]], [[2, 1], [2, 3], [3, 3], [3, 1]]
            ]),
            b: () => new Polygon([[1.25, 1.25], [2.75, 1.25], [2.75, 2.75], [1.25, 2.75]]),
            areas: [34.25, 0, 32, 2.25], faces: [3, 0, 2, 1]
        },
        {
            name: 'merging adjacent faces creates a hole',
            a: () => new Polygon([
                [[0, 0], [3, 0], [3, 1], [1, 1], [1, 3], [3, 3], [3, 4], [0, 4]],
                [[3, 0], [4, 0], [4, 4], [3, 4]]
            ]),
            b: () => new Polygon([[-1, -1], [5, -1], [5, 5], [-1, 5]]),
            areas: [36, 12, 0, 24], faces: [1, 2, 0, 3]
        },
        {
            name: 'faces sharing a curved internal seam',
            a: () => new Polygon([
                [circle(point(0, 0), 1).toArc(true)],
                [arc(point(0, 0), 2, 0, Math.PI, true), segment(-2, 0, -1, 0),
                    arc(point(0, 0), 1, Math.PI, 0, false), segment(1, 0, 2, 0)]
            ]),
            b: () => new Polygon([[-3, -3], [3, -3], [3, 3], [-3, 3]]),
            areas: [36, 2.5 * Math.PI, 0, 36 - 2.5 * Math.PI], faces: [1, 1, 0, 2]
        },
        {
            name: 'square and rectangle with a touching triangle (#258)',
            a: () => new Polygon([[[0, 0], [2, 0], [2, 2], [0, 2]]]),
            b: () => new Polygon([[[0, 0], [2, 0], [2, 1], [0, 1]], [[1, 0], [1, -1], [2, -1]]]),
            areas: [4.5, 2, 2, 0.5], faces: [2, 1, 1, 1]
        },
        {
            name: 'triangles with a touching face (#258)',
            a: () => new Polygon([[[0, 1], [3, 1], [4, 4]]]),
            b: () => new Polygon([[[3, 1], [1, 2], [0, 1]], [[1, 1], [0, 0], [1, 0]]]),
            areas: [5.15, 1.35, 3.15, 0.65], faces: [2, 1, 1, 2]
        },
        {
            name: 'several unrelated faces touching the same edge',
            a: () => new Polygon([[[0, 0], [4, 0], [4, 2], [0, 2]]]),
            b: () => new Polygon([
                [[0, 0], [4, 0], [4, 1], [0, 1]],
                ...[1, 2, 3].map(x => [[x, 0], [x, -1], [x + 0.5, -1]])
            ]),
            areas: [8.75, 4, 4, 0.75], faces: [4, 1, 1, 3]
        },
        {
            name: 'both operands split at different unrelated contacts',
            a: () => new Polygon([
                [[0, 0], [4, 0], [4, 2], [0, 2]], [[1, 0], [1, -1], [1.5, -1]]
            ]),
            b: () => new Polygon([
                [[0, 0], [4, 0], [4, 1], [0, 1]], [[3, 0], [3, -1], [3.5, -1]]
            ]),
            areas: [8.5, 4, 4.25, 0.25], faces: [3, 1, 2, 1]
        },
        {
            name: 'complementary arcs sharing endpoints but not a curved boundary',
            a: () => new Polygon([[arc(point(0, 0), 2, 0, Math.PI, true), segment(-2, 0, 2, 0)]]),
            b: () => new Polygon([[arc(point(0, 0), 2, Math.PI, 2 * Math.PI, true), segment(2, 0, -2, 0)]]),
            areas: [4 * Math.PI, 0, 2 * Math.PI, 2 * Math.PI], faces: [1, 0, 1, 1]
        },
        {
            name: 'a full circle split by a touching triangle',
            a: () => new Polygon([[circle(point(0, 0), 2).toArc(true)]]),
            b: () => {
                const polygon = new Polygon([[circle(point(0, 0), 2).toArc(true)]]);
                polygon.addFace([point(0, 2), point(0.5, 3), point(-0.5, 3)]);
                return polygon;
            },
            areas: [4 * Math.PI + 0.5, 4 * Math.PI, 0, 0.5], faces: [2, 1, 0, 1]
        }
    ];

    for (const test of cases) {
        for (const swap of [false, true]) {
            for (const reverse of [false, true]) {
                for (const operation of ['unify', 'intersect', 'subtract']) {
                    it(`${test.name}: ${operation}, swapped=${swap}, reversed=${reverse}`, function() {
                        let a = test.a(), b = test.b();
                        if (reverse) { a.reverse(); b.reverse(); }
                        if (swap) [a, b] = [b, a];
                        const before = [JSON.stringify(a), JSON.stringify(b)];
                        const index = operation === 'unify' ? 0 : operation === 'intersect' ? 1 : swap ? 3 : 2;
                        checkResult(BooleanOperations[operation](a, b), test.areas[index], test.faces[index]);
                        expect([JSON.stringify(a), JSON.stringify(b)]).to.deep.equal(before);
                    });
                }
            }
        }
    }

    it('Finds the overlapping face regardless of face insertion order', function() {
        const a = new Polygon([[[0, 0], [2, 0], [2, 2], [0, 2]]]);
        const b = new Polygon([[[1, 0], [1, -1], [2, -1]], [[0, 0], [2, 0], [2, 1], [0, 1]]]);
        checkResult(BooleanOperations.unify(a, b), 4.5, 2);
        checkResult(BooleanOperations.unify(b, a), 4.5, 2);
    });

    it('Merges shared-face boundaries independently of face insertion order', function() {
        for (const reverseA of [false, true]) {
            for (const reverseB of [false, true]) {
                const a = new Polygon(reverseA ? sharedA.slice().reverse() : sharedA);
                const b = new Polygon(reverseB ? sharedB.slice().reverse() : sharedB);
                checkResult(BooleanOperations.unify(a, b), 11.5, 2);
                checkResult(BooleanOperations.unify(b, a), 11.5, 2);
            }
        }
    });
});
