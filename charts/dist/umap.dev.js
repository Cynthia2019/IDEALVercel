"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _umapJs = require("umap-js");

var _organizeByName = _interopRequireDefault(require("@/util/organizeByName"));

var _standardScaler = require("@/components/shared/standardScaler");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var circleOriginalSize = 5;
var circleFocusSize = 7;
var legendSpacing = 4;
var MARGIN = {
  TOP: 0,
  RIGHT: 50,
  BOTTOM: 20,
  LEFT: 50
};
var SIDE_BAR_SIZE = 100;
var WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;
var HEIGHT = 700 - MARGIN.TOP - MARGIN.BOTTOM;

function expo(x, f) {
  if (x < 1000 && x > -1000) return x.toFixed();
  return Number(x).toExponential(f);
}

function isBrushed(brush_coords, cx, cy) {
  var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
}

var Umap =
/*#__PURE__*/
function () {
  function Umap(element, legendElement, data, setDataPoint, selectedData, setSelectedData, view, knn) {
    _classCallCheck(this, Umap);

    this.svg = d3.select(element).append("svg").attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT).attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM).attr("viewBox", [-MARGIN.LEFT, -MARGIN.TOP, WIDTH + MARGIN.LEFT + MARGIN.RIGHT, HEIGHT + MARGIN.TOP + MARGIN.BOTTOM]).attr("style", "max-width: 100%").append("g").attr("class", "scatter-plot-plot").attr("transform", "translate(".concat(MARGIN.LEFT, ", ").concat(MARGIN.TOP, ")")); //Legend

    this.legend = d3.select(legendElement).append("svg").attr("width", 120).append("g").attr("class", "scatter-plot-legend"); // Labels

    this.xLabel = this.svg.append("text").attr("x", WIDTH / 2).attr("y", HEIGHT + 50).attr("text-anchor", "middle").style("fill", "black");
    this.yLabel = this.svg.append("text").attr("x", -HEIGHT / 2).attr("y", -60).attr("text-anchor", "middle").attr("transform", "rotate(-90)").style("fill", "black"); // Append group el to display both axes

    this.xAxisGroup = this.svg.append("g").attr("transform", "translate(0, ".concat(HEIGHT, ")")); // Append group el to display both axes

    this.yAxisGroup = this.svg.append("g");
    this.xScale;
    this.yScale;
    this.zoomedXScale;
    this.zoomedYScale;
    this.update(data, element, legendElement, setDataPoint, this.query1, this.query2, selectedData, setSelectedData, view, false, knn);
  } //query1: x-axis
  //query2: y-axis


  _createClass(Umap, [{
    key: "update",
    value: function update(data, element, legendElement, setDataPoint, query1, query2, selectedData, setSelectedData, view, reset, setReset, knn) {
      var _ref,
          _this = this;

      this.data = data;
      this.query1 = "X";
      this.query2 = "Y";
      query1 = "X";
      query2 = "Y";
      var properties = ['C11', 'C12', 'C22', 'C16', 'C26', 'C66'];
      var datasets = [];
      var scaler = new _standardScaler.StandardScaler(); // const embedding = umap.fit(data);

      var organizedData = (0, _organizeByName["default"])(data);
      var umap = new _umapJs.UMAP({
        nNeighbors: knn ? knn : 15
      });
      var temp_data = [];
      organizedData.map(function (d, i) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = d.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _data = _step.value;
            var temp_properties = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = properties[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var p = _step2.value;
                temp_properties.push(+_data[p]);
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                  _iterator2["return"]();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            temp_data.push(temp_properties);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
      temp_data.length ? temp_data = scaler.fit_transform(temp_data) : null;
      temp_data.length ? umap.fit(temp_data) : null;
      organizedData.map(function (d, i) {
        var temp_data2 = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = d.data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _data2 = _step3.value;
            var temp_properties = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = properties[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var p = _step4.value;
                // data[p] === 0 ? console.log("zero") : null;
                temp_properties.push(_data2[p]);
              }
            } catch (err) {
              _didIteratorError4 = true;
              _iteratorError4 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                  _iterator4["return"]();
                }
              } finally {
                if (_didIteratorError4) {
                  throw _iteratorError4;
                }
              }
            }

            _data2.name = d.name;
            _data2.color = d.color;
            temp_data2.push(temp_properties);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        temp_data2 = scaler.transform(temp_data2); // df2 = dfd.toJSON(df2, {format: 'row'})

        var res = temp_data2.length ? umap.transform(temp_data2) : null;
        res ? res.map(function (p, i) {
          d.data[i]['X'] = p[0];
          d.data[i]['Y'] = p[1];
        }) : null;
        datasets.push(d.data);
      });

      var finalData = (_ref = []).concat.apply(_ref, datasets); // Split by single data set
      // organizedData.map((d, i) => {
      //     const umap = new UMAP({
      //         nNeighbors: knn,
      //     });
      //     let temp_data = []
      //     for (let data of d.data) {
      //         let temp_properties = []
      //         for (let p of properties) {
      //             temp_properties.push(data[p])
      //         }
      //         data.name = d.name;
      //         data.color = d.color;
      //         temp_data.push(temp_properties)
      //     }
      //     console.log("temp")
      //     console.log(temp_data)
      //     let res = umap.fit(temp_data)
      //     res.map((p, i) => {
      //         d.data[i]['X'] = p[0]
      //         d.data[i]['Y'] = p[1]
      //     })
      //     datasets.push(d.data);
      // });
      //
      // let finalData = [].concat(...datasets);
      //
      // console.log(`final data`, finalData)
      //remove elements to avoid repeated append


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
      }

      var zoom = d3.zoom().scaleExtent([0.1, 20]) // This control how much you can unzoom (x1) and zoom (x20)
      .extent([[0, 0], [WIDTH, HEIGHT]]).on("zoom", function (event) {
        // recover the new scale
        var newXScale = event.transform.rescaleX(this.xScale);
        var newYScale = event.transform.rescaleY(this.yScale); //
        // // update axes with these new boundaries
        // let xAxisCall = d3
        //     .axisBottom(newXScale)
        //     .tickFormat((x) => `${expo(x, 2)}`);
        // let yAxisCall = d3
        //     .axisLeft(newYScale)
        //     .tickFormat((y) => `${expo(y, 2)}`);
        // this.xAxisGroup.transition().duration(500).call(xAxisCall);
        // this.yAxisGroup.transition().duration(500).call(yAxisCall);

        d3.selectAll(".dataCircle").data(finalData).attr("cy", function (d) {
          return newYScale(d[query2]);
        }).attr("cx", function (d) {
          return newXScale(d[query1]);
        }); // zoomedXScale = newXScale;
        // zoomedYScale = newYScale;
        // this.zoomedXScale = newXScale;
        // this.zoomedYScale = newYScale;
      }.bind(this)); // Add a clipPath: everything out of this area won't be drawn.

      this.svg.append("defs").append("SVG:clipPath").attr("id", "clip").append("SVG:rect").attr("width", WIDTH).attr("height", HEIGHT).attr("x", 0).attr("y", 0);
      var xAxisCall = d3.axisBottom(this.xScale).tickFormat("");
      this.xAxisGroup.transition().duration(500).call(xAxisCall);
      var yAxisCall = d3.axisLeft(this.yScale).tickFormat("");
      this.yAxisGroup.transition().duration(500).call(yAxisCall); // this.xLabel.text(this.query1);
      // this.yLabel.text(this.query2);

      var tooltip = d3.select(element).append("div").attr("class", "tooltip").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px").style("visibility", "hidden"); // let mouseover = function (e, d) {
      //     d3.select(this)
      //         .attr("r", circleFocusSize)
      //         .style("stroke", "black")
      //         .style("stroke-width", 2)
      //         .style("fill-opacity", 1);
      //     setDataPoint(d);
      //     tooltip.style("visibility", "visible").transition().duration(200);
      // };
      //
      // let mousemove = function (e, d) {
      //     tooltip
      //         .html(
      //             `${query1}: ` +
      //             d[query1] +
      //             `<br>${query2}: ` +
      //             d[query2]
      //         )
      //         .style("top", e.pageY + 10 + "px")
      //         .style("left", e.pageX + 10 + "px");
      // };

      var mouseleave = function mouseleave(e, d) {
        tooltip.style("visibility", "hidden").transition().duration(200);
        d3.select(this).attr("r", circleOriginalSize).style("stroke", "none").style("stroke-width", 2).style("fill-opacity", 0.8);
      };

      var mousedown = function mousedown(e, d) {
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
      };

      var zoomedXScale = this.xScale;
      var zoomedYScale = this.yScale;

      if (view === "zoom") {
        this.svg.append("rect").attr("class", "rectZoom").attr("width", WIDTH).attr("height", HEIGHT).call(zoom);
      }

      var circles = this.svg.append("g").attr("clip-path", "url(#clip)").attr("class", "clipPath").selectAll(".dataCircle").data(finalData);
      circles.exit().transition().attr("r", 0).remove();
      circles.enter().append("circle").join(circles).attr("r", circleOriginalSize).attr("class", "dataCircle").attr("fill", function (d) {
        return d.color;
      }).classed("selected", function (d) {
        return selectedData.includes(d);
      }).style("stroke", "none").style("stroke-width", 2).style("fill-opacity", 0.8).on("mousedown", mousedown) // .on("mouseover", mouseover)
      // .on("mousemove", mousemove)
      .on("mouseleave", mouseleave).attr("cx", function (d) {
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

  return Umap;
}();

var _default = Umap;
exports["default"] = _default;