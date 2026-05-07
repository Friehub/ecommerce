'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, addressDetails?: any) => void;
  initialPos?: [number, number];
}

function LocationMarker({ position, setPosition, onLocationSelect }: { 
  position: [number, number], 
  setPosition: (pos: [number, number]) => void,
  onLocationSelect: (lat: number, lng: number, details?: any) => void
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      map.flyTo(e.latlng, map.getZoom());
      fetchReverseGeocode(newPos[0], newPos[1]);
    },
  });

  const fetchReverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      onLocationSelect(lat, lng, data);
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      onLocationSelect(lat, lng);
    }
  };

  return (
    <Marker position={position} />
  );
}

export default function LocationPicker({ onLocationSelect, initialPos = [6.5244, 3.3792] }: LocationPickerProps) {
  const [position, setPosition] = React.useState<[number, number]>(initialPos);

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-100 shadow-inner relative z-0">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
      </MapContainer>
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-extrabold uppercase tracking-tight text-gray-500 shadow-sm">
        Click to pin delivery location
      </div>
    </div>
  );
}
