let mysql = require("promise-mysql");
let config = require("./dbinfo").local;

let connection;

module.exports = {
  init: function() {
    if (connection) return Promise.resolve(connection);
    return mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      timezone: "KST"
    });
  },

  test_open: async function() {
    try {
      const conn = await this.init();
      console.info("mysql is connected successfully");
      return Promise.resolve(conn);
    } catch (err) {
      console.error("mysql connection error :" + err);
      process.exit();
    }
  },
  end: function() {
    if (!connection) return Promise.resolve(true);
    return connection.end();
  }
};
