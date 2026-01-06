import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AQIDashboard from "./pages/AQIDashboard";
import AQIHistoryScreen from "./pages/AQIHistoryScreen";
import HealthProfileScreen from "./pages/HealthProfileScreen";
import SafeRoutes from "./pages/SafeRoutes";
import SmartCommuteScreen from "./pages/SmartCommuteScreen";

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
        <Route path="/safe-routes" element={<SafeRoutes />} />
        <Route path="/smart-commute" element={<SmartCommuteScreen />} />
      </Routes>

      {/* AI Chatbot Overlay – always visible */}
      <Chatbot />
    </Router>
  );
}

export default App;
