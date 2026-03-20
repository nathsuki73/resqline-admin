"use client";
import React, { useState, useMemo, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import { useReports } from "@/app/hooks/useReports";
import { useRealtimeReports } from "@/app/hooks/useRealTimeReports";
import "mapbox-gl/dist/mapbox-gl.css";

interface IncidentMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: "SOS" | "Fire" | "Flood";
}

const IncidentMap: React.FC<{ onOpenFullMap?: () => void }> = ({
  onOpenFullMap,
}) => {
  const { reports: apiReports, loading: apiLoading } = useReports();
  const { reports: realtimeReports } = useRealtimeReports();

  const [viewState, setViewState] = useState({
    longitude: 121.0287,
    latitude: 14.6574,
    zoom: 13, // Slightly zoomed out to see markers better
  });

  // EXACT SYNC WITH TRIAGE FEED: Merge the data sources
  const incidents = useMemo((): IncidentMarker[] => {
    const mergedReports = [...realtimeReports, ...apiReports];

    console.log(`🗺️ Map Sync: Merged ${mergedReports.length} reports.`);

    return mergedReports
      .map((r: any) => {
        // Use the exact same path TriageFeed uses: r.location?.latitude
        const lat = parseFloat(r.location?.latitude ?? r.latitude ?? r.lat);
        const lng = parseFloat(r.location?.longitude ?? r.longitude ?? r.lng);

        const getMarkerType = (cat: number): "SOS" | "Fire" | "Flood" => {
          if (cat === 3) return "Fire";
          if (cat === 4) return "Flood";
          return "SOS";
        };

        return {
          id: r.id || r._id || Math.random().toString(),
          lat,
          lng,
          label: r.description || "Active Incident",
          type: getMarkerType(r.category),
        };
      })
      .filter((inc) => {
        const isValid =
          !isNaN(inc.lat) && inc.lat !== 0 && inc.lat >= -90 && inc.lat <= 90;
        if (!isValid && mergedReports.length > 0) {
          console.warn("📍 Marker filtered out due to invalid coords:", inc);
        }
        return isValid;
      });
  }, [apiReports, realtimeReports]);

  const getMarkerColor = (type: string) => {
    if (type === "Fire")
      return "bg-(--color-orange) ring-(--color-orange-border)";
    if (type === "Flood") return "bg-(--color-blue) ring-(--color-blue-border)";
    return "bg-(--color-red) ring-(--color-red-border)";
  };

  // Inside your IncidentMap component
  useEffect(() => {
    if (incidents.length > 0 && viewState.latitude === 14.6574) {
      // If we have data and we are still at the default QC view,
      // snap to the first incident found.
      setViewState((prev) => ({
        ...prev,
        latitude: incidents[0].lat,
        longitude: incidents[0].lng,
        zoom: 14,
      }));
      console.log("🎯 Map re-centered to first incident in Dolores");
    }
  }, [incidents]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-(--color-border-1) bg-(--color-bg)">
      {/* Show loader ONLY if we have absolutely no data yet */}
      {apiLoading && incidents.length === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <Loader2 className="animate-spin text-(--color-orange)" size={32} />
        </div>
      )}

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-linear-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center gap-2 text-(--color-orange)">
          <MapPin size={18} />
          <span className="text-xs font-bold uppercase tracking-widest text-(--color-text-2)">
            Live Scene Map
          </span>
        </div>
        <div className="px-2 py-1 rounded bg-black/40 text-[10px] font-mono text-(--color-text-3)">
          {incidents.length} FEED ITEMS MAPPED
        </div>
      </div>

      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
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
              <div
                className={`relative h-5 w-5 rounded-full ring-4 shadow-xl border-2 border-white/20 ${getMarkerColor(incident.type)}`}
              >
                {incident.type === "SOS" && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-(--color-red) opacity-75"></span>
                )}
              </div>
              <div className="mt-2 whitespace-nowrap rounded border border-(--color-border-1) bg-black/90 px-2 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {incident.label}
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
};

export default IncidentMap;
