import "./ProfileSettings.css";

const ProfileSettings = () => {
  return (
    <div className="profile-page">
      <h1>Profile & Settings</h1>

      {/* Saved Locations */}
      <div className="settings-card">
        <h2>📍 Saved Locations</h2>
        <ul>
          <li>Home – Andheri East</li>
          <li>Office – BKC</li>
        </ul>
      </div>

      {/* Health Settings */}
      <div className="settings-card">
        <h2>🧑‍⚕️ Health Settings</h2>
        <p>Condition: <strong>Asthma</strong></p>
        <p>Sensitivity Level: <strong>High</strong></p>
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
    </div>
  );
};

export default ProfileSettings;
