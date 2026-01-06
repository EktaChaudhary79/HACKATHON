import React from "react";
import "./AQIDashboard.css";

const AQIDashboard = () => {
  const aqiData = {
    aqi: 178,
    category: "Poor",
    pollutants: [
      { name: "PM2.5", value: "96 µg/m³" },
      { name: "PM10", value: "140 µg/m³" },
      { name: "NO₂", value: "42 µg/m³" },
    ],
    weather: {
      temp: "32°C",
      humidity: "68%",
      wind: "10 km/h",
    },
  };

  return (
    <div className="aqi-dashboard">
      {/* Header */}
      <div className="aqi-header">
        <h1>🌫️ Air Quality Dashboard</h1>
        <p>Live air quality insights based on your location</p>
      </div>

      {/* AQI Summary Card */}
      <div className="aqi-summary-card">
        <h2>Current AQI</h2>
        <div className="aqi-value">{aqiData.aqi}</div>
        <div className="aqi-category">{aqiData.category}</div>
      </div>

      {/* AQI Horizontal Scale */}
      <div className="aqi-horizontal-scale">
        <div className="aqi-scale-bar">
          <div className="aqi-good"></div>
          <div className="aqi-moderate"></div>
          <div className="aqi-poor"></div>
          <div className="aqi-unhealthy"></div>
          <div className="aqi-severe"></div>
          <div className="aqi-hazardous"></div>

          {/* AQI Pointer */}
          <div
            className="aqi-pointer"
            style={{
              left: `${(aqiData.aqi / 500) * 100}%`,
            }}
          >
            {aqiData.aqi}
          </div>
        </div>

        {/* Labels */}
        <div className="aqi-scale-labels">
          <span>Good</span>
          <span>Moderate</span>
          <span>Poor</span>
          <span>Unhealthy</span>
          <span>Severe</span>
          <span>Hazardous</span>
        </div>
      </div>

      {/* Pollutants */}
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

      {/* Weather */}
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
    </div>
  );
};

export default AQIDashboard;
