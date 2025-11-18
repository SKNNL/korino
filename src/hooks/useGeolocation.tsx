import { useState, useEffect } from "react";

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        loading: false,
        error: "La géolocalisation n'est pas supportée par votre navigateur",
      });
      return;
    }

    setState({ coordinates: null, loading: true, error: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMessage = "Impossible d'obtenir votre position";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Vous avez refusé l'accès à votre position";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position non disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "La demande de position a expiré";
            break;
        }

        setState({
          coordinates: null,
          loading: false,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  return {
    ...state,
    requestLocation,
  };
};
