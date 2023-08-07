"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateUmap = void 0;

var _standardScaler = require("@/components/shared/standardScaler");

var _umapJs = require("umap-js");

var _organizeByName = _interopRequireDefault(require("./organizeByName"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var calculateUmap = function calculateUmap(data, knn) {
  var _ref;

  var scaler = new _standardScaler.StandardScaler();
  var properties = ["C11", "C12", "C22", "C16", "C26", "C66"];
  var datasets = [];
  var umap = new _umapJs.UMAP({
    nNeighbors: knn ? knn : 15
  });
  var organizedData = (0, _organizeByName["default"])(data);
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

    temp_data2 = scaler.transform(temp_data2);
    var res = temp_data2.length ? umap.transform(temp_data2) : null;
    res ? res.map(function (p, i) {
      d.data[i]["X"] = p[0];
      d.data[i]["Y"] = p[1];
    }) : null;
    datasets.push(d.data);
  });
  return (_ref = []).concat.apply(_ref, datasets);
};

exports.calculateUmap = calculateUmap;