import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const start = [28.6139, 77.2090]; // Delhi
const end = [28.7041, 77.1025];   // Noida

const MapComponent = () => {
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch route");
        }
        const data = await response.json();
        const coords = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );
        setRoute(coords);
      } catch (err) {
        console.error(err);
        setError("Could not load route. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Welcome to AeroWay</h1>
      {loading && <p style={{ textAlign: "center" }}>Loading route...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      <MapContainer
        center={start}
        zoom={11}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={start} />
        <Marker position={end} />

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "blue",
              weight: 5,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round"
            }}
            smoothFactor={1.5}
            renderer={L.canvas()}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;







