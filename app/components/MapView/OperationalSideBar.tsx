import React from "react";
import { MapPin, X, Send, Eye } from "lucide-react";
import type { BridgeIncident } from "../Dashboard/incidentBridge";
import Map, { Marker } from "react-map-gl/mapbox";

const ICON_SIZE = 14;

const OperationalSidebar = ({
  incident,
  onClose,
  onViewFullDetail,
  onDispatch,
}: {
  incident: BridgeIncident | null;
  onClose: () => void;
  onViewFullDetail: () => void;
  onDispatch: () => void;
}) => {
  if (!incident) return null;

  const initials = incident.reporter
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const parseCoordinatesFromLocation = (value: string) => {
    const match = value.match(/Lat\s*(-?\d+(?:\.\d+)?)\s*,\s*Lon\s*(-?\d+(?:\.\d+)?)/i);
    if (!match) return null;
    return {
      latitude: Number.parseFloat(match[1]),
      longitude: Number.parseFloat(match[2]),
    };
  };

  const parsedCoords = parseCoordinatesFromLocation(incident.location);
  const markerLatitude = incident.latitude ?? parsedCoords?.latitude ?? 14.6574;
  const markerLongitude = incident.longitude ?? parsedCoords?.longitude ?? 121.0287;
  const markerTypeSource = `${incident.type ?? ""} ${incident.incidentType ?? ""}`.toLowerCase();
  const markerColorClass = markerTypeSource.includes("fire")
    ? "bg-(--color-orange) ring-(--color-orange-border)"
    : markerTypeSource.includes("flood")
      ? "bg-(--color-blue) ring-(--color-blue-border)"
      : "bg-(--color-red) ring-(--color-red-border)";
  const shouldPulse = !(markerTypeSource.includes("fire") || markerTypeSource.includes("flood"));

  return (
    <aside
      className="flex h-full w-92.5 flex-col overflow-hidden bg-(--color-surface-1) text-(--color-text-2)"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-(--color-border-1) bg-(--color-surface-1) p-4">
        <div className="flex min-w-0 flex-1 items-start gap-2 text-(--color-orange)">
          <MapPin size={ICON_SIZE} className="mt-0.5 shrink-0 flex-none" />
          <h2 className="text-sm font-bold leading-tight text-(--color-text-1) whitespace-normal wrap-break-word">
            {incident.incidentType}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-3 mt-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-(--color-border-2) bg-(--color-surface-2) text-(--color-text-3) transition-colors hover:text-(--color-text-1)"
        >
          <X size={ICON_SIZE} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Mini Map Preview Area */}
        <div className="relative mb-6 aspect-video overflow-hidden rounded-lg border border-(--color-border-1) bg-(--color-bg)">
          <Map
            longitude={markerLongitude}
            latitude={markerLatitude}
            zoom={15.5}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            dragPan={false}
            scrollZoom={false}
            doubleClickZoom={false}
            touchZoomRotate={false}
            style={{ width: "100%", height: "100%" }}
          >
            <Marker latitude={markerLatitude} longitude={markerLongitude} anchor="center">
              <div className={`relative h-4 w-4 rounded-full border-2 border-white/20 ring-3 ${markerColorClass}`}>
                {shouldPulse && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-(--color-red) opacity-75" />
                )}
              </div>
            </Marker>
          </Map>
          <span className="absolute bottom-2 left-2 text-[9px] font-mono text-(--color-text-3)">
            {markerLatitude.toFixed(4)}°N · {markerLongitude.toFixed(4)}°E
          </span>
        </div>

        {/* Incident Info */}
        <div className="mb-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">
            Incident Info
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded border border-(--color-border-1) bg-(--color-surface-2) p-2">
              <p className="text-[8px] uppercase text-(--color-text-4)">Type</p>
              <p className="text-xs font-bold text-(--color-orange)">
                {incident.type || incident.incidentType}
              </p>
            </div>
            <div className="rounded border border-(--color-border-1) bg-(--color-surface-2) p-2">
              <p className="text-[8px] uppercase text-(--color-text-4)">Department</p>
              <p className="text-xs font-bold text-(--color-text-2)">{incident.department}</p>
            </div>
            <div className="rounded border border-(--color-border-1) bg-(--color-surface-2) p-2">
              <p className="text-[8px] uppercase text-(--color-text-4)">Reported</p>
              <p className="text-xs font-bold text-(--color-text-2)">{incident.time} Today</p>
            </div>
          </div>
        </div>

        {/* Reporter Info */}
        <div className="mb-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">
            Reporter
          </p>
          <div className="flex items-center justify-between rounded-lg border border-(--color-border-1) bg-(--color-surface-2) p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-orange-border) bg-(--color-orange-glow) text-xs font-bold text-(--color-orange)">
                {initials || "RD"}
              </div>
              <div>
                <p className="text-xs font-bold text-(--color-text-1)">{incident.reporter}</p>
                <p className="text-[10px] text-(--color-text-3)">{incident.reporterContact || "No contact provided"}</p>
              </div>
            </div>
            {/* TODO: Re-enable once direct call workflow and permissions are available.
            <button type="button" className="rounded-lg border border-(--color-green-border) bg-(--color-green-glow) p-1.5 text-(--color-text-green)">
              <Phone size={14} fill="currentColor" />
            </button>
            */}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="grid grid-cols-2 gap-2 border-t border-(--color-border-1) bg-(--color-surface-2)/35 p-4">
        <button type="button" onClick={onViewFullDetail} className="ui-btn ui-btn-secondary w-full rounded-md px-2 py-2 text-[10px] uppercase whitespace-nowrap">
          <Eye size={ICON_SIZE} /> View Full Detail
        </button>
        <button type="button" onClick={onDispatch} className="ui-btn ui-btn-primary w-full rounded-md px-2 py-2 text-[10px] uppercase whitespace-nowrap">
          <Send size={ICON_SIZE} /> Dispatch
        </button>
      </div>
    </aside>
  );
};

export default OperationalSidebar;
