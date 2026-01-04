// src/components/AboutSection.js
import "./AboutSection.css";

const AboutSection = () => {
  return (
    <section className="about-section">
      <div className="about-card">
        <div className="about-content">
          <h2>About AeroWay🚀</h2>

          <p>
            <strong>AeroWay</strong> is a smart, eco-focused web platform
            designed to help people make safer, healthier, and more sustainable
            travel decisions in urban environments.
          </p>

          <p>
            With rising air pollution and traffic congestion in cities,
            AeroWay combines real-time data, AI intelligence, and modern
            design to guide users toward cleaner and smarter commuting choices.
          </p>

          <p className="about-footer">
            Built with a modern, responsive design, AeroWay aims to
            create healthier cities by empowering people with actionable,
            data-driven commute insights.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
