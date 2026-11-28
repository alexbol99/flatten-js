import {expect} from 'chai';
import {Edge, Utils, point, segment, arc, circle, OVERLAP_SAME, OVERLAP_OPPOSITE} from '../../index';

describe('Edge overlap classification', function() {
    let tolerance;
    beforeEach(function() {
        tolerance = Utils.getTolerance();
        Utils.setTolerance(1e-6);
    });
    afterEach(function() {
        Utils.setTolerance(tolerance);
    });

    const diagonal = () => segment(0, 0, 2, 2);
    const nearDiagonal = () => segment(0, 0, 2.0000009, 2.0000009);
    const upper = () => arc(point(0, 0), 2, 0, Math.PI, true);
    const fullCircle = () => circle(point(0, 0), 2).toArc(true);
    const cases = [
        ['equal segments', diagonal, diagonal, OVERLAP_SAME],
        ['reversed segments', diagonal, () => diagonal().reverse(), OVERLAP_OPPOSITE],
        ['coordinate-equal segments with different lengths', diagonal, nearDiagonal, OVERLAP_SAME],
        ['reversed coordinate-equal segments', diagonal, () => nearDiagonal().reverse(), OVERLAP_OPPOSITE],
        ['segments beyond tolerance', diagonal, () => segment(0, 0, 2.000002, 2.000002), undefined],
        ['partial segment overlap', diagonal, () => segment(0, 0, 1, 1), undefined],
        ['equal arcs', upper, upper, OVERLAP_SAME],
        ['reversed arcs', upper, () => upper().reverse(), OVERLAP_OPPOSITE],
        ['complementary arcs', upper, () => arc(point(0, 0), 2, 0, Math.PI, false), undefined],
        ['arc and chord', upper, () => segment(2, 0, -2, 0), undefined],
        ['equal full circles', fullCircle, fullCircle, OVERLAP_SAME],
        ['reversed full circles', fullCircle, () => fullCircle().reverse(), OVERLAP_OPPOSITE]
    ];

    for (const [name, first, second, expected] of cases) {
        it(`Classifies ${name} consistently without changing the shapes`, function() {
            const a = new Edge(first()), b = new Edge(second());
            const shapes = [JSON.stringify(a.shape), JSON.stringify(b.shape)];
            expect(Edge.getOverlap(a.shape, b.shape)).to.equal(expected);
            expect(Edge.getOverlap(b.shape, a.shape)).to.equal(expected);
            expect(a.overlap).to.equal(undefined);
            expect(b.overlap).to.equal(undefined);
            a.setOverlap(b);
            expect(a.overlap).to.equal(expected);
            expect(b.overlap).to.equal(expected);
            expect([JSON.stringify(a.shape), JSON.stringify(b.shape)]).to.deep.equal(shapes);
        });
    }

    it('Preserves flags assigned by an earlier overlapping chain', function() {
        const a = new Edge(diagonal()), b = new Edge(diagonal());
        a.overlap = OVERLAP_OPPOSITE;
        a.setOverlap(b);
        expect(a.overlap).to.equal(OVERLAP_OPPOSITE);
        expect(b.overlap).to.equal(OVERLAP_SAME);
    });
});
