"use client";
import React, { useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import { MapPin, ExternalLink } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface IncidentMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: "SOS" | "Fire" | "Flood";
}

interface IncidentMapProps {
  onOpenFullMap?: () => void;
}

const IncidentMap: React.FC<IncidentMapProps> = ({ onOpenFullMap }) => {
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
    if (type === "SOS") return "bg-(--color-red) ring-(--color-red-border)";
    if (type === "Fire") return "bg-(--color-orange) ring-(--color-orange-border)";
    return "bg-(--color-blue) ring-(--color-blue-border)";
  };

  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-(--color-border-1) bg-(--color-bg)">
      {/* Map Header Overlay */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-linear-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center gap-2 text-(--color-orange)">
          <MapPin size={18} />
          <span className="text-xs font-bold uppercase tracking-widest text-(--color-text-2)">
            Incident Location
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-(--color-text-3)">
            14.6574°N 121.0287°E
          </span>
          <button
            type="button"
            onClick={onOpenFullMap}
            className="ui-btn ui-btn-secondary border-(--color-border-2) bg-black/45 text-(--color-text-2)"
          >
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
                className={`relative h-4 w-4 rounded-full ring-4 shadow-xl ${getMarkerColor(incident.type)}`}
              >
                {incident.type === "SOS" && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-(--color-red) opacity-75"></span>
                )}
              </div>

              {/* Label */}
              <div className="mt-2 whitespace-nowrap rounded border border-(--color-border-1) bg-black/80 px-2 py-1 text-[10px] font-bold text-(--color-text-2) shadow-2xl">
                {incident.label}
              </div>

              {/* Selection Ring (Specific to your image for Maria S.) */}
              {incident.id === "2" && (
                <div className="-z-10 absolute -top-1 h-6 w-6 animate-pulse rounded-full border-2 border-(--color-orange-border)" />
              )}
            </div>
          </Marker>
        ))}
      </Map>

      {/* Legend Overlay */}
      <div className="absolute right-4 top-20 z-10 rounded-xl border border-(--color-border-1) bg-black/60 p-3 backdrop-blur-md">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-(--color-text-3)">
          Legend
        </p>
        <div className="flex flex-col gap-2">
          <LegendItem color="bg-(--color-red)" label="SOS" />
          <LegendItem color="bg-(--color-orange)" label="Fire" />
          <LegendItem color="bg-(--color-blue)" label="Flood" />
        </div>
      </div>

      {/* Footer Coordinates Overlay */}
      <div className="absolute bottom-6 left-6 z-10 rounded-lg border border-(--color-border-1) bg-black/60 px-3 py-1.5 text-[10px] text-(--color-text-3) backdrop-blur-sm">
        14.6574°N · 121.0287°E · Brgy. Pag-asa, QC
      </div>
    </div>
  );
};

// Sub-component for Legend
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`h-2 w-2 rounded-full ${color}`} />
    <span className="text-[10px] font-bold uppercase tracking-tight text-(--color-text-2)">
      {label}
    </span>
  </div>
);

export default IncidentMap;
