import Navbar from "../components/Navbar";
import AboutSection from "../components/AboutSection";
import FeatureSection from "../components/FeatureSection";
import "./Home.css";

function Home() {
  return (
    <>
      <Navbar />

      {/* ABOUT WEBSITE SECTION */}
      <AboutSection />

      {/* FEATURES */}
      <FeatureSection
        title="Live AQI"
        highlight="Monitoring"
        description="Track real-time air quality across cities and locations."
        points={[
          "Real-time AQI updates",
          "City-wise rankings",
          "Health-based AQI categories",
        ]}
      />

      {/* other FeatureSection components */}
    </>
  );
}

export default Home;
