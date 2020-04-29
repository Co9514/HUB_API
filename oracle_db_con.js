const oracledb = require("oracledb");
const crypto = require("crypto");

function getEmployee(req, res) {
  return new Promise(async function(resolve, reject) {
    let conn; // Declared here for scoping purposes.

    try {
      conn = await oracledb.getConnection();
      console.log("Connected to database");

      const id = req.body.id;
      const password = crypto
        .createHash("sha512")
        .update(req.body.pwd)
        .digest("base64");
      console.log(password);
      let result = await conn.execute(
        "SELECT USER_ID,NM FROM HUB_USER WHERE USER_ID = :id AND PASSWD = :password",
        [id, password],
        {
          outFormat: oracledb.OBJECT
        }
      );

      console.log("Query executed");

      resolve(result.rows[0]);
    } catch (err) {
      console.log("Error occurred", err);

      reject(err);
    } finally {
      // If conn assignment worked, need to close.
      if (conn) {
        try {
          await conn.close();

          console.log("Connection closed");
        } catch (err) {
          console.log("Error closing connection", err);
        }
      }
    }
  });
}

module.exports.getEmployee = getEmployee;
