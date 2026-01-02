import React, { useState } from "react";
import "./HealthProfileScreen.css";

/* ================= Disease-specific Guidelines ================= */
const diseaseGuidelines = {
  asthma: {
    dos: [
      "Wear an N95 mask on high AQI days",
      "Prefer green routes and indoor workouts",
      "Check AQI before stepping out",
      "Carry prescribed inhaler"
    ],
    donts: [
      "Avoid outdoor exercise during peak hours",
      "Do not travel near high-traffic roads",
      "Avoid smoke and dusty areas"
    ]
  },
  heart: {
    dos: [
      "Limit outdoor activity when AQI is high",
      "Take frequent breaks during travel",
      "Choose public transport or carpool",
      "Stay hydrated"
    ],
    donts: [
      "Avoid long commutes in polluted areas",
      "Do not ignore chest discomfort",
      "Avoid stressful peak-hour travel"
    ]
  },
  allergy: {
    dos: [
      "Use a face covering outdoors",
      "Keep windows closed on poor AQI days",
      "Use air purifiers at home"
    ],
    donts: [
      "Avoid open-air travel during pollen peaks",
      "Do not stay outdoors for long durations"
    ]
  }
};

const HealthProfileScreen = () => {
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [sensitivity, setSensitivity] = useState("medium");

  const getRiskLevel = () => {
    if (sensitivity === "high") return "High Risk";
    if (sensitivity === "medium") return "Moderate Risk";
    return "Low Risk";
  };

  return (
    <div className="health-screen">
      <h1>Health Profile & Alerts</h1>

      {/* ================= Health Input Card ================= */}
      <div className="health-card">
        <h2>Your Health Details</h2>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Health Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Select condition</option>
            <option value="asthma">Asthma</option>
            <option value="heart">Heart Disease</option>
            <option value="allergy">Allergies</option>
            <option value="none">None</option>
          </select>
        </div>

        <div className="form-group">
          <label>Sensitivity Level</label>
          <div className="sensitivity-buttons">
            <button
              className={sensitivity === "low" ? "active" : ""}
              onClick={() => setSensitivity("low")}
            >
              Low
            </button>
            <button
              className={sensitivity === "medium" ? "active" : ""}
              onClick={() => setSensitivity("medium")}
            >
              Medium
            </button>
            <button
              className={sensitivity === "high" ? "active" : ""}
              onClick={() => setSensitivity("high")}
            >
              High
            </button>
          </div>
        </div>
      </div>

      {/* ================= Alerts Section ================= */}
      <div className="alerts-card">
        <h2>Personalized Alerts</h2>

        <div className={`risk-indicator ${sensitivity}`}>
          {getRiskLevel()}
        </div>

        <ul className="alerts-list">
          <li>⚠️ Avoid outdoor travel during peak AQI hours</li>
          <li>😷 Wear a mask if AQI exceeds safe limits</li>
          <li>🌿 Prefer green routes and public transport</li>
        </ul>
      </div>

      {/* ================= Do's & Don'ts Section ================= */}
      {condition && diseaseGuidelines[condition] && (
        <div className="guidelines-card">
          <h2>Do’s & Don’ts for You</h2>

          <div className="guidelines-grid">
            <div className="dos">
              <h3>✅ Do’s</h3>
              <ul>
                {diseaseGuidelines[condition].dos.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="donts">
              <h3>❌ Don’ts</h3>
              <ul>
                {diseaseGuidelines[condition].donts.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthProfileScreen;
