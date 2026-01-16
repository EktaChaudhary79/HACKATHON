import React, { useState, useEffect } from "react";
import "./MapComponent.css";
import carpoolData from "../data/carpools";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ---------- Leaflet marker fix ---------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* ---------- Resize Fix ---------- */
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [map]);
  return null;
};

/* ---------- Fit Bounds ---------- */
const FitBounds = ({ start, end }) => {
  const map = useMap();
  useEffect(() => {
    if (start && end) {
      map.fitBounds([start, end], { padding: [50, 50] });
    }
  }, [start, end, map]);
  return null;
};

const EMISSION_FACTOR = 0.12;

const MapComponent = ({ source, destination, mode, useCurrentLocation }) => {
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [bestRoute, setBestRoute] = useState(null);
  const [visibleRiders, setVisibleRiders] = useState({});
  const [bookedRide, setBookedRide] = useState(null);
  const [error, setError] = useState("");

  /* ---------- Toast ---------- */
  const showToast = (msg) => {
    alert(msg);
  };

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

  /* ---------- SOURCE ---------- */
  useEffect(() => {
    setError("");

    if (useCurrentLocation) {
      if (!navigator.geolocation) {
        setError("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStartCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        () => setError("Unable to fetch current location")
      );
    } else if (source) {
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
    const fetchRoutes = async () => {
      if (!startCoords || !endCoords) return;

      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?alternatives=true&overview=full&geometries=geojson`
        );

        const data = await res.json();

        const evaluated = data.routes.map((r, idx) => {
          const distanceKm = r.distance / 1000;
          let carbon = distanceKm * EMISSION_FACTOR;

          const riders = carpoolData.filter(
            (c) => c.route === idx && c.seats > 0
          );

          if (mode === "carpool" && riders.length > 0) {
            carbon *= 0.6;
          }

          return {
            id: idx,
            coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
            distance: distanceKm.toFixed(2),
            carbon: carbon.toFixed(2),
            riders,
          };
        });

        let best = 0;
        evaluated.forEach((r, i) => {
          if (+r.carbon < +evaluated[best].carbon) best = i;
        });

        const riderMap = {};
        evaluated.forEach((r) => {
          riderMap[r.id] = [...r.riders].slice(0, 4);
        });

        setRoutes(evaluated);
        setVisibleRiders(riderMap);
        setBestRoute(best);
        setActiveRoute(best);
        setBookedRide(null);
      } catch {
        setError("Failed to fetch routes");
      }
    };

    fetchRoutes();
  }, [startCoords, endCoords, mode]);

  /* ---------- BOOK / CANCEL ---------- */
  const handleBook = (rider) => {
    if (bookedRide) {
      showToast("You already booked a ride");
      return;
    }

    if (rider.seats < 1) {
      showToast("No seats available");
      return;
    }

    setVisibleRiders((prev) => ({
      ...prev,
      [activeRoute]: prev[activeRoute].map((r) =>
        r.name === rider.name ? { ...r, seats: r.seats - 1 } : r
      ),
    }));

    setBookedRide({ route: activeRoute, rider: rider.name });
    showToast("Ride booked successfully");
  };

  const handleCancel = () => {
    setVisibleRiders((prev) => ({
      ...prev,
      [bookedRide.route]: prev[bookedRide.route].map((r) =>
        r.name === bookedRide.rider ? { ...r, seats: r.seats + 1 } : r
      ),
    }));

    setBookedRide(null);
    showToast("Ride cancelled");
  };

  return (
    <div className="map-component">
      {error && <p style={{ color: "red" }}>{error}</p>}

      {startCoords && endCoords && (
        <MapContainer center={startCoords} zoom={7} className="leaflet-container">
          <ResizeMap />
          <FitBounds start={startCoords} end={endCoords} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={startCoords}>
            <Tooltip>Start</Tooltip>
          </Marker>

          <Marker position={endCoords}>
            <Tooltip>Destination</Tooltip>
          </Marker>

          {routes.map((r, idx) => (
            <Polyline
              key={r.id}
              positions={r.coords}
              pathOptions={{
                color: idx === activeRoute ? "green" : "#aaa",
                weight: idx === activeRoute ? 6 : 4,
              }}
              eventHandlers={{ click: () => setActiveRoute(idx) }}
            />
          ))}
        </MapContainer>
      )}

      {/* ROUTE CARDS */}
      <div className="route-cards">
        {routes.map((r, i) => (
          <div
            key={r.id}
            className={`route-card ${i === activeRoute ? "active" : ""}`}
            onClick={() => setActiveRoute(i)}
          >
            {i === bestRoute && <div className="best-badge">🌟 BEST</div>}
            <h4>Route {i + 1}</h4>
            <p>Distance: {r.distance} km</p>
            <p>CO₂: {r.carbon} kg</p>
          </div>
        ))}
      </div>

      {/* CARPOOL */}
      {mode === "carpool" && activeRoute !== null && (
        <div className="booking-panel">
          <h3>🚗 Available Carpools</h3>

          {visibleRiders[activeRoute]?.map((r, i) => (
            <div key={i} className="booking-row">
              <span>
                {r.name} • {r.seats} seat(s) • ⭐ {r.rating}
              </span>

              {!bookedRide ? (
                <button onClick={() => handleBook(r)}>Book</button>
              ) : bookedRide.rider === r.name ? (
                <button onClick={handleCancel}>Cancel</button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
