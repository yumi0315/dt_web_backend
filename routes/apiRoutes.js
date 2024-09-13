const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authMiddleware");

const {
  getImage,
  getChart1,
  getChart2,
  getTable2,
  getChart3,
  getChart5,
} = require("../controllers/apiController");

const { getTable4, getChart4 } = require("../controllers/page3Controller");

const {
  page5table2,
  page5chart2,
  page5table3,
} = require("../controllers/page5Controller");

// router.use(authenticateJWT);
router.route("/image").get(getImage);
router.route("/chart1/:proj").get(getChart1);
router.route("/chart2").get(getChart2);
router.route("/table2/:proj").get(getTable2);
router.route("/chart3").get(getChart3);
router.route("/chart5").get(getChart5);

router.route("/page3/table").post(getTable4);
router.route("/page3/chart").post(getChart4);

router.route("/page5/table2").get(page5table2);
router.route("/page5/chart2").get(page5chart2);
router.route("/page5/table3").get(page5table3);

module.exports = router;
