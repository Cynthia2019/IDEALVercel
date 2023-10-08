"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.config = void 0;

var _aws = _interopRequireDefault(require("./aws"));

var _clientS = require("@aws-sdk/client-s3");

var _zlib = _interopRequireDefault(require("zlib"));

var _stream = require("stream");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var config = {
  api: {
    responseLimit: '20mb'
  }
};
exports.config = config;

var _callee = function _callee(req, res) {
  var command, s3Response;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          command = new _clientS.GetObjectCommand({
            // Bucket: info.bucket_name,
            Bucket: "ideal-dataset-1",
            Key: req.query.name
          });
          _context.next = 4;
          return regeneratorRuntime.awrap(_aws["default"].send(command));

        case 4:
          s3Response = _context.sent;
          res.status(200).send(s3Response); // if (s3Response.Body instanceof Readable) {
          //     const gunzip = zlib.createGunzip();
          //     // Set the appropriate response headers
          //     res.setHeader("Content-Type",  "application/json");
          //     // Pipe the S3 response stream to the API response stream
          //     s3Response.Body.pipe(gunzip).pipe(res);
          //   } else {
          //     throw new Error("Invalid response body");
          //   }
          // const decompressedData = zlib.gunzipSync(Body.transformToByteArray());
          // const jsonData = JSON.parse(decompressedData.toString("utf8"));
          // console.log(jsonData);
          // res.setHeader("Content-Type", "text/csv");
          // res.status(200).send(decompressedData.toString());

          _context.next = 11;
          break;

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            statusCode: 500,
            message: _context.t0.message
          });

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 8]]);
};

exports["default"] = _callee;