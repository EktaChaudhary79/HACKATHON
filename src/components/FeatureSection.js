import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./FeatureSection.css";

import aqiLive from "../assets/images/aqi-dashboard.webp";
import aqiHistory from "../assets/images/aqi-history.png";
import health from "../assets/images/health-alerts.jpg";
import commute from "../assets/images/smart-commute.webp";
import chatbot from "../assets/images/ai-chatbot.png";
import unicommute from "../assets/images/unicommute.jpeg";

const FeatureBlock = ({
  title,
  desc,
  points,
  image,
  reverse,
  path,
  hideButton,
}) => {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, []);

  return (
    <div ref={ref} className={`feature-card ${reverse ? "reverse" : ""}`}>
      <div className="feature-text">
        <h2>{title}</h2>
        <p>{desc}</p>

        <ul>
          {points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>

        {path && !hideButton && (
          <button
            className="know-more-btn"
            onClick={() => navigate(path)}
          >
            Know More
          </button>
        )}
      </div>

      <div className="feature-image">
        <img src={image} alt={title} />
      </div>
    </div>
  );
};

const FeatureSection = () => {
  return (
    <section className="feature-wrapper">
      {/* FEATURES SECTION HEADING */}
      <div className="features-heading">
        <h1>Features Our Website Offers</h1>
        <p>
          Smart tools designed to help you monitor air quality, protect your
          health, and commute sustainably.
        </p>
        <div className="features-heading-line"></div>
      </div>

      {/* FEATURE CARDS */}
      <FeatureBlock
        title="Real-time Air Quality Monitoring"
        desc="Track live AQI values like aqi.in with pollutant-level insights."
        points={["Live AQI & category", "PM2.5 & PM10", "City-based data"]}
        image={aqiLive}
        path="/aqi-live"
      />

      <FeatureBlock
        reverse
        title="Historical AQI Trends"
        desc="Understand pollution patterns with clean visual charts."
        points={[
          "Weekly & monthly trends",
          "Peak pollution hours",
          "Best commute time",
        ]}
        image={aqiHistory}
        path="/aqi-history"
      />

      <FeatureBlock
        title="Health Profiles & Alerts"
        desc="Personalized health warnings based on your sensitivity."
        points={["Risk level indicator", "Daily alerts", "Health-safe travel"]}
        image={health}
        path="/health-profile"
      />

      <FeatureBlock
        reverse
        title="Smart Commute & Carpool"
        desc="Reduce emissions using carpool & public transport."
        points={[
          "Carpool matching",
          "Public transport",
          "CO₂ savings",
        ]}
        image={commute}
        path="/smart-commute"
      />

      {/* 🎓 UNIVERSITY CARPOOL FEATURE */}
      <FeatureBlock
        title="University Carpool for Students"
        desc="Travel smarter by sharing rides with students heading to the same university."
        points={[
          "University-based matching",
          "Same-route grouping",
          "Student-only carpools",
        ]}
        image={unicommute}
        path="/university"
      />

      {/* AI Assistant – no Know More button */}
      <FeatureBlock
        reverse
        title="AI Assistant"
        desc="Ask anything about AQI, health, or commute safety."
        points={[
          "Health advice",
          "Route help",
          "Eco guidance",
        ]}
        image={chatbot}
        hideButton={true}
      />
    </section>
  );
};

export default FeatureSection;
