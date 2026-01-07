require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   PORT (RENDER SAFE)
========================= */
const PORT = process.env.PORT || 5001;

/* =========================
   API KEYS
========================= */
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WAQI_API_KEY = process.env.WAQI_API_KEY;

if (!OPENWEATHER_API_KEY || !WAQI_API_KEY) {
  console.warn("⚠️ API keys missing. Set them in Render Environment Variables.");
}

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
    {
      params: { token: WAQI_API_KEY }
    }
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
   SMART AQI PICKER
========================= */
async function getBestAQI(lat, lon) {
  try {
    const waqi = await fetchWAQI(lat, lon);
    if (waqi && waqi.aqi) {
      return {
        ...waqi,
        category: category(waqi.aqi),
        advice: advice(waqi.aqi),
        confidence: "Ground station data (WAQI)"
      };
    }
  } catch {}

  const ow = await fetchOpenWeather(lat, lon);
  return {
    ...ow,
    category: category(ow.aqi),
    advice: advice(ow.aqi),
    confidence: "Model + satellite data (OpenWeather)"
  };
}

/* =========================
   AQI API
========================= */
app.get("/aqi", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing latitude or longitude" });
  }

  try {
    const data = await getBestAQI(lat, lon);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch AQI" });
  }
});

/* =========================
   CHATBOT API
========================= */
app.post("/chat", async (req, res) => {
  const { message, step, lat, lon } = req.body;
  const msg = (message || "").toLowerCase();

  if (!step || step === "start") {
    return res.json({
      reply:
        "Hi! What do you want to check?\n" +
        "1. Air Quality\n" +
        "2. Health advice\n" +
        "3. Best time to go out",
      nextStep: "choose"
    });
  }

  if (step === "choose") {
    const data = await getBestAQI(lat, lon);

    if (msg === "1" || msg.includes("air")) {
      return res.json({
        reply:
          `AQI: ${data.aqi} (${data.category})\n` +
          `PM2.5: ${data.pm25}\nPM10: ${data.pm10}\n` +
          `Source: ${data.source}`,
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
      return res.json({
        reply:
          data.aqi <= 100
            ? "You can go out anytime today."
            : data.aqi <= 200
            ? "Early morning or late evening is safer."
            : "Avoid going out today.",
        nextStep: "choose"
      });
    }
  }

  res.json({
    reply: "Please choose 1, 2, or 3.",
    nextStep: "choose"
  });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`🤖 Chatbot server running on port ${PORT}`);
});
