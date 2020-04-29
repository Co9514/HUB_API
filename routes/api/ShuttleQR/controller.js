const mysql_dbc = require("../../../db_con");
exports.Shuttle_QR = async (req, res) => {
  try {
    //넘겨온 json 데이터를 값으로 전환
    const student = JSON.parse(req.jsonData).student;
    const station = JSON.parse(req.jsonData).station;
    const type = JSON.parse(req.jsonData).type;
    const connection = await mysql_dbc.test_open();
    const check = await connection.query(
      "INSERT INTO SHUTTLE_QR (STUDENT_ID,STATION,STATE,DATE,TIME) VALUES (?,?,?,DATE(NOW()),TIME(NOW()));",
      [student, station, type]
    );
    connection.end();
    res.json({ message: "데이터 등록 성공" });
  } catch (err) {
    res.status(403).json({
      message: "데이터 등록 실패"
    });
  }
};
