import express from "express";
let compressRouter = express.Router();
/* GET home page. */
compressRouter.post("/compress", function(req, res, next) {
  console.log(req);
  res.send("Add a book");
});

export default compressRouter;
