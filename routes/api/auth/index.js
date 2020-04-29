const router = require("express").Router();
const controller = require("./controller");
const authMiddleware = require("../../../middlewares/auth");

router.use("/check", authMiddleware);

router.post("/login", controller.login);
router.post("/check", controller.check);

module.exports = router;
