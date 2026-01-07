require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   PORT (RENDER REQUIRED)
========================= */
const PORT = process.env.PORT || 5001;

/* =========================
   API KEYS
========================= */
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WAQI_API_KEY = process.env.WAQI_API_KEY;

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
  const res = await axios.get(
    "https://api.openweathermap.org/data/2.5/air_pollution",
    {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY
      }
    }
  );

  const d = res.data.list[0];

  return {
    aqi: owAqiToReal(d.main.aqi),
    pm25: d.components.pm2_5,
    pm10: d.components.pm10,
    source: "OpenWeather"
  };
}

/* =========================
   WAQI AQI
========================= */
async function fetchWAQI(lat, lon) {
  const res = await axios.get(
    `https://api.waqi.info/feed/geo:${lat};${lon}/`,
    { params: { token: WAQI_API_KEY } }
  );

  if (res.data.status !== "ok") return null;

  const d = res.data.data;

  return {
    aqi: d.aqi,
    pm25: d.iaqi?.pm25?.v ?? null,
    pm10: d.iaqi?.pm10?.v ?? null,
    source: "WAQI"
  };
}

/* =========================
   BEST AQI PICKER
========================= */
async function getBestAQI(lat, lon) {
  try {
    const waqi = await fetchWAQI(lat, lon);
    if (waqi && waqi.aqi) {
      return {
        ...waqi,
        category: category(waqi.aqi),
        advice: advice(waqi.aqi),
        confidence: "Ground station (WAQI)"
      };
    }
  } catch {}

  const ow = await fetchOpenWeather(lat, lon);
  return {
    ...ow,
    category: category(ow.aqi),
    advice: advice(ow.aqi),
    confidence: "Model data (OpenWeather)"
  };
}

/* =========================
   AQI API
========================= */
app.get("/aqi", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat/lon" });
  }

  try {
    const data = await getBestAQI(lat, lon);
    res.json(data);
  } catch {
    res.status(500).json({ error: "AQI fetch failed" });
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
        "Hi! Choose an option:\n" +
        "1. Air Quality\n" +
        "2. Health Advice\n" +
        "3. Best Time to Go Out",
      nextStep: "choose"
    });
  }

  if (step === "choose") {
    const data = await getBestAQI(lat, lon);

    if (msg === "1") {
      return res.json({
        reply: `AQI: ${data.aqi} (${data.category})`,
        nextStep: "choose"
      });
    }

    if (msg === "2") {
      return res.json({
        reply: data.advice,
        nextStep: "choose"
      });
    }

    if (msg === "3") {
      return res.json({
        reply:
          data.aqi <= 100
            ? "You can go out safely."
            : "Avoid going out today.",
        nextStep: "choose"
      });
    }
  }

  res.json({ reply: "Choose 1, 2, or 3", nextStep: "choose" });
});

/* =========================
   START SERVER (CRITICAL)
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🤖 Chatbot running on port ${PORT}`);
});
