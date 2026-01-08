/**********************************
 * ENV & IMPORTS
 **********************************/
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

// node-fetch dynamic import (safe for Node 18+)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5001;

/**********************************
 * MIDDLEWARE
 **********************************/
app.use(cors());
app.use(express.json());

/**********************************
 * API KEYS
 **********************************/
const WAQI_KEY = process.env.WAQI_API_KEY;
const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

if (!WAQI_KEY || !OPENWEATHER_KEY) {
  console.warn("⚠️ API keys missing. Server running in limited mode.");
}

/**********************************
 * ROOT ROUTE (RENDER HEALTH CHECK)
 **********************************/
app.get("/", (req, res) => {
  res.send("AQI Health Backend Running");
});

/**********************************
 * HELPERS
 **********************************/
function getAQILevel(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Poor";
  if (aqi <= 200) return "Very Poor";
  return "Severe";
}

function generateAdvice(aqiLevel, age, disease, sensitivity) {
  let reason = `This health advisory is generated based on ${aqiLevel.toLowerCase()} air quality and your personal health profile.`;
  let explanation = "";
  let dos = [];
  let donts = [];

  if (age < 12)
    explanation += "Children are especially sensitive to air pollution. ";
  else if (age >= 60)
    explanation += "Older adults face higher health risks from polluted air. ";
  else
    explanation += "Adults may tolerate mild pollution, but prolonged exposure can still affect health. ";

  if (disease === "asthma") {
    explanation += "Asthma increases the risk of breathing discomfort. ";
    dos.push("Keep prescribed inhalers accessible.");
    donts.push("Avoid smoke and dust.");
  }

  if (disease === "heart") {
    explanation += "Heart conditions may worsen with poor air quality. ";
    dos.push("Monitor physical exertion carefully.");
    donts.push("Avoid strenuous outdoor activity.");
  }

  if (disease === "allergy") {
    explanation += "Pollution can intensify allergy symptoms. ";
    dos.push("Wear a mask in dusty or pollen-heavy areas.");
    donts.push("Avoid allergen-heavy zones.");
  }

  if (sensitivity === "high") {
    explanation += " High sensitivity suggests symptoms may appear quickly.";
  }

  if (aqiLevel === "Severe") {
    dos.push("Stay indoors except for essential needs.");
    dos.push("Seek medical advice if symptoms appear.");
    donts.push("Avoid all outdoor exposure.");
  }

  return { reason, explanation, dos, donts };
}

/**********************************
 * FETCH BEST AQI (WAQI → FALLBACK)
 **********************************/
async function fetchBestAQI(lat, lon) {
  // 1️⃣ WAQI (nearest station)
  try {
    const waqiRes = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_KEY}`
    );
    const waqiJson = await waqiRes.json();

    if (waqiJson.status === "ok" && waqiJson.data?.aqi) {
      return {
        aqi: waqiJson.data.aqi,
        source: "WAQI",
        station: waqiJson.data.city?.name || "Nearest WAQI station",
      };
    }
  } catch (err) {
    console.error("WAQI error:", err.message);
  }

  // 2️⃣ OpenWeather fallback
  try {
    const owRes = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`
    );
    const owJson = await owRes.json();

    if (owJson.list?.length) {
      return {
        aqi: owJson.list[0].main.aqi * 50,
        source: "OpenWeather",
        station: "Model-based grid",
      };
    }
  } catch (err) {
    console.error("OpenWeather error:", err.message);
  }

  return null;
}

/**********************************
 * GET: AI HEALTH ADVICE
 **********************************/
app.get("/health-risk", async (req, res) => {
  const { lat, lon, age = 25, disease = "none", sensitivity = "medium" } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing latitude or longitude" });
  }

  const aqiData = await fetchBestAQI(lat, lon);

  if (!aqiData) {
    return res.status(500).json({ error: "AQI data unavailable" });
  }

  const aqiLevel = getAQILevel(aqiData.aqi);
  const advice = generateAdvice(aqiLevel, Number(age), disease, sensitivity);

  res.json({
    aqi: aqiData.aqi,
    aqiLevel,
    sourceUsed: aqiData.source,
    stationUsed: aqiData.station,
    reason: advice.reason,
    explanation: advice.explanation,
    dos: advice.dos,
    donts: advice.donts,
  });
});

/**********************************
 * POST: HEALTH RISK ANALYSIS
 **********************************/
app.post("/health/analyze", async (req, res) => {
  const { lat, lon, age = 25, condition = "none", sensitivity = "medium" } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }

  try {
    const aqiRes = await axios.get(
      "https://api.openweathermap.org/data/2.5/air_pollution",
      {
        params: {
          lat,
          lon,
          appid: OPENWEATHER_KEY,
        },
      }
    );

    const aqi = aqiRes.data.list[0].main.aqi; // 1–5 scale

    let score = 0;

    if (aqi >= 4) score += 2;
    else if (aqi === 3) score += 1;

    if (age > 50) score += 2;
    else if (age >= 30) score += 1;

    if (condition === "heart") score += 2;
    else if (condition === "asthma" || condition === "allergy") score += 1;

    if (sensitivity === "high") score += 2;
    else if (sensitivity === "medium") score += 1;

    let riskLevel = "Low Risk";
    if (score >= 6) riskLevel = "High Risk";
    else if (score >= 3) riskLevel = "Moderate Risk";

    res.json({
      aqi,
      score,
      riskLevel,
      alerts: [
        "Avoid outdoor travel during peak pollution hours",
        "Wear a mask if AQI is poor",
        "Prefer green and low-traffic routes",
        "Stay hydrated and take breaks",
      ],
    });
  } catch (error) {
    console.error("Health analyze error:", error.message);
    res.status(500).json({ error: "AQI analysis failed" });
  }
});

/**********************************
 * START SERVER
 **********************************/
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
