const asyncHandler = require("express-async-handler");
const promisePool = require("../config/dbConnect");

const page3Table = asyncHandler(async (req, res) => {
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
                SUM(CASE WHEN work_perform <= ? THEN 1 ELSE 0 END) AS Completed_Tasks
            FROM 
                structural_production_structure
            WHERE 
                proj = ?
            GROUP BY 
                dp_bom_desc
        ) AS subquery
        `,
      [date, date, proj, date, proj]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const page3Chart = asyncHandler(async (req, res) => {
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
        `,
      [date, date, proj]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const page4Table = asyncHandler(async (req, res) => {
  const { proj, date } = req.body;
  try {
    const [rows] = await promisePool.query(
      `
        SELECT 
            dp_bom_desc, 
            COUNT(final_poss_date) AS Plan_count,
            SUM(CASE WHEN final_poss_date <= ? THEN 1 ELSE 0 END) AS Completed_Tasks,
            ROUND((SUM(CASE WHEN final_poss_date <= ? THEN 1 ELSE 0 END) * 100.0 / COUNT(final_poss_date)), 2) AS "Achievement_Rate"
        FROM 
            structural_production_outfitting
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
                COUNT(final_poss_date) AS Plan_count,
                SUM(CASE WHEN final_poss_date <= ? THEN 1 ELSE 0 END) AS Completed_Tasks
            FROM 
                structural_production_outfitting
            WHERE 
                proj = ?
            GROUP BY 
                dp_bom_desc
        ) AS subquery
        `,
      [date, date, proj, date, proj]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const page4Chart = asyncHandler(async (req, res) => {
  const { proj, date } = req.body;
  try {
    const [rows] = await promisePool.query(
      `
        SELECT 
            reapon_dep as respon_dep, 
            COUNT(final_poss_date) AS Plan_count,
            SUM(CASE WHEN perform <= ? THEN 1 ELSE 0 END) AS Completed_Tasks,
            ROUND((SUM(CASE WHEN perform <= ? THEN 1 ELSE 0 END) * 100.0 / COUNT(final_poss_date)), 2) AS "Achievement_Rate"
        FROM 
            structural_production_outfitting
        WHERE 
            proj = ?
        GROUP BY 
            reapon_dep
        `,
      [date, date, proj]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { page3Table, page3Chart, page4Table, page4Chart };
