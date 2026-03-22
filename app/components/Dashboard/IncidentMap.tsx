"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import Map, {
  Marker,
  NavigationControl,
  type MapRef,
} from "react-map-gl/mapbox";
import { Loader2 } from "lucide-react";
import { useReports } from "@/app/hooks/useReports";
import {
  getReportCategoryInput,
  type IncidentCategoryType,
  mapCategoryCodeToLabel,
  mapCategoryCodeToDepartment,
  mapCategoryCodeToType,
} from "@/app/constants/reportCategories";
import {
  mapApiStatusToSlug,
  mapResponderStatusToMobileStatus,
} from "@/app/constants/reportStatus";
import {
  getActiveIncident,
  INCIDENT_CLEARED_EVENT,
  INCIDENT_SELECTED_EVENT,
  type BridgeIncident,
} from "./incidentBridge";
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
  byType: Record<IncidentCategoryType, number>;
};

const isValidLatitude = (value: number): boolean =>
  Number.isFinite(value) && value >= -90 && value <= 90;

const isValidLongitude = (value: number): boolean =>
  Number.isFinite(value) && value >= -180 && value <= 180;

const mapCategoryToSeverity = (
  category: unknown,
): BridgeIncident["severity"] => {
  const type = mapCategoryCodeToType(category);
  if (type === "SOS" || type === "FIRE" || type === "MEDICAL")
    return "Critical";
  if (type === "TRAFFIC" || type === "FLOOD") return "High";
  return "Medium";
};

