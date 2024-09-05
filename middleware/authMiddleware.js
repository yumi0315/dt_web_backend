const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // 'Bearer <token>'에서 <token> 부분만 추출

  if (token == null) return res.sendStatus(401); // 토큰이 없으면 401 Unauthorized 응답

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // 토큰이 유효하지 않으면 403 Forbidden 응답
    req.user = user; // 사용자 정보를 요청 객체에 추가
    next(); // 다음 미들웨어로 이동
  });
};

module.exports = authenticateJWT;
