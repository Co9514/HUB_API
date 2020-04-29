const mysql_dbc = require("../../../db_con");

exports.ticket_delete = async (req, res) => {
  try {
    const connection = await mysql_dbc.test_open();
    if (req.query.start == "아산캠퍼스" || req.query.start == "천안캠퍼스") {
      const ticket = await connection.query(
        "DELETE FROM TICKET_LIST WHERE TICKET_ID= ? AND CASE WHEN TICKET_DATE > DATE(NOW()) THEN TRUE WHEN TICKET_DATE = DATE(NOW()) THEN TICKET_TIME > date_sub(TIME(NOW()),INTERVAL 1 HOUR) END;",
        [req.query.ticket_id]
      );
      res.json({ ticket_cancle: ticket.affectedRows });
    } else {
      const ticket = await connection.query(
        "DELETE FROM TICKET_LIST WHERE TICKET_ID= ? AND TICKET_DATE > date_add(NOW(),INTERVAL 3 DAY);",
        [req.query.ticket_id]
      );
      res.json({ ticket_cancle: ticket.affectedRows });
    }

    connection.end();
  } catch (err) {
    res.status(403).json({
      ticket_cancle: err
    });
  }
};

exports.insert_ticket = async (req, res) => {
  try {
    let message;
    const connection = await mysql_dbc.test_open();
    const check = await connection.query(
      "SELECT * FROM TICKET_LIST WHERE TICKET_DATE = ? AND BUS_STOP_ID = ? AND DESTINATION_ID = ? AND SEAT = ?;",
      [req.body.ticket_date, req.body.start, req.body.end, req.body.count]
    );
    if (check == "") {
      const ticket = await connection.query(
        "INSERT INTO TICKET_LIST (STUDENT_ID,BUS_ID,BUS_STOP_ID,DESTINATION_ID,TICKET_TIME,TICKET_DATE,RESERVATION_DATE,SEAT) VALUES(?,(SELECT BUS_ID FROM BUS_START WHERE BUS_STOP_ID = ? AND DESTINATION_ID = ? AND DAY_OF_WEEK = ? AND TIME = ?),?,?,?,?,NOW(),?);",
        [
          req.body.id,
          req.body.start,
          req.body.end,
          req.body.day_of_week,
          req.body.time,
          req.body.start,
          req.body.end,
          req.body.time,
          req.body.ticket_date,
          req.body.count
        ]
      );
      message = "success";
    } else if (check != "") {
      message = "이미 예약된 자리입니다.";
    }
    connection.end();
    res.json({ message: message });
  } catch (err) {
    res.status(403).json({
      message: "fail"
    });
  }
};

