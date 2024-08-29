import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import ChangeView from "./ChangeView";
import "./MapFunction.css";

const trainRoutes = {
  1: "Colombo to Kandy",
  2: "Colombo to Galgamuwa",
  3: "Colombo to Matara",

  // Add more routes here
};

const MapFunction = () => {
  const [location, setLocation] = useState(null);
  const [mapZoom, setMapZoom] = useState(8); // Initial zoom level
  const [selectedRoute, setSelectedRoute] = useState(1); // Default route
  const API_KEY = "madhusha-sampath"; // Replace with your actual API key

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/train/${selectedRoute}`,
          {
            headers: {
              "x-api-key": API_KEY, // Include the API key in the request headers
            },
          }
        );
        console.log("API Response:", response);

        const loc = response.data;

        setLocation({
          lat: loc.location[1],
          lng: loc.location[0],
          stationName: loc.stationName,
          timestamp: loc.timestamp,
        });
      } catch (error) {
        console.error("Error fetching latest location data:", error.message);
      }
    };

    // Fetch location immediately
    fetchLocation();

    // Set up polling to fetch location every 10 seconds
    const intervalId = setInterval(fetchLocation, 10000); // Poll every 10 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [selectedRoute]);

  // Update zoom level when location changes, if desired
  useEffect(() => {
    if (location) {
      setMapZoom(15); // Example: Zoom in when location updates
    }
  }, [location]);

  const handleRouteChange = (event) => {
    setSelectedRoute(event.target.value);
  };

  return (
    <div className="map-container">
      <div className="sidebar">
        <h2>Select Train Route</h2>
        <select onChange={handleRouteChange} value={selectedRoute}>
          {Object.entries(trainRoutes).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="map-view">
        <MapContainer
          center={[7.8731, 80.7718]} // Default center (Sri Lanka)
          zoom={mapZoom}
          style={{ height: "100vh", width: "100%" }}
        >
          {/* Change the map view when location updates */}
          {location && (
            <ChangeView center={[location.lat, location.lng]} zoom={mapZoom} />
          )}

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />

          {location && (
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                {location.stationName ? (
                  <div>
                    <strong>{location.stationName}</strong>
                    <br />
                    Timestamp:{" "}
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </div>
                ) : (
                  <div>
                    In Transit
                    <br />
                    Timestamp:{" "}
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapFunction;
