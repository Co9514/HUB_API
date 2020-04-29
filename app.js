var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes");
var app = express();
const config = require("./config");
const qrconfig = require("./qrconfig");
const schedule = require("node-schedule");
const mysql_dbc = require("./db_con");

// 월,화,수,목,금 새벽3시에 함수실행
// let j = schedule.scheduleJob("0 0 3 * * 0,4", async () => {
//   try {
//     const connection = await mysql_dbc.test_open();
//     const check = await connection.query(
//       "SELECT STUDENT_ID FROM TICKET_LIST WHERE TICKET_DATE = DATE_SUB(DATE(NOW()), INTERVAL 1 DAY) AND BOARDING = '미탑승'"
//     );

//     for (var prop in check) {
//       const penalty = await connection.query(
//         " INSERT INTO PENALTY (STUDENT_ID, PENALTY_DATE, PENALTY_COUNT, PENALTY_END) VALUES (?, DATE(NOW()), 1, DATE_ADD(NOW(),INTERVAL 1 WEEK))ON DUPLICATE KEY UPDATE PENALTY_COUNT = PENALTY_COUNT + 1, PENALTY_END = DATE_ADD(PENALTY_END, INTERVAL 1 WEEK);",
//         [check[prop].STUDENT_ID]
//       );
//     }

//     const del_penalty = await connection.query(
//       "DELETE FROM PENALTY WHERE PENALTY_END = DATE(NOW());"
//     );
//     connection.end();
//   } catch (err) {
//     console.log(err);
//   }
// });
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(indexRouter);
// configure api router
app.use("/api", require("./routes/api"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.set("view engine", "ejs");

//jwt secretkey
app.set("jwt-secret", config.secret);

//Shuttle QR secretkey
app.set("QR-secret", qrconfig.secret);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
