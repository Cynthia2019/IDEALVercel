"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var organizeByName = function organizeByName(data) {
  var dataset_names = _toConsumableArray(new Set(data.map(function (d) {
    return d.name;
  })));

  var datasets = [];
  dataset_names.map(function (name, i) {
    datasets.push({
      name: name,
      color: data.filter(function (d) {
        return d.name === name;
      })[0].color,
      data: data.filter(function (d) {
        return d.name === name;
      })
    });
  });
  return datasets;
};

var _default = organizeByName;
exports["default"] = _default;