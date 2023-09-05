"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDesignTokens = void 0;

var _colors = require("@mui/material/colors");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Create a theme instance.
var getDesignTokens = function getDesignTokens(mode) {
  return {
    palette: _objectSpread({
      mode: mode
    }, mode === 'light' ? {
      // palette values for light mode
      primary: {
        main: "#F4ECF7"
      },
      divider: "#4E2A84",
      background: {
        "default": "#fff",
        paper: "#fff"
      },
      text: {
        primary: '#000',
        secondary: _colors.grey[800]
      },
      warning: {
        main: _colors.red[500]
      }
    } : {
      // palette values for dark mode
      primary: {
        main: "#F4ECF7"
      },
      divider: "#4E2A84",
      background: {
        "default": "#fff",
        paper: "#4E2A84"
      },
      text: {
        primary: "#4E2A84",
        secondary: "#fff"
      },
      warning: {
        main: _colors.red[500]
      }
    })
  };
};

exports.getDesignTokens = getDesignTokens;