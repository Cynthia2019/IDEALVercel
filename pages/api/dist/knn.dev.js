"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = handler;

function handler(req) {
  var env, url, body, response, jsonData;
  return regeneratorRuntime.async(function handler$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          env = process.env.NODE_ENV; //   let url= 'http://localhost:8000/model?data='

          url = 'https://metamaterials-srv.northwestern.edu/model?data=';

          if (env == 'production') {
            url = 'https://metamaterials-srv.northwestern.edu/model?data=';
          }

          body = req.body;
          _context.next = 6;
          return regeneratorRuntime.awrap(fetch("".concat(url).concat(body)));

        case 6:
          response = _context.sent;
          _context.next = 9;
          return regeneratorRuntime.awrap(response.json());

        case 9:
          jsonData = _context.sent;
          return _context.abrupt("return", jsonData);

        case 11:
        case "end":
          return _context.stop();
      }
    }
  });
}