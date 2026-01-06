import "./Navbar.css";


function Navbar() {
  return (
    <nav className="navbar">
      {/* LEFT: Logo + App Name */}
      <div className="nav-left">
        <span className="logo">🌱</span>
        <span className="brand">AeroWay</span>
      </div>

      {/* CENTER: Search Bar */}
      <div className="nav-center">
        <input
          type="text"
          placeholder="Search city or location"
          className="search-input"
        />
      </div>

      {/* RIGHT: Menu Items */}
      <div className="nav-right">
        <span className="nav-item">AQI</span>
        <span className="nav-item">Commute</span>
        <span className="nav-item">Resources</span>
        <button className="profile-btn">👤 My Profile</button>
      </div>
    </nav>
  );
}

export default Navbar;
