const asyncHandler = require("express-async-handler");
require("dotenv").config();
const promisePool = require("../config/dbConnect");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// @desc 로그인 처리(액션)
// @route POST /
const loginUser = asyncHandler(async (req, res) => {
  const { id, password: inputPassword } = req.body;

  try {
    const [rows] = await promisePool.query(
      "SELECT id, password, name, position, profile FROM user WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "유저가 존재하지 않습니다." });
    }

    const user = rows[0];

    const isMatch = user.password === inputPassword;
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const { password, ...rest } = user;
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "2h" });

    res.setHeader("Authorization", `Bearer ${token}`);
    res.json(rest);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = loginUser;
