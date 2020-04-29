var fs = require("fs");
var pdf = require("html-pdf");
const ejs = require("ejs");
const mysql_dbc = require("../../../db_con");

var options = {
  format: "A4",
  border: {
    top: "0.1in",
    right: "0.7in",
    bottom: "0.5in",
    left: "0.7in"
  }
};

exports.pdf = async (req, res) => {
  const connection = await mysql_dbc.test_open();
  const ticket = await connection.query(
    "select TICKET_ID,BUS_STOP_ID,DESTINATION_ID,RESERVATION_DATE,SEAT from TICKET_LIST WHERE STUDENT_ID = ?;",
    [req.query.id]
  );
  const student = await connection.query(
    "SELECT * FROM STUDENT_INFO WHERE STUDENT_ID = ?;",
    [req.query.id]
  );
  connection.end();
  console.log(ticket[0]);
  var html = null;
  ejs.renderFile(
    "./pdf.ejs",
    {
      name: student[0].STUDENT_NAME,
      id: student[0].STUDENT_ID,
      grade: student[0].STUDENT_SCHYR,
      department: student[0].STUDENT_DEPT,
      ticket
    },
    function(err, result) {
      if (result) {
        html = result;
      } else {
        res.end("An error occurred");
        console.log(err);
      }
    }
  );
  const name = student[0].STUDENT_NAME;
  pdf.create(html, options).toStream(function(err, stream) {
    if (err) return res.send(err);
    res.type("pdf");
    stream.pipe(fs.createWriteStream("./pdf/" + name + ".pdf"));
    stream.pipe(res);
  });
};
