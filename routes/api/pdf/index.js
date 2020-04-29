const router = require("express").Router();
const controller = require("./controller");

router.get("/", controller.pdf);

module.exports = router;
