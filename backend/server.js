const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

/* =========================
   UTILS
========================= */

// Haversine distance (km)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// AQI category
function getAQICategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Unhealthy";
  if (aqi <= 400) return "Severe";
  return "Hazardous";
}

/* =========================
   WEATHER (DEFINED FIRST ✅)
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
    windSpeed: res.data.wind.speed
  };
}

/* =========================
   GEOCODING (ADDRESS → LAT/LON)
========================= */
async function geocodeAddress(address) {
  // 1️⃣ Try full address
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

  // 2️⃣ Fallback → city + India
  if (!res.data || res.data.length === 0) {
    const words = address.split(" ");
    const fallbackCity = words[words.length - 1];

    res = await axios.get(
      "https://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: `${fallbackCity},IN`,
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
   🔥 NEAREST AQI FOR ANY ADDRESS
========================= */
app.get("/aqi/nearest", async (req, res) => {
  const address = req.query.q;

  if (!address) {
    return res.status(400).json({ error: "Address required" });
  }

  try {
    // 1️⃣ Address → Lat/Lon
    const userLocation = await geocodeAddress(address);

    // 2️⃣ Get AQI stations in India
    const stationsRes = await axios.get(
      "https://api.waqi.info/map/bounds/",
      {
        params: {
          latlng: "6.554607,68.111378,35.674545,97.395561",
          token: process.env.WAQI_TOKEN
        }
      }
    );

    const stations = stationsRes.data.data;

    // 3️⃣ Find nearest AQI station
    let nearest = null;
    let minDistance = Infinity;

    stations.forEach(station => {
      if (!station.lat || !station.lon) return;

      const dist = getDistance(
        userLocation.lat,
        userLocation.lon,
        station.lat,
        station.lon
      );

      if (dist < minDistance && !isNaN(station.aqi)) {
        minDistance = dist;
        nearest = station;
      }
    });

    if (!nearest) {
      return res.status(404).json({ error: "No AQI station found" });
    }

    // 4️⃣ Detailed AQI
    const detailRes = await axios.get(
      `https://api.waqi.info/feed/@${nearest.uid}/`,
      {
        params: { token: process.env.WAQI_TOKEN }
      }
    );

    const aqiData = detailRes.data.data;

    // 5️⃣ Weather
    const weather = await getWeather(
      aqiData.city.geo[0],
      aqiData.city.geo[1]
    );

    // 6️⃣ Response
    res.json({
      searchedAddress: address,
      resolvedLocation: userLocation.name,

      nearestStation: {
        name: aqiData.city.name,
        distance_km: minDistance.toFixed(2)
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
    console.error("Nearest AQI Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   SERVER START
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
