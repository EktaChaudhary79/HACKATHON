import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import "./AQIHistoryScreen.css";

const AQIHistoryScreen = () => {
  const [location, setLocation] = useState("");
  const [aqiTrendData, setAqiTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const fetchAQIHistory = async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/aqi/history?city=${encodeURIComponent(location)}`
      );

      const formattedData = res.data.history.map(item => ({
        time: item.date,
        AQI: item.aqi
      }));

      setAqiTrendData(formattedData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch AQI history for this location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aqi-history-screen">
      <h1>AQI History & Trends</h1>

      {/* 🔍 Location Input */}
      <div className="location-input-wrapper">
        <input
          type="text"
          placeholder="Enter city (e.g., Delhi, Noida)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="location-input"
        />
        <button onClick={fetchAQIHistory} className="fetch-btn">
          View AQI History
        </button>
      </div>

      {loading && <p className="status-text">Loading AQI history...</p>}
      {error && <p className="status-text error">{error}</p>}

      {aqiTrendData.length > 0 && (
        <section className="chart-section">
          <h2>Past AQI Trend for {location}</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={aqiTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="AQI"
                stroke="#ff4d6d"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
};

export default AQIHistoryScreen;
