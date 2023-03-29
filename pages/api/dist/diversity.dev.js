"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDiversity = getDiversity;

function getDiversity(body) {
  var env, url, response, jsonData;
  return regeneratorRuntime.async(function getDiversity$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          env = process.env.NODE_ENV;
          url = 'http://localhost:8000/diversity/';

          if (env == 'production') {//        url = 'https://ideal-server-espy0exsw-cynthia2019.vercel.app/diversity/'
          }

          _context.next = 5;
          return regeneratorRuntime.awrap(fetch("".concat(url), {
            body: body,
            method: "POST"
          }));

        case 5:
          response = _context.sent;
          _context.next = 8;
          return regeneratorRuntime.awrap(response.json());

        case 8:
          jsonData = _context.sent;
          return _context.abrupt("return", jsonData);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  });
}