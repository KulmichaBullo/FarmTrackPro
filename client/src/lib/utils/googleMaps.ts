let googleMapsPromise: Promise<void> | null = null;

/**
 * Load Google Maps API script
 * @returns Promise that resolves when the API is loaded
 */
export function loadGoogleMapsAPI(): Promise<void> {
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if API is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Create callback function for when API loads
    const callbackName = `googleMapsInitialize_${Date.now()}`;
    (window as any)[callbackName] = function() {
      resolve();
      delete (window as any)[callbackName];
    };

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=drawing&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
      delete (window as any)[callbackName];
    };

    // Add script to document
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

declare global {
  interface Window {
    google: any;
  }
}