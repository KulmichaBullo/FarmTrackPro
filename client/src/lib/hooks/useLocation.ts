import { useState, useEffect } from 'react';

interface LocationState {
  loading: boolean;
  error: string | null;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    loading: true,
    error: null,
    coordinates: {
      latitude: null,
      longitude: null,
    },
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        ...location,
        loading: false,
        error: "Geolocation is not supported by your browser",
      });
      return;
    }

    const success = (position: GeolocationPosition) => {
      setLocation({
        loading: false,
        error: null,
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
    };

    const error = (error: GeolocationPositionError) => {
      setLocation({
        ...location,
        loading: false,
        error: error.message,
      });
    };

    // Get current position with high accuracy
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
    
    // Set up a watchPosition to track location changes
    const watchId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    // Clean up
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return location;
}
