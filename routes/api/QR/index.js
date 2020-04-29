const router = require("express").Router();
const controller = require("./controller");

router.patch("/QR_Check", controller.QR_Check);

module.exports = router;
