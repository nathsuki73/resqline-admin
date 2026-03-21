"use client";
import React, { useState } from "react";
import IncidentMap from "../Dashboard/IncidentMap"; // Using your existing map
import OperationalMapHeader from "./OperationalMapHeader";
import OperationalSidebar from "./OperationalSideBar";
import { Search } from "lucide-react";
import {
  queueIncidentAction,
  setActiveIncident,
  type BridgeIncident,
} from "../Dashboard/incidentBridge";
import useModalDissolve from "../settings/ui/useModalDissolve";

const SIDEBAR_EXIT_MS = 360;

const OperationalMapView = ({ onClose }: { onClose: () => void }) => {
  const [selectedIncident, setSelectedIncident] =
    useState<BridgeIncident | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { shouldRender: shouldRenderSidebar, isVisible: isSidebarVisible } =
    useModalDissolve(selectedIncident !== null, SIDEBAR_EXIT_MS);

  const handleRefreshMap = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setSelectedIncident(null);
    setRefreshToken((prev) => prev + 1);
  };

  const handleViewFullDetail = () => {
    if (!selectedIncident) return;
    setActiveIncident(selectedIncident);
    onClose();
  };

  const handleDispatch = () => {
    if (!selectedIncident) return;
    setActiveIncident(selectedIncident);
    queueIncidentAction("dispatch");
    onClose();
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-(--color-bg)">
      {/* 1. Header Overlay */}
      <OperationalMapHeader onRefresh={handleRefreshMap} isRefreshing={isRefreshing} />

      <div className="flex h-full w-full pt-16">
        <div className="relative min-w-0 flex-1">

      {/* 2. Left Search & Filter Overlays */}
      <div className="absolute top-8 left-4 z-20 flex flex-col gap-4 w-64">
        {/* Search Bar */}
        <div className="relative group">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-3)"
          />
          <input
            type="text"
            placeholder="Search barangay, address..."
            className="w-full rounded-lg border border-(--color-border-2) bg-(--color-surface-1)/90 py-2 pl-10 pr-14 text-xs text-(--color-text-2) placeholder-(--color-text-4) transition-all focus:border-(--color-orange-border) focus:outline-none"
          />
          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-(--color-orange-border) bg-(--color-orange) px-2 py-1 text-[9px] font-bold text-white">
            GO
          </button>
        </div>

        {/* Filters Box */}
        <div className="rounded-xl border border-(--color-border-1) bg-(--color-surface-1)/90 p-4 shadow-2xl">
          <p className="mb-3 text-[9px] font-bold uppercase text-(--color-text-4)">
            Filter by Department
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {["All", "BFP", "CTMO", "PDRRMO", "PNP"].map((f, i) => (
              <button
                key={f}
                type="button"
                className={`rounded border px-2 py-1 text-[8px] font-bold ${
                  i === 0
                    ? "border-(--color-orange-border) bg-(--color-orange-glow) text-(--color-orange)"
                    : "border-(--color-border-2) text-(--color-text-3)"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="mb-3 text-[9px] font-bold uppercase text-(--color-text-4)">
            Show Layers
          </p>
          <div className="flex gap-2">
            <button type="button" className="rounded border border-(--color-orange-border) bg-(--color-orange-glow) px-3 py-1 text-[8px] font-bold uppercase text-(--color-orange)">
              Incidents
            </button>
            <button type="button" className="rounded border border-(--color-border-2) px-3 py-1 text-[8px] font-bold uppercase text-(--color-text-3)">
              Units
            </button>
            <button type="button" className="rounded border border-(--color-border-2) px-3 py-1 text-[8px] font-bold uppercase text-(--color-text-3)">
              Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Left Deployed Units Overlay */}
      <div className="absolute bottom-16 left-4 z-20 w-48 rounded-xl border border-(--color-border-1) bg-(--color-surface-1)/90 p-4 shadow-2xl">
        <p className="mb-3 text-[9px] font-bold uppercase text-(--color-text-4)">
          Deployed Units
        </p>
        <div className="space-y-3">
          <UnitStatus
            label="BFP-QC-3"
            status="En Route"
            color="text-green-500"
          />
          <UnitStatus
            label="BFP-QC-7"
            status="On Scene"
            color="text-green-500"
          />
          <UnitStatus label="CTMO-1" status="En Route" color="text-blue-500" />
          <UnitStatus
            label="PNP-QC-2"
            status="Standby"
            color="text-purple-500"
          />
        </div>
      </div>

      {/* 4. Incident Summary Overlay (Floating Right) */}
      <div className="absolute top-8 right-4 z-20 w-32 rounded-xl border border-(--color-border-1) bg-(--color-surface-1)/90 p-3 shadow-2xl">
        <p className="mb-2 text-[8px] font-bold uppercase text-(--color-text-4)">
          Summary
        </p>
        <div className="space-y-1">
          <SummaryLine color="bg-red-500" label="SOS" count="2" />
          <SummaryLine color="bg-orange-500" label="Fire" count="3" />
          <SummaryLine color="bg-blue-500" label="Flood" count="1" />
          <SummaryLine color="bg-green-500" label="Units" count="4" />
        </div>
      </div>

      {/* 5. The Map Base Layer */}
      <div className="h-full w-full">
        <IncidentMap
          onIncidentSelect={setSelectedIncident}
          refreshToken={refreshToken}
          onRefreshComplete={() => setIsRefreshing(false)}
        />
      </div>

      {/* 7. Coordinates Footer */}
      <div className="absolute bottom-4 left-4 z-20 font-mono text-[9px] text-(--color-text-3)">
        14.6700°N · 121.0437°E · Quezon City
      </div>
        </div>

        {shouldRenderSidebar ? (
          <div
            className={`overflow-hidden border-l border-(--color-border-1) transition-[width,transform,opacity] ${
              isSidebarVisible
                ? "w-92.5 translate-x-0 opacity-100"
                : "pointer-events-none w-0 translate-x-3 opacity-0"
            }`}
            style={{
              transitionDuration: `${SIDEBAR_EXIT_MS}ms`,
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "width, transform, opacity",
            }}
          >
            <OperationalSidebar
              incident={selectedIncident}
              onClose={() => setSelectedIncident(null)}
              onViewFullDetail={handleViewFullDetail}
              onDispatch={handleDispatch}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

// --- Helpers ---
const UnitStatus = ({ label, status, color }: any) => (
  <div className="flex items-center justify-between text-[9px] font-bold">
    <div className="flex items-center gap-2 text-(--color-text-2)">
      <div className="h-1.5 w-1.5 rounded-full bg-(--color-border-2)" /> {label}
    </div>
    <span className={color}>{status}</span>
  </div>
);

const SummaryLine = ({ color, label, count }: any) => (
  <div className="flex items-center justify-between text-[10px]">
    <div className="flex items-center gap-2 text-(--color-text-3)">
      <div className={`h-1.5 w-1.5 rounded-full ${color}`} /> {label}
    </div>
    <span className="font-bold text-(--color-text-1)">{count}</span>
  </div>
);

export default OperationalMapView;
