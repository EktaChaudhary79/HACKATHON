import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "../context/LocationContext";
import "./AQIDashboard.css";

const API_BASE_URL = process.env.REACT_APP_AQI_API_URL;

const AQIDashboard = () => {
  const { location: globalLocation } = useLocation();

  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [aqiData, setAqiData] = useState(null);
  const [error, setError] = useState("");

  /* =========================
     Prefill input ONLY
     (NO auto fetch)
  ========================= */
  useEffect(() => {
    if (globalLocation && city === "") {
      setCity(globalLocation);
    }
  }, [globalLocation, city]);

  /* =========================
     Fetch AQI (ON BUTTON CLICK)
  ========================= */
  const fetchAQI = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError("");
    setAqiData(null);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/aqi/nearest`,
        {
          params: { q: city }
        }
      );

      const data = res.data;

      setAqiData({
        aqi: data?.aqi?.value ?? "N/A",
        category: data?.aqi?.category ?? "N/A",

        pollutants: [
          { name: "PM2.5", value: `${data?.pollutants?.pm25 ?? "N/A"} µg/m³` },
          { name: "PM10", value: `${data?.pollutants?.pm10 ?? "N/A"} µg/m³` },
          { name: "NO₂", value: `${data?.pollutants?.no2 ?? "N/A"} µg/m³` },
          { name: "SO₂", value: `${data?.pollutants?.so2 ?? "N/A"} µg/m³` },
          { name: "CO", value: `${data?.pollutants?.co ?? "N/A"} mg/m³` },
          { name: "O₃", value: `${data?.pollutants?.o3 ?? "N/A"} µg/m³` },
        ],

        weather: {
          temp: `${data?.weather?.temperature ?? "N/A"} °C`,
          humidity: `${data?.weather?.humidity ?? "N/A"} %`,
          wind: `${data?.weather?.windSpeed ?? "N/A"} m/s`,
          condition: data?.weather?.condition ?? "N/A",
        },

        station: data?.station?.name ?? "Unknown",
        location: data?.resolvedLocation ?? city,
      });

    } catch (err) {
      console.error("Failed to fetch AQI:", err);
      setError("Failed to fetch AQI data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aqi-dashboard">
      {/* HEADER */}
      <div className="aqi-header">
        <h1>Air Quality Dashboard</h1>
        <p>Get nearest AQI after entering a location</p>
      </div>

      {/* INPUT */}
      <div className="aqi-input-wrapper">
        <input
          type="text"
          placeholder="Enter full location (e.g. Sarojini Nagar, Delhi)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={loading}
          className="aqi-input"
        />
        <button
          onClick={fetchAQI}
          disabled={loading || !city.trim()}
          className="aqi-btn"
        >
          {loading ? "Loading..." : "Get AQI"}
        </button>
      </div>

      {/* ERROR */}
      {error && <p className="error-text">{error}</p>}

      {/* AQI RESULT */}
      {aqiData && !loading && (
        <>
          <div className="aqi-summary-card">
            <h2>Current AQI</h2>
            <div className="aqi-value">{aqiData.aqi}</div>
            <div className="aqi-category">{aqiData.category}</div>
            <p>📍 {aqiData.location}</p>
            <p style={{ fontSize: "14px" }}>
              Nearest Station: {aqiData.station}
            </p>
          </div>

          <div className="section">
            <h2>Dominant Pollutants</h2>
            <div className="pollutant-grid">
              {aqiData.pollutants.map((p, i) => (
                <div className="pollutant-card" key={i}>
                  <h3>{p.name}</h3>
                  <div className="pollutant-value">{p.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>Weather Conditions</h2>
            <div className="weather-grid">
              <div className="weather-card">
                <h3>Temperature</h3>
                <span>{aqiData.weather.temp}</span>
              </div>
              <div className="weather-card">
                <h3>Humidity</h3>
                <span>{aqiData.weather.humidity}</span>
              </div>
              <div className="weather-card">
                <h3>Wind Speed</h3>
                <span>{aqiData.weather.wind}</span>
              </div>
              <div className="weather-card">
                <h3>Condition</h3>
                <span>{aqiData.weather.condition}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AQIDashboard;
