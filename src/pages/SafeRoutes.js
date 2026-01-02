import "./SafeRoutes.css";

function SafeRoutes() {
  return (
    <div className="safe-routes-page">
      <h1>AI-Powered Safe Routes</h1>
      <p className="subtitle">
        Routes optimized for lowest pollution exposure and health safety
      </p>

      {/* INPUTS */}
      <div className="route-inputs">
        <input placeholder="Source location" />
        <input placeholder="Destination" />
        <button className="analyze-btn">Analyze Routes</button>
      </div>

      {/* AI INSIGHT */}
      <div className="ai-insight">
        🤖 <strong>AI Recommendation:</strong>  
        Avoid peak traffic roads between 8–10 AM.  
        Route B offers <span>32% lower pollution exposure</span>.
      </div>

      {/* ROUTE CARDS */}
      <div className="routes-grid">
        <div className="route-card best">
          <h3>Health-First Route ⭐</h3>
          <p><b>Exposure Score:</b> 28 / 100</p>
          <p><b>Pollution Level:</b> Low</p>
          <p><b>CO₂ Saved:</b> +18%</p>
          <span className="badge">Best Option Today</span>
        </div>

        <div className="route-card">
          <h3>Fastest Route</h3>
          <p><b>Exposure Score:</b> 62 / 100</p>
          <p><b>Pollution Level:</b> Moderate</p>
          <p><b>CO₂ Saved:</b> +5%</p>
        </div>

        <div className="route-card">
          <h3>Shortest Route</h3>
          <p><b>Exposure Score:</b> 75 / 100</p>
          <p><b>Pollution Level:</b> High</p>
          <p><b>CO₂ Saved:</b> +2%</p>
        </div>
      </div>
    </div>
  );
}

export default SafeRoutes;
