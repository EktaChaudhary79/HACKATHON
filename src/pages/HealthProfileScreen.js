import React, { useEffect, useState } from "react";
import axios from "axios";
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

const HEALTH_API_URL = process.env.REACT_APP_HEALTH_API_URL;

const HealthProfileScreen = () => {
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [sensitivity, setSensitivity] = useState("medium");

  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  const [riskLevel, setRiskLevel] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= GET USER LOCATION ================= */
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);
      },
      () => {
        alert("Unable to fetch your location");
      }
    );
  }, []);

  /* ================= BACKEND HEALTH ANALYSIS ================= */
  const analyzeHealth = async () => {
    if (!age || !condition || !lat || !lon) {
      alert("Please complete all details and allow location access");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${HEALTH_API_URL}/health/analyze`,
        {
          lat,
          lon,
          age,
          condition,
          sensitivity
        }
      );

      // ✅ Backend decides everything
      setRiskLevel(response.data.riskLevel);
      setAlerts(response.data.alerts);

    } catch (error) {
      console.error(error);
      alert("Health analysis service unavailable");
    } finally {
      setLoading(false);
    }
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
            {["low", "medium", "high"].map((level) => (
              <button
                key={level}
                className={sensitivity === level ? "active" : ""}
                onClick={() => setSensitivity(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          className="analyze-btn"
          onClick={analyzeHealth}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Health"}
        </button>
      </div>

      {/* ================= Alerts Section ================= */}
      {riskLevel && (
        <div className="alerts-card">
          <h2>Personalized Alerts</h2>

          <div
            className={`risk-indicator ${riskLevel
              .replace(" ", "")
              .toLowerCase()}`}
          >
            {riskLevel}
          </div>

          <ul className="alerts-list">
            {alerts.map((alert, index) => (
              <li key={index}>⚠️ {alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ================= Do's & Don'ts ================= */}
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
