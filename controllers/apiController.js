const asyncHandler = require("express-async-handler");
const promisePool = require("../config/dbConnect");
const path = require("path");
const fs = require("fs");

const getImage = asyncHandler(async (req, res) => {
  const { filename } = req.body;

  const imagePath = path.join(__dirname, "..", "images", filename);
  console.log(imagePath);

  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    res.sendFile(imagePath);
  });
});

const getChart1 = asyncHandler(async (req, res) => {
  try {
    const { proj } = req.params;

    const [rows] = await promisePool.query(
      `SELECT
          draw_name,
          disp_date,
          disp_num,
          code_name
      FROM (
              SELECT
                        proj,
                        draw_name,
                        disp_date,
                        disp_num,
                        code_name,
                        ROW_NUMBER() OVER (PARTITION BY proj,draw_name ORDER BY disp_date DESC, disp_num DESC) AS rn
              FROM
                        revision_status
            ) AS ranked
      WHERE
              rn = 1
              AND proj = ?`,
      [proj]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getChart2 = asyncHandler(async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `
      SELECT 
            proj, 
            COUNT(CASE WHEN stat = "완료" THEN 1 END) AS complete_count,
            ROUND((COUNT(CASE WHEN stat = "완료" THEN 1 END) / COUNT(*))*100,2) AS total_per,
            COUNT(*) AS total_count
      FROM design_change_request
      GROUP BY proj
      `
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { getImage, getChart1, getChart2 };
