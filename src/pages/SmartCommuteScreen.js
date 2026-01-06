import React, { useState } from "react";
import { FaCar, FaUsers, FaBus, FaStar } from "react-icons/fa";
import "./SmartCommuteScreen.css";

const SmartCommuteScreen = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("solo");

  // Placeholder route options
  const routeOptions = [
    {
      type: "Solo Route",
      icon: <FaCar />,
      pollution: 45,
      co2: 1.2,
      best: false,
    },
    {
      type: "Carpool + Safe Route",
      icon: <FaUsers />,
      pollution: 30,
      co2: 0.7,
      best: true,
    },
    {
      type: "Public Transport",
      icon: <FaBus />,
      pollution: 35,
      co2: 0.9,
      best: false,
    },
  ];

  return (
    <div className="smart-commute-screen">
      <h1>Smart Commute Planner</h1>

      {/* Source & Destination Inputs */}
      <div className="inputs-section">
        <input
          type="text"
          placeholder="Enter Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      {/* Commute Mode Selection */}
      <div className="mode-selection">
        <button
          className={mode === "solo" ? "active" : ""}
          onClick={() => setMode("solo")}
        >
          Solo
        </button>
        <button
          className={mode === "carpool" ? "active" : ""}
          onClick={() => setMode("carpool")}
        >
          Carpool
        </button>
        <button
          className={mode === "public" ? "active" : ""}
          onClick={() => setMode("public")}
        >
          Public Transport
        </button>
      </div>

      {/* Map Placeholder */}
      <div className="map-placeholder">
        <p>🗺️ Map will be displayed here</p>
      </div>

      {/* Route Option Cards */}
      <div className="route-cards">
        {routeOptions.map((option, index) => (
          <div key={index} className={`route-card ${option.best ? "best" : ""}`}>
            {option.best && <div className="best-badge"><FaStar /> Best Option Today</div>}
            <div className="route-icon">{option.icon}</div>
            <h3>{option.type}</h3>
            <p>Pollution Score: {option.pollution}</p>
            <p>CO₂ Savings: {option.co2} kg</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartCommuteScreen;