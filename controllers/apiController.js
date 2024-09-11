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

const getChart3 = asyncHandler(async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `
      SELECT 
    dp_bom_desc,
    COUNT(work_plan) AS Plan_count,
    SUM(CASE WHEN work_perform < '2014-07-01' THEN 1 ELSE 0 END) AS Completed_Tasks,
    ROUND((SUM(CASE WHEN work_perform < '2014-07-01' THEN 1 ELSE 0 END) * 100.0 / COUNT(work_plan)), 2) AS "Achievement_Rate(%)"
FROM 
    structural_production_structure
WHERE 
    proj = 'P1'
GROUP BY 
    dp_bom_desc

UNION ALL

SELECT 
    'Total' AS dp_bom_desc,
    SUM(Plan_count) AS Plan_count,
    SUM(Completed_Tasks) AS Completed_Tasks,
    ROUND((SUM(Completed_Tasks) * 100.0 / SUM(Plan_count)), 2) AS "Achievement_Rate(%)"
FROM (
    SELECT 
        dp_bom_desc,
        COUNT(work_plan) AS Plan_count,
        SUM(CASE WHEN work_perform < '2014-07-01' THEN 1 ELSE 0 END) AS Completed_Tasks
    FROM 
        structural_production_structure
    WHERE 
        proj = 'P1'
    GROUP BY 
        dp_bom_desc
) AS subquery
ORDER BY 
    dp_bom_desc;
      `
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getChart5 = asyncHandler(async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `
      SELECT 
          dr.welding_meth, dr.defect_count, dr.total_count,
          round(dr.defect_rate, 2) AS 'def_rate', dc.dep,
          round((dc.dep_count * 100.0 / tc.total_count),2) AS 'dep_def_rate',
          C1, C2, C3, C4, C5
      FROM 
          (
              SELECT 
                  welding_meth,
                  SUM(CASE WHEN usage_decision = '보류' THEN 1 ELSE 0 END) AS defect_count,
                  COUNT(*) AS total_count,
                  (SUM(CASE WHEN usage_decision = '보류' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS defect_rate
              FROM 
                  samsung_heavy_industry.welding_defect_rate
              GROUP BY 
                  welding_meth
          ) dr
      LEFT JOIN 
          (
              SELECT 
                  welding_meth,
                  dep,
                  COUNT(*) AS dep_count,
                  sum(CASE WHEN reason_code = 'C1' THEN 1 ELSE 0 END) as C1,
                  sum(CASE WHEN reason_code = 'C2' THEN 1 ELSE 0 END) as C2,
                  sum(CASE WHEN reason_code = 'C3' THEN 1 ELSE 0 END) as C3,
                  sum(CASE WHEN reason_code = 'C4' THEN 1 ELSE 0 END) as C4,
                  sum(CASE WHEN reason_code = 'C5' THEN 1 ELSE 0 END) as C5
              FROM 
                  samsung_heavy_industry.welding_defect_rate
              WHERE 
                  usage_decision = '보류'
              GROUP BY 
                  welding_meth, dep
          ) dc ON dr.welding_meth = dc.welding_meth
      LEFT JOIN 
          (
              SELECT 
                  welding_meth,
                  COUNT(*) AS total_count
              FROM 
                  samsung_heavy_industry.welding_defect_rate
              WHERE 
                  usage_decision = '보류'
              GROUP BY 
                  welding_meth
          ) tc ON dc.welding_meth = tc.welding_meth
      ORDER BY 
          dr.welding_meth, dep_def_rate desc, dc.dep
      `
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { getImage, getChart1, getChart3, getChart2, getChart5 };
