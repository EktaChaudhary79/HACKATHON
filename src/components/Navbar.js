import "./Navbar.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../context/LocationContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

function Navbar() {
  const { setLocation } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  const handleSearch = () => {
    if (!inputValue.trim()) return;
    setLocation(inputValue.trim());
  };

  // ✅ CORRECT PROFILE HANDLER
  const handleProfileClick = () => {
    if (user) {
      navigate("/profile-settings"); // ✅ Profile settings screen
    } else {
      setShowAuth(true); // ✅ Auth modal
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <span className="brand">AeroWay</span>
        </div>

        <div className="nav-center">
          <input
            type="text"
            placeholder="Search city or location"
            className="search-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            Enter
          </button>
        </div>

        <div className="nav-right">
          <span className="nav-item" onClick={() => navigate("/aqi-live")}>
            AQI
          </span>

          <span
            className="nav-item"
            onClick={() => navigate("/smart-commute")}
          >
            Commute
          </span>

          <span className="nav-item">Resources</span>

          <button className="profile-btn" onClick={handleProfileClick}>
            👤 {user ? "My Profile" : "Sign In"}
          </button>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

export default Navbar;
