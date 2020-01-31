"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _index = _interopRequireDefault(require("./routes/index"));

var _archiver2 = _interopRequireDefault(require("archiver"));

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

var _fs = require("fs");

var _stream = require("stream");

// -------------------
//--------------------
var BUCKET_NAME = "viacheck.dev.viamericas.net";
var archive = (0, _archiver2["default"])("zip");
var app = (0, _express["default"])();
var s3 = new _awsSdk["default"].S3();
var keys_amazon = ["2020/1/b0213e3e-0660-4724-9d00-fdb2a02c9f57FRONT", "2020/1/b0213e3e-0660-4724-9d00-fdb2a02c9f57BACK", "2020/1/9faddd19-a529-4470-aab9-511b92284cbcFRONT", "2020/1/9faddd19-a529-4470-aab9-511b92284cbcBACK", "2020/1/bd0487de-6c3b-44ee-8d50-38665ce268abFRONT"];
app.use((0, _morgan["default"])("dev"));
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use((0, _cookieParser["default"])());
app.use(_express["default"]["static"](_path["default"].join(__dirname, "../public")));
app.use("/", function (req, res, next) {
  res.send("uno");
  console.log("inicio");
  compress_data(next);
});
app.use("/compress", function (req, res, next) {
  res.send("uno");
  console.log("inicio");
  compress_data(next);
}); // ----------------------------------------------------------
//This returns us a stream.. consider it as a real pipe sending fluid to S3 bucket.. Don't forget it

var streamTo = function streamTo(_bucket, _key) {
  var stream = require("stream");

  var _pass = new stream.PassThrough();

  s3.upload({
    Bucket: _bucket,
    Key: _key,
    Body: _pass
  }, function (_err, _data) {
    if (_err) {
      console.log(_err);
    }
  });
  return _pass;
};

var compress_data =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(_cb) {
    var _list;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return Promise.all(keys_amazon.map(function (_key) {
              return new Promise(function (_resolve, _reject) {
                s3.getObject({
                  Bucket: BUCKET_NAME,
                  Key: _key
                }).then(function (_data) {
                  return _resolve({
                    data: _data.Body,
                    name: "".concat(_key.split("/").pop())
                  });
                });
              });
            }))["catch"](function (_err) {
              throw new Error(_err);
            });

          case 2:
            _list = _context.sent;
            _context.next = 5;
            return new Promise(function (_resolve, _reject) {
              var _myStream = streamTo(BUCKET_NAME, "test_juanes.zip"); //Now we instantiate that pipe...


              var _archive = _archiver("zip");

              _archive.on("error", function (err) {
                throw new Error(err);
              }); //Your promise gets resolved when the fluid stops running... so that's when you get to close and resolve


              _myStream.on("close", _resolve);

              _myStream.on("end", _resolve);

              _myStream.on("error", _reject);

              _archive.pipe(_myStream); //Pass that pipe to _archive so it can push the fluid straigh down to S3 bucket


              _list.forEach(function (_itm) {
                return _archive.append(_itm.data, {
                  name: _itm.name
                });
              }); //And then we start adding files to it


              _archive.finalize(); //Tell is, that's all we want to add. Then when it finishes, the promise will resolve in one of those events up there

            })["catch"](function (_err) {
              throw new Error(_err);
            });

          case 5:
            _cb(null, {}); //Handle response back to server


          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function compress_data(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _default = app;
exports["default"] = _default;