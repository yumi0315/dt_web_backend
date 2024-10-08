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
              AND proj = ?
      ORDER BY         
              CAST(SUBSTRING(draw_name, 6) AS UNSIGNED)
              `,
      [proj]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getChart2 = asyncHandler(async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `
      SELECT
          proj,
          stat,
          COUNT(*) AS stat_count,
          ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY proj)), 2) AS stat_percent
      FROM 
          design_change_request
      GROUP BY 
          proj, stat
      `
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getTable2 = asyncHandler(async (req, res) => {
  const { proj } = req.params;
  try {
    const [rows] = await promisePool.query(
      `
      SELECT 
          reg_type, ECN_No, stat, request_dep, urg, import, action_dep
      FROM 
          design_change_request
      where
          proj = ?
      `,
      [proj]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
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
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getChart5 = asyncHandler(async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `
     SELECT 
        dr.welding_meth, 
        dr.defect_count, 
        dr.total_count,
        round(dr.defect_rate, 2) AS 'def_rate', 
        dc.dep,
        dc.dep_defect_count,  -- 부서별 defect_count
    tc.dep_total_count,  -- 부서별 total_count
        round((dc.dep_defect_count * 100.0 / tc.dep_total_count), 2) AS 'dep_def_rate',  -- 부서별 defect 비율
        C1, C2, C3, C4, C5
    FROM 
        (
            -- 용접 방법별 defect_count와 total_count 계산
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
            -- 부서별 용접 방법별 defect_count 계산
            SELECT 
                welding_meth,
                dep,
                COUNT(*) AS dep_defect_count,
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
            -- 부서별 용접 방법별 total_count 계산
            SELECT 
                welding_meth,
                dep,
                COUNT(*) AS dep_total_count
            FROM 
                samsung_heavy_industry.welding_defect_rate
            GROUP BY 
                welding_meth, dep
        ) tc ON dc.welding_meth = tc.welding_meth AND dc.dep = tc.dep
    ORDER BY 
        dr.welding_meth, dc.dep
      `
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  getImage,
  getChart1,
  getChart3,
  getChart2,
  getTable2,
  getChart5,
};
