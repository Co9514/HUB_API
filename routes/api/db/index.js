const router = require("express").Router();
const controller = require("./controller");

router.post("/insert_ticket", controller.insert_ticket);
router.get("/list_all", controller.list_all);
router.get("/list", controller.list);
router.get("/startpoint", controller.startpoint);
router.get("/arrival", controller.arrival);
router.get("/timetable", controller.timetable);
router.get("/price", controller.price);
router.get("/count", controller.count);
router.get("/graph", controller.graph);
router.get("/notice", controller.notice);
router.get("/penalty", controller.penalty);
router.delete("/ticket_delete", controller.ticket_delete);

module.exports = router;
