const asyncHandler = require("express-async-handler");
require("dotenv").config();

const getNews = asyncHandler(async (req, res) => {
  const api_url =
    "https://openapi.naver.com/v1/search/news.json?query=" +
    encodeURI("삼성중공업");

  console.log(process.env.client_id);
  console.log(process.env.client_secret);

  try {
    const response = await fetch(api_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Naver-Client-Id": process.env.client_id,
        "X-Naver-Client-Secret": process.env.client_secret,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

module.exports = { getNews };
