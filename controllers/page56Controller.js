const asyncHandler = require("express-async-handler");
const promisePool = require("../config/dbConnect");

const page5table2 = asyncHandler(async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `
        SELECT 
            vendor_type,
            SUM(CASE WHEN usage_decision = '보류' THEN 1 ELSE 0 END) AS defect_count,
            COUNT(*) AS total_count,
            ROUND((SUM(CASE WHEN usage_decision = '보류' THEN 1 ELSE 0 END)* 100.0 / COUNT(*)), 2) AS defect_rate
        FROM 
            samsung_heavy_industry.welding_defect_rate
        GROUP BY 
            vendor_type
        ORDER BY 
            vendor_type
        `
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const page5table3 = asyncHandler(async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `
        SELECT 
            super_code,
            SUM(CASE WHEN usage_decision = '보류' THEN 1 ELSE 0 END) AS super_code_defect_count,
            COUNT(*) AS super_code_total_count,
            ROUND((SUM(CASE WHEN usage_decision = '보류' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) AS defect_rate
        FROM 
            samsung_heavy_industry.welding_defect_rate
        WHERE 
            vendor_type = 'Vendor'
        GROUP BY 
            super_code
        ORDER BY 
            CAST(SUBSTRING(super_code, 2) AS UNSIGNED)
        `
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const page5chart2 = asyncHandler(async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `
        SELECT 
            type1,
            SUM(CASE WHEN usage_decision = '보류' THEN 1 ELSE 0 END) AS defect_count,
            COUNT(*) AS total_count,
            ROUND((SUM(CASE WHEN usage_decision = '보류' THEN 1 ELSE 0 END)* 100.0 / COUNT(*)), 2) AS defect_rate
        FROM 
            samsung_heavy_industry.welding_defect_rate
        GROUP BY 
            type1
        ORDER BY 
            type1
          `
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const page6Table = asyncHandler(async (req, res) => {
  const { start, end } = req.body;
  try {
    const [rows] = await promisePool.query(
      `
        SELECT 
            vd.dep, 
            COALESCE(ROUND(drd.defect_rate, 2), 0) AS dept_defect_rate,
            COALESCE(ROUND(SUM(CASE WHEN wdr.welding_meth = 'EGFC' THEN 
                (CASE WHEN wdr.usage_decision = '보류' THEN 1 ELSE 0 END) END) * 100.0 / COUNT(wdr.welding_meth), 2), 0) AS EGFC,
            COALESCE(ROUND(SUM(CASE WHEN wdr.welding_meth = 'EGW' THEN 
                (CASE WHEN wdr.usage_decision = '보류' THEN 1 ELSE 0 END) END) * 100.0 / COUNT(wdr.welding_meth), 2), 0) AS EGW,
            COALESCE(ROUND(SUM(CASE WHEN wdr.welding_meth = 'FAW' THEN 
                (CASE WHEN wdr.usage_decision = '보류' THEN 1 ELSE 0 END) END) * 100.0 / COUNT(wdr.welding_meth), 2), 0) AS FAW,
            COALESCE(ROUND(SUM(CASE WHEN wdr.welding_meth = 'FCAW' THEN 
                (CASE WHEN wdr.usage_decision = '보류' THEN 1 ELSE 0 END) END) * 100.0 / COUNT(wdr.welding_meth), 2), 0) AS FCAW,
            COALESCE(ROUND(SUM(CASE WHEN wdr.welding_meth = 'FCSA' THEN 
                (CASE WHEN wdr.usage_decision = '보류' THEN 1 ELSE 0 END) END) * 100.0 / COUNT(wdr.welding_meth), 2), 0) AS FCSA,
            COALESCE(ROUND(SUM(CASE WHEN wdr.welding_meth = 'SAW' THEN 
                (CASE WHEN wdr.usage_decision = '보류' THEN 1 ELSE 0 END) END) * 100.0 / COUNT(wdr.welding_meth), 2), 0) AS SAW,
            vd.작업가능기간_start as start_date,     
            vd.작업가능기간_end as end_date  
        FROM 
            (
                SELECT 
                    dep,
                    GREATEST(dp.start_date, ?) AS 작업가능기간_start,
                    LEAST(dp.end_date, ?) AS 작업가능기간_end
                FROM dep_plan dp
                WHERE dp.start_date <= ? 
                AND dp.end_date >= ?
            ) AS vd
        LEFT JOIN welding_defect_rate wdr 
            ON vd.dep = wdr.dep  
        LEFT JOIN 
            (
                SELECT 
                    dep, 
                    COUNT(*) AS total_records,
                    SUM(CASE WHEN usage_decision = '보류' THEN 1 ELSE 0 END) AS defect_count,
                    ROUND((SUM(CASE WHEN usage_decision = '보류' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS defect_rate
                FROM welding_defect_rate
                GROUP BY dep
            ) AS drd 
            ON vd.dep = drd.dep
        GROUP BY 
            vd.dep, 
            vd.작업가능기간_start, 
            vd.작업가능기간_end, 
            drd.defect_rate
        HAVING 
            dept_defect_rate > 0
        `,
      [start, end, end, start]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { page5table2, page5table3, page5chart2, page6Table };
