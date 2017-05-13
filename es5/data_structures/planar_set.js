/**
 * Created by Alex Bol on 3/12/2017.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IntervalTree = require('flatten-interval-tree');

module.exports = function (Flatten) {
    /**
     * Class representing a planar set - a generic container with ability to keep and retrieve shapes and
     * perform spatial queries. Planar set is an extension of Set container, so it is possible to call directly
     * Set properties and methods
     */
    Flatten.PlanarSet = function (_Set) {
        _inherits(PlanarSet, _Set);

        /**
         * Create new empty instance of PlanarSet
         */
        function PlanarSet() {
            _classCallCheck(this, PlanarSet);

            var _this = _possibleConstructorReturn(this, (PlanarSet.__proto__ || Object.getPrototypeOf(PlanarSet)).call(this));

            _this.index = new IntervalTree();
            return _this;
        }

        /**
         * Add new shape to planar set and to its spatial index.<br/>
         * If shape already exist, it will not be added again.
         * This happens with no error, it is possible to use <i>size</i> property to check if
         * a shape was actually added.<br/>
         * @param shape - shape to be added, should have valid <i>box</i> property
         * @returns {PlanarSet} - planar set update, so may be chained
         */


        _createClass(PlanarSet, [{
            key: "add",
            value: function add(shape) {
                var size = this.size;
                _get(PlanarSet.prototype.__proto__ || Object.getPrototypeOf(PlanarSet.prototype), "add", this).call(this, shape);
                // size not changed - item not added, probably trying to add same item twice
                if (this.size > size) {
                    var node = this.index.insert(shape.box, shape);
                }
                return this; // in accordance to Set.add interface
            }

            /**
             * Delete shape from planar set.
             * @param shape - shape to be deleted
             * @returns {boolean} - returns true if shape was actually deleted, false otherwise
             */

        }, {
            key: "delete",
            value: function _delete(shape) {
                var deleted = _get(PlanarSet.prototype.__proto__ || Object.getPrototypeOf(PlanarSet.prototype), "delete", this).call(this, shape);
                if (deleted) {
                    this.index.remove(shape.box, shape);
                }
                return deleted;
            }
        }, {
            key: "clear",
            value: function clear() {}

            /**
             * 2d range search in planar set.<br/>
             * Returns array of all shapes in planar set which bounding box is intersected with query box
             * @param box - query box
             * @returns {Array} - array of shapes
             */

        }, {
            key: "search",
            value: function search(box) {
                var resp = this.index.search(box);
                return resp;
            }

            /**
             * Point hit test. Returns array of shapes which contains given point
             * @param point - query point
             * @returns {Array} - array of shapes which contains given point
             */

        }, {
            key: "hit",
            value: function hit(point) {
                var box = new Flatten.Box(point.x - 1, point.y - 1, point.x + 1, point.y + 1);
                var resp = this.index.search(box);
                return resp.filter(function (shape) {
                    return point.on(shape);
                });
            }

            /**
             * Returns svg string to draw all shapes in planar set
             * @returns {String}
             */

        }, {
            key: "svg",
            value: function svg() {
                var svgcontent = [].concat(_toConsumableArray(this)).reduce(function (acc, shape) {
                    return acc + shape.svg();
                }, "");
                return svgcontent;
            }
        }]);

        return PlanarSet;
    }(Set);
};