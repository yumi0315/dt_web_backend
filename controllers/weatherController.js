const puppeteer = require("puppeteer");
const asyncHandler = require("express-async-handler");
const cheerio = require("cheerio");

const getWeather = asyncHandler(async (req, res) => {
  try {
    const url = "https://weather.naver.com/today/03310108"; // 거제도 URL

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.waitForSelector("#weekly");

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const weeklyForecasts = [];

    $("#weekly .week_item").each((index, element) => {
      const date = $(element).find(".date").text().trim();

      const weatherData = [];

      $(element)
        .find(".cell_weather .weather_inner")
        .each((i, el) => {
          const timeSlot = $(el).find(".timeslot").text().trim(); // 오전/오후
          const weatherDescription = $(el).find(".weather_text").text().trim(); // 날씨 설명
          const rainfallText = $(el).find(".rainfall").text().trim(); // 강수 확률
          const weatherCode = $(el).attr("data-wetr-cd"); // data-wetr-cd 값

          // 강수 확률에서 숫자만 추출
          const rainfall = parseInt(rainfallText.replace(/[^\d]/g, ""), 10); // 숫자만 추출

          // 온도 정보 추출
          const lowestTempText = $(element)
            .find(".cell_temperature .lowest")
            .text()
            .trim();
          const highestTempText = $(element)
            .find(".cell_temperature .highest")
            .text()
            .trim();

          // 최저, 최고 기온에서 숫자만 추출
          const lowestTemp = parseInt(lowestTempText.replace(/[^\d]/g, ""), 10); // 숫자만 추출
          const highestTemp = parseInt(
            highestTempText.replace(/[^\d]/g, ""),
            10
          ); // 숫자만 추출

          weatherData.push({
            timeSlot,
            weatherDescription,
            rainfall,
            weatherCode,
            temperature: {
              lowest: isNaN(lowestTemp) ? null : lowestTemp, // NaN 방지
              highest: isNaN(highestTemp) ? null : highestTemp,
            },
          });
        });

      // weeklyForecasts 배열에 날짜와 날씨 정보를 추가
      weeklyForecasts.push({
        date,
        weather: weatherData, // 날씨 정보를 배열로 저장
      });
    });

    // JSON 형식으로 응답
    res.json(weeklyForecasts.splice(0, 7));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data");
  }
});

module.exports = { getWeather };
