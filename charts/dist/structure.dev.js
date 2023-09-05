"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _material = require("@mui/material");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var MARGIN = {
  TOP: 30,
  RIGHT: 30,
  BOTTOM: 30,
  LEFT: 30
};
var SIDE = 230;
var WIDTH = SIDE - MARGIN.LEFT - MARGIN.RIGHT;
var HEIGHT = SIDE - MARGIN.TOP - MARGIN.BOTTOM;
var prefersDarkMode = (0, _material.useMediaQuery)('(prefers-color-scheme: dark)');

var Structure =
/*#__PURE__*/
function () {
  function Structure(element, data) {
    _classCallCheck(this, Structure);

    var height = data.height ? data.height : HEIGHT;
    var width = data.width ? data.width : WIDTH;
    var marginLeft = data.marginLeft ? data.marginLeft : MARGIN.LEFT;
    var marginTop = data.marginTop ? data.marginTop : MARGIN.TOP;
    this.svg = d3.select(element).append("svg").attr("width", width + marginLeft * 2).attr("height", height + marginTop * 2).attr("viewBox", [0, 0, width + marginLeft * 2, height + marginTop * 2]).style("z-index", 10).style("margin-top", "30px").append("g").attr("transform", "translate(".concat(marginLeft, ", ").concat(marginTop, ")"));
    this.svg.append("text").attr("x", width / 2).attr("y", 0 - marginTop / 2).attr("text-anchor", "middle").style("font-size", data.fontSize ? data.fontSize : "16px").style("font-family", 'Arial, sans-serif').text("Unit Cell Geometry").style("font-weight", 700);
    this.svg.append("text").attr("x", width / 2).attr("y", height + marginTop).attr("class", "volume-fraction").attr("text-anchor", "middle").style("font-size", data.fontSize ? data.fontSize : "16px").style("font-family", 'Arial, sans-serif');
    this.update({
      data: data,
      element: element
    });
  }

  _createClass(Structure, [{
    key: "update",
    value: function update(_ref) {
      var data = _ref.data,
          element = _ref.element;
      this.data = data.geometry;
      this.color = data.outline_color;
      var height = data.height ? data.height : HEIGHT;
      var width = data.width ? data.width : WIDTH;
      var marginLeft = data.marginLeft ? data.marginLeft : MARGIN.LEFT;
      var res = [];
      res = this.pixelate(this.data, this.color);
      var yScale = d3.scaleLinear().domain([0, 50]).range([height, 0]);
      var xScale = d3.scaleLinear().domain([0, 50]).range([0, width]);
      var size = (width + marginLeft * 2) / 50;
      var ratio = this.calculateRatio(this.data);
      this.svg.select(".volume-fraction").text("Volume Fraction: ".concat(ratio));
      d3.select(".tooltip").remove();
      var pixels = this.svg.selectAll("rect").data(res);
      pixels.enter().append("rect").merge(pixels).attr("x", function (d) {
        return xScale(d.x);
      }).attr("y", function (d) {
        return yScale(d.y);
      }).attr("width", size).attr("height", size).attr("fill", function (d) {
        return d.fill;
      });
      pixels.exit().remove();
      var tooltip = d3.select(element).append("div").attr("class", "tooltip-structure").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px").style("visibility", "hidden").style();

      var mouseover = function mouseover(event, d) {
        tooltip.style("visibility", "visible");
      };

      var mousemove = function mousemove(event, d) {
        tooltip.html("(".concat(data['CM0'] || 'N/A', ", ").concat(data['CM1'] || 'N/A', ")")).style("left", event.pageX + 10 + "px").style("top", event.pageY + 10 + "px");
      };

      var mouseleave = function mouseleave(event, d) {
        tooltip.style("visibility", "hidden");
      };

      this.svg.on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave);
    }
  }, {
    key: "calculateRatio",
    value: function calculateRatio(data) {
      if (!data) return 0;
      var count_1 = 0;
      var xSquares = 50;
      var ySquares = 50;
      var d = [];

      for (var i = 0; i < xSquares; i++) {
        for (var j = 0; j < ySquares; j++) {
          if (data[i * xSquares + j] == '1') count_1++;
        }
      }

      return (count_1 / (xSquares * ySquares)).toFixed(2);
    }
  }, {
    key: "pixelate",
    value: function pixelate(data, color) {
      if (!data) return [];
      var xSquares = 50;
      var ySquares = 50;
      var d = [];
      var background = prefersDarkMode ? color : "white";
      var pixelColor = prefersDarkMode ? "white" : color;

      for (var i = 0; i < xSquares; i++) {
        for (var j = 0; j < ySquares; j++) {
          d.push({
            x: i,
            y: j,
            fill: data[i * xSquares + j] == "0" ? background : pixelColor
          });
        }
      }

      return d;
    }
  }]);

  return Structure;
}();

var _default = Structure;
exports["default"] = _default;