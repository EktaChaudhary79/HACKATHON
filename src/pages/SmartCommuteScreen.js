import React, { useState } from "react";
import { FaCar, FaUsers, FaBus } from "react-icons/fa";
import MapComponent from "../components/MapComponent";
import "./SmartCommuteScreen.css";

const SmartCommuteScreen = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("solo");
  const [showMap, setShowMap] = useState(false);

  const handleFindRoute = () => {
    if (!source || !destination) {
      alert("Please enter both source and destination");
      return;
    }
    setShowMap(true);
  };

  return (
    <div className="smart-commute-screen">
      <h1>Smart Commute Planner</h1>

      {/* Inputs */}
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

        <button
          className="find-route-btn"
          onClick={handleFindRoute}
          disabled={!source || !destination}
        >
          Find Best Route
        </button>
      </div>

      {/* Mode Selection */}
      <div className="mode-selection">
        <button
          className={mode === "solo" ? "active" : ""}
          onClick={() => setMode("solo")}
        >
          <FaCar /> Solo
        </button>

        <button
          className={mode === "carpool" ? "active" : ""}
          onClick={() => setMode("carpool")}
        >
          <FaUsers /> Carpool
        </button>

        <button
          className={mode === "public" ? "active" : ""}
          onClick={() => setMode("public")}
        >
          <FaBus /> Public Transport
        </button>
      </div>

      {/* Map */}
      {showMap && (
        <div style={{ marginTop: "30px" }}>
          <MapComponent
            source={source}
            destination={destination}
            mode={mode}
          />
        </div>
      )}
    </div>
  );
};

export default SmartCommuteScreen;
