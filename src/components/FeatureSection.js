import React, { useEffect, useRef } from "react";
import "./FeatureSection.css";

import aqiLive from "../assets/images/aqi-dashboard.webp";
import aqiHistory from "../assets/images/aqi-history.png";
import health from "../assets/images/health-alerts.jpg";
import routes from "../assets/images/safe-routes.webp";
import commute from "../assets/images/smart-commute.webp";
import chatbot from "../assets/images/ai-chatbot.png";

const FeatureBlock = ({ title, desc, points, image, reverse }) => {
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
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

        {/* KNOW MORE BUTTON */}
        {title !== "AI Assistant" && (
  <button className="know-more-btn">Know More</button>
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
      {/* SECTION HEADING */}
      <div className="features-heading">
        <h1>What Our Website Offers</h1>
        <div className="features-heading-line"></div>
      </div>

      <FeatureBlock
        title="Real-time Air Quality Monitoring"
        desc="Track live AQI values like aqi.in with pollutant-level insights."
        points={["Live AQI & category", "PM2.5 & PM10", "City-based data"]}
        image={aqiLive}
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
      />

      <FeatureBlock
        title="Health Profiles & Alerts"
        desc="Personalized health warnings based on your sensitivity."
        points={["Risk level indicator", "Daily alerts", "Health-safe travel"]}
        image={health}
      />

      <FeatureBlock
        reverse
        title="AI-Powered Safe Routes"
        desc="Routes optimized for lowest pollution exposure."
        points={["Exposure score", "Health-first routing", "AI recommendations"]}
        image={routes}
      />

      <FeatureBlock
        title="Smart Commute & Carpool"
        desc="Reduce emissions using carpool & public transport."
        points={["Carpool matching", "Public transport", "CO₂ savings"]}
        image={commute}
      />

      <FeatureBlock
        reverse
        title="AI Assistant"
        desc="Ask anything about AQI, health, or commute safety."
        points={["Health advice", "Route help", "Eco guidance"]}
        image={chatbot}
      />
    </section>
  );
};

export default FeatureSection;
