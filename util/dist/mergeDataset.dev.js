"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.merge = void 0;

var merge = function merge(first, second) {
  for (var i = 0; i < second.length; i++) {
    for (var j = 0; j < second[i].data.length; j++) {
      first.push(second[i].data[j]);
    }
  }

  return first;
};

exports.merge = merge;