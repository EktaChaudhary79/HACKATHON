const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

/* =========================
   AQI CATEGORY
========================= */
function getAQICategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Unhealthy";
  if (aqi <= 400) return "Severe";
  return "Hazardous";
}

/* =========================
   WEATHER
========================= */
async function getWeather(lat, lon) {
  const res = await axios.get(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: {
        lat,
        lon,
        units: "metric",
        appid: process.env.API_KEY
      }
    }
  );

  return {
    temperature: res.data.main.temp,
    humidity: res.data.main.humidity,
    windSpeed: res.data.wind.speed,
    condition: res.data.weather[0].main
  };
}

/* =========================
   GEOCODING (ADDRESS → LAT/LON)
========================= */
async function geocodeAddress(address) {
  let res = await axios.get(
    "https://api.openweathermap.org/geo/1.0/direct",
    {
      params: {
        q: address,
        limit: 5,
        appid: process.env.API_KEY
      }
    }
  );

  // fallback → last word + India
  if (!res.data || res.data.length === 0) {
    const parts = address.split(" ");
    const city = parts[parts.length - 1];

    res = await axios.get(
      "https://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: `${city},IN`,
          limit: 5,
          appid: process.env.API_KEY
        }
      }
    );
  }

  if (!res.data || res.data.length === 0) {
    throw new Error("Location not found");
  }

  return {
    lat: res.data[0].lat,
    lon: res.data[0].lon,
    name: `${res.data[0].name}, ${res.data[0].state || ""}, ${res.data[0].country}`
  };
}

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("✅ Aeroway Backend Running");
});

/* =========================
   🔥 AQI BY GEO LOCATION (CORRECT METHOD)
========================= */
app.get("/aqi/nearest", async (req, res) => {
  const address = req.query.q;

  if (!address) {
    return res.status(400).json({ error: "Address required" });
  }

  try {
    // 1️⃣ Address → Lat/Lon
    const location = await geocodeAddress(address);

    // 2️⃣ AQI using GEO (THIS FIXES YOUR ISSUE)
    const aqiRes = await axios.get(
      `https://api.waqi.info/feed/geo:${location.lat};${location.lon}/`,
      {
        params: {
          token: process.env.WAQI_TOKEN
        }
      }
    );

    const aqiData = aqiRes.data.data;

    if (!aqiData || aqiData.aqi === "-" || aqiData.aqi == null) {
      return res.status(404).json({ error: "AQI data not available" });
    }

    // 3️⃣ Weather
    const weather = await getWeather(
      location.lat,
      location.lon
    );

    // 4️⃣ Response
    res.json({
      searchedAddress: address,
      resolvedLocation: location.name,

      station: {
        name: aqiData.city.name
      },

      aqi: {
        value: aqiData.aqi,
        category: getAQICategory(aqiData.aqi)
      },

      pollutants: {
        pm25: aqiData.iaqi?.pm25?.v ?? null,
        pm10: aqiData.iaqi?.pm10?.v ?? null,
        no2: aqiData.iaqi?.no2?.v ?? null,
        so2: aqiData.iaqi?.so2?.v ?? null,
        co: aqiData.iaqi?.co?.v ?? null,
        o3: aqiData.iaqi?.o3?.v ?? null
      },

      weather
    });

  } catch (err) {
    console.error("AQI Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get("/aqi/history", async (req, res) => {
  try {
    // 1️⃣ Read query params
    const city = req.query.city;
    const days = req.query.days || 7;

    // 2️⃣ Validate input
    if (!city) {
      return res.status(400).json({
        error: "City is required"
      });
    }

    // 3️⃣ Mock historical data
    const history = [
      { date: "2025-12-30", aqi: 180 },
      { date: "2025-12-31", aqi: 165 },
      { date: "2026-01-01", aqi: 210 },
      { date: "2026-01-02", aqi: 190 },
      { date: "2026-01-03", aqi: 175 }
    ];

    // 4️⃣ Send structured response
    res.json({
      city,
      days,
      history
    });

  } catch (err) {
    console.error("AQI History Error:", err.message);
    res.status(500).json({
      error: "Failed to fetch AQI history"
    });
  }
});

/* =========================
   SERVER START
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
