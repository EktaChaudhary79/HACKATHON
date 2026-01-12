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

/* ---------- Leaflet icon fix ---------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* ---------- Resize safety ---------- */
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [map]);
  return null;
};

/* ---------- Fit bounds ---------- */
const FitBounds = ({ start, end }) => {
  const map = useMap();
  useEffect(() => {
    if (start && end) map.fitBounds([start, end], { padding: [50, 50] });
  }, [start, end, map]);
  return null;
};

const EMISSION_FACTOR = 0.12;

const MapComponent = ({ source, destination, mode }) => {
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(null);
  const [bestRouteIndex, setBestRouteIndex] = useState(null);

  // { routeId: { riderName: { seats, rider } } }
  const [userBookings, setUserBookings] = useState({});
  const [visibleRidersByRoute, setVisibleRidersByRoute] = useState({});

  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [seatCount, setSeatCount] = useState(1);
  const [toast, setToast] = useState("");
  const [error, setError] = useState(null);

  /* ---------- Toast helper ---------- */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
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

  useEffect(() => {
    if (!source) return;
    getCoordinates(source).then(setStartCoords).catch(() => setError("Invalid source"));
  }, [source]);

  useEffect(() => {
    if (!destination) return;
    getCoordinates(destination).then(setEndCoords).catch(() => setError("Invalid destination"));
  }, [destination]);

  /* ---------- Fetch routes ---------- */
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

          const carpoolsForRoute = carpoolData.filter(
            (c) => c.route === idx && c.seats > 0
          );

          if (mode === "carpool" && carpoolsForRoute.length > 0) {
            carbon *= 0.6;
          }

          return {
            id: idx,
            coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
            distance: distanceKm.toFixed(2),
            carbon: carbon.toFixed(2),
            carpools: carpoolsForRoute,
          };
        });

        let bestIdx = 0;
        evaluated.forEach((r, i) => {
          if (+r.carbon < +evaluated[bestIdx].carbon) bestIdx = i;
        });

        const frozen = {};
        evaluated.forEach((route) => {
          frozen[route.id] = [...route.carpools]
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
        });

        setRoutes(evaluated);
        setVisibleRidersByRoute(frozen);
        setBestRouteIndex(bestIdx);
        setActiveRouteIndex(bestIdx);
        setUserBookings({});
      } catch {
        setError("Unable to fetch routes");
      }
    };

    fetchRoutes();
  }, [startCoords, endCoords, mode]);

  /* ---------- Booking ---------- */
  const openSeatModal = (rider) => {
    // 🚫 BLOCK multiple bookings
    if (Object.keys(userBookings).length > 0) {
      showToast("⚠️ You have already booked a ride");
      return;
    }

    setSelectedRider(rider);
    setSeatCount(1);
    setSeatModalOpen(true);
  };

  const confirmBooking = () => {
    if (seatCount > selectedRider.seats) {
      showToast(`Only ${selectedRider.seats} seat(s) available`);
      return;
    }

    const routeId = activeRouteIndex;

    setVisibleRidersByRoute((prev) => ({
      ...prev,
      [routeId]: prev[routeId].map((r) =>
        r.name === selectedRider.name
          ? { ...r, seats: r.seats - seatCount }
          : r
      ),
    }));

    setUserBookings((prev) => ({
      [routeId]: {
        [selectedRider.name]: {
          seats: seatCount,
          rider: selectedRider,
        },
      },
    }));

    setSeatModalOpen(false);
    showToast("✅ Ride booked successfully");
  };

  const cancelBooking = (routeId, riderName) => {
    const bookedSeats = userBookings[routeId][riderName].seats;

    setVisibleRidersByRoute((prev) => ({
      ...prev,
      [routeId]: prev[routeId].map((r) =>
        r.name === riderName
          ? { ...r, seats: r.seats + bookedSeats }
          : r
      ),
    }));

    setUserBookings({});
    showToast("❌ Ride cancelled");
  };

  const selectedRoute =
    activeRouteIndex !== null ? routes[activeRouteIndex] : null;

  return (
    <div className="map-component">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {toast && <div className="toast">{toast}</div>}

      {startCoords && endCoords && (
        <MapContainer center={startCoords} zoom={6} className="leaflet-container">
          <ResizeMap />
          <FitBounds start={startCoords} end={endCoords} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={startCoords}><Tooltip>Source</Tooltip></Marker>
          <Marker position={endCoords}><Tooltip>Destination</Tooltip></Marker>

          {routes.map((route, idx) => (
            <Polyline
              key={route.id}
              positions={route.coords}
              pathOptions={{
                color: idx === activeRouteIndex ? "green" : "#aaa",
                weight: idx === activeRouteIndex ? 6 : 4,
              }}
              renderer={L.canvas()}
            />
          ))}
        </MapContainer>
      )}

      {/* ROUTE CARDS */}
      <div className="route-cards">
        {routes.map((route, idx) => (
          <div
            key={route.id}
            className={`route-card ${idx === activeRouteIndex ? "active" : ""}`}
            onClick={() => setActiveRouteIndex(idx)}
          >
            {idx === bestRouteIndex && <div className="best-badge">🌟 BEST ROUTE</div>}
            <h4>Route {idx + 1}</h4>
            <p>Distance: {route.distance} km</p>
            <p>Carbon: {route.carbon} kg CO₂</p>
          </div>
        ))}
      </div>

      {/* BOOKING PANEL */}
      {mode === "carpool" && selectedRoute && (
        <div className="booking-panel">
          <h3>🚗 Available Carpools</h3>

          {visibleRidersByRoute[selectedRoute.id]?.map((c, i) => {
            const booked =
              userBookings[selectedRoute.id]?.[c.name];

            return (
              <div key={i} className="booking-row">
                <span>
                  {c.name} • {c.seats} seat(s) • ⭐ {c.rating}
                </span>

                {!booked ? (
                  <button onClick={() => openSeatModal(c)}>Book</button>
                ) : (
                  <button
                    onClick={() =>
                      cancelBooking(selectedRoute.id, c.name)
                    }
                  >
                    Cancel
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SEAT MODAL */}
      {seatModalOpen && selectedRider && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Book Seats</h3>
            <p><strong>{selectedRider.name}</strong></p>

            <input
              type="number"
              min="1"
              max={selectedRider.seats}
              value={seatCount}
              onChange={(e) => setSeatCount(Number(e.target.value))}
            />

            <p><strong>Vehicle:</strong> {selectedRider.vehicle}</p>
            <p><strong>Contact:</strong> {selectedRider.phone}</p>
            <p><strong>Rating:</strong> ⭐ {selectedRider.rating}</p>

            <div className="modal-buttons">
              <button onClick={confirmBooking}>Confirm</button>
              <button onClick={() => setSeatModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
