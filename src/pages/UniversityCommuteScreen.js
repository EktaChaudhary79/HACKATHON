import React, { useState } from "react";
import UniversityMap from "../components/UniversityMap";
import "./UniversityCommuteScreen.css";

const UniversityCommuteScreen = () => {
  const [source, setSource] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [university, setUniversity] = useState("");
  const [showMap, setShowMap] = useState(false);

  const handleFindStudents = () => {
    if (!useCurrentLocation && !source.trim()) {
      alert("Please enter your location or use current location");
      return;
    }

    if (!university) {
      alert("Please select your university");
      return;
    }

    setShowMap(true);
  };

  return (
    <div className="university-screen">
      <h1>University Carpool</h1>

      {/* INPUT PANEL */}
      <div className="inputs-section">
        {!useCurrentLocation && (
          <input
            type="text"
            placeholder="Enter your location"
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

        <select
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
        >
          <option value="">Select University</option>
          <option value="Delhi University">Delhi University</option>
          <option value="IIT Delhi">IIT Delhi</option>
          <option value="NSUT">NSUT</option>
        </select>

        <button onClick={handleFindStudents}>
          Find Students on My Route
        </button>
      </div>

      {/* MAP + STUDENTS */}
      {showMap && (
        <UniversityMap
          source={source}
          useCurrentLocation={useCurrentLocation}
          destination={university}
          university={university}
        />
      )}
    </div>
  );
};

export default UniversityCommuteScreen;
