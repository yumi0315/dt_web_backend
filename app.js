const express = require("express");
const app = express();
const port = 3030;

app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: true })); // For URL-encoded payloads

app.use("/", require("./routes/loginRoutes"));
app.use("/api", require("./routes/apiRoutes"));

app.listen(port, () => {
  console.log(`${port}번 포트에서 서버 실행 중`);
});
