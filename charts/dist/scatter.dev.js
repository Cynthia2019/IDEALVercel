"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _constants = require("@/util/constants");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var circleOriginalSize = 5;
var circleFocusSize = 8;
var legendSpacing = 4;
var MARGIN = {
  TOP: 0,
  RIGHT: 50,
  BOTTOM: 20,
  LEFT: 50
};
var SIDE_BAR_SIZE = 100;
var WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT - SIDE_BAR_SIZE;
var HEIGHT = 700 - MARGIN.TOP - MARGIN.BOTTOM - SIDE_BAR_SIZE;

function expo(x, f) {
  if (x < 1000 && x > -1000) return x;
  return Number(x).toExponential(f);
}

function isBrushed(brush_coords, cx, cy) {
  var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
}

var Scatter =
/*#__PURE__*/
function () {
  function Scatter(element, legendElement, data, view) {
    _classCallCheck(this, Scatter);

    this.svg = d3.select(element).append("svg").attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT).attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM).attr("viewBox", [-MARGIN.LEFT, -MARGIN.TOP, WIDTH + MARGIN.LEFT + MARGIN.RIGHT, HEIGHT + MARGIN.TOP + MARGIN.BOTTOM]).attr("style", "max-width: 100%").append("g").attr("class", "scatter-plot-plot").attr("transform", "translate(".concat(MARGIN.LEFT, ", ").concat(MARGIN.TOP, ")")); //Legend

    this.legend = d3.select(legendElement).append("svg").attr("width", 120).append("g").attr("class", "scatter-plot-legend"); // Labels

    this.xLabel = this.svg.append("text").attr("x", WIDTH / 2).attr("y", HEIGHT + 50).attr("text-anchor", "middle").style("fill", "black");
    this.yLabel = this.svg.append("text").attr("x", -HEIGHT / 2).attr("y", -80).attr("text-anchor", "middle").attr("transform", "rotate(-90)").style("fill", "black"); // Append group el to display both axes

    this.xAxisGroup = this.svg.append("g").attr("transform", "translate(0, ".concat(HEIGHT, ")")); // Append group el to display both axes

    this.yAxisGroup = this.svg.append("g");
    this.xScale;
    this.yScale;
    this.zoomedXScale;
    this.zoomedYScale;
    this.update({
      data: data,
      element: element,
      legendElement: legendElement,
      query1: this.query1,
      query2: this.query2,
      view: view,
      reset: false
    });
  } //query1: x-axis
  //query2: y-axis


  _createClass(Scatter, [{
    key: "update",
    value: function update(_ref) {
      var _ref2,
          _this = this;

      var data = _ref.data,
          element = _ref.element,
          legendElement = _ref.legendElement,
          setDataPoint = _ref.setDataPoint,
          query1 = _ref.query1,
          query2 = _ref.query2,
          selectedData = _ref.selectedData,
          setSelectedData = _ref.setSelectedData,
          setNeighbors = _ref.setNeighbors,
          view = _ref.view,
          reset = _ref.reset,
          setReset = _ref.setReset;
      this.data = data;
      this.query1 = query1;
      this.query2 = query2;
      var datasets = data;

      var finalData = (_ref2 = []).concat.apply(_ref2, _toConsumableArray(datasets)); //remove elements to avoid repeated append


      d3.selectAll(".legend").remove();
      d3.select(".tooltip").remove();
      d3.selectAll(".dataCircle").remove();
      d3.selectAll("defs").remove();
      d3.selectAll(".rectZoom").remove();
      d3.selectAll(".clipPath").remove();
      var yScale = d3.scaleLinear().domain([d3.min(finalData, function (d) {
        return d[query2];
      }), d3.max(finalData, function (d) {
        return d[query2];
      })]).range([HEIGHT, 0]);
      var xScale = d3.scaleLinear().domain([d3.min(finalData, function (d) {
        return d[query1];
      }), d3.max(finalData, function (d) {
        return d[query1];
      })]).range([0, WIDTH]);

      if (reset || this.zoomedXScale === undefined) {
        this.xScale = xScale;
      } else {
        this.xScale = this.zoomedXScale;
      }

      if (reset || this.zoomedYScale === undefined) {
        this.yScale = yScale;
      } else {
        this.yScale = this.zoomedYScale;
      } // Add a clipPath: everything out of this area won't be drawn.


      this.svg.append("defs").append("SVG:clipPath").attr("id", "clip").append("SVG:rect").attr("width", WIDTH).attr("height", HEIGHT).attr("x", 0).attr("y", 0);
      var xAxisCall = d3.axisBottom(this.xScale).tickFormat(function (x) {
        return "".concat(expo(x, 2));
      });
      this.xAxisGroup.transition().duration(500).call(xAxisCall);
      var yAxisCall = d3.axisLeft(this.yScale).tickFormat(function (y) {
        return "".concat(expo(y, 2));
      });
      this.yAxisGroup.transition().duration(500).call(yAxisCall);
      this.xLabel.text(this.query1);
      this.yLabel.text(this.query2);
      var tooltip = d3.select(element).append("div").attr("class", "tooltip").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px").style("visibility", "hidden");

      var mouseover = function mouseover(e, d) {
        d3.select(this).attr("r", circleFocusSize).style("stroke", "black").style("stroke-width", 2).style("fill-opacity", 1);
        setDataPoint(d);
        tooltip.style("visibility", "visible").transition().duration(200);
      };

      var mousemove = function mousemove(e, d) {
        tooltip.html("Dataset: " + d["name"] + "<br>symmetry: " + d["symmetry"] + "<br>Material_0: " + d.CM0 + "<br>Material_1: " + d.CM1 + "<br>".concat(query1, ": ") + d[query1] + "<br>".concat(query2, ": ") + d[query2]).style("top", e.pageY + 10 + "px").style("left", e.pageX + 10 + "px");
      };

      var mouseleave = function mouseleave(e, d) {
        tooltip.style("visibility", "hidden").transition().duration(200);
        var circle = d3.select(this);
        d3.select(this).attr("r", circle.classed("highlighted") ? circleFocusSize : circleOriginalSize).style("stroke", "none").style("stroke-width", 2).style("fill-opacity", 0.8);
      };

      function getKnnData(data) {
        var env, url, response;
        return regeneratorRuntime.async(function getKnnData$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                env = process.env.NODE_ENV;
                url = 'http://localhost:8000/model?data=';

                if (env == 'production') {//    url = 'https://ideal-server-espy0exsw-cynthia2019.vercel.app/model?data='
                }

                _context.next = 5;
                return regeneratorRuntime.awrap(fetch("".concat(url, "[").concat(data, "]"), {
                  method: "GET",
                  mode: "cors"
                }).then(function (res) {
                  return res.json();
                })["catch"](function (err) {
                  return console.log("fetch error", err.message);
                }));

              case 5:
                response = _context.sent;
                return _context.abrupt("return", response);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        });
      }

      var mousedown = function mousedown(e, d) {
        var columns = ["C11", "C12", "C22", "C16", "C26", "C66"];
        var inputData = columns.map(function (c) {
          return d[c];
        });
        var target = d3.select(this);

        if (view == "brush-on") {
          target.classed("selected", true);
        } else if (view == "brush-off") {
          target.classed("selected", false);
        }

        var selected = [];
        d3.selectAll(".selected").each(function (d, i) {
          return selected.push(d);
        });
        setSelectedData(selected);

        if (view == 'neighbor') {
          target.classed("selected", true);
          getKnnData(inputData).then(function (indices) {
            d3.selectAll(".dataCircle").data(finalData).classed("highlighted", function (datum) {
              return indices.includes(datum.index);
            }).classed("masked", function (datum) {
              return !indices.includes(datum.index);
            });
          });
          var neighborElements = d3.selectAll('.highlighted');
          var masked = d3.selectAll('.masked');
          masked.attr('fill', function (d) {
            return d.color;
          }).attr('r', circleOriginalSize).classed('selected', false);
          var neighbors = [];
          neighborElements.each(function (d, i) {
            d['outline_color'] = _constants.nnColorAssignment[i];
            return neighbors.push(d);
          });
          neighborElements.attr('fill', function (d) {
            return d.outline_color;
          }).attr('r', circleFocusSize);
          setNeighbors(neighbors);
        }
      };

      var zoomedXScale = this.xScale;
      var zoomedYScale = this.yScale; // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom

      var zoom = d3.zoom().scaleExtent([0.1, 20]) // This control how much you can unzoom (x1) and zoom (x20)
      .extent([[0, 0], [WIDTH, HEIGHT]]).on("zoom", function (event) {
        // recover the new scale
        var newXScale = event.transform.rescaleX(this.xScale);
        var newYScale = event.transform.rescaleY(this.yScale); // update axes with these new boundaries

        var xAxisCall = d3.axisBottom(newXScale).tickFormat(function (x) {
          return "".concat(expo(x, 2));
        });
        var yAxisCall = d3.axisLeft(newYScale).tickFormat(function (y) {
          return "".concat(expo(y, 2));
        });
        this.xAxisGroup.transition().duration(500).call(xAxisCall);
        this.yAxisGroup.transition().duration(500).call(yAxisCall);
        d3.selectAll(".dataCircle").data(finalData).attr("cy", function (d) {
          return newYScale(d[query2]);
        }).attr("cx", function (d) {
          return newXScale(d[query1]);
        });
        zoomedXScale = newXScale;
        zoomedYScale = newYScale;
        this.zoomedXScale = newXScale;
        this.zoomedYScale = newYScale;
      }.bind(this));
      this.xScale = zoomedXScale;
      this.yScale = zoomedYScale;
      var brush = d3.brush().extent([[0, 0], [WIDTH, HEIGHT]]).on("start brush end", function brushed(event) {
        var xScale = this.xScale;
        var yScale = this.yScale;

        if (event.selection) {
          if (view == "brush-on") {
            d3.selectAll(".dataCircle").data(finalData).classed("selected", function (d) {
              return d3.select(this).classed("selected") || isBrushed(event.selection, xScale(d[query1]), yScale(d[query2]));
            });
          } else if (view == "brush-off") {
            d3.selectAll(".selected").classed("selected", function (d) {
              return isBrushed(event.selection, xScale(d[query1]), yScale(d[query2])) ? false : true;
            });
          }

          var selected = [];
          d3.selectAll(".selected").each(function (d, i) {
            return selected.push(d);
          });
          setSelectedData(selected);
        }
      }.bind(this));
      var legend = this.legend.selectAll(".legend").data(data);
      legend.exit().remove();
      legend.enter().append("circle").attr("class", "legend").attr("r", circleOriginalSize).attr("cx", 10).attr("cy", function (d, i) {
        return (circleOriginalSize * 2 + legendSpacing) * i + 30;
      }).style("fill", function (d) {
        return d.color;
      }); //Create legend labels

      legend.enter().append("text").attr("class", "legend").attr("x", 20).attr("y", function (d, i) {
        return (circleOriginalSize * 2 + legendSpacing) * i + 30;
      }).text(function (d) {
        return d.name;
      }).attr("text-anchor", "left").style("alignment-baseline", "middle");
      legend.exit().remove();

      if (view === "brush-on" || view === "brush-off") {
        zoom.on("zoom", null);
        d3.selectAll(".rectZoom").remove();
        this.svg.call(brush);
      } else if (view === "zoom") {
        brush.on("start brush end", null);
        this.svg.append("rect").attr("class", "rectZoom").attr("width", WIDTH).attr("height", HEIGHT).call(zoom);
      }

      var circles = this.svg.append("g").attr("clip-path", "url(#clip)").attr("class", "clipPath").selectAll(".dataCircle").data(finalData);
      circles.exit().transition().attr("r", 0).remove();
      circles.enter().append("circle").join(circles).attr("r", circleOriginalSize).attr("class", "dataCircle").attr("fill", function (d) {
        return d.color;
      }).classed("selected", function (d) {
        return selectedData.includes(d);
      }).style("stroke", "none").style("stroke-width", 2).style("fill-opacity", 0.8).on("mousedown", mousedown).on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave).attr("cx", function (d) {
        return _this.xScale(d[query1]);
      }).attr("cy", function (d) {
        return _this.yScale(d[query2]);
      });
      circles.exit().transition().attr("r", 0).remove();

      if (reset) {
        this.svg.call(zoom.transform, d3.zoomIdentity);
        d3.selectAll(".selected").classed("selected", false);
        setSelectedData([]);
        setReset(false);
      }
    }
  }]);

  return Scatter;
}();

var _default = Scatter;
exports["default"] = _default;