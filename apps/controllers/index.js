var express = require("express");
var router = express.Router();
router.use("/kh", require(__dirname + "/KHController"));
router.use("/product", require(__dirname + "/ProductController"));
router.use("/", require(__dirname + "/GioHangController"));
router.use("/", require(__dirname + "/ProductController"));

module.exports = router;