import React, { useState } from "react";
import axios from "axios";
import "./AQIDashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const AQIDashboard = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [aqiData, setAqiData] = useState(null);

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
      <div className="aqi-header">
        <h1>🌫️ Air Quality Dashboard</h1>
        <p>Live air quality insights based on your location</p>
      </div>

      {/* SEARCH */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          margin: "40px 0",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Enter location (e.g. Sarojini Nagar, Delhi)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={loading}
          style={{
            width: "380px",
            height: "58px",
            padding: "0 22px",
            fontSize: "18px",
            borderRadius: "16px",
            border: "3px solid #00b4d8",
            outline: "none",
            color: "#03045e",
          }}
        />

        <button
          onClick={fetchAQI}
          disabled={loading}
          style={{
            height: "58px",
            padding: "0 36px",
            fontSize: "18px",
            fontWeight: "600",
            borderRadius: "16px",
            border: "none",
            cursor: "pointer",
            background:
              "linear-gradient(135deg, #00b4d8, #0077b6)",
            color: "#ffffff",
            boxShadow: "0 8px 20px rgba(0, 119, 182, 0.4)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Loading..." : "Get AQI"}
        </button>
      </div>

      {/* AQI SUMMARY */}
      <div className="aqi-summary-card">
        <h2>Current AQI</h2>

        {loading && <div className="aqi-loading">Fetching AQI...</div>}

        {!loading && aqiData && (
          <>
            <div className="aqi-value">{aqiData.aqi}</div>
            <div className="aqi-category">{aqiData.category}</div>
            <p style={{ marginTop: "10px", color: "#555" }}>
              📍 {aqiData.location}
            </p>
            <p style={{ fontSize: "14px", color: "#777" }}>
              Nearest Station: {aqiData.station}
            </p>
          </>
        )}
      </div>

      {/* DETAILS */}
      {!loading && aqiData && (
        <>
          {/* AQI SCALE */}
          <div className="aqi-horizontal-scale">
            <div className="aqi-scale-bar">
              <div className="aqi-good"></div>
              <div className="aqi-moderate"></div>
              <div className="aqi-poor"></div>
              <div className="aqi-unhealthy"></div>
              <div className="aqi-severe"></div>
              <div className="aqi-hazardous"></div>

              <div
                className="aqi-pointer"
                style={{
                  left: `${(aqiData.aqi / 500) * 100}%`,
                }}
              >
                {aqiData.aqi}
              </div>
            </div>

            <div className="aqi-scale-labels">
              <span>Good</span>
              <span>Moderate</span>
              <span>Poor</span>
              <span>Unhealthy</span>
              <span>Severe</span>
              <span>Hazardous</span>
            </div>
          </div>

          {/* POLLUTANTS */}
          <div className="section">
            <h2>Dominant Pollutants</h2>
            <div className="pollutant-grid">
              {aqiData.pollutants.map((item, index) => (
                <div className="pollutant-card" key={index}>
                  <h3>{item.name}</h3>
                  <div className="pollutant-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* WEATHER */}
          <div className="section">
            <h2>Weather Conditions</h2>
            <div className="weather-grid">
              <div className="weather-card">
                🌡️ <strong>{aqiData.weather.temp}</strong>
                <span>Temperature</span>
              </div>
              <div className="weather-card">
                💧 <strong>{aqiData.weather.humidity}</strong>
                <span>Humidity</span>
              </div>
              <div className="weather-card">
                🌬️ <strong>{aqiData.weather.wind}</strong>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AQIDashboard;