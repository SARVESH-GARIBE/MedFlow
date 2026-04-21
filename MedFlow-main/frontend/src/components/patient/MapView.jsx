import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "550px",
  borderRadius: "1rem"
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629 // Center of India fallback
};

// Haversine distance calculator
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return (R * c).toFixed(1);
};

export default function MapView({ doctors, onSelectDoctor }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
  });

  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Get User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error fetching location", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const onLoad = useCallback((map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  if (!isLoaded) return (
    <div className="h-[550px] flex items-center justify-center bg-slate-800/50 rounded-2xl border border-slate-700 animate-pulse text-slate-400 font-medium tracking-wide">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        Loading interactive map...
      </div>
    </div>
  );

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl animate-in zoom-in-95 duration-500">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || defaultCenter}
        zoom={userLocation ? 12 : 5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {/* User Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            }}
          />
        )}

        {/* Doctor Markers */}
        {doctors.map((doctor) => {
          if (!doctor.locationDetails?.lat || !doctor.locationDetails?.lng) return null;

          return (
            <Marker
              key={doctor._id}
              position={{
                lat: doctor.locationDetails.lat,
                lng: doctor.locationDetails.lng,
              }}
              icon={{
                url: doctor.clinicType === "government" 
                  ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png" 
                  : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              }}
              onClick={() => setSelectedMarker(doctor)}
            />
          );
        })}

        {/* Info Window */}
        {selectedMarker && (
          <InfoWindow
            position={{
              lat: selectedMarker.locationDetails.lat,
              lng: selectedMarker.locationDetails.lng,
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2 min-w-[200px] text-slate-800 font-sans tracking-tight">
              <h3 className="font-bold text-lg leading-tight mb-1">{selectedMarker.name}</h3>
              <p className="text-emerald-700 font-semibold text-xs mb-2">🔬 {selectedMarker.specialization}</p>
              
              <div className="flex gap-2 mb-3 mt-2">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">
                  {selectedMarker.clinicType === "government" ? "🏥 Government" : "🏢 Private"}
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  ⭐ {(selectedMarker.rating || 0).toFixed(1)}
                </span>
              </div>

              {userLocation && (
                <p className="text-xs text-slate-600 mb-2 font-medium tracking-wide">
                  📍 {calculateDistance(
                    userLocation.lat, userLocation.lng, 
                    selectedMarker.locationDetails.lat, selectedMarker.locationDetails.lng
                  )} km away
                </p>
              )}

              <button
                onClick={() => onSelectDoctor(selectedMarker)}
                className="w-full mt-1 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-xs font-bold py-2 rounded shadow-md hover:shadow-lg transition-all"
              >
                Book Appointment
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
