import { useMap } from "react-leaflet";
import { useEffect } from "react";

const ChangeView = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 2 }); // Smoothly transition to the new location
    }
  }, [center, zoom, map]);

  return null;
};

export default ChangeView;
