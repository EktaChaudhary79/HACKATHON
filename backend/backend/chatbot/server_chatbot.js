/***********************
 * IMPORTS & CONFIG
 ***********************/
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

/***********************
 * APP INIT
 ***********************/
const app = express();

// ✅ IMPORTANT: Render uses process.env.PORT
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

/***********************
 * HOME ROUTE
 ***********************/
app.get("/", (req, res) => {
  res.send("Chatbot backend is running 🚀");
});

/***********************
 * HELPERS
 ***********************/
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
  const map = { 1: 25, 2: 75, 3: 150, 4: 250, 5: 350 };
  return map[aqi] || null;
}

/***********************
 * OPENWEATHER AQI
 ***********************/
async function fetchOpenWeather(lat, lon) {
  const response = await axios.get(
    "https://api.openweathermap.org/data/2.5/air_pollution",
    {
      params: {
        lat,
        lon,
        appid: process.env.API_KEY
      }
    }
  );

  const data = response.data.list[0];

  return {
    aqi: owAqiToReal(data.main.aqi),
    pm25: data.components.pm2_5,
    pm10: data.components.pm10,
    source: "OpenWeather"
  };
}

/***********************
 * WAQI AQI
 ***********************/
async function fetchWAQI(lat, lon) {
  const response = await axios.get(
    `https://api.waqi.info/feed/geo:${lat};${lon}/`,
    {
      params: {
        token: process.env.WAQI_TOKEN
      }
    }
  );

  if (response.data.status !== "ok") return null;

  const data = response.data.data;

  return {
    aqi: data.aqi,
    pm25: data.iaqi?.pm25?.v ?? null,
    pm10: data.iaqi?.pm10?.v ?? null,
    source: "WAQI"
  };
}

/***********************
 * SMART AQI SELECTION
 ***********************/
async function getBestAQI(lat, lon) {
  const ow = await fetchOpenWeather(lat, lon);
  const waqi = await fetchWAQI(lat, lon);

  if (waqi && waqi.aqi && waqi.aqi > 0) {
    return {
      ...waqi,
      category: category(waqi.aqi),
      advice: advice(waqi.aqi),
      confidence: "Ground station data (WAQI)"
    };
  }

  return {
    ...ow,
    category: category(ow.aqi),
    advice: advice(ow.aqi),
    confidence: "Satellite + model data (OpenWeather)"
  };
}

/***********************
 * AQI API
 ***********************/
app.get("/aqi", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }

  try {
    const data = await getBestAQI(lat, lon);
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch AQI" });
  }
});

/***********************
 * CHATBOT API
 ***********************/
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
    if (!lat || !lon) {
      return res.json({
        reply: "Please allow location access to continue.",
        nextStep: "choose"
      });
    }

    const data = await getBestAQI(lat, lon);

    if (msg === "1" || msg.includes("air")) {
      return res.json({
        reply:
          `AQI near you: ${data.aqi} (${data.category})\n` +
          `PM2.5: ${data.pm25}\n` +
          `PM10: ${data.pm10}\n` +
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
      const timeAdvice =
        data.aqi <= 100
          ? "You can go out anytime today."
          : data.aqi <= 200
          ? "Early morning or late evening is safer."
          : "Avoid going out today.";

      return res.json({
        reply: timeAdvice,
        nextStep: "choose"
      });
    }
  }

  res.json({
    reply: "Please choose 1, 2, or 3.",
    nextStep: "choose"
  });
});

/***********************
 * START SERVER
 ***********************/
/***********************
 * START SERVER
 ***********************/
// Use 0.0.0.0 to ensure the server is accessible externally on Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