const getMarkerType = (category: unknown): "SOS" | "Fire" | "Flood" => {
  const type = mapCategoryCodeToType(category);
  if (type === "FIRE") return "Fire";
  if (type === "FLOOD") return "Flood";
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
  showSelectedOnly?: boolean;
  autoFitAllVisible?: boolean;
}> = ({
  onOpenFullMap,
  onIncidentSelect,
  refreshToken = 0,
  onRefreshComplete,
  searchQuery = "",
  departmentFilter = "All",
  showIncidentsLayer = true,
  onSummaryChange,
  showSelectedOnly = false,
  autoFitAllVisible = false,
}) => {
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasInitialCentered = useRef(false);

  const { reports, loading: apiLoading, mutate: reloadReports } = useReports();

  const [viewState, setViewState] = useState({
    longitude: 121.0287,
    latitude: 14.6574,
    zoom: 13, // Slightly zoomed out to see markers better
  });
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    () => getActiveIncident()?.id ?? null,
  );

  // Single source of truth: all reports already merged/reconciled in reportsStore.
  const incidents = useMemo((): IncidentMarker[] => {
    return reports
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
        const categoryInput = getReportCategoryInput(r);
        const incidentCategoryName = getMarkerType(categoryInput);

        return {
          id: r.id || r._id || Math.random().toString(),
          lat,
          lng,
          label: r.description || "Active Incident",
          type: incidentCategoryName,
          incident: {
            id: String(r.id || r._id || ""),
            incidentType: mapCategoryCodeToLabel(categoryInput),
            location: locationString,
            latitude: isValidLatitude(lat) ? lat : undefined,
            longitude: isValidLongitude(lng) ? lng : undefined,
            reporter: r.reportByName || r.reportedBy?.name || "Unknown",
            reporterContact:
              r.reportByPhoneNumber ||
              r.reportedBy?.phoneNumber ||
              "No contact provided",
            department: mapCategoryCodeToDepartment(categoryInput),
            severity: mapCategoryToSeverity(categoryInput),
            status: mapApiStatusToSlug(r.status),
            mobileStatus: mapResponderStatusToMobileStatus(r.status),
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
            type: mapCategoryCodeToType(categoryInput),
          },
        };
      })
      .filter((inc) => {
        const isValid = isValidLatitude(inc.lat) && isValidLongitude(inc.lng);
        if (!isValid && reports.length > 0) {
          console.warn("📍 Marker filtered out due to invalid coords:", inc);
        }
        return isValid;
      });
  }, [reports]);

  const getCategoryMarkerStyle = (categoryType?: string) => {
    const normalized = (categoryType ?? "").toUpperCase();

    if (normalized === "STRUCTURAL") {
      return {
        marker: "bg-(--color-purple) ring-(--color-purple-border)",
        ping: "bg-(--color-purple)",
      };
    }

    if (normalized === "MEDICAL") {
      return {
        marker: "bg-(--color-green) ring-(--color-green-border)",
        ping: "bg-(--color-green)",
      };
    }

    if (normalized === "TRAFFIC") {
      return {
        marker: "bg-(--color-amber) ring-(--color-amber-border)",
        ping: "bg-(--color-amber)",
      };
    }

    if (normalized === "FIRE") {
      return {
        marker: "bg-(--color-orange) ring-(--color-orange-border)",
        ping: "bg-(--color-orange)",
      };
    }

    if (normalized === "FLOOD") {
      return {
        marker: "bg-(--color-blue) ring-(--color-blue-border)",
        ping: "bg-(--color-blue)",
      };
    }

    return {
      marker: "bg-(--color-red) ring-(--color-red-border)",
      ping: "bg-(--color-red)",
    };
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

  const incidentById = useMemo(() => {
    const byId = new globalThis.Map<string, IncidentMarker>();
    incidents.forEach((incident) => {
      byId.set(String(incident.incident.id), incident);
    });
    return byId;
  }, [incidents]);

  const visibleIncidents = useMemo(() => {
    if (!showSelectedOnly) return filteredIncidents;
    if (!selectedIncidentId) return filteredIncidents;

    const selectedOnly = filteredIncidents.filter(
      (incident) => String(incident.incident.id) === String(selectedIncidentId),
    );

    return selectedOnly.length > 0 ? selectedOnly : filteredIncidents;
  }, [filteredIncidents, selectedIncidentId, showSelectedOnly]);

  const summaryCategoryTypes = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return reports
      .filter((report: any) => {
        const categoryInput = getReportCategoryInput(report);
        const department = mapCategoryCodeToDepartment(categoryInput);

        if (departmentFilter !== "All" && department !== departmentFilter) {
          return false;
        }

        if (!normalizedSearch) return true;

        const lat = report.reportedAt?.latitude || report.location?.latitude;
        const lon = report.reportedAt?.longitude || report.location?.longitude;
        const geoCode =
          report.reportedAt?.reverseGeoCode || report.location?.reverseGeoCode;
        const locationString =
          geoCode ??
          (lat && lon ? `Lat ${lat}, Lon ${lon}` : "Unknown Location");

        const searchTarget = [
          report.description || "",
          locationString,
          report.reportByName || report.reportedBy?.name || "",
          department,
        ]
          .join(" ")
          .toLowerCase();

        return searchTarget.includes(normalizedSearch);
      })
      .map((report: any) =>
        mapCategoryCodeToType(getReportCategoryInput(report)),
      );
  }, [reports, searchQuery, departmentFilter]);

  useEffect(() => {
    const initialByType: Record<IncidentCategoryType, number> = {
      SOS: 0,
      MEDICAL: 0,
      TRAFFIC: 0,
      FIRE: 0,
      FLOOD: 0,
      STRUCTURAL: 0,
      OTHER: 0,
    };

    summaryCategoryTypes.forEach((type) => {
      initialByType[type] += 1;
    });

    const summary: IncidentSummary = {
      total: summaryCategoryTypes.length,
      byType: initialByType,
    };

    onSummaryChange?.(summary);
  }, [summaryCategoryTypes, onSummaryChange]);

  // Auto-center on initial load and refresh, not on search changes
  useEffect(() => {
    if (autoFitAllVisible) return;
    if (showSelectedOnly) return;
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
  }, [incidents, refreshToken, showSelectedOnly, autoFitAllVisible]);

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

  useEffect(() => {
    const zoomToIncident = (selected: BridgeIncident | null) => {
      if (!selected) return;

      const latFromDetail = Number(selected.latitude);
      const lngFromDetail = Number(selected.longitude);
      const matched = incidentById.get(String(selected.id));

      const targetLat = isValidLatitude(latFromDetail)
        ? latFromDetail
        : Number(matched?.lat);
      const targetLng = isValidLongitude(lngFromDetail)
        ? lngFromDetail
        : Number(matched?.lng);

      if (!isValidLatitude(targetLat) || !isValidLongitude(targetLng)) return;

      const latitude = targetLat;
      const longitude = targetLng;

      const nextView = {
        latitude,
        longitude,
        zoom: 17,
      };

      setViewState((prev) => ({ ...prev, ...nextView }));
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: nextView.zoom,
        duration: 900,
        essential: true,
      });
    };

    zoomToIncident(getActiveIncident());

    const onIncidentSelected = (event: Event) => {
      const detail = (event as CustomEvent<BridgeIncident>).detail;
      setSelectedIncidentId(detail?.id ?? null);
      zoomToIncident(detail ?? null);
    };

    const onIncidentCleared = () => {
      setSelectedIncidentId(null);
    };

    window.addEventListener(
      INCIDENT_SELECTED_EVENT,
      onIncidentSelected as EventListener,
    );
    window.addEventListener(INCIDENT_CLEARED_EVENT, onIncidentCleared);

    return () => {
      window.removeEventListener(
        INCIDENT_SELECTED_EVENT,
        onIncidentSelected as EventListener,
      );
      window.removeEventListener(INCIDENT_CLEARED_EVENT, onIncidentCleared);
    };
  }, [incidentById]);

  useEffect(() => {
    if (!autoFitAllVisible || showSelectedOnly) return;
    if (visibleIncidents.length === 0) return;

    if (visibleIncidents.length === 1) {
      const only = visibleIncidents[0];
      const nextView = {
        longitude: only.lng,
        latitude: only.lat,
        zoom: 12,
      };

      setViewState((prev) => ({ ...prev, ...nextView }));
      mapRef.current?.flyTo({
        center: [only.lng, only.lat],
        zoom: nextView.zoom,
        duration: 600,
        essential: true,
      });
      return;
    }

    const first = visibleIncidents[0];
    let minLng = first.lng;
    let maxLng = first.lng;
    let minLat = first.lat;
    let maxLat = first.lat;

    visibleIncidents.forEach((incident) => {
      if (incident.lng < minLng) minLng = incident.lng;
      if (incident.lng > maxLng) maxLng = incident.lng;
      if (incident.lat < minLat) minLat = incident.lat;
      if (incident.lat > maxLat) maxLat = incident.lat;
    });

    mapRef.current?.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 120,
        duration: 700,
        maxZoom: 13,
      },
    );
  }, [autoFitAllVisible, showSelectedOnly, visibleIncidents]);

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
          ? visibleIncidents.map((incident) =>
              (() => {
                const markerStyle = getCategoryMarkerStyle(
                  incident.incident.type,
                );
                return (
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
                        className={`relative h-5 w-5 rounded-full ring-4 shadow-xl border-2 border-white/20 ${markerStyle.marker}`}
                      >
                        {incident.incident.status !== "resolved" && (
                          <span
                            className={`absolute inset-0 animate-ping rounded-full opacity-75 ${markerStyle.ping}`}
                          ></span>
                        )}
                      </div>
                      <div className="mt-2 whitespace-nowrap rounded border border-(--color-border-1) bg-black/90 px-2 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {incident.label}
                      </div>
                    </button>
                  </Marker>
                );
              })(),
            )
          : null}
      </Map>
    </div>
  );
};

export default IncidentMap;
