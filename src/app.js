import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./routes/index";
// -------------------
import Archiver from "archiver";
import AWS from "aws-sdk";
import { createReadStream } from "fs";
import { Readable, Stream } from "stream";

//--------------------
const BUCKET_NAME = "viacheck.dev.viamericas.net";
const archive = Archiver("zip");
const app = express();
const s3 = new AWS.S3();

const keys_amazon = [
  "2020/1/b0213e3e-0660-4724-9d00-fdb2a02c9f57FRONT",
  "2020/1/b0213e3e-0660-4724-9d00-fdb2a02c9f57BACK",
  "2020/1/9faddd19-a529-4470-aab9-511b92284cbcFRONT",
  "2020/1/9faddd19-a529-4470-aab9-511b92284cbcBACK",
  "2020/1/bd0487de-6c3b-44ee-8d50-38665ce268abFRONT"
];

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/", function(req, res, next) {
  res.send("uno");
  console.log("inicio");
  compress_data(next);
});

app.use("/compress", function(req, res, next) {
  res.send("uno");
  console.log("inicio");
  compress_data(next);
});

// ----------------------------------------------------------
//This returns us a stream.. consider it as a real pipe sending fluid to S3 bucket.. Don't forget it
const streamTo = (_bucket, _key) => {
  var stream = require("stream");
  var _pass = new stream.PassThrough();
  s3.upload({ Bucket: _bucket, Key: _key, Body: _pass }, (_err, _data) => {
    if (_err) {
      console.log(_err);
    }
  });
  return _pass;
};

const compress_data = async _cb => {
  var _list = await Promise.all(
    keys_amazon.map(
      _key =>
        new Promise((_resolve, _reject) => {
          s3.getObject({ Bucket: BUCKET_NAME, Key: _key }).then(_data =>
            _resolve({ data: _data.Body, name: `${_key.split("/").pop()}` })
          );
        })
    )
  ).catch(_err => {
    throw new Error(_err);
  });

  await new Promise((_resolve, _reject) => {
    var _myStream = streamTo(BUCKET_NAME, "test_juanes.zip"); //Now we instantiate that pipe...
    var _archive = _archiver("zip");
    _archive.on("error", err => {
      throw new Error(err);
    });

    //Your promise gets resolved when the fluid stops running... so that's when you get to close and resolve
    _myStream.on("close", _resolve);
    _myStream.on("end", _resolve);
    _myStream.on("error", _reject);

    _archive.pipe(_myStream); //Pass that pipe to _archive so it can push the fluid straigh down to S3 bucket
    _list.forEach(_itm => _archive.append(_itm.data, { name: _itm.name })); //And then we start adding files to it
    _archive.finalize(); //Tell is, that's all we want to add. Then when it finishes, the promise will resolve in one of those events up there
  }).catch(_err => {
    throw new Error(_err);
  });

  _cb(null, {}); //Handle response back to server
};

export default app;
