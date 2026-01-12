import "./ProfileSettings.css";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";

const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const { location } = useLocation();

  if (!user) {
    return (
      <div className="profile-page">
        <h1>Profile & Settings</h1>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>Profile & Settings</h1>

      {/* Personal Details */}
      <div className="settings-card">
        <h2>👤 Personal Details</h2>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Mobile:</strong> {user.mobile}
        </p>
      </div>

      {/* Saved Locations */}
      <div className="settings-card">
        <h2>📍 Saved Locations</h2>
        <ul>
          <li>Current Location – {location || "Not selected"}</li>
        </ul>
      </div>

      {/* Notifications */}
      <div className="settings-card">
        <h2>🔔 Notification Preferences</h2>
        <label>
          <input type="checkbox" defaultChecked /> AQI Alerts
        </label>
        <label>
          <input type="checkbox" /> Commute Safety Alerts
        </label>
      </div>

      {/* Theme */}
      <div className="settings-card">
        <h2>🎨 Theme Settings</h2>
        <button className="theme-btn">Light</button>
        <button className="theme-btn">Dark</button>
      </div>

      {/* Logout */}
      <div className="settings-card">
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
