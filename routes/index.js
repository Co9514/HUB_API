var express = require("express");
var router = express.Router();
var loginRouter = require("./api/auth/index");
var dbRouter = require("./api/db/index");
var QRRouter = require("./api/QR/index");
var ShuttleQRRouter = require("./api/ShuttleQR/index");
var pdf = require("./api/pdf/index");

router.use("/login", loginRouter);
router.use("./db", dbRouter);
router.use("./QR", QRRouter);
router.use("/shuttleQR", ShuttleQRRouter);
router.use("/pdf", pdf);
module.exports = router;
