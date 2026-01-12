import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AQIDashboard from "./pages/AQIDashboard";
import AQIHistoryScreen from "./pages/AQIHistoryScreen";
import HealthProfileScreen from "./pages/HealthProfileScreen";
import SmartCommuteScreen from "./pages/SmartCommuteScreen";
import ProfileSettings from "./pages/ProfileSettings"; // ✅ ADD THIS

import Chatbot from "./pages/Chatbot";

function App() {
  return (
    <Router>
      {/* App Screens */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aqi-live" element={<AQIDashboard />} />
        <Route path="/aqi-history" element={<AQIHistoryScreen />} />
        <Route path="/health-profile" element={<HealthProfileScreen />} />
        <Route path="/smart-commute" element={<SmartCommuteScreen />} />

        {/* ✅ PROFILE SETTINGS ROUTE */}
        <Route
          path="/profile-settings"
          element={<ProfileSettings />}
        />
      </Routes>

      {/* AI Chatbot Overlay – always visible */}
      <Chatbot />
    </Router>
  );
}

export default App;
