"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StandardScaler = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var StandardScaler =
/*#__PURE__*/
function () {
  function StandardScaler() {
    _classCallCheck(this, StandardScaler);

    this.means = [0, 0, 0, 0, 0, 0];
    this.stds = [0, 0, 0, 0, 0, 0];
  }

  _createClass(StandardScaler, [{
    key: "fit",
    value: function fit(data) {
      var _this = this;

      var nFeatures = data[0].length;

      var _loop = function _loop(i) {
        var featureData = data.map(function (row) {
          return row[i];
        });
        var mean = featureData.reduce(function (acc, val) {
          return acc + val;
        }, 0) / featureData.length;
        var std = Math.sqrt(featureData.reduce(function (acc, val) {
          return acc + Math.pow(val - mean, 2);
        }, 0) / featureData.length);
        _this.means[i] = mean;
        _this.stds[i] = std;
      };

      for (var i = 0; i < nFeatures; i++) {
        _loop(i);
      }
    }
  }, {
    key: "transform",
    value: function transform(data) {
      var _this2 = this;

      var nFeatures = data[0].length;
      var scaledData = data.map(function (row) {
        var scaledRow = [];

        for (var i = 0; i < nFeatures; i++) {
          scaledRow.push(_this2.stds[i] == 0 ? 0 : (row[i] - _this2.means[i]) / _this2.stds[i]);
        }

        return scaledRow;
      });
      return scaledData;
    }
  }, {
    key: "fit_transform",
    value: function fit_transform(data) {
      this.fit(data);
      return this.transform(data);
    }
  }]);

  return StandardScaler;
}();

exports.StandardScaler = StandardScaler;