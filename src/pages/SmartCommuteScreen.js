import React, { useState } from "react";
import { FaCar, FaUsers, FaBus } from "react-icons/fa";
import MapComponent from "../components/MapComponent";
import "./SmartCommuteScreen.css";

const SmartCommuteScreen = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [mode, setMode] = useState("solo");
  const [showMap, setShowMap] = useState(false);

  // 🔑 IMPORTANT
  const [requestLocation, setRequestLocation] = useState(false);

  const handleFindRoute = () => {
    if (!useCurrentLocation && !source.trim()) {
      alert("Please enter source or use current location");
      return;
    }
    if (!destination.trim()) {
      alert("Please enter destination");
      return;
    }

    // 🔥 force GPS request
    setRequestLocation((prev) => !prev);
    setShowMap(true);
  };

  return (
    <div className="smart-commute-screen">
      <h1>Smart Commute Planner</h1>

      <div className="inputs-section">
        {!useCurrentLocation && (
          <input
            type="text"
            placeholder="Enter Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        )}

        <label className="checkbox">
          <input
            type="checkbox"
            checked={useCurrentLocation}
            onChange={() => setUseCurrentLocation((prev) => !prev)}
          />
          Use Current Location
        </label>

        <input
          type="text"
          placeholder="Enter Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <button className="find-route-btn" onClick={handleFindRoute}>
          Find Best Route
        </button>
      </div>

      {showMap && (
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
      )}

      {showMap && (
        <MapComponent
          source={source}
          destination={destination}
          useCurrentLocation={useCurrentLocation}
          requestLocation={requestLocation}   // 🔥 IMPORTANT
          mode={mode}
        />
      )}
    </div>
  );
};

export default SmartCommuteScreen;
