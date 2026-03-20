"use client";
import TriageFeed from "./TriageFeed";
import IncidentHeader from "./IncidentHeader";
import IncidentDetailPanel from "./IncidentDetailPanel";
import IncidentMap from "./IncidentMap";
import OperationalMapView from "../MapView/OperationalMapView";
import { useState, useEffect } from "react";
import {
  getActiveIncident,
  INCIDENT_SELECTED_EVENT,
  type BridgeIncident,
} from "./incidentBridge";
import { LayoutPanelLeft } from "lucide-react";

export default function ResponderDashboard() {
  const [showFullMap, setShowFullMap] = useState(false);
  // 🟢 Track if any incident is currently selected
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    // Check on mount
    if (getActiveIncident()) setHasSelection(true);

    // Listen for new selections
    const onSelect = (event: Event) => {
      const detail = (event as CustomEvent<BridgeIncident>).detail;
      if (detail) setHasSelection(true);
    };

    window.addEventListener(INCIDENT_SELECTED_EVENT, onSelect as EventListener);
    return () =>
      window.removeEventListener(
        INCIDENT_SELECTED_EVENT,
        onSelect as EventListener,
      );
  }, []);

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-(--color-bg)">
      <TriageFeed />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* 🟢 Condition 1: Hide Header if no selection */}
        {hasSelection ? (
          <IncidentHeader />
        ) : (
          <div className="h-[73px] border-b border-(--color-border-1) bg-(--color-surface-1)" />
        )}

        <div className="flex flex-1 flex-row overflow-hidden">
          {/* 🟢 Condition 2: Show Panel OR Empty Placeholder */}
          {hasSelection ? (
            <IncidentDetailPanel />
          ) : (
            <div className="flex w-80 flex-col items-center justify-center border-r border-(--color-border-1) bg-(--color-surface-1) p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--color-surface-2) text-(--color-text-4)">
                <LayoutPanelLeft size={24} />
              </div>
              <h3 className="text-sm font-semibold text-(--color-text-2)">
                No Incident Selected
              </h3>
              <p className="mt-1 text-xs text-(--color-text-4)">
                Select a report from the Triage Feed to view details and
                dispatch units.
              </p>
            </div>
          )}

          <div className="relative flex-1 bg-black">
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
