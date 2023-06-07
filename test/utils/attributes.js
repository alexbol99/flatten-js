'use strict';

import { expect } from 'chai';
import SVGAttributes from "../../src/utils/attributes";

const defaultAttributes = {
    stroke: "black",
    strokeWidth: 1,
    fill: "none",
    fillOpacity: 1.0
}

describe('#SVGAttributes', function() {
    it('May create new instance of SVGAttributes', function () {
        let attrs = new SVGAttributes();
        expect(attrs).to.be.an.instanceof(SVGAttributes);
    });
    it('May create new attributes with default values', function () {
        let attrs = new SVGAttributes();
        expect(attrs).to.deep.equal(defaultAttributes);
    });
    it('May create attributes with parameters', function () {
        const test_attrs = new SVGAttributes({stroke: "green"});
        const ref_attrs = {
            ...defaultAttributes,
            stroke: "green"
        }
        expect(test_attrs).to.deep.equal(ref_attrs);
    });
    it('May create attributes with arbitrary parameters', function () {
        const test_attrs = new SVGAttributes({id:"test", className: "test", stroke: "red"});
        const ref_attr = {
            ...defaultAttributes,
            ...{id:"test", className: "test", stroke: "red"}
        }
        expect(test_attrs).to.deep.equal(ref_attr);
    });
    it('May transform attributes into svg string', function () {
        const test_attrs = new SVGAttributes({id:"test", className: "test", strokeWidth: 5});
        const svg_string = test_attrs.toAttributesString();
        const ref_string = `id="test" class="test" stroke-width="5" stroke="black" fill="none" fill-opacity="1" `
        expect(svg_string).to.equal(ref_string)
    });
    it('May support valueless attributes in svg string', function () {
        const test_attrs = new SVGAttributes({id:"test", strokeWidth: 5, disabled: null});
        const svg_string = test_attrs.toAttributesString();
        const ref_string = `id="test" stroke-width="5" disabled stroke="black" fill="none" fill-opacity="1" `
        expect(svg_string).to.equal(ref_string)
    });

});
