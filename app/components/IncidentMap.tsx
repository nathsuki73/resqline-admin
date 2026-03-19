"use client";
import React, { useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import { MapPin, ExternalLink, Circle } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface IncidentMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: "SOS" | "Fire" | "Flood";
}

const IncidentMap = () => {
  const [viewState, setViewState] = useState({
    longitude: 121.0287,
    latitude: 14.6574,
    zoom: 14,
  });

  const incidents: IncidentMarker[] = [
    { id: "1", lat: 14.661, lng: 121.025, label: "Jose R. - SOS", type: "SOS" },
    {
      id: "2",
      lat: 14.6574,
      lng: 121.0287,
      label: "Maria S. - SOS",
      type: "SOS",
    },
    { id: "3", lat: 14.654, lng: 121.033, label: "Grass Fire", type: "Fire" },
  ];

  const getMarkerColor = (type: string) => {
    if (type === "SOS") return "bg-red-500 ring-red-500/40";
    if (type === "Fire") return "bg-orange-500 ring-orange-500/40";
    return "bg-blue-500 ring-blue-500/40";
  };

  return (
    <div className="relative h-full h-[500px] bg-[#0a0a0a] overflow-hidden rounded-xl border border-gray-800">
      {/* Map Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 text-orange-500">
          <MapPin size={18} />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
            Incident Location
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-gray-500">
            14.6574°N 121.0287°E
          </span>
          <button className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border border-gray-700">
            Open in Maps <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Mapbox Instance */}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11" // Sleek dark theme
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100vh" }}
      >
        <NavigationControl position="bottom-right" />

        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            latitude={incident.lat}
            longitude={incident.lng}
            anchor="bottom"
          >
            <div className="flex flex-col items-center group cursor-pointer">
              {/* Pulsing Marker */}
              <div
                className={`relative h-4 w-4 rounded-full ${getMarkerColor(incident.type)} ring-4 shadow-xl`}
              >
                {incident.type === "SOS" && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
                )}
              </div>

              {/* Label */}
              <div className="mt-2 bg-black/80 border border-gray-800 px-2 py-1 rounded text-[10px] font-bold text-gray-200 whitespace-nowrap shadow-2xl">
                {incident.label}
              </div>

              {/* Selection Ring (Specific to your image for Maria S.) */}
              {incident.id === "2" && (
                <div className="absolute -top-1 h-6 w-6 rounded-full border-2 border-orange-500/50 -z-10 animate-pulse" />
              )}
            </div>
          </Marker>
        ))}
      </Map>

      {/* Legend Overlay */}
      <div className="absolute top-20 right-4 z-10 bg-black/60 border border-gray-800 p-3 rounded-xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
          Legend
        </p>
        <div className="flex flex-col gap-2">
          <LegendItem color="bg-red-500" label="SOS" />
          <LegendItem color="bg-orange-500" label="Fire" />
          <LegendItem color="bg-blue-500" label="Flood" />
        </div>
      </div>

      {/* Footer Coordinates Overlay */}
      <div className="absolute bottom-6 left-6 z-10 bg-black/60 border border-gray-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-gray-400 backdrop-blur-sm">
        14.6574°N · 121.0287°E · Brgy. Pag-asa, QC
      </div>
    </div>
  );
};

// Sub-component for Legend
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`h-2 w-2 rounded-full ${color}`} />
    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">
      {label}
    </span>
  </div>
);

export default IncidentMap;
