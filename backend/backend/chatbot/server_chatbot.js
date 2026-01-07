require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;

/* =========================
   HELPERS
========================= */

function category(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Very Poor";
  return "Severe";
}

function advice(aqi) {
  if (aqi <= 50) return "Air quality is safe.";
  if (aqi <= 100) return "Sensitive people should be careful.";
  if (aqi <= 200) return "Reduce outdoor activities.";
  if (aqi <= 300) return "Avoid outdoor activities.";
  return "Stay indoors and avoid exposure.";
}

function owAqiToReal(aqi) {
  return { 1: 25, 2: 75, 3: 150, 4: 250, 5: 350 }[aqi];
}

/* =========================
   OPENWEATHER AQI
========================= */
async function fetchOpenWeather(lat, lon) {
  const r = await axios.get(
    "https://api.openweathermap.org/data/2.5/air_pollution",
    { params: { lat, lon, appid: process.env.API_KEY } }
  );

  const d = r.data.list[0];

  return {
    aqi: owAqiToReal(d.main.aqi),
    pm25: d.components.pm2_5,
    pm10: d.components.pm10,
    source: "OpenWeather"
  };
}

/* =========================
   WAQI AQI (NEAREST STATION)
========================= */
async function fetchWAQI(lat, lon) {
  const r = await axios.get(
    "https://api.waqi.info/feed/geo:" + lat + ";" + lon + "/",
    { params: { token: process.env.WAQI_TOKEN } }
  );

  if (r.data.status !== "ok") return null;

  const d = r.data.data;

  return {
    aqi: d.aqi,
    pm25: d.iaqi?.pm25?.v ?? null,
    pm10: d.iaqi?.pm10?.v ?? null,
    distance: d.city?.geo ? "nearest station" : "unknown",
    source: "WAQI"
  };
}

/* =========================
   SMART AQI DECISION
========================= */
async function getBestAQI(lat, lon) {
  const ow = await fetchOpenWeather(lat, lon);
  const waqi = await fetchWAQI(lat, lon);

  // Prefer WAQI if available
  if (waqi && waqi.aqi && waqi.aqi > 0) {
    return {
      ...waqi,
      category: category(waqi.aqi),
      advice: advice(waqi.aqi),
      confidence: "Ground station data (WAQI)"
    };
  }

  // Fallback to OpenWeather
  return {
    ...ow,
    category: category(ow.aqi),
    advice: advice(ow.aqi),
    confidence: "Satellite + model data (OpenWeather)"
  };
}

/* =========================
   AQI API
========================= */
app.get("/aqi", async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const data = await getBestAQI(lat, lon);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch AQI" });
  }
});

/* =========================
   CHATBOT
========================= */
app.post("/chat", async (req, res) => {
  const { message, step, lat, lon } = req.body;
  const msg = (message || "").toLowerCase();

  if (!step || step === "start") {
    return res.json({
      reply:
        "Hi! What do you want to check?\n" +
        "1. Air Quality\n2. Health advice\n3. Best time to go out",
      nextStep: "choose"
    });
  }

  if (step === "choose") {
    const data = await getBestAQI(lat, lon);

    if (msg === "1" || msg.includes("air")) {
      return res.json({
        reply:
          `AQI near you: ${data.aqi} (${data.category})\n` +
          `PM2.5: ${data.pm25}\nPM10: ${data.pm10}\n` +
          `Source: ${data.source}\n` +
          `Confidence: ${data.confidence}`,
        nextStep: "choose"
      });
    }

    if (msg === "2" || msg.includes("health")) {
      return res.json({
        reply: "Health advice: " + data.advice,
        nextStep: "choose"
      });
    }

    if (msg === "3" || msg.includes("best")) {
      const time =
        data.aqi <= 100
          ? "You can go out anytime today."
          : data.aqi <= 200
          ? "Early morning or late evening is safer."
          : "Avoid going out today.";

      return res.json({
        reply: time,
        nextStep: "choose"
      });
    }
  }

  res.json({
    reply: "Please choose 1, 2, or 3.",
    nextStep: "choose"
  });
});

/* ========================= */
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
