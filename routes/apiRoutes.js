const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authMiddleware");

const {
  getImage,
  getChart1,
  getChart2,
} = require("../controllers/apiController");

// router.use(authenticateJWT);
router.route("/image").get(getImage);
router.route("/chart1/:proj").get(getChart1);
router.route("/chart2").get(getChart2);

module.exports = router;
