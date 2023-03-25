"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var d3 = _interopRequireWildcard(require("d3"));

var _organizeByName = _interopRequireDefault(require("@/util/organizeByName"));

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

var padding = 20; // separation between adjacent cells, in pixels

var marginTop = 10; // top margin, in pixels

var marginRight = 20; // right margin, in pixels

var marginBottom = 50; // bottom margin, in pixels

var marginLeft = 100; // left margin, in pixels

var width = 968; // outer width, in pixels

function expo(x, f) {
  if (x < 1000 && x > -1000) return x;
  return Number(x).toExponential(f);
}

var Pairwise =
/*#__PURE__*/
function () {
  // Copyright 2021 Observable, Inc.
  // Released under the ISC license.
  // https://observablehq.com/@d3/splom
  function Pairwise(data, container, legendContainer) {
    _classCallCheck(this, Pairwise);

    this.container = container; // Compute values (and promote column names to accessors)

    this.legend = d3.select(legendContainer).append("svg").attr("width", 120).append("g").attr("class", "pairwise-plot-legend");
    this.render(data, {
      columns: ["C11", "C12", "C22", "C16", "C26", "C66"],
      // z: d => d.species
      colors: data.color
    }, container);
  }

  _createClass(Pairwise, [{
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
      // let datasets = [];
      //
      // data.map((d, i) => {
      //     for (let data of d.data) {
      //         data.name = d.name;
      //         data.color = d.color;
      //     }
      //     datasets.push(d.data);
      // });
      //
      // let finalData = [].concat(...datasets);
      // Compute values (and promote column names to accessors).
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
      this.svg = d3.select(container.current).append('svg').attr("width", width).attr("height", height).attr("viewBox", [-marginLeft, -marginTop, width, height]).attr("style", "max-width: 100%; height: auto; height: intrinsic;");
      this.cell = this.svg.append("g").selectAll("g").data(d3.cross(d3.range(X.length), d3.range(Y.length))).join("g").attr("fill-opacity", fillOpacity).attr("transform", function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
            i = _ref3[0],
            j = _ref3[1];

        return "translate(".concat(i * (cellWidth + padding), ",").concat(j * (cellHeight + padding), ")");
      }); //add rect box frames

      this.cell.append("rect").attr("fill", "white").attr("stroke", "grey").attr("stroke-width", 2).attr("width", cellWidth).attr("height", cellHeight).attr("class", "cell");
      if (x === y) this.svg.append("g").attr("font-size", 14).attr("font-family", "sans-serif").attr("font-weight", "bold").selectAll("text").data(x).join("text").attr("transform", function (d, i) {
        return "translate(".concat(0 - marginLeft + padding * 1.5, ",").concat(i * (cellHeight + padding) + marginTop * 9, ") rotate(270)");
      }).attr("x", padding / 2).attr("y", padding / 2).attr("dy", ".71em").text(function (d) {
        return d;
      });
      if (x === y) this.svg.append("g").attr("font-size", 14).attr("font-family", "sans-serif").attr("font-weight", "bold").selectAll("text").data(y).join("text").attr("transform", function (d, i) {
        return "translate(".concat(i * (cellWidth + padding) + marginBottom - padding / 2, ",").concat(cellHeight * 6 + marginBottom + padding * 4, ")");
      }).attr("x", padding / 2).attr("y", padding / 2).text(function (d) {
        return d;
      });
    }
  }, {
    key: "renderAxis",
    value: function renderAxis(data) {
      var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref4$columns = _ref4.columns,
          columns = _ref4$columns === void 0 ? data.columns : _ref4$columns,
          _ref4$x = _ref4.x,
          x = _ref4$x === void 0 ? columns : _ref4$x,
          _ref4$y = _ref4.y,
          y = _ref4$y === void 0 ? columns : _ref4$y,
          _ref4$z = _ref4.z,
          z = _ref4$z === void 0 ? function () {
        return 1;
      } : _ref4$z,
          _ref4$height = _ref4.height,
          height = _ref4$height === void 0 ? width : _ref4$height,
          _ref4$xType = _ref4.xType,
          xType = _ref4$xType === void 0 ? d3.scaleLinear : _ref4$xType,
          _ref4$yType = _ref4.yType,
          yType = _ref4$yType === void 0 ? d3.scaleLinear : _ref4$yType,
          zDomain = _ref4.zDomain,
          _ref4$fillOpacity = _ref4.fillOpacity,
          fillOpacity = _ref4$fillOpacity === void 0 ? 0.7 : _ref4$fillOpacity,
          _ref4$colors = _ref4.colors,
          colors = _ref4$colors === void 0 ? d3.schemeCategory10 : _ref4$colors;

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
      var xAxis = d3.axisBottom().tickFormat(function (x) {
        return "".concat(expo(x, 0));
      }).ticks(3);
      var yAxis = d3.axisLeft().tickFormat(function (x) {
        return "".concat(expo(x, 0));
      }).ticks(3);
      this.svg.append("g").selectAll("g").data(yScales).join("g").attr("transform", function (d, i) {
        return "translate(0,".concat(i * (cellHeight + padding), ")");
      }).attr("class", "yAxisGroup").each(function (yScale) {
        d3.select(this).call(yAxis.scale(yScale));
      });
      this.svg.append("g").selectAll(".xAxisGroup").data(xScales).join("g").attr("transform", function (d, i) {
        return "translate(".concat(i * (cellWidth + padding), ", ").concat(height - marginBottom - marginTop, ")");
      }).attr("class", "xAxisGroup").each(function (xScale, columns) {
        d3.select(this).call(xAxis.scale(xScale));
      });
    }
  }, {
    key: "update",
    value: function update(data) {
      var _ref6;

      var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref5$columns = _ref5.columns,
          columns = _ref5$columns === void 0 ? data.columns : _ref5$columns,
          _ref5$x = _ref5.x,
          x = _ref5$x === void 0 ? columns : _ref5$x,
          _ref5$y = _ref5.y,
          y = _ref5$y === void 0 ? columns : _ref5$y,
          _ref5$z = _ref5.z,
          z = _ref5$z === void 0 ? function () {
        return 1;
      } : _ref5$z,
          _ref5$height = _ref5.height,
          height = _ref5$height === void 0 ? width : _ref5$height,
          _ref5$xType = _ref5.xType,
          xType = _ref5$xType === void 0 ? d3.scaleLinear : _ref5$xType,
          _ref5$yType = _ref5.yType,
          yType = _ref5$yType === void 0 ? d3.scaleLinear : _ref5$yType,
          zDomain = _ref5.zDomain,
          _ref5$fillOpacity = _ref5.fillOpacity,
          fillOpacity = _ref5$fillOpacity === void 0 ? 0.7 : _ref5$fillOpacity,
          _ref5$colors = _ref5.colors,
          colors = _ref5$colors === void 0 ? {} : _ref5$colors;

      var container = arguments.length > 2 ? arguments[2] : undefined;
      var legendContainer = arguments.length > 3 ? arguments[3] : undefined;
      var setDataPoint = arguments.length > 4 ? arguments[4] : undefined;
      var router = arguments.length > 5 ? arguments[5] : undefined;
      var max_num_datasets = arguments.length > 6 ? arguments[6] : undefined;
      console.log("updating...");
      var circleFocusSize = 7;
      var circleSize = 3.5;
      var legendCircleSize = 5.0;
      var legendSpacing = 4;
      var datasets = [];
      var dataset_dic = {};

      for (var i = 0; i < max_num_datasets; i++) {
        datasets.push([]);
      }

      var organizedData = (0, _organizeByName["default"])(data);
      organizedData.map(function (d, i) {
        colors[d.name] = d.color;
        datasets[i] = d.data ? d.data : [];
        dataset_dic[i] = d.name;
      });

      var finalData = (_ref6 = []).concat.apply(_ref6, datasets); //clean up before updating visuals


      d3.selectAll(".xAxisGroup").remove();
      d3.selectAll(".yAxisGroup").remove();
      d3.selectAll(".legend").remove();
      d3.selectAll("circle").remove();
      d3.selectAll(".tooltip_circ").remove();

      for (var _i2 = 0; _i2 < max_num_datasets; _i2++) {
        d3.selectAll(".group" + _i2).remove();
      }

      this.renderAxis(finalData, {
        columns: ["C11", "C12", "C22", "C16", "C26", "C66"],
        // z: d => d.species
        colors: data.color
      }, container);
      var tooltip_hist = d3.select(container.current).append("div").attr("class", "tooltip_hist").style("position", "fixed").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px").style("visibility", "hidden");
      var tooltip_circ = d3.select(container.current).append("div").attr("class", "tooltip_circ").style("position", "fixed").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px").style("visibility", "hidden");

      var mouseover_circ = function mouseover_circ(e, d) {
        d3.select(this).attr("r", circleFocusSize).style("stroke", "black").style("stroke-width", 2).style("fill-opacity", 1);
        setDataPoint(finalData[d]);
        tooltip_circ.style("visibility", "visible").transition().duration(200);
      };

      var mouseleave_circ = function mouseleave_circ(e, d) {
        tooltip_circ.style("visibility", "hidden").transition().duration(200);
        d3.select(this).attr("r", circleSize).style("stroke", "none").style("stroke-width", 2).style("fill-opacity", 0.8);
      };

      var mouseleave_rec = function mouseleave_rec(e, d) {
        tooltip_hist.style("visibility", "hidden").transition().duration(200);
        d3.select(this).style("fill", "white").style("stroke", "grey").style("stroke-width", 2).style("fill-opacity", 0.8);
      };

      var mouseover_hist = function mouseover_hist(e, d) {
        console.log("hist");
        d3.select(this).style("stroke", "black").style("stroke-width", 5).style("fill-opacity", 1);
        tooltip_hist.style("visibility", "visible").transition().duration(200);
      };

      var mouseover_non_hist = function mouseover_non_hist(e, d) {
        console.log("non-hist"); // console.log(this)

        d3.select(this) // .style("fill", "#EAEAEA")
        .style("stroke", "black").style("stroke-width", 4).style("fill-opacity", 1);
      };

      var mousedown_non_hist = function mousedown_non_hist(e, d) {
        d3.select(container.current).remove();
        router.push({
          pathname: "/scatter",
          query: {
            pairwise_query1: x[d[0]],
            pairwise_query2: x[d[1]]
          }
        }); // window.open(
        //     '/scatter',
        //     '_self' // <- This is what makes it open in a new window.
        // );
      };

      var mousedown_hist = function mousedown_hist(e, d) {
        d3.select(container.current).remove();
        router.push({
          pathname: "/hist",
          query: {
            pairwise_query1: x[d[0]]
          }
        });
      };

      var mousemove_circ = function mousemove_circ(e, d) {
        tooltip_circ.html("Dataset: " + dataset_dic[Math.floor(d / datasets[0].length)] + "<br>symmetry: " + finalData[d]["symmetry"] // "<br>Material_0: " +
        // finalData[d].CM0 +
        // "<br>Material_1: "
        // d.CM1 +
        // `<br>${query1}: ` +
        // d[query1] +
        // `<br>${query2}: ` +
        // d[query2]
        ).style("top", e.pageY - 85 + "px").style("left", e.pageX - 165 + "px");
      };

      var mousemove_hist = function mousemove_hist(e, d) {
        var column = columns[parseInt(d)];

        var temp_arr = _toConsumableArray(finalData.map(function (data) {
          return data[column];
        }));

        tooltip_hist.html("Column: " + column + "<br>Range: " + (d3.min(temp_arr) > 0 ? d3.min(temp_arr) : 0) + " to " + (d3.max(temp_arr) > 0 ? d3.max(temp_arr) : 0) + "<br>Mean: " + d3.mean(temp_arr) + "<br>Median: " + d3.median(temp_arr) // "<br>symmetry: " +
        // finalData[d]["symmetry"]
        // "<br>Material_0: " +
        // finalData[d].CM0 +
        // "<br>Material_1: "
        // d.CM1 +
        // `<br>${query1}: ` +
        // d[query1] +
        // `<br>${query2}: ` +
        // d[query2]
        ).style("top", e.pageY - 110 + "px").style("left", e.pageX + 10 + "px");
      };

      d3.select(legendContainer).selectAll(".legend").remove();
      var legend = this.legend.selectAll(".legend").data(data);
      legend.exit().remove();
      legend.enter().append("circle").attr("class", "legend").attr("r", legendCircleSize).attr("cx", 10).attr("cy", function (d, i) {
        return (legendCircleSize * 2 + legendSpacing * 2) * i + 30;
      }).style("fill", function (d) {
        return d.color;
      }); //Create legend labels

      legend.enter().append("text").attr("class", "legend").attr("x", 20).attr("y", function (d, i) {
        return (legendCircleSize * 2 + legendSpacing * 2) * i + 30;
      }).text(function (d) {
        return d.name;
      }).attr("text-anchor", "left").style("alignment-baseline", "middle");
      legend.exit().remove(); // Compute values (and promote column names to accessors).

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

      var cellWidth = (width - marginLeft - marginRight - (X.length - 1) * padding) / X.length;
      var cellHeight = (height - marginTop - marginBottom - (Y.length - 1) * padding) / Y.length; // Construct scales and axes.

      var xScales = X.map(function (X) {
        return xType(d3.extent(X), [0, cellWidth]);
      });
      var yScales = Y.map(function (Y) {
        return yType(d3.extent(Y), [cellHeight, 0]);
      });
      var zScale = d3.scaleOrdinal(zDomain, colors); //
      // d3.selectAll(".hist")
      //     .on("mouseover", mouseover_hist)
      //
      // d3.selectAll(".non-hist")
      //     .on("mouseover", mouseover_non_hist)

      this.cell.each(function (_ref7) {
        var _this = this;

        var _ref8 = _slicedToArray(_ref7, 2),
            x = _ref8[0],
            y = _ref8[1];

        if (x != y) {
          // console.log(this)
          d3.select(this).select(".cell").attr("class", "non_hist").on("mouseover", mouseover_non_hist).on("mousedown", mousedown_non_hist).on("mouseout", mouseleave_rec);
          d3.select(this).selectAll("circle") //.data(finalData)
          .data(I.filter(function (i) {
            return !isNaN(X[x][i]) && !isNaN(Y[y][i]);
          })).join("circle").attr("r", circleSize).attr("cx", function (i) {
            return xScales[x](X[x][i]);
          }).attr("cy", function (i) {
            return yScales[y](Y[y][i]);
          }).attr("fill", function (i) {
            return finalData[i].color;
          }).on("mouseover", mouseover_circ).on("mouseleave", mouseleave_circ).on("mousemove", mousemove_circ);
        } else {
          d3.select(this).selectAll(".cell").attr("class", "hist").on("mouseover", mouseover_hist).on("mouseleave", mouseleave_rec).on("mousemove", mousemove_hist).on("mousedown", mousedown_hist);

          var _loop = function _loop(_i3) {
            var a = columns;
            var b = columns;
            var X0 = d3.map(a, function (a) {
              return d3.map(datasets[_i3], typeof a === "function" ? a : function (d) {
                return +d[a];
              });
            });
            var Y0 = d3.map(b, function (b) {
              return d3.map(datasets[_i3], typeof b === "function" ? b : function (d) {
                return +d[b];
              });
            });
            var Z = d3.map(datasets[_i3], z); // Omit any data not present in the z-domain.

            var I0 = d3.range(Z.length).filter(function (i) {
              return zDomain.has(Z[i]);
            });
            var thresholds = 40;
            Y0 = d3.map(Y0[y], function () {
              return 1;
            });
            var bins = d3.bin().thresholds(thresholds).value(function (i) {
              return X0[x][i];
            })(I0);
            var Y1 = Array.from(bins, function (I0) {
              return d3.sum(I0, function (i) {
                return Y0[i];
              });
            });
            var normalize = true; // if (normalize) {
            //     const total = d3.sum(Y1);
            //     for (let i = 0; i < Y1.length; ++i) Y1[i] /= total;
            // }
            // Compute default domains.

            var xDomain = [bins[0].x0, bins[bins.length - 1].x1];
            var yDomain = [0, d3.max(Y1)]; // Construct scales and axes.

            var xRange = [0, cellWidth];
            var yRange = [cellHeight, 0];
            var xScale = xType(xDomain, xRange);
            var yScale = yType(yDomain, yRange);
            var insetLeft = 0.5;
            var insetRight = 0.5; //when two dataset are selected, shows one color, but shows none when 1 or none are selected

            if (datasets[_i3].length == 0) {
              d3.selectAll(".group" + _i3).remove();
            } else {
              var histogram = d3.select(_this).append("g").attr("class", "group" + _i3);
              histogram.selectAll("rect").data(bins).join("rect").attr("fill", colors[dataset_dic[_i3]]).attr("x", function (d) {
                return xScale(d.x0) + insetLeft;
              }).attr("width", function (d) {
                return bins.length == 1 ? 5 : Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetRight);
              }).attr("y", function (d, i) {
                return yScale(Y1[i]);
              }).attr("height", function (d, i) {
                return yScale(0) - yScale(Y1[i]);
              });
              histogram.exit().remove();
            }
          };

          for (var _i3 = 0; _i3 < max_num_datasets; _i3++) {
            _loop(_i3);
          }
        }
      });
    }
  }]);

  return Pairwise;
}();

var _default = Pairwise;
exports["default"] = _default;