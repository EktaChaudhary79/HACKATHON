import React, { useState, useEffect } from "react";
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
import { useLocation } from "../context/LocationContext";
import "./AQIHistoryScreen.css";

// ✅ Correct env variable
const API_BASE_URL = process.env.REACT_APP_AQI_API_URL;

const AQIHistoryScreen = () => {
  const { location: globalLocation } = useLocation();

  const [location, setLocation] = useState("");
  const [aqiTrendData, setAqiTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     Prefill input ONLY
  ========================= */
  useEffect(() => {
    if (globalLocation && location === "") {
      setLocation(globalLocation);
    }
  }, [globalLocation, location]);

  /* =========================
     Fetch AQI History
     (ON BUTTON CLICK ONLY)
  ========================= */
  const fetchAQIHistory = async () => {
    if (!location.trim()) return;

    setLoading(true);
    setError("");
    setAqiTrendData([]);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/aqi/history`,
        {
          params: { city: location }
        }
      );

      const history = res.data?.history ?? [];

      if (history.length === 0) {
        setError("No AQI history available for this location");
        return;
      }

      const formattedData = history.map(item => ({
        date: item.date,
        AQI: item.aqi
      }));

      setAqiTrendData(formattedData);

    } catch (err) {
      console.error("AQI History Error:", err);
      setError("Failed to fetch AQI history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aqi-history-screen">
      <h1>AQI History & Trends</h1>
      <p className="subtitle">
        View past air quality trends for a specific location
      </p>

      {/* INPUT */}
      <div className="location-input-wrapper">
        <input
          type="text"
          placeholder="Enter city (e.g. Delhi, Noida)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="location-input"
          disabled={loading}
        />
        <button
          onClick={fetchAQIHistory}
          className="fetch-btn"
          disabled={loading || !location.trim()}
        >
          {loading ? "Loading..." : "View AQI History"}
        </button>
      </div>

      {/* STATUS */}
      {loading && (
        <p className="status-text">Fetching AQI history...</p>
      )}
      {error && (
        <p className="status-text error">{error}</p>
      )}

      {/* CHART */}
      {aqiTrendData.length > 0 && !loading && (
        <section className="chart-section">
          <h2>Past AQI Trend for {location}</h2>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={aqiTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="AQI"
                stroke="#ff4d6d"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
};

export default AQIHistoryScreen;
