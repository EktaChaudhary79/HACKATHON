import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import universityCarpools from "../data/universityCarpools";
import "./UniversityMap.css";

/* Leaflet marker fix */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const UniversityMap = ({
  source,
  destination,
  useCurrentLocation,
  university,
}) => {
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [error, setError] = useState("");

  /* ---------- Geocoding ---------- */
  const getCoordinates = async (place) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        place
      )}`
    );
    const data = await res.json();
    if (!data.length) throw new Error("Location not found");
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };

  /* ---------- SOURCE (FIXED: EXACT LOCATION) ---------- */
  useEffect(() => {
    setError("");
    setStartCoords(null);

    if (useCurrentLocation) {
      if (!navigator.geolocation) {
        setError("Geolocation not supported by this browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStartCoords([
            position.coords.latitude,
            position.coords.longitude,
          ]);

          console.log(
            "GPS Accuracy (meters):",
            position.coords.accuracy
          );
        },
        (err) => {
          console.error(err);
          setError("Unable to fetch your exact location. Please allow GPS.");
        },
        {
          enableHighAccuracy: true, // 🔑 force GPS
          timeout: 15000,           // wait for lock
          maximumAge: 0,            // no cached location
        }
      );
    } else if (source && source.trim()) {
      getCoordinates(source)
        .then(setStartCoords)
        .catch(() => setError("Invalid source location"));
    }
  }, [source, useCurrentLocation]);

  /* ---------- DESTINATION ---------- */
  useEffect(() => {
    if (!destination) return;

    getCoordinates(destination)
      .then(setEndCoords)
      .catch(() => setError("Invalid destination"));
  }, [destination]);

  /* ---------- ROUTES ---------- */
  useEffect(() => {
    if (!startCoords || !endCoords) return;

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?alternatives=true&overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.routes.map((r, i) => ({
          id: i,
          coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        }));

        setRoutes(formatted);
        setActiveRoute(0);
      })
      .catch(() => setError("Failed to fetch routes"));
  }, [startCoords, endCoords]);

  /* ---------- STUDENTS ON ROUTE ---------- */
  const studentsOnRoute = universityCarpools.filter(
    (s) => s.university === university && s.routeId === activeRoute
  );

  return (
    <div>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {startCoords && endCoords && (
        <MapContainer
          center={startCoords}
          zoom={12}
          className="leaflet-container"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={startCoords}>
            <Tooltip>Your Current Location</Tooltip>
          </Marker>

          <Marker position={endCoords}>
            <Tooltip>{university}</Tooltip>
          </Marker>

          {routes.map((r, idx) => (
            <Polyline
              key={idx}
              positions={r.coords}
              pathOptions={{
                color: idx === activeRoute ? "#007bff" : "#aaa",
                weight: idx === activeRoute ? 6 : 4,
              }}
              eventHandlers={{
                click: () => setActiveRoute(idx),
              }}
            />
          ))}
        </MapContainer>
      )}

      {/* ---------- STUDENTS LIST ---------- */}
      {activeRoute !== null && (
        <div className="students-panel">
          <h3>Students on this route</h3>

          {studentsOnRoute.length === 0 ? (
            <p>No students found on this route</p>
          ) : (
            studentsOnRoute.map((s, i) => (
              <div key={i} className="student-card">
                <strong>{s.studentName}</strong>
                <p>{s.year}</p>
                <p>Seats Available: {s.seats}</p>
                <p>📞 {s.contact}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UniversityMap;