exports.list_all = async (req, res) => {
  try {
    const type = req.query.type;
    const connection = await mysql_dbc.test_open();
    let ticket = "";
    if (type == 0) {
      //전체리스트 출력
      ticket = await connection.query(
        `SELECT CASE 
WHEN TL.DESTINATION_ID = 1001 THEN B3.A_PRICE
WHEN TL.BUS_STOP_ID = 1001 THEN B3.A_PRICE
WHEN TL.DESTINATION_ID = 1002 THEN B3.C_PRICE
WHEN TL.BUS_STOP_ID = 1002 THEN B3.C_PRICE 
END AS PRICE,
TL.BOARDING,TL.TICKET_ID,TL.TICKET_TIME,TL.STUDENT_ID,TL.TICKET_DATE,TL.RESERVATION_DATE,TL.SEAT, B1.BUS_STOP_NAME AS START,B2.BUS_STOP_NAME AS END 
FROM TICKET_LIST TL,BUS_STOP B3,BUS_START BS,BUS_STOP B,BUS_STOP B1 JOIN BUS_STOP B2
WHERE CASE
WHEN TL.DESTINATION_ID IN (1001,1002) THEN B.BUS_STOP_ID = TL.BUS_STOP_ID ELSE B.BUS_STOP_ID = TL.DESTINATION_ID END
AND CASE WHEN TL.DESTINATION_ID IN (1001,1002) THEN B3.BUS_STOP_ID = TL.BUS_STOP_ID
WHEN TL.BUS_STOP_ID IN (1001,1002) THEN B3.BUS_STOP_ID = TL.DESTINATION_ID END
AND B1.BUS_STOP_ID = TL.BUS_STOP_ID 
AND B2.BUS_STOP_ID = TL.DESTINATION_ID 
AND BS.BUS_ID=TL.BUS_ID 
AND STUDENT_ID = ?
AND TL.TICKET_TIME = BS.TIME 
AND TL.BUS_STOP_ID = BS.BUS_STOP_ID 
AND TL.DESTINATION_ID = BS.DESTINATION_ID
ORDER BY TICKET_ID DESC;`,
        [req.query.id]
      );
    } else if (type == 1) {
      //등교리스트 출력
      ticket = await connection.query(
        `SELECT CASE 
WHEN TL.DESTINATION_ID = 1001 THEN B3.A_PRICE
WHEN TL.DESTINATION_ID = 1002 THEN B3.C_PRICE
END AS PRICE,
TL.BOARDING,TL.TICKET_ID,TL.TICKET_TIME,TL.STUDENT_ID,TL.TICKET_DATE,TL.RESERVATION_DATE,TL.SEAT, B1.BUS_STOP_NAME AS START,B2.BUS_STOP_NAME AS END 
FROM TICKET_LIST TL,BUS_STOP B3,BUS_START BS,BUS_STOP B,BUS_STOP B1 JOIN BUS_STOP B2
WHERE B.BUS_STOP_ID = TL.BUS_STOP_ID
AND B3.BUS_STOP_ID = TL.BUS_STOP_ID
AND B1.BUS_STOP_ID = TL.BUS_STOP_ID 
AND B2.BUS_STOP_ID = TL.DESTINATION_ID 
AND BS.BUS_ID=TL.BUS_ID
AND STUDENT_ID = ?
AND TL.TICKET_TIME = BS.TIME 
AND TL.BUS_STOP_ID = BS.BUS_STOP_ID 
AND TL.BUS_STOP_ID NOT IN(1001,1002)
AND TL.DESTINATION_ID = BS.DESTINATION_ID
ORDER BY TICKET_ID DESC;`,
        [req.query.id]
      );
    } else if (type == 2) {
      //하교리스트 출력
      ticket = await connection.query(
        `SELECT CASE 
WHEN TL.BUS_STOP_ID = 1001 THEN B3.A_PRICE
WHEN TL.BUS_STOP_ID = 1002 THEN B3.C_PRICE 
END AS PRICE,
TL.BOARDING,TL.TICKET_ID,TL.TICKET_TIME,TL.STUDENT_ID,TL.TICKET_DATE,TL.RESERVATION_DATE,TL.SEAT, B1.BUS_STOP_NAME AS START,B2.BUS_STOP_NAME AS END 
FROM TICKET_LIST TL,BUS_STOP B3,BUS_START BS,BUS_STOP B,BUS_STOP B1 JOIN BUS_STOP B2
WHERE B.BUS_STOP_ID = TL.DESTINATION_ID
AND B3.BUS_STOP_ID = TL.DESTINATION_ID
AND B1.BUS_STOP_ID = TL.BUS_STOP_ID 
AND B2.BUS_STOP_ID = TL.DESTINATION_ID 
AND BS.BUS_ID=TL.BUS_ID 
AND STUDENT_ID = ?
AND TL.TICKET_TIME = BS.TIME 
AND TL.BUS_STOP_ID = BS.BUS_STOP_ID 
AND TL.DESTINATION_ID = BS.DESTINATION_ID
AND TL.DESTINATION_ID NOT IN(1001,1002)
ORDER BY TICKET_ID DESC;`,
        [req.query.id]
      );
    }
    if (ticket == "") {
      res.json({
        message: "조회된 값 없음"
      });
      connection.end();
      return;
    }
    res.json({ ticket: ticket });
    connection.end();
  } catch (err) {
    res.status(403).json({
      message: "DB ERROR"
    });
  }
};

exports.list = async (req, res) => {
  try {
    const connection = await mysql_dbc.test_open();
    const ticket = await connection.query(
      "SELECT  TL.TICKET_ID,TL.TICKET_DATE,TL.TICKET_TIME,TL.SEAT,B1.BUS_STOP_NAME AS START,B2.BUS_STOP_NAME AS END FROM TICKET_LIST TL,BUS_STOP B1 JOIN BUS_STOP B2 WHERE B1.BUS_STOP_ID = TL.BUS_STOP_ID AND B2.BUS_STOP_ID = TL.DESTINATION_ID AND TL.STUDENT_ID = ? AND TL.TICKET_DATE >= DATE(NOW()) ORDER BY TICKET_DATE LIMIT 1;",
      [req.query.id]
    );
    if (ticket == "") {
      res.json({
        message: "조회된 값 없음"
      });
      connection.end();
      return;
    }
    res.json({ ticket: ticket });
    connection.end();
  } catch (err) {
    res.status(403).json({
      message: "DB ERROR"
    });
  }
};

