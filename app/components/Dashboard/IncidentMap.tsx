"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import Map, { Marker, NavigationControl, type MapRef } from "react-map-gl/mapbox";
import { Loader2 } from "lucide-react";
import { useReports } from "@/app/hooks/useReports";
import { useRealtimeReports } from "@/app/hooks/useRealTimeReports";
import type { BridgeIncident } from "./incidentBridge";
import "mapbox-gl/dist/mapbox-gl.css";

interface IncidentMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: "SOS" | "Fire" | "Flood";
  incident: BridgeIncident;
}

type IncidentSummary = {
  total: number;
  sos: number;
  fire: number;
  flood: number;
};

const mapStatusToSlug = (status: unknown): BridgeIncident["status"] => {
  if (status === 1 || status === "submitted") return "submitted";
  if (status === 2 || status === "in-progress" || status === "under-review") {
    return "in-progress";
  }
  if (status === 3 || status === "resolved") return "resolved";
  return "under-review";
};

const mapCategoryToDepartment = (category: unknown): BridgeIncident["department"] => {
  if (category === 3) return "BFP";
  if (category === 2) return "CTMO";
  if (category === 5) return "PNP";
  return "PDRRMO";
};

const mapCategoryToSeverity = (category: unknown): BridgeIncident["severity"] => {
  if (category === 3 || category === 1) return "Critical";
  if (category === 2 || category === 4) return "High";
  return "Medium";
};

const getMarkerType = (cat: number): "SOS" | "Fire" | "Flood" => {
  if (cat === 3) return "Fire";
  if (cat === 4) return "Flood";
  return "SOS";
};

const IncidentMap: React.FC<{
  onOpenFullMap?: () => void;
  onIncidentSelect?: (incident: BridgeIncident) => void;
  refreshToken?: number;
  onRefreshComplete?: () => void;
  searchQuery?: string;
  departmentFilter?: "All" | BridgeIncident["department"];
  showIncidentsLayer?: boolean;
  onSummaryChange?: (summary: IncidentSummary) => void;
}> = ({
  onOpenFullMap,
  onIncidentSelect,
  refreshToken = 0,
  onRefreshComplete,
  searchQuery = "",
  departmentFilter = "All",
  showIncidentsLayer = true,
  onSummaryChange,
}) => {
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasInitialCentered = useRef(false);

  const { reports: apiReports, loading: apiLoading, mutate: reloadReports } = useReports();
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
        const geoCode =
          r.reportedAt?.reverseGeoCode || r.location?.reverseGeoCode;
        const locationString =
          geoCode ??
          (Number.isFinite(lat) && Number.isFinite(lng)
            ? `Lat ${lat}, Lon ${lng}`
            : "Unknown Location");
        const rawDate = r.createdAt || r.dateCreated;
        const incidentCategoryName = getMarkerType(r.category);

        return {
          id: r.id || r._id || Math.random().toString(),
          lat,
          lng,
          label: r.description || "Active Incident",
          type: incidentCategoryName,
          incident: {
            id: String(r.id || r._id || ""),
            incidentType: r.description || "General Incident",
            location: locationString,
            latitude: Number.isFinite(lat) ? lat : undefined,
            longitude: Number.isFinite(lng) ? lng : undefined,
            reporter: r.reportByName || r.reportedBy?.name || "Unknown",
            reporterContact:
              r.reportByPhoneNumber ||
              r.reportedBy?.phoneNumber ||
              "No contact provided",
            department: mapCategoryToDepartment(r.category),
            severity: mapCategoryToSeverity(r.category),
            status: mapStatusToSlug(r.status),
            time: rawDate
              ? new Date(rawDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A",
            reporterDescription: r.description || "",
            internalNote: r.internalNote || "",
            aiAnalysis: r.aiProbabilities || {},
            images: r.image || r.images || [],
            type: incidentCategoryName.toUpperCase(),
          },
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

  const filteredIncidents = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return incidents.filter((incident) => {
      if (
        departmentFilter !== "All" &&
        incident.incident.department !== departmentFilter
      ) {
        return false;
      }

      if (!normalizedSearch) return true;

      const searchTarget = [
        incident.label,
        incident.incident.incidentType,
        incident.incident.location,
        incident.incident.reporter,
        incident.incident.department,
      ]
        .join(" ")
        .toLowerCase();

      return searchTarget.includes(normalizedSearch);
    });
  }, [incidents, searchQuery, departmentFilter]);

  useEffect(() => {
    const summary: IncidentSummary = {
      total: filteredIncidents.length,
      sos: filteredIncidents.filter((incident) => incident.type === "SOS").length,
      fire: filteredIncidents.filter((incident) => incident.type === "Fire").length,
      flood: filteredIncidents.filter((incident) => incident.type === "Flood").length,
    };

    onSummaryChange?.(summary);
  }, [filteredIncidents, onSummaryChange]);

  // Auto-center on initial load and refresh, not on search changes
  useEffect(() => {
    if (incidents.length === 0) return;
    if (hasInitialCentered.current && refreshToken === 0) return;

    hasInitialCentered.current = true;
    setViewState((prev) => ({
      ...prev,
      latitude: incidents[0].lat,
      longitude: incidents[0].lng,
      zoom: 14,
    }));
    console.log("🎯 Map centered on first incident");
  }, [incidents, refreshToken]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeMap = () => {
      mapRef.current?.resize();
    };

    // Run once immediately and once on next frame for layout-transition cases.
    resizeMap();
    const rafId = window.requestAnimationFrame(resizeMap);

    const observer = new ResizeObserver(() => {
      resizeMap();
    });

    observer.observe(container);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (refreshToken === 0) return;

    setViewState({
      longitude: 121.0287,
      latitude: 14.6574,
      zoom: 13,
    });

    const refreshData = async () => {
      try {
        await reloadReports();
      } finally {
        onRefreshComplete?.();
      }
    };

    void refreshData();
  }, [refreshToken, reloadReports, onRefreshComplete]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden border border-(--color-border-1) bg-(--color-bg)"
    >
      {/* Show loader ONLY if we have absolutely no data yet */}
      {apiLoading && incidents.length === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <Loader2 className="animate-spin text-(--color-orange)" size={32} />
        </div>
      )}

      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" />

        {showIncidentsLayer
          ? filteredIncidents.map((incident) => (
          <Marker
            key={incident.id}
            latitude={incident.lat}
            longitude={incident.lng}
            anchor="bottom"
          >
            <button
              type="button"
              onClick={() => onIncidentSelect?.(incident.incident)}
              className="group flex cursor-pointer flex-col items-center"
            >
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
            </button>
          </Marker>
            ))
          : null}
      </Map>
    </div>
  );
};

export default IncidentMap;
