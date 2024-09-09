const express = require("express");
const app = express();
const cors = require("cors");
const port = 3030;

app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: true })); // For URL-encoded payloads

app.use(
  cors({
    origin: "*", // 모든 출처 허용 옵션. true를 써도 된다.
  })
);

app.use("/", require("./routes/loginRoutes"));
app.use("/api", require("./routes/apiRoutes"));

app.listen(port, () => {
  console.log(`${port}번 포트에서 서버 실행 중`);
});
