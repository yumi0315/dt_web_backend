const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: 10,
});

const promisePool = pool.promise();

module.exports = promisePool;
