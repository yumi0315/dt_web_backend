const mysql = require("mysql2");
require("dotenv").config(); // .env 파일에 수록된 정보를 가져옴.

const pool = mysql.createPool({
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: 10, // 풀의 최대 연결 수
});

// 프로미스를 반환하는 풀
const promisePool = pool.promise();

// 데이터베이스 연결 테스트
const dbConnect = async () => {
  try {
    const [rows, fields] = await promisePool.query("SELECT 1 + 1 AS result");
    console.log("DB Connected! Test query result:", rows[0].result);
  } catch (err) {
    console.error("An error occurred:", err);
  }
};

module.exports = { dbConnect, promisePool };
