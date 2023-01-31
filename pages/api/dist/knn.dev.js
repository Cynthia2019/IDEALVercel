"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getKnn = getKnn;

function getKnn(req) {
  var response, jsonData;
  return regeneratorRuntime.async(function getKnn$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(req);
          _context.next = 3;
          return regeneratorRuntime.awrap(fetch("http://localhost:8000/model?data=".concat(req)));

        case 3:
          response = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(response.json());

        case 6:
          jsonData = _context.sent;
          return _context.abrupt("return", jsonData);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
}