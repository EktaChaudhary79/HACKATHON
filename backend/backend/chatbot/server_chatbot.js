require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Render injects PORT automatically
const PORT = process.env.PORT || 5001;

// ================= API KEYS =================
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WAQI_API_KEY = process.env.WAQI_API_KEY;

// ================= HELPERS =================
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

// ================= AQI FETCH =================
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

async function fetchWAQI(lat, lon) {
  const res = await axios.get(
    `https://api.waqi.info/feed/geo:${lat};${lon}/`,
    {
      params: {
        token: WAQI_API_KEY
      }
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

async function getBestAQI(lat, lon) {
  try {
    const waqi = await fetchWAQI(lat, lon);
    if (waqi) {
      return {
        ...waqi,
        category: category(waqi.aqi),
        advice: advice(waqi.aqi)
      };
    }
  } catch (err) {
    console.log("WAQI failed, fallback to OpenWeather");
  }

  const ow = await fetchOpenWeather(lat, lon);
  return {
    ...ow,
    category: category(ow.aqi),
    advice: advice(ow.aqi)
  };
}

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.send("AQI Chatbot Backend Running");
});

app.get("/aqi", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon" });
  }

  try {
    const data = await getBestAQI(lat, lon);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch AQI" });
  }
});

app.post("/chat", async (req, res) => {
  const { message, lat, lon } = req.body;

  if (!lat || !lon) {
    return res.json({
      reply: "Location is required to check air quality."
    });
  }

  const msg = (message || "").toLowerCase();
  const data = await getBestAQI(lat, lon);

  if (msg.includes("air")) {
    return res.json({
      reply: `Current AQI is ${data.aqi} (${data.category}) from ${data.source}.`
    });
  }

  if (msg.includes("health")) {
    return res.json({
      reply: data.advice
    });
  }

  if (msg.includes("best time")) {
    return res.json({
      reply:
        data.aqi <= 100
          ? "Morning hours are relatively safer."
          : "Avoid going out unless necessary."
    });
  }

  res.json({
    reply:
      "Ask me about:\n• Air quality\n• Health advice\n• Best time to go out"
  });
});

// ================= START SERVER =================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