/* get bus_stop */
exports.startpoint = async (req, res) => {
  try {
    const connection = await mysql_dbc.test_open();
    if (req.query.type == 0) {
      const bus = await connection.query(
        "SELECT BUS_STOP_ID,BUS_STOP_NAME FROM BUS_STOP WHERE BUS_STOP_ID !=1001 AND BUS_STOP_ID !=1002 AND NOT BUS_STOP_ID LIKE '5%' AND NOT BUS_STOP_ID LIKE '6%' "
      );
      res.json({ stop: bus });
    }
    if (req.query.type == 1) {
      const bus = await connection.query(
        "SELECT BUS_STOP_ID,BUS_STOP_NAME FROM BUS_STOP WHERE BUS_STOP_ID =1001 OR BUS_STOP_ID =1002"
      );
      res.json({ stop: bus });
    }
    if (bus == "") {
      throw new Error(403);
    }
    connection.end();
  } catch (err) {
    res.status(403).json({
      message: "조회된 값 없음"
    });
  }
};

exports.arrival = async (req, res) => {
  try {
    const connection = await mysql_dbc.test_open();
    const bus = await connection.query(
      "SELECT DISTINCT A.DESTINATION_ID,B.BUS_STOP_NAME FROM BUS_START A,BUS_STOP B WHERE A.DESTINATION_ID=B.BUS_STOP_ID AND A.BUS_STOP_ID=? ",
      [req.query.start]
    );
    if (bus == "") {
      throw new Error(403);
    }
    res.json({ end: bus });
    connection.end();
  } catch (err) {
    res.status(403).json({
      message: "조회된 값 없음"
    });
  }
};

exports.timetable = async (req, res) => {
  try {
    const connection = await mysql_dbc.test_open();
    let check;
    let bus;
    if (req.query.type == 0) {
      //등교
      check = await connection.query(
        "SELECT TICKET_ID FROM TICKET_LIST WHERE TICKET_DATE = ? AND STUDENT_ID = ? AND DESTINATION_ID IN (1001,1002);",
        [req.query.ticket_date, req.query.id]
      );
    } else if (req.query.type == 1) {
      //하교
      check = await connection.query(
        "SELECT TICKET_ID FROM TICKET_LIST WHERE TICKET_DATE = ? AND STUDENT_ID = ? AND BUS_STOP_ID IN (1001,1002);",
        [req.query.ticket_date, req.query.id]
      );
    }

    if (check == "") {
      if (req.query.start == 1001) {
        bus = await connection.query(
          /*--------------------------------------------------------------------------------리미트값-------------------------- */
          `SELECT BS.BUS_ID,BS.TIME,B.seat
          FROM BUS_START BS LEFT JOIN (SELECT TL.BUS_ID,30-COUNT(TL.SEAT) AS seat 
          FROM TICKET_LIST TL
          WHERE TL.TICKET_DATE =? 
          AND TL.BUS_STOP_ID = 1001 GROUP BY TL.BUS_ID) AS B ON BS.BUS_ID = B.BUS_ID 
          WHERE BS.BUS_STOP_ID = 1001 AND BS.DESTINATION_ID =? AND BS.DAY_OF_WEEK =? 
          AND CASE WHEN DATE(NOW()) = ? THEN BS.TIME >= TIME(NOW()) ELSE BS.TIME END;`,
          [
            req.query.ticket_date,
            req.query.end,
            req.query.day,
            req.query.ticket_date
          ]
        );
      } else if (req.query.start == 1002) {
        bus = await connection.query(
          /*--------------------------------------------------------------------------------리미트값------------------------- */
          "SELECT BS.BUS_ID,BS.TIME,B.seat FROM BUS_START BS LEFT JOIN (SELECT TL.BUS_ID,15-COUNT(TL.SEAT) AS seat FROM TICKET_LIST TL WHERE TL.TICKET_DATE =? AND TL.BUS_STOP_ID = 1002 GROUP BY TL.BUS_ID) AS B ON BS.BUS_ID = B.BUS_ID WHERE BS.BUS_STOP_ID = 1002 AND BS.DESTINATION_ID =? AND BS.DAY_OF_WEEK =? AND CASE WHEN DATE(NOW()) = ? THEN BS.TIME >= TIME(NOW()) ELSE BS.TIME END;",
          [
            req.query.ticket_date,
            req.query.end,
            req.query.day,
            req.query.ticket_date
          ]
        );
      } else {
        bus = await connection.query(
          `SELECT BS.BUS_ID,BS.TIME,B.seat FROM BUS_START BS LEFT JOIN 
          (SELECT TL.BUS_ID,45-COUNT(TL.SEAT) AS seat FROM TICKET_LIST TL WHERE TL.TICKET_DATE =? GROUP BY TL.BUS_ID)
          AS B ON BS.BUS_ID = B.BUS_ID 
          WHERE BS.BUS_STOP_ID = ? AND BS.DESTINATION_ID =? AND BS.DAY_OF_WEEK =? AND 
          CASE WHEN DATE(NOW()) = ? THEN BS.TIME >= TIME(NOW()) ELSE BS.TIME END;`,
          [
            req.query.ticket_date,
            req.query.start,
            req.query.end,
            req.query.day,
            req.query.ticket_date
          ]
        );
      }
    } else if (check != "") {
      res.json({ timetable: "이미 예약하셨습니다." });
      connection.end();
      return;
    }
    if (bus == "") {
      throw new Error(403);
    } else if (req.query.start == 1001) {
      for (let i = 0; i < bus.length; i++) {
        if (bus[i].seat === null) {
          bus[i].seat = 30;
        }
      }
    } else if (req.query.start == 1002) {
      for (let i = 0; i < bus.length; i++) {
        if (bus[i].seat === null) {
          bus[i].seat = 15;
        }
      }
    } else {
      for (let i = 0; i < bus.length; i++) {
        if (bus[i].seat === null) {
          bus[i].seat = 45;
        }
      }
    }
    res.json({ timetable: bus });
    connection.end();
  } catch (err) {
    res.status(403).json({
      message: "조회된 값 없음"
    });
  }
};

