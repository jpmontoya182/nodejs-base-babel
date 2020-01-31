"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var compressRouter = _express["default"].Router();
/* GET home page. */


compressRouter.post("/compress", function (req, res, next) {
  console.log(req);
  res.send("Add a book");
});
var _default = compressRouter;
exports["default"] = _default;