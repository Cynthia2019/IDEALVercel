"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _header = _interopRequireDefault(require("../components/shared/header"));

var _organizeByName = _interopRequireDefault(require("../util/organizeByName"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var padding = 10; // separation between adjacent cells, in pixels

var marginTop = 0; // top margin, in pixels

var marginRight = 0; // right margin, in pixels

var marginBottom = 0; // bottom margin, in pixels

var marginLeft = 0; // left margin, in pixels

var width = 968; // outer width, in pixels

var Hist =
/*#__PURE__*/
function () {
  function Hist(data, container, legendContainer) {
    _classCallCheck(this, Hist);

    this.container = container;
    this.render(data, {
      columns: ["C11", "C12", "C22", "C16", "C26", "C66"],
      // z: d => d.species
      colors: data.color
    }, container);
  }

  _createClass(Hist, [{
    key: "render",
    value: function render(data) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$columns = _ref.columns,
          columns = _ref$columns === void 0 ? data.columns : _ref$columns,
          _ref$x = _ref.x,
          x = _ref$x === void 0 ? columns : _ref$x,
          _ref$y = _ref.y,
          y = _ref$y === void 0 ? columns : _ref$y,
          _ref$z = _ref.z,
          z = _ref$z === void 0 ? function () {
        return 1;
      } : _ref$z,
          _ref$height = _ref.height,
          height = _ref$height === void 0 ? width : _ref$height,
          _ref$xType = _ref.xType,
          xType = _ref$xType === void 0 ? d3.scaleLinear : _ref$xType,
          _ref$yType = _ref.yType,
          yType = _ref$yType === void 0 ? d3.scaleLinear : _ref$yType,
          zDomain = _ref.zDomain,
          _ref$fillOpacity = _ref.fillOpacity,
          fillOpacity = _ref$fillOpacity === void 0 ? 0.7 : _ref$fillOpacity,
          _ref$colors = _ref.colors,
          colors = _ref$colors === void 0 ? d3.schemeCategory10 : _ref$colors;

      var container = arguments.length > 2 ? arguments[2] : undefined;
      var X = d3.map(x, function (x) {
        return d3.map(data, typeof x === "function" ? x : function (d) {
          return +d[x];
        });
      });
      var Y = d3.map(y, function (y) {
        return d3.map(data, typeof y === "function" ? y : function (d) {
          return +d[y];
        });
      });
      var Z = d3.map(data, z); // Compute default z-domain, and unique the z-domain.

      if (zDomain === undefined) zDomain = Z;
      zDomain = new d3.InternSet(zDomain); // Omit any data not present in the z-domain.

      var I = d3.range(Z.length).filter(function (i) {
        return zDomain.has(Z[i]);
      }); // Compute the inner dimensions of the cells.

      var cellWidth = (width - marginLeft - marginRight - (X.length - 1) * padding) / X.length;
      var cellHeight = (height - marginTop - marginBottom - (Y.length - 1) * padding) / Y.length; // Construct scales and axes.

      var xScales = X.map(function (X) {
        return xType(d3.extent(X), [0, cellWidth]);
      });
      var yScales = Y.map(function (Y) {
        return yType(d3.extent(Y), [cellHeight, 0]);
      });
      var zScale = d3.scaleOrdinal(zDomain, colors);
      this.svg = d3.select(container.current).append('svg').attr("width", width).attr("height", height).attr("viewBox", [padding * 2, padding * 5, width, height + padding * 13]).attr("style", "max-width: 100%; height: auto; height: intrinsic;");
      this.cell = this.svg.append("g").selectAll("g").data(d3.cross(d3.range(X.length), d3.range(Y.length))).join("g").attr("fill-opacity", fillOpacity).attr("transform", "translate(".concat(cellWidth + padding, ",").concat(cellHeight - 2 * marginBottom, ")"));
    }
  }, {
    key: "update",
    value: function update(data) {
      var _ref3;

      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          columns = _ref2.columns,
          _ref2$x = _ref2.x,
          x = _ref2$x === void 0 ? columns : _ref2$x,
          _ref2$y = _ref2.y,
          y = _ref2$y === void 0 ? columns : _ref2$y,
          _ref2$z = _ref2.z,
          z = _ref2$z === void 0 ? function () {
        return 1;
      } : _ref2$z,
          _ref2$height = _ref2.height,
          height = _ref2$height === void 0 ? width : _ref2$height,
          _ref2$xType = _ref2.xType,
          xType = _ref2$xType === void 0 ? d3.scaleLinear : _ref2$xType,
          _ref2$yType = _ref2.yType,
          yType = _ref2$yType === void 0 ? d3.scaleLinear : _ref2$yType,
          zDomain = _ref2.zDomain,
          _ref2$fillOpacity = _ref2.fillOpacity,
          fillOpacity = _ref2$fillOpacity === void 0 ? 0.7 : _ref2$fillOpacity,
          _ref2$colors = _ref2.colors,
          colors = _ref2$colors === void 0 ? {} : _ref2$colors;

      var container = arguments.length > 2 ? arguments[2] : undefined;
      var legendContainer = arguments.length > 3 ? arguments[3] : undefined;
      var setDataPoint = arguments.length > 4 ? arguments[4] : undefined;
      var query1 = arguments.length > 5 ? arguments[5] : undefined;
      var max_num_datasets = arguments.length > 6 ? arguments[6] : undefined;
      var setTooltip = arguments.length > 7 ? arguments[7] : undefined;
      var toggled = arguments.length > 8 ? arguments[8] : undefined;

      function expo(x, f) {
        if (x < 1000 && x > -1000) return x;

        if (!toggled) {
          return x / 1e6 + "e+6";
        } else {
          return x / 1e9 + "e+9";
        } // return Number(x).toExponential(f);

      }

      var index = columns.indexOf(query1);
      var datasets = [];
      var dataset_dic = {};
      var tooltip = [];

      for (var i = 0; i < max_num_datasets; i++) {
        datasets.push([]);
      }

      var organizedData = (0, _organizeByName["default"])(data);
      organizedData.map(function (d, i) {
        colors[d.name] = d.color;
        datasets[i] = d.data ? d.data : [];
        dataset_dic[i] = d.name;
      });

      var finalData = (_ref3 = []).concat.apply(_ref3, datasets); //clean up before updating visuals


      d3.selectAll(".xAxisGroup").remove();
      d3.selectAll(".yAxisGroup").remove();
      d3.selectAll(".x-label").remove();
      d3.selectAll(".tooltip_hist").remove();

      for (var _i = 0; _i < max_num_datasets; _i++) {
        d3.selectAll(".group" + _i).remove();
        d3.selectAll(".mean-line" + _i).remove();
      }

      var mouseleave_rec = function mouseleave_rec(e, d) {
        // tooltip_hist.style("visibility", "hidden").transition().duration(200);
        d3.select(this).style("stroke", "grey").style("stroke-width", 0).style("fill-opacity", 0.8);
      };

      var mouseover_hist = function mouseover_hist(e, d) {
        // console.log(e)
        // console.log(d)
        // index = d3.select(this).attr("class")[5]
        d3.select(this).raise().style("stroke", "black").style("stroke-width", 5).style("fill-opacity", 1); // d3.selectAll('.mean-line' + index)
        //     .raise()
        //     .style("stroke-width", 10)
        //     .style("fill-opacity", 1)
        //     .style("stroke-dasharray", ("0, 0"))
      }; // Compute values (and promote column names to accessors).


      var X = d3.map(x, function (x) {
        return d3.map(finalData, typeof x === "function" ? x : function (d) {
          return +d[x];
        });
      });
      var Y = d3.map(y, function (y) {
        return d3.map(finalData, typeof y === "function" ? y : function (d) {
          return +d[y];
        });
      });
      var Z = d3.map(finalData, z); // Compute default z-domain, and unique the z-domain.

      if (zDomain === undefined) zDomain = Z;
      zDomain = new d3.InternSet(zDomain); // Omit any data not present in the z-domain.

      var I = d3.range(Z.length).filter(function (i) {
        return zDomain.has(Z[i]);
      }); // Compute the inner dimensions of the cells.

      var cellWidth = width - marginRight - (X.length - 1) * padding;
      var cellHeight = height - marginTop - marginBottom - (Y.length - 1) * padding; // Construct scales and axes.

      var xScales = X.map(function (X) {
        return xType(d3.extent(X), [0, cellWidth]);
      });
      var yScales = Y.map(function (Y) {
        return yType(d3.extent(Y), [cellHeight, 0]);
      });
      var zScale = d3.scaleOrdinal(zDomain, colors);
      var all_bins = [];
      this.cell.each(function (_ref4) {
        var _this = this;

        var _ref5 = _slicedToArray(_ref4, 2),
            x = _ref5[0],
            y = _ref5[1];

        if (x == index && y == index) {
          d3.select(this).append("g").attr("class", "x-label").attr("font-size", 20).attr("font-family", "sans-serif").attr("font-weight", "bold").selectAll("text").data([columns[index]]).join("text").attr("transform", function (d, i) {
            return "translate(".concat(width / 3, ",").concat(width + padding * 2, ")");
          }).attr("x", padding / 2).attr("y", padding / 2).text(function (d) {
            return d;
          });
          d3.select(this).append("g").attr("class", "y-label").attr("font-size", 20).attr("font-family", "sans-serif").attr("font-weight", "bold").selectAll("text").data(["Frequency"]).join("text").attr("transform", "translate(".concat(-width / 10 - padding * 6, ",").concat(cellHeight / 2 + padding, ") rotate(270)")).attr("x", padding / 2).attr("y", padding / 2).text(function (d) {
            return d;
          });

          var _loop = function _loop(_i2) {
            var a = columns;
            var b = columns;
            var X0 = d3.map(a, function (a) {
              return d3.map(datasets[_i2], typeof a === "function" ? a : function (d) {
                return +d[a];
              });
            });
            var Y0 = d3.map(b, function (b) {
              return d3.map(datasets[_i2], typeof b === "function" ? b : function (d) {
                return +d[b];
              });
            });
            var Z = d3.map(datasets[_i2], z); // Omit any data not present in the z-domain.

            var I0 = d3.range(Z.length).filter(function (i) {
              return zDomain.has(Z[i]);
            });
            var thresholds = 40;
            Y0 = d3.map(Y0[index], function () {
              return 1;
            });
            var bins = d3.bin().thresholds(thresholds).value(function (i) {
              return X0[index][i];
            })(I0);
            all_bins.push.apply(all_bins, _toConsumableArray(bins));
            var temp_tooltip = {};

            if (organizedData[_i2]) {
              var temp_arr = finalData.map(function (d, i) {
                return d[query1];
              }); // temp_tooltip["max"] = d3.max(temp_arr)
              // temp_tooltip["min"] = d3.min(temp_arr)

              temp_tooltip["name"] = organizedData[_i2].name;
              temp_tooltip["color"] = organizedData[_i2].color;
              temp_tooltip["min"] = d3.min(temp_arr);
              temp_tooltip["max"] = d3.max(temp_arr);
              temp_tooltip["mean"] = d3.mean(temp_arr);
              temp_tooltip["median"] = d3.median(temp_arr);
              tooltip.push(temp_tooltip);
            } // console.log("bins")
            // console.log(data[i] ? data[i].data.map((d, i) => d[query1]) : null)
            // console.log(temp_tooltip)


            var Y1 = Array.from(bins, function (I0) {
              return d3.sum(I0, function (i) {
                return Y0[i];
              });
            }); // Compute default domains.

            var xDomain = [bins[0].x0, bins[bins.length - 1].x1];
            var yDomain = [0, d3.max(Y1)]; // Construct scales and axes.

            var xRange = [0, cellWidth];
            var yRange = [cellHeight, 0];
            var xScale = xType(xDomain, xRange);
            var yScale = yType(yDomain, yRange);
            var insetLeft = 0.5;
            var insetRight = 0.5; //when two dataset are selected, shows one color, but shows none when 1 or none are selected

            if (datasets[_i2].length == 0) {
              d3.selectAll(".group" + _i2).remove();
            } else {
              var histogram = d3.select(_this).append("g").attr("class", "group" + _i2);
              histogram.selectAll("rect").data(bins).join("rect").attr("fill", colors[dataset_dic[_i2]]).attr("x", function (d) {
                return xScale(d.x0) + insetLeft;
              }).attr("width", function (d) {
                return bins.length == 1 ? 5 : Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetRight);
              }).attr("y", function (d, i) {
                return yScale(Y1[i]);
              }).attr("height", function (d, i) {
                return yScale(0) - yScale(Y1[i]);
              }) // .on("mouseleave", mouseleave_rec)
              // .on("mousemove", mousemove_hist)
              .attr("transform", "translate(".concat(-width / 10, ", ", 0, ")"));
              d3.selectAll(".group" + _i2).on("mouseover", mouseover_hist).on("mouseleave", mouseleave_rec);
              histogram.exit().remove();
            }
          };

          for (var _i2 = 0; _i2 < max_num_datasets; _i2++) {
            _loop(_i2);
          }
        }
      }); //draw axis

      var max_bin_len = d3.max(all_bins, function (b) {
        return b.length;
      });
      var hist_yScales = d3.scaleLinear().domain([0, max_bin_len]).range([cellHeight, 0]);
      var xAxis = d3.axisBottom().tickFormat(function (x) {
        return "".concat(expo(x, 0));
      }).ticks(3);
      var yAxis = d3.axisLeft().ticks(3);
      var yAxis_line = this.svg.append("g").selectAll("g").data([hist_yScales]).join("g").attr("transform", "translate(".concat(padding * 6 + 5, ",").concat(padding * 16 - 5, ")")).attr("class", "yAxisGroup").call(yAxis.scale(hist_yScales));
      yAxis_line.selectAll("text").attr("font-size", 20).attr("font-family", "sans-serif");
      var xAxis_line = this.svg.append("g").selectAll(".xAxisGroup").data(xScales).join("g").attr("transform", "translate(".concat(width / 15, ", ").concat(width + padding * 10 + 5, ")")).attr("class", "xAxisGroup").call(xAxis.scale(xScales[index]));
      xAxis_line.selectAll("text").attr("font-size", 18).attr("font-family", "sans-serif").attr("text-anchor", "middle"); // console.log('final_tool_tip')
      // console.log(tooltip)

      setTooltip(tooltip);
      var transitionDuration = 200;
      var exitTransition = d3.transition().duration(transitionDuration);
      var updateTransition = exitTransition.transition().duration(transitionDuration);
      tooltip.map(function (d, i) {
        var mean = tooltip[i].mean; // console.log('mean-line')
        // console.log(dataset_dic[i])
        // console.log(mean)
        // console.log(xScales[index](mean))

        d3.select('svg').append('g').append('line').attr('class', 'mean-line' + i).raise().transition(updateTransition).attr("x1", xScales[index](mean) + width / 15).attr("y1", width + padding * 10 + 5).attr("x2", xScales[index](mean) + width / 15).attr("y2", padding * 16 - 5).attr("stroke", colors[dataset_dic[i]]).attr("stroke-width", 6).attr("fill", "None").style("stroke-dasharray", "5, 5");
      });
      var tooltipContent = tooltip.map(function (d, i) {
        return "<b>Dataset: </b>" + d.name + "<br>" + "<b>Range: </b>" + expo(d.min, 0) + " to " + expo(d.max, 0) + "<br>" + "<b>Mean: </b>" + expo(d.mean, 0) + "<br>" + "<b>Median: </b>" + expo(d.median, 0) + "<br>";
      }); // let legend = d3.select('svg')
      //     .append('g')
      //     .append("line");
      //
      //
      //
      // legend//making a line for legend
      //     .raise()
      //     .attr("x1", width - 28)
      //     .attr("x2", width)
      //     .attr("y1", 10)
      //     .attr("y2", 10)
      //     .style("stroke-dasharray","5,5")//dashed array for line
      //     .style("stroke", "black");
      //
      // legend.append("text")
      //     .attr("x", width - 44)
      //     .attr("y", 9)
      //     .attr("dy", ".35em")
      //     .style("text-anchor", "end")
      //     .text("Mean");

      var tooltip_hist = d3.select(container.current).append("div").style("overflow-y", "auto").style("width", '280px').style("height", '200px').attr("class", "tooltip_hist").style("position", "fixed").style("background-color", "white").style("border", "solid").style("stroke", "white").style("box-shadow", "5px 5px 5px 0px rgba(0,0,0,0.3)").style("border-width", "2px").style("border-radius", "5px").style("padding", "10px").style("visibility", "visible").html(tooltipContent.join("<br>")).style("top", 60 + "px").style("left", 500 + "px");
    }
  }]);

  return Hist;
}();

var _default = Hist;
exports["default"] = _default;