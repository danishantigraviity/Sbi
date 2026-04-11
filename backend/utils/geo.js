/**
 * Calculates the distance between two points in meters using the Haversine formula.
 * @param {number} lat1 - Latitude of coordinate 1
 * @param {number} lon1 - Longitude of coordinate 1
 * @param {number} lat2 - Latitude of coordinate 2
 * @param {number} lon2 - Longitude of coordinate 2
 * @returns {number} Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Default Office Coordinates (Placeholder - Example: RedBank HQ)
const OFFICE_COORDS = {
  lat: 12.8707332,
  lng: 78.1082435
};

module.exports = {
  calculateDistance,
  OFFICE_COORDS
};
