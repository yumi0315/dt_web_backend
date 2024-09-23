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

const {
  page3Table,
  page3Chart,
  page4Table,
  page4Chart,
} = require("../controllers/page34Controller");

const {
  page5table2,
  page5chart2,
  page5table3,
  page6Table,
} = require("../controllers/page56Controller");

const { getWeather } = require("../controllers/weatherController");

const { getNews } = require("../controllers/newsController");

// router.use(authenticateJWT);
router.route("/image").get(getImage);
router.route("/chart1/:proj").get(getChart1);
router.route("/chart2").get(getChart2);
router.route("/table2/:proj").get(getTable2);
router.route("/chart3").get(getChart3);
router.route("/chart5").get(getChart5);

router.route("/page3/table").post(page3Table);
router.route("/page3/chart").post(page3Chart);

router.route("/page4/table").post(page4Table);
router.route("/page4/chart").post(page4Chart);

router.route("/page5/table2").get(page5table2);
router.route("/page5/chart2").get(page5chart2);
router.route("/page5/table3").get(page5table3);

router.route("/page6/table").post(page6Table);

router.route("/weather").get(getWeather);

router.route("/news").get(getNews);

module.exports = router;
