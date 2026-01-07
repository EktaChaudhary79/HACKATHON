require("dotenv").config();
const express = require("express");

/* REQUIRED FOR FETCH IN NODE */
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 5001;

console.log("SERVER FILE STARTED");

/* =========================
   BASIC ROOT CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

/* =========================
   AQI LEVEL HELPER
========================= */
function getAQILevel(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Poor";
  if (aqi <= 200) return "Very Poor";
  return "Severe";
}

/* =========================
   PERSONALISED ADVICE
========================= */
function generateAdvice(aqiLevel, age, disease, sensitivity) {
  let reason =
    `This health advisory is generated based on ${aqiLevel.toLowerCase()} air quality and your personal health profile.`;

  let explanation = "";
  let dos = [];
  let donts = [];

  if (age < 12) {
    explanation += "Children are more sensitive to air pollution. ";
  } else if (age >= 60) {
    explanation += "Older adults are more vulnerable to polluted air. ";
  } else {
    explanation += "Adults may tolerate mild pollution, but prolonged exposure can affect health. ";
  }

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
    dos.push("Wear a mask in dusty environments.");
    donts.push("Avoid allergen-heavy areas.");
  }

  if (sensitivity === "high") {
    explanation += "High sensitivity suggests symptoms may appear quickly.";
  }

  if (aqiLevel === "Severe") {
    dos.push("Stay indoors except for essential needs.");
    dos.push("Seek medical advice if symptoms appear.");
    donts.push("Avoid all outdoor exposure.");
  }

  return { reason, explanation, dos, donts };
}

/* =========================
   MAIN API
========================= */
app.get("/health-risk", async (req, res) => {
  const { lat, lon, age = 25, disease = "none", sensitivity = "medium" } = req.query;

  if (!lat || !lon) {
    return res.json({ error: "Missing latitude or longitude" });
  }

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    const aqi = data.list[0].main.aqi * 50;
    const aqiLevel = getAQILevel(aqi);

    const advice = generateAdvice(
      aqiLevel,
      Number(age),
      disease,
      sensitivity
    );

    res.json({
      aqi,
      aqiLevel,
      reason: advice.reason,
      explanation: advice.explanation,
      dos: advice.dos,
      donts: advice.donts
    });
  } catch (err) {
    console.error(err);
    res.json({ error: "Failed to fetch AQI data" });
  }
});

/* =========================
   THIS WAS MISSING
========================= */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log("END OF FILE REACHED");
