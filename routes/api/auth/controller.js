const jwt = require("jsonwebtoken");
const mysql_dbc = require("../../../db_con");
const oracledb = require("oracledb");
const oracle_config = require("../../../oracle_db_info");
const oracle_check = require("../../../oracle_db_con");
const crypto = require("crypto");

function sign({ secret, info }) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      info,
      secret,
      {
        algorithm: "HS512",
        expiresIn: "7d",
        issuer: "Kim_hyeongjin",
        subject: "userInfo"
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}

exports.login = async (req, res) => {
  const password = crypto
    .createHash("sha512")
    .update(req.body.pwd)
    .digest("base64");
  console.log(password);
  const secret = req.app.get("jwt-secret");
  try {
    let oracle = await oracledb.createPool(oracle_config);
    let check_oracle = await oracle_check.getEmployee(req, res);
    if (check_oracle === undefined) {
      res.status(401).send({ message: "ID or PASSWORD IS WRONG" });
    } else {
      const student_id = check_oracle.USER_ID;
      const student_name = check_oracle.NM;

      const connection = await mysql_dbc.test_open();

      const check_maria = await connection.query(
        "SELECT * FROM STUDENT_INFO WHERE STUDENT_ID =?",
        [student_id]
      );
      if (check_maria == "") {
        const check = await connection.query(
          "INSERT INTO STUDENT_INFO (STUDENT_ID, STUDENT_NAME) VALUES (?, ?)",
          [student_id, student_name]
        );
        const token = await sign({
          info: {
            STUDENT_ID: student_id,
            STUDENT_NAME: student_name
          },
          secret
        });
        res.json({
          message: "logged in successfully",
          token: token,
          STUDENT_ID: student_id,
          STUDENT_NAME: student_name
        });
        connection.end();
        return;
      }
      const token = await sign({
        info: {
          STUDENT_ID: check_maria[0].STUDENT_ID,
          STUDENT_NAME: check_maria[0].STUDENT_NAME
        },
        secret
      });
      res.json({
        message: "logged in successfully",
        token: token,
        STUDENT_ID: check_maria[0].STUDENT_ID,
        STUDENT_NAME: check_maria[0].STUDENT_NAME
      });
      connection.end();
    }
  } catch (err) {
    res.status(403).json({
      message: err.message
    });
  }
};

exports.check = (req, res) => {
  res.json({
    success: true,
    info: req.decoded
  });
};
