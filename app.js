const express = require("express");
const { dbConnect, promisePool } = require("./config/dbConnect");
const app = express();
const port = 3030;

dbConnect();

app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: true })); // For URL-encoded payloads

app.get("/", (req, res) => {
  res.status(200);
  res.send("Hello Express~");
});

app.get("/data", async (req, res) => {
  try {
    // 예제 쿼리: users 테이블에서 모든 사용자 정보를 가져오기
    const [rows, fields] = await promisePool.query("SELECT * FROM 1_data");
    res.status(200).json(rows); // 조회된 데이터를 JSON 형식으로 반환
  } catch (err) {
    console.error("An error occurred while querying the database:", err);
    res.status(500).send("An error occurred while querying the database.");
  }
});

app.listen(port, () => {
  console.log(`${port}번 포트에서 서버 실행 중`);
});
