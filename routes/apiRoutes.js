const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authMiddleware");

const { getImage } = require("../controllers/apiController");

router.use(authenticateJWT);
router.route("/image").get(getImage);

module.exports = router;
