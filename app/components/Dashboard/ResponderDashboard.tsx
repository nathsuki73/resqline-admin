"use client";
import TriageFeed from "./TriageFeed";
import IncidentHeader from "./IncidentHeader";
import IncidentDetailPanel from "./IncidentDetailPanel";
import IncidentMap from "./IncidentMap";
import OperationalMapView from "../MapView/OperationalMapView";
import { useState, useEffect } from "react";
import {
  getActiveIncident,
  INCIDENT_CLEARED_EVENT,
  INCIDENT_SELECTED_EVENT,
  type BridgeIncident,
} from "./incidentBridge";
import useModalDissolve from "../settings/ui/useModalDissolve";
import {
  getDetailTransitionStyle,
  getHeaderTransitionStyle,
  PANEL_EXIT_MS,
} from "./dashboardMotion";

export default function ResponderDashboard() {
  const [showFullMap, setShowFullMap] = useState(false);
  // 🟢 Track if any incident is currently selected
  const [hasSelection, setHasSelection] = useState(false);
  const { shouldRender: shouldRenderHeader, isVisible: isHeaderVisible } =
    useModalDissolve(hasSelection, PANEL_EXIT_MS);
  const { shouldRender: shouldRenderDetail, isVisible: isDetailVisible } =
    useModalDissolve(hasSelection, PANEL_EXIT_MS);

  const headerTransitionStyle = getHeaderTransitionStyle(isHeaderVisible);
  const detailTransitionStyle = getDetailTransitionStyle(isDetailVisible);

  useEffect(() => {
    // Check on mount
    if (getActiveIncident()) setHasSelection(true);

    // Listen for new selections
    const onSelect = (event: Event) => {
      const detail = (event as CustomEvent<BridgeIncident>).detail;
      if (detail) setHasSelection(true);
    };

    const onClear = () => {
      setHasSelection(false);
    };

    window.addEventListener(INCIDENT_SELECTED_EVENT, onSelect as EventListener);
    window.addEventListener(INCIDENT_CLEARED_EVENT, onClear);
    return () =>
      {
        window.removeEventListener(
          INCIDENT_SELECTED_EVENT,
          onSelect as EventListener,
        );
        window.removeEventListener(INCIDENT_CLEARED_EVENT, onClear);
      };
  }, []);

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-(--color-bg)">
      <TriageFeed />

      <main className="flex flex-1 flex-col overflow-hidden">
        {shouldRenderHeader ? (
          <div
            className={`overflow-hidden transition-all ${
              isHeaderVisible
                ? "max-h-96 opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            }`}
            style={headerTransitionStyle}
          >
            <IncidentHeader onClearSelection={() => setHasSelection(false)} />
          </div>
        ) : null}

        <div className="flex flex-1 flex-row overflow-hidden">
          {shouldRenderDetail ? (
            <div
              className={`overflow-hidden transition-[width,opacity,transform] ${
                isDetailVisible
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none -translate-x-4 opacity-0"
              }`}
              style={detailTransitionStyle}
            >
              <IncidentDetailPanel />
            </div>
          ) : null}

          <div className="relative min-w-0 flex-1 bg-black">
            <IncidentMap onOpenFullMap={() => setShowFullMap(true)} />
          </div>
        </div>
      </main>

      {showFullMap && (
        <OperationalMapView onClose={() => setShowFullMap(false)} />
      )}
    </div>
  );
}
