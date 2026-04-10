import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { socket, connectSocket, disconnectSocket } from "../utils/socket";

const useLocationTracker = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === "seller") {
      connectSocket(user);

      const trackLocation = () => {
        if (!navigator.geolocation) {
          console.error("[GEOLOCATION] Not supported");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`[GEOLOCATION] Updating: ${latitude}, ${longitude}`);

            socket.emit("update-location", {
              userId: user._id,
              lat: latitude,
              lng: longitude,
            });
          },
          (error) => {
            console.error("[GEOLOCATION] Error:", error.message);
            // Even if location fails, send heartbeat
            socket.emit("heartbeat", { userId: user._id });
          },
          { enableHighAccuracy: true },
        );
      };

      // Initial track
      trackLocation();

      // Set interval for real-time tracking (every 15 seconds)
      intervalRef.current = setInterval(trackLocation, 15000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        disconnectSocket();
      };
    }
  }, [isAuthenticated, user]);
};

export default useLocationTracker;
