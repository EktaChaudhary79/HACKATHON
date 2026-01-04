const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

/* =========================
   HELPER: STATE EXTRACTOR
========================= */
function extractState(stationName) {
  if (!stationName) return "Other";

  if (stationName.includes("Delhi")) return "Delhi";
  if (stationName.includes("Maharashtra")) return "Maharashtra";
  if (stationName.includes("Uttar Pradesh")) return "Uttar Pradesh";
  if (stationName.includes("Karnataka")) return "Karnataka";
  if (stationName.includes("Tamil Nadu")) return "Tamil Nadu";
  if (stationName.includes("West Bengal")) return "West Bengal";
  if (stationName.includes("Rajasthan")) return "Rajasthan";
  if (stationName.includes("Gujarat")) return "Gujarat";
  if (stationName.includes("Punjab")) return "Punjab";
  if (stationName.includes("Haryana")) return "Haryana";

  return "Other";
}

/* =========================
   APP SETUP
========================= */
const app = express();
app.use(cors());

const PORT = 5001;

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Backend is working");
});

/* =========================
   AQI BY LAT / LON (OpenWeather)
========================= */
app.get("/aqi", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon required" });
  }

  try {
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

    res.json({
      aqi: data.main.aqi,
      pm25: data.components.pm2_5,
      pm10: data.components.pm10
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch AQI" });
  }
});

/* =========================
   ALL INDIA LIVE AQI (WAQI)
========================= */
app.get("/aqi/india", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.waqi.info/map/bounds/",
      {
        params: {
          latlng: "6.554607,68.111378,35.674545,97.395561",
          token: process.env.WAQI_TOKEN
        }
      }
    );

    res.json(
      response.data.data.map(item => ({
        city: item.station?.name || "Unknown",
        lat: item.lat,
        lon: item.lon,
        aqi: item.aqi
      }))
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch India AQI" });
  }
});

/* =========================
   STATE-WISE AQI (FAST & SAFE)
========================= */
app.get("/aqi/india/states", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.waqi.info/map/bounds/",
      {
        params: {
          latlng: "6.554607,68.111378,35.674545,97.395561",
          token: process.env.WAQI_TOKEN
        }
      }
    );

    const stations = response.data.data;
    const stateData = {};

    stations.forEach(station => {
      const name = station.station?.name || station.city || "";
      const state = extractState(name);

      if (!stateData[state]) {
        stateData[state] = {
          totalAQI: 0,
          count: 0,
          worstAQI: 0
        };
      }

      const aqi = parseInt(station.aqi);
      if (!isNaN(aqi)) {
        stateData[state].totalAQI += aqi;
        stateData[state].count += 1;
        stateData[state].worstAQI = Math.max(stateData[state].worstAQI, aqi);
      }
    });

    const result = {};
    for (const state in stateData) {
      const s = stateData[state];
      result[state] = {
        avgAQI: Math.round(s.totalAQI / s.count),
        worstAQI: s.worstAQI,
        stations: s.count
      };
    }

    res.json(result);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch state-wise AQI" });
  }
});
app.get("/aqi/city/regions", async (req, res) => {
  const city = req.query.name;

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    // 1️⃣ Search stations by city name
    const searchResponse = await axios.get(
      "https://api.waqi.info/search/",
      {
        params: {
          keyword: city,
          token: process.env.WAQI_TOKEN
        }
      }
    );

    const stations = searchResponse.data.data;

    if (!stations || stations.length === 0) {
      return res.status(404).json({ error: "No stations found for this city" });
    }

    const results = [];

    // 2️⃣ Limit stations to avoid rate limits (VERY IMPORTANT)
    const limitedStations = stations.slice(0, 8);

    // 3️⃣ Fetch details for each station
    for (const station of limitedStations) {
      const detailResponse = await axios.get(
        `https://api.waqi.info/feed/@${station.uid}/`,
        {
          params: {
            token: process.env.WAQI_TOKEN
          }
        }
      );

      const data = detailResponse.data.data;

      results.push({
        region: data.city.name,
        aqi: data.aqi,
        pm25: data.iaqi?.pm25?.v ?? null,
        pm10: data.iaqi?.pm10?.v ?? null,
        no2: data.iaqi?.no2?.v ?? null,
        lat: data.city.geo[0],
        lon: data.city.geo[1]
      });
    }

    res.json({
      city,
      regions: results
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch city region AQI" });
  }
});


/* =========================
   START SERVER (LAST LINE)
========================= */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
