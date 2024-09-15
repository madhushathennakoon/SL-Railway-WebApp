import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import ChangeView from "./ChangeView";
import "./MapFunction.css";

const trainRoutes = {
  1: "Colombo to Badulla",
  2: "Colombo to Matara",
  3: "Colombo to Trincomalee ",
  4: "Colombo to Jaffna  ",
  5: "Colombo to Puttalam ",
  6: "Colombo to Matale ",
  7: "Colombo to KelaniValley ",
};

const MapFunction = () => {
  const [location, setLocation] = useState(null);
  const [mapZoom, setMapZoom] = useState(8);
  const [selectedRoute, setSelectedRoute] = useState(1);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/train/${selectedRoute}`,
          {
            headers: {
              "x-api-key": import.meta.env.VITE_API_KEY,
            },
          }
        );
        console.log("API Response:", response);

        const loc = response.data;

        setLocation({
          lat: loc.location[0],
          lng: loc.location[1],
          stationName: loc.stationName,
          timestamp: loc.timestamp,
        });
      } catch (error) {
        console.error("Error fetching latest location data:", error.message);
      }
    };

    fetchLocation();

    const intervalId = setInterval(fetchLocation, 10000);

    return () => clearInterval(intervalId);
  }, [selectedRoute]);

  useEffect(() => {
    if (location) {
      setMapZoom(15);
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
          center={[7.8731, 80.7718]}
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
