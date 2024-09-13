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

module.exports = { page5table2, page5table3, page5chart2 };
