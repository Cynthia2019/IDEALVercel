"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchNames = fetchNames;

var _clientS = require("@aws-sdk/client-s3");

var _aws = _interopRequireDefault(require("@/pages/api/aws"));

var _constants = require("@/util/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function fetchNames() {
  var fetchedNames, listObjectCommand;
  return regeneratorRuntime.async(function fetchNames$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          fetchedNames = [];
          listObjectCommand = new _clientS.ListObjectsCommand({
            Bucket: 'ideal-dataset-1',
            cacheControl: "no-cache"
          });
          _context.next = 4;
          return regeneratorRuntime.awrap(_aws["default"].send(listObjectCommand).then(function (res) {
            var names = res.Contents.map(function (content) {
              return content.Key;
            });

            for (var i = 0; i < names.length; i++) {
              fetchedNames.push({
                bucket_name: 'ideal-dataset-1',
                name: names[i],
                color: _constants.colorAssignment[i]
              });
            }
          }));

        case 4:
          return _context.abrupt("return", {
            fetchedNames: fetchedNames
          });

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
}