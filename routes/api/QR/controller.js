const jwt = require("jsonwebtoken");
var http = require("http");
let express = require("express");
let router = express.Router();
let app = express();
const mysql_dbc = require("../../../db_con");

exports.QR_Check = async (req, res) => {
  try {
    const connection = await mysql_dbc.test_open();
    const check = await connection.query(
      //   `SELECT TICKET_ID,STUDENT_ID,BUS_ID,B1.BUS_STOP_NAME,B2.BUS_STOP_NAME,TICKET_DATE,TICKET_TIME,RESERVATION_DATE,SEAT,BOARDING
      // FROM TICKET_LIST TL,BUS_STOP B1 JOIN BUS_STOP B2
      // WHERE TICKET_ID = ?
      // AND TL.BUS_STOP_ID = B1.BUS_STOP_ID
      // AND TL.DESTINATION_ID = B2.BUS_STOP_ID
      // AND TICKET_DATE = DATE(NOW())
      // AND CASE WHEN TL.BUS_STOP_ID IN (1001,1002)
      // THEN TIME(NOW()) <= DATE_ADD(TICKET_TIME,INTERVAL 30 MINUTE) AND TIME(NOW()) >= DATE_SUB(TICKET_TIME,INTERVAL 30 MINUTE)
      // ELSE TICKET_TIME = DATE_ADD(TICKET_TIME,INTERVAL 3 HOUR) > TIME(NOW()) END;`,
      `SELECT TICKET_ID,STUDENT_ID,BUS_ID,B1.BUS_STOP_NAME,B2.BUS_STOP_NAME,TICKET_DATE,TICKET_TIME,RESERVATION_DATE,SEAT,BOARDING 
      FROM TICKET_LIST TL,BUS_STOP B1 JOIN BUS_STOP B2 
      WHERE TICKET_ID = ? 
      AND TL.BUS_STOP_ID = B1.BUS_STOP_ID 
      AND TL.DESTINATION_ID = B2.BUS_STOP_ID 
      AND TICKET_DATE = DATE(NOW())`,
      [req.query.ticket_id]
    );
    if (check[0].BOARDING == "탑승") {
      res.json({ message: "이미 탑승한 티켓입니다." });
    } else if (check[0].BOARDING == "미탑승") {
      const qr = await connection.query(
        "UPDATE TICKET_LIST SET BOARDING = '탑승' WHERE TICKET_ID = ?;",
        [req.query.ticket_id]
      );
      res.json({ ticket: check });
    }
    connection.end();
  } catch (err) {
    res.status(403).json({
      message: "티켓 탑승 날짜가 아닙니다."
    });
  }
};
