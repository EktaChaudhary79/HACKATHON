import React from "react";

import Navbar from "../components/Navbar";
import AboutSection from "../components/AboutSection";
import FeatureSection from "../components/FeatureSection";

import "./Home.css";

const Home = () => {
  return (
    <>
      <Navbar />
      <AboutSection />
      <FeatureSection />
    </>
  );
};

export default Home;