"use client";
import TriageFeed from "./TriageFeed";
import IncidentHeader from "./IncidentHeader";
import IncidentDetailPanel from "./IncidentDetailPanel";
import IncidentMap from "./IncidentMap";
import OperationalMapView from "../MapView/OperationalMapView";
import { useState } from "react";

export default function ResponderDashboard() {
  const [showFullMap, setShowFullMap] = useState(false);

  return (
    // Outer Wrapper: Full screen height, no scroll on the body
    <div className="flex h-screen w-full flex-row overflow-hidden bg-(--color-bg)">
      {/* 2. Triage Feed (Fixed Width) */}
      <TriageFeed />

      {/* 3. Main Action Area (Vertical Stack) */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top: Incident Header (Full Width) */}
        <IncidentHeader />

        {/* Bottom: Detail Panel + Map (Split Row) */}
        <div className="flex flex-1 flex-row overflow-hidden">
          {/* Left: Detail Info (Fixed or Max Width) */}
          <IncidentDetailPanel />

          {/* Right: Map (Takes up remaining space) */}
          <div className="relative flex-1 bg-black">
            <IncidentMap onOpenFullMap={() => setShowFullMap(true)} />
          </div>
        </div>
      </main>

      {/* THE UNIFIED FULL SCREEN VIEW */}
      {showFullMap && (
        <OperationalMapView onClose={() => setShowFullMap(false)} />
      )}
    </div>
  );
}
