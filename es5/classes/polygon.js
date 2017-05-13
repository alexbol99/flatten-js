/**
 * Created by Alex Bol on 3/15/2017.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function (Flatten) {
  var Edge = Flatten.Edge,
      Face = Flatten.Face,
      PlanarSet = Flatten.PlanarSet;
  /**
   * Class representing a polygon.<br/>
   * Polygon in FlattenJS is a multipolygon comprised from a set of faces<br/>
   * Face, in turn, is a closed loop of edges, which can be a segment or a circular arc<br/>
   * @type {Polygon}
   */

  Flatten.Polygon = function () {
    /**
     * Constructor creates new instance of polygon.<br/>
     * New polygon is empty. Add new face to the polygon using method <br/>
     * <code>
     *     polygon.addFace(Points|Segments|Arcs[])
     * </code>
     */
    function Polygon() {
      _classCallCheck(this, Polygon);

      /**
       * Set of faces (closed loops), may be empty
       * @type {PlanarSet}
       */
      this.faces = new PlanarSet();
      /**
       * Set of edges. Usually is not used directly. Better access edges via faces
       * @type {PlanarSet}
       */
      this.edges = new PlanarSet();
    }

    /**
     *
     * @param {Points[]|Segments|Arcs[]} args - list of points or list of shapes (segments and arcs)
     * which comprise a closed loop
     * @returns {Face}
     */


    _createClass(Polygon, [{
      key: "addFace",
      value: function addFace() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var face = new Face(this, args);
        this.faces.add(face);
        return face;
      }

      /**
       * Returns area of the polygon. Area of an island will be added, area of a hole will be subtracted
       * @returns {number}
       */

    }, {
      key: "area",
      value: function area() {
        var signedArea = [].concat(_toConsumableArray(this.faces)).reduce(function (acc, face) {
          return acc + face.signedArea();
        }, 0);
        return Math.abs(signedArea);
      }

      /**
       * Return string to draw polygon in svg
       * @param attrs  - json structure with any attributes allowed to svg path element,
       * like "stroke", "strokeWidth", "fill", "fillRule"
       * Defaults are stroke:"black", strokeWidth:"3", fill:"lightcyan", fillRule:"evenodd"
       * @returns {string}
       */

    }, {
      key: "svg",
      value: function svg() {
        var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { stroke: "black", strokeWidth: "3", fill: "lightcyan", fillRule: "evenodd" };
        var stroke = attrs.stroke,
            strokeWidth = attrs.strokeWidth,
            fill = attrs.fill,
            fillRule = attrs.fillRule;

        var svgStr = "\n<path stroke=\"" + stroke + "\" stroke-width=\"" + strokeWidth + "\" fill=\"" + fill + "\" fill-rule=\"" + fillRule + "\" d=\"";
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.faces[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var face = _step.value;

            svgStr += face.svg();
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        svgStr += "\">\n</path>";

        return svgStr;
      }
    }]);

    return Polygon;
  }();
};