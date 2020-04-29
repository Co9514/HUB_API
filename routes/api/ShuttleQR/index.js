const router = require("express").Router();
const controller = require("./controller");
const QRMiddleware = require("../../../middlewares/shuttle_qr");

router.post("/", QRMiddleware, controller.Shuttle_QR);

module.exports = router;