exports.price = async (req, res) => {
  try {
    const type = req.query.type;
    const start = req.query.stop;
    const end = req.query.end;
    let price;
    const connection = await mysql_dbc.test_open();
    if (type == 0) {
      //등교
      if (end == 1001) {
        //아산 등교
        price = await connection.query(
          "SELECT A_PRICE AS PRICE FROM BUS_STOP WHERE BUS_STOP_ID = ?",
          [start]
        );
      } else if (end == 1002) {
        //천안 등교
        price = await connection.query(
          "SELECT C_PRICE AS PRICE FROM BUS_STOP WHERE BUS_STOP_ID = ?",
          [start]
        );
      }
    } else if (type == 1) {
      //하교
      if (start == 1001) {
        //아산 하교
        price = await connection.query(
          "SELECT A_PRICE AS PRICE FROM BUS_STOP WHERE BUS_STOP_ID = ?",
          [end]
        );
      } else if (start == 1002) {
        //천안 하교
        price = await connection.query(
          "SELECT C_PRICE AS PRICE FROM BUS_STOP WHERE BUS_STOP_ID = ?",
          [end]
        );
      }
    }

    if (price == "") {
      throw new Error(403);
    }
    res.json({ pay: price });
    connection.end();
  } catch (err) {
    res.status(403).json({
      message: "조회된 값 없음"
    });
  }
};

exports.count = async (req, res) => {
  try {
    const connection = await mysql_dbc.test_open();
    const bus_count = await connection.query(
      "SELECT SEAT FROM TICKET_LIST WHERE BUS_ID IN (SELECT BUS_ID AS BUS_ID FROM BUS_START WHERE BUS_STOP_ID = ? AND DESTINATION_ID = ? AND DAY_OF_WEEK = ? AND TIME = ?) AND TICKET_DATE = ?;",
      [
        req.query.start,
        req.query.end,
        req.query.day_of_week,
        req.query.time,
        req.query.ticket_date
      ]
    );
    res.json({ bus_count: bus_count });
    connection.end();
  } catch (err) {
    res.status(403).json({
      message: "조회된 값 없음"
    });
  }
};

exports.graph = async (req, res) => {
  try {
    const connection = await mysql_dbc.test_open();
    const graph = await connection.query(
      "SELECT TL.BUS_ID,COUNT(TL.BUS_ID),BS.DESTINATION_ID,BS.BUS_STOP_ID,BS.TIME,BS.DAY_OF_WEEK,B.BUS_STOP_NAME FROM TICKET_LIST TL,BUS_START BS,BUS_STOP B WHERE BS.BUS_ID = TL.BUS_ID AND BS.BUS_STOP_ID = B.BUS_STOP_ID AND TL.TICKET_DATE > date_sub(NOW(),INTERVAL 1 MONTH) GROUP BY TL.BUS_ID;"
    );
    res.json(graph);
    connection.end();
  } catch (err) {
    res.status(403).json({
      message: "조회된 값 없음"
    });
  }
};

exports.notice = async (req, res) => {
  try {
    const connection = await mysql_dbc.test_open();
    const notice = await connection.query("SELECT * FROM NOTICE_BOARD");
    if (notice == "") {
      throw new Error(403);
    }
    res.json({ notice: notice });
    connection.end();
  } catch (err) {
    res.status(403).json({
      message: "조회된 값 없음"
    });
  }
};

exports.penalty = async (req, res) => {
  try {
    //   const connection = await mysql_dbc.test_open();
    //   const result = await connection.query(
    //     "SELECT STUDENT_ID,PENALTY_END FROM PENALTY WHERE STUDENT_ID = ? AND PENALTY_END >= DATE(NOW());",
    //     [req.query.id]
    //   );
    //   if (
    //     result == ""
    //       ? res.json({ penalty: true })
    //       : res.json({ penalty: false, end: result[0].PENALTY_END })
    //   )
    //     connection.end();
    res.json({ penalty: true });
  } catch (err) {
    res.status(403).json({
      message: "DB ERROR"
    });
  }
};
