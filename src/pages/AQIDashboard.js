import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "../context/LocationContext";
import "./AQIDashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const AQIDashboard = () => {
  const { location: globalLocation } = useLocation(); // from Navbar/Home

  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [aqiData, setAqiData] = useState(null);

  // 🔹 Prefill input ONCE from Navbar
  useEffect(() => {
    if (globalLocation && city === "") {
      setCity(globalLocation);
    }
  }, [globalLocation, city]);

  const fetchAQI = async () => {
    if (!city) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/aqi/nearest?q=${encodeURIComponent(city)}`
      );

      const data = res.data;

      setAqiData({
        aqi: data.aqi.value,
        category: data.aqi.category,
        pollutants: [
          { name: "PM2.5", value: `${data.pollutants.pm25 ?? "N/A"} µg/m³` },
          { name: "PM10", value: `${data.pollutants.pm10 ?? "N/A"} µg/m³` },
          { name: "NO₂", value: `${data.pollutants.no2 ?? "N/A"} µg/m³` },
          { name: "SO₂", value: `${data.pollutants.so2 ?? "N/A"} µg/m³` },
          { name: "CO", value: `${data.pollutants.co ?? "N/A"} µg/m³` },
          { name: "O₃", value: `${data.pollutants.o3 ?? "N/A"} µg/m³` },
        ],
        weather: {
          temp: `${data.weather.temperature}°C`,
          humidity: `${data.weather.humidity}%`,
          wind: `${data.weather.windSpeed} m/s`,
          condition: data.weather.condition,
        },
        station: data.station?.name,
        location: data.resolvedLocation,
      });
    } catch (error) {
      console.error("Failed to fetch AQI", error);
      alert("Failed to fetch AQI data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aqi-dashboard">
      {/* HEADER */}
      <div className="aqi-header">
        <h1>🌫️ Air Quality Dashboard</h1>
        <p>Live air quality insights based on your location</p>
      </div>

      {/* INPUT */}
      <div className="aqi-input-wrapper">
        <input
          type="text"
          placeholder="Enter location (e.g. Sarojini Nagar, Delhi)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={loading}
          className="aqi-input"
        />
        <button onClick={fetchAQI} disabled={loading} className="aqi-btn">
          {loading ? "Loading..." : "Get AQI"}
        </button>
      </div>

      {/* AQI SUMMARY */}
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

          {/* DOMINANT POLLUTANTS */}
          <div className="section">
            <h2>Dominant Pollutants</h2>
            <div className="pollutant-grid">
              {aqiData.pollutants.map((pollutant, index) => (
                <div className="pollutant-card" key={index}>
                  <h3>{pollutant.name}</h3>
                  <div className="pollutant-value">{pollutant.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* WEATHER CONDITIONS */}
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
