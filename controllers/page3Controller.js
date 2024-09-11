const asyncHandler = require("express-async-handler");
const promisePool = require("../config/dbConnect");

const getTable4 = asyncHandler(async (req, res) => {
  const { proj, date } = req.body;
  try {
    const [rows] = await promisePool.query(
      `
        SELECT 
            dp_bom_desc,
            COUNT(work_plan) AS Plan_count,
            SUM(CASE WHEN work_perform <= ? THEN 1 ELSE 0 END) AS Completed_Tasks,
            ROUND((SUM(CASE WHEN work_perform <= ? THEN 1 ELSE 0 END) * 100.0 / COUNT(work_plan)), 2) AS "Achievement_Rate"
        FROM 
            structural_production_structure
        WHERE 
            proj = ?
        GROUP BY 
            dp_bom_desc
        UNION ALL
        SELECT 
            'Total' AS dp_bom_desc,
            SUM(Plan_count) AS Plan_count,
            SUM(Completed_Tasks) AS Completed_Tasks,
            ROUND((SUM(Completed_Tasks) * 100.0 / SUM(Plan_count)), 2) AS "Achievement_Rate"
        FROM (
            SELECT 
                dp_bom_desc,
                COUNT(work_plan) AS Plan_count,
                SUM(CASE WHEN work_perform < ? THEN 1 ELSE 0 END) AS Completed_Tasks
            FROM 
                structural_production_structure
            WHERE 
                proj = ?
            GROUP BY 
                dp_bom_desc
        ) AS subquery
        ORDER BY 
            dp_bom_desc
        `,
      [date, date, proj, date, proj]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getChart4 = asyncHandler(async (req, res) => {
  const { proj, date } = req.body;
  try {
    const [rows] = await promisePool.query(
      `
        SELECT 
            respon_dep, 
            COUNT(work_plan) AS Plan_count,
            SUM(CASE WHEN work_perform <= ? THEN 1 ELSE 0 END) AS Completed_Tasks,
            ROUND((SUM(CASE WHEN work_perform <= ? THEN 1 ELSE 0 END) * 100.0 / COUNT(work_plan)), 2) AS "Achievement_Rate"
        FROM 
            structural_production_structure
        WHERE 
            proj = ?
        GROUP BY 
            respon_dep
        UNION ALL
        SELECT 
            'Total' AS respon_dep,
            SUM(Plan_count) AS Plan_count,
            SUM(Completed_Tasks) AS Completed_Tasks,
            ROUND((SUM(Completed_Tasks) * 100.0 / SUM(Plan_count)), 2) AS "Achievement_Rate"
        FROM (
            SELECT 
                respon_dep,
                COUNT(work_plan) AS Plan_count,
                SUM(CASE WHEN work_perform <= ? THEN 1 ELSE 0 END) AS Completed_Tasks
            FROM 
                structural_production_structure
            WHERE 
                proj = ?
            GROUP BY 
                respon_dep
        ) AS subquery
        ORDER BY 
            respon_dep
        `,
      [date, date, proj, date, proj]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { getTable4, getChart4 };
