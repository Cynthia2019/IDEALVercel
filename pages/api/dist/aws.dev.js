"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _clientS = require("@aws-sdk/client-s3");

var s3Client = new _clientS.S3Client({
  region: process.env.NEXT_PUBLIC_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_SECRET_KEY
  }
});
var _default = s3Client; 

exports["default"] = _default;
