import React, { useState, useEffect } from "react";
import carpoolData from "./carpools"; 
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapComponent = () => {
  const [startCoords, setStartCoords] = useState(null);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [startPlace, setStartPlace] = useState("");
  const [endPlace, setEndPlace] = useState("");
  const [endCoords, setEndCoords] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [carpools, setCarpools] = useState([]);

  const [userBookings, setUserBookings] = useState({});
  const [toast, setToast] = useState("");

  // New states for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCarpoolIndex, setModalCarpoolIndex] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);

  // New state for pickup message feature
  const [recentBooking, setRecentBooking] = useState(null);

  // Rider Details Modal
  const [riderModalOpen, setRiderModalOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);


  // 🔹 New state for carbon impact
  const [carbonImpact, setCarbonImpact] = useState({ solo: 0, saved: 0, perPerson: 0 });

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setGpsCoords(coords);
          setStartCoords(coords);
          setStartPlace("");
          setRoutes([]);
          setEndCoords(null);
          setError(null);
        },
        () => setError("Could not get your current location.")
      );
    } else setError("Geolocation not supported.");
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const getCoordinates = async (place) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
    );
    const data = await res.json();
    if (!data.length) throw new Error(`Location not found: ${place}`);
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };

  const fetchRoutes = async () => {
    if (!startCoords) {
      setError("Start location not available.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRoutes([]);

      if (!endPlace) {
        setError("Please enter a destination");
        setLoading(false);
        return;
      }

      const end = await getCoordinates(endPlace);
      setEndCoords(end);

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${end[1]},${end[0]}?alternatives=true&overview=full&geometries=geojson`
      );

      if (!response.ok) throw new Error("Failed to fetch routes");

      const data = await response.json();

      const rawRoutes = data.routes.slice(0, 3).map((route) => ({
        coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distance: route.distance,
        duration: route.duration,
      }));

      if (!rawRoutes.length) throw new Error("No routes found");

      const minDuration = Math.min(...rawRoutes.map((r) => r.duration));
      const maxDuration = Math.max(...rawRoutes.map((r) => r.duration));

      const formattedRoutes = rawRoutes.map((route, index) => {
        let label = "Normal";
        let color = "green";

        if (route.duration === minDuration) {
          label = "Fastest & Eco Friendly ⚡🌱";
          color = "blue";
        } else if (route.duration === maxDuration) {
          label = "Slowest 🐢";
          color = "red";
        }

        return {
          routeId: index,
          name: `Route ${index + 1} (${label})`,
          coords: route.coords,
          distance: (route.distance / 1000).toFixed(2),
          duration: Math.round(route.duration / 60),
          color,
        };
      });

      // 🔹 regenerate carpools using REAL rider data
const shuffledRiders = [...carpoolData].sort(() => Math.random() - 0.5);
const newCarpools = [];

formattedRoutes.forEach((route) => {
  const count = Math.floor(Math.random() * 4) + 2; // 2–5 riders per route

  shuffledRiders
    .filter((r) => r.route === route.routeId)
    .slice(0, count)
    .forEach((rider) => {
      newCarpools.push({
        ...rider,                 // ✅ real data
        route: route.routeId,     // ensure route matches
      });
    });
});

setCarpools(newCarpools);

      setRoutes(formattedRoutes);
      setActiveRouteIndex(0);
      setUserBookings({}); // reset previous bookings on new routes
      setRecentBooking(null); // remove pickup message when new routes are fetched
      setCarbonImpact({ solo: 0, saved: 0, perPerson: 0 }); // reset carbon on new route fetch
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSearch = async () => {
    setRecentBooking(null); // reset pickup message
    if (!startPlace.trim()) {
      setError("Please enter a location to change start.");
      return;
    }
    try {
      const coords = await getCoordinates(startPlace);
      setStartCoords(coords);
      setRoutes([]);
      setEndCoords(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUseCurrentLocation = () => {
    setRecentBooking(null); // reset pickup message
    if (!gpsCoords) {
      setError("GPS location not available yet.");
      return;
    }
    setStartCoords(gpsCoords);
    setStartPlace("");
    setRoutes([]);
    setEndCoords(null);
    setError(null);
  };

  // Reset pickup message when endPlace or route changes
  useEffect(() => {
    setRecentBooking(null);
  }, [endPlace, activeRouteIndex]);

  // 🔹 Carbon impact calculation
  useEffect(() => {
    if (!routes.length) return;
    const activeRoute = routes[activeRouteIndex];
    const distanceKm = parseFloat(activeRoute.distance);
    const emissionFactor = 0.12; // kg CO₂ per km per person

    const soloCO2 = distanceKm * emissionFactor;

    // Count total passengers in booked carpools for this route
    let totalSeatsBooked = 0;
    Object.values(userBookings).forEach((b) => {
      if (b.route === activeRoute.routeId) totalSeatsBooked += b.seats;
    });

    const passengers = totalSeatsBooked > 0 ? totalSeatsBooked + 1 : 1;
    const perPersonCO2 = soloCO2 / passengers;
    const savedCO2 = soloCO2 - perPersonCO2;

    setCarbonImpact({ solo: soloCO2.toFixed(2), saved: savedCO2.toFixed(2), perPerson: perPersonCO2.toFixed(2) });
  }, [activeRouteIndex, routes, userBookings]);

  // Open modal instead of prompt
  const handleBooking = (idx) => {
    if (Object.keys(userBookings).length > 0) {
      setToast("You have already booked a ride!");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    setModalCarpoolIndex(idx);
    setSeatsToBook(1);
    setModalOpen(true);
  };

  // Confirm booking from modal
  const confirmBooking = () => {
    const idx = modalCarpoolIndex;
    const routeId = routes[activeRouteIndex].routeId;
    const selected = carpools.filter((c) => c.route === routeId)[idx];



    if (!selected || selected.seats === 0) {
      setToast("No seats available");
      setTimeout(() => setToast(""), 3000);
      setModalOpen(false);
      return;
    }

    let seats = seatsToBook;
    if (seats > selected.seats) seats = selected.seats;

    const updatedCarpools = carpools.map((c) =>
      c === selected ? { ...c, seats: c.seats - seats } : c
    );
    setCarpools(updatedCarpools);

    setUserBookings((prev) => {
      const prevSeats = prev[selected.name]?.seats || 0;
      return { ...prev, [selected.name]: { route: routeId, seats: prevSeats + seats } };
    });

    setToast(`Booking confirmed: ${seats} seat(s) in ${selected.name}`);
    setRecentBooking({ name: selected.name, route: routeId });


    setTimeout(() => setToast(""), 4000);

    setModalOpen(false);
  };

  const handleCancelBooking = (name) => {
    const booked = userBookings[name];
    if (!booked) return;

    const updatedCarpools = carpools.map((c) =>
      c.name === name && c.route === booked.route
        ? { ...c, seats: c.seats + booked.seats }
        : c
    );
    setCarpools(updatedCarpools);

    setUserBookings((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });

    // 🔹 ADD THIS LINE
    if (recentBooking?.name === name) setRecentBooking(null);

    setToast(`Cancelled booking for ${name}`);
    setTimeout(() => setToast(""), 3000);
  };


  const openRiderDetails = () => {
  if (!recentBooking) return;

  const activeRoute = routes[activeRouteIndex];

  const carpool = carpools.find(
  (c) => c.name === recentBooking.name
);


  if (!carpool) return;

  setSelectedRider({
  // ✅ explicitly map rider data
  riderName: carpool.name,
  vehicle: carpool.vehicle,
  rating: carpool.rating,
  contact: carpool.phone,
   

  // ✅ route info MUST come from routes[]
  route: routes[activeRouteIndex]?.name,

  // ✅ booking + UI info
  seats: userBookings[carpool.name]?.seats || 0,
  eta: "10 minutes",

  // ✅ map-calculated values (unchanged)
  distance: activeRoute?.distance,
  duration: activeRoute?.duration,
});


  setRiderModalOpen(true);
};


  const getCarpoolsForRoute = (routeIndex) => {
    const routeId = routes[routeIndex]?.routeId ?? 0;
    const options = carpools.filter((c) => c.route === routeId);
    return options.length ? options : [{ name: "No carpools available", seats: 0 }];
  };

  return (
    <div className="map-component">
      <div className="input-container">
        {startCoords && (
          <>
            <input
              className="start"
              type="text"
              value={startPlace}
              placeholder="Your Current Location"
              onChange={(e) => setStartPlace(e.target.value)}
            />
            <button onClick={handleStartSearch}>Change Start</button>
            <button onClick={handleUseCurrentLocation}>Use Current Location</button>
          </>
        )}
        <input
          className="end"
          type="text"
          placeholder="Enter destination"
          value={endPlace}
          onChange={(e) => setEndPlace(e.target.value)}
        />
        <button onClick={fetchRoutes}>Show Routes</button>
      </div>

      {loading && <p>Loading routes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {startCoords && (
        <div className="map-wrapper">
          <MapContainer center={startCoords} zoom={11} className="leaflet-container">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={startCoords}>
              <Tooltip>{startPlace || "Your Current Location"}</Tooltip>
            </Marker>
            {endCoords && (
              <Marker position={endCoords}>
                <Tooltip>{endPlace}</Tooltip>
              </Marker>
            )}
            {routes.map((route, idx) => (
              <Polyline
                key={idx}
                positions={route.coords}
                pathOptions={{
                  color: route.color,
                  weight: idx === activeRouteIndex ? 6 : 4,
                  opacity: idx === activeRouteIndex ? 0.9 : 0.6,
                }}
                renderer={L.canvas()}
              />
            ))}
          </MapContainer>

          {routes.length > 0 && (
            <>
              {/* Route selection card */}
              <div className="route-card centered-card">
                <strong>Choose a Route</strong>
                <ul className="route-list">
                  {routes.map((r, idx) => (
                    <li
                      key={idx}
                      className={idx === activeRouteIndex ? "active-route" : ""}
                      onClick={() => setActiveRouteIndex(idx)}
                    >
                      <span>{r.name}</span>
                      <span>
                        {r.distance} km | {r.duration} min
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 🔹 Carbon Impact Card */}
              <div className="route-card centered-card">
                <strong>Carbon Impact 🌱</strong>
                <p>Solo CO₂: {carbonImpact.solo} kg</p>
                <p>Per Person CO₂: {carbonImpact.perPerson} kg</p>
                <p>Carbon Saved: {carbonImpact.saved} kg</p>
              </div>

              {/* Carpool suggestions */}
              <div className="carpool-card centered-card">
                <strong>Suggested Carpools</strong>
                <ul>
                  {getCarpoolsForRoute(activeRouteIndex).map((carpool, idx) => (
                    <li key={idx}>
                      {carpool.name}
                      {carpool.seats > 0 && (
                        <span className="seat-badge">{carpool.seats} seats</span>
                      )}
                      {carpool.seats > 0 && (
                        <button
                          onClick={() => handleBooking(idx)}
                          style={{ marginLeft: "8px" }}
                        >
                          Book
                        </button>
                      )}
                      {userBookings[carpool.name] && (
                        <button
                          onClick={() => handleCancelBooking(carpool.name)}
                          style={{ marginLeft: "8px" }}
                        >
                          Cancel
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {recentBooking && (
                  <div
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#e0f7ff",
                      padding: "12px 20px",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span>Rider will pick you up in ~10 minutes</span>
                    <button
                      style={{
                        padding: "6px 12px",
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                      onClick={openRiderDetails}

                    >
                      View Rider Details
                    </button>
                  </div>
                )}
              </div>

              {toast && <div className="toast">{toast}</div>}

              {/* Booking Modal */}
              {modalOpen && modalCarpoolIndex !== null && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3>Book Seats</h3>
                    <p>Rider will pick up in ~10 minutes</p>
                    <input
                      type="number"
                      min="1"
                      max={
                        carpools.filter((c) => c.route === routes[activeRouteIndex].routeId)[
                          modalCarpoolIndex
                        ]?.seats || 1
                      }
                      value={seatsToBook}
                      onChange={(e) => setSeatsToBook(Number(e.target.value))}
                    />
                    <div className="modal-buttons">
                      <button onClick={confirmBooking}>Confirm Book</button>
                      <button onClick={() => setModalOpen(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Rider Details Modal */}
{riderModalOpen && selectedRider && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Rider Details</h3>

      <p><strong>Name:</strong> {selectedRider.riderName}</p>
      <p><strong>Route:</strong> {selectedRider.route}</p>
      <p><strong>Seats Booked:</strong> {selectedRider.seats}</p>
      <p><strong>Pickup ETA:</strong> {selectedRider.eta}</p>
      <p><strong>Contact:</strong> {selectedRider.contact}</p>
      <p><strong>Distance:</strong> {selectedRider.distance} km</p>
      <p><strong>Duration:</strong> {selectedRider.duration} min</p>
      <p><strong>Vehicle:</strong> {selectedRider.vehicle}</p>
      <p><strong>Rating:</strong> {selectedRider.rating} ⭐</p>

      

      <div className="modal-buttons">
        <button onClick={() => setRiderModalOpen(false)}>
          Close
        </button>
      </div>
    </div>
  </div>
)}

            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MapComponent;










































