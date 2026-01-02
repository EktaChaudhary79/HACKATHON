import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import "./AQIHistoryScreen.css";

const AQIHistoryScreen = () => {
  // Placeholder data for AQI trends (24h / 7 days)
  const aqiTrendData = [
    { time: "00:00", AQI: 55 },
    { time: "03:00", AQI: 60 },
    { time: "06:00", AQI: 70 },
    { time: "09:00", AQI: 80 },
    { time: "12:00", AQI: 90 },
    { time: "15:00", AQI: 85 },
    { time: "18:00", AQI: 70 },
    { time: "21:00", AQI: 60 },
  ];

  // Placeholder pollutant trends (PM2.5, PM10, NO2)
  const pollutantData = [
    { time: "00:00", PM25: 30, PM10: 40, NO2: 20 },
    { time: "06:00", PM25: 50, PM10: 55, NO2: 30 },
    { time: "12:00", PM25: 70, PM10: 80, NO2: 45 },
    { time: "18:00", PM25: 60, PM10: 65, NO2: 35 },
  ];

  return (
    <div className="aqi-history-screen">
      <h1>AQI History & Trends</h1>

      <section className="chart-section">
        <h2>24h AQI Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={aqiTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="AQI" stroke="#ff4d6d" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-section">
        <h2>Pollutant Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={pollutantData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="PM25" stroke="#1f77b4" />
            <Line type="monotone" dataKey="PM10" stroke="#ff7f0e" />
            <Line type="monotone" dataKey="NO2" stroke="#2ca02c" />
          </LineChart>
        </ResponsiveContainer>
      </section>

    </div>
  );
};

export default AQIHistoryScreen;
