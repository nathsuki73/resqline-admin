"use client";
import React, { useState } from "react";
import IncidentMap from "../Dashboard/IncidentMap"; // Using your existing map
import OperationalMapHeader from "./OperationalMapHeader";
import OperationalSidebar from "./OperationalSideBar";
import { Search } from "lucide-react";
import { type IncidentCategoryType } from "@/app/constants/reportCategories";
import {
  queueIncidentAction,
  setActiveIncident,
  type BridgeIncident,
} from "../Dashboard/incidentBridge";
import useModalDissolve from "../settings/ui/useModalDissolve";

const SIDEBAR_EXIT_MS = 360;
const DEPARTMENT_FILTERS = ["All", "BFP", "CTMO", "PDRRMO", "PNP"] as const;

type IncidentSummary = {
  total: number;
  byType: Record<IncidentCategoryType, number>;
};

const SUMMARY_TYPE_ORDER: IncidentCategoryType[] = [
  "SOS",
  "FIRE",
  "FLOOD",
  "STRUCTURAL",
  "MEDICAL",
  "TRAFFIC",
  "OTHER",
];

const SUMMARY_TYPE_META: Record<IncidentCategoryType, { label: string; color: string }> = {
  SOS: { label: "SOS", color: "bg-(--color-red)" },
  FIRE: { label: "Fire", color: "bg-(--color-orange)" },
  FLOOD: { label: "Flood", color: "bg-(--color-blue)" },
  STRUCTURAL: { label: "Structural", color: "bg-(--color-purple)" },
  MEDICAL: { label: "Medical", color: "bg-(--color-green)" },
  TRAFFIC: { label: "Traffic", color: "bg-(--color-amber)" },
  OTHER: { label: "Other", color: "bg-(--color-text-3)" },
};

const EMPTY_SUMMARY_TYPES: Record<IncidentCategoryType, number> = {
  SOS: 0,
  MEDICAL: 0,
  TRAFFIC: 0,
  FIRE: 0,
  FLOOD: 0,
  STRUCTURAL: 0,
  OTHER: 0,
};

const OperationalMapView = ({ onClose }: { onClose: () => void }) => {
  const [selectedIncident, setSelectedIncident] =
    useState<BridgeIncident | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState<(typeof DEPARTMENT_FILTERS)[number]>("All");
  const [showIncidentsLayer, setShowIncidentsLayer] = useState(true);
  const [summary, setSummary] = useState<IncidentSummary>({
    total: 0,
    byType: EMPTY_SUMMARY_TYPES,
  });
  const { shouldRender: shouldRenderSidebar, isVisible: isSidebarVisible } =
    useModalDissolve(selectedIncident !== null, SIDEBAR_EXIT_MS);

  const handleSearchGo = () => {
    setActiveSearchQuery(searchInput);
  };

  const handleSearchClear = () => {
    setSearchInput("");
    setActiveSearchQuery("");
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

  const visibleSummaryTypes = SUMMARY_TYPE_ORDER.filter(
    (type) => (summary.byType[type] ?? 0) > 0,
  );

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-(--color-bg)">
      {/* 1. Header Overlay */}
      <OperationalMapHeader />

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
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                handleSearchGo();
              }
            }}
            className="w-full rounded-lg border border-(--color-border-2) bg-(--color-surface-1)/90 py-2 pl-10 pr-14 text-xs text-(--color-text-2) placeholder-(--color-text-4) transition-all focus:border-(--color-orange-border) focus:outline-none"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-(--color-text-3) hover:text-(--color-text-1) transition-colors"
              title="Clear search"
            >
              ×
            </button>
          )}
          <button
            type="button"
            onClick={handleSearchGo}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-(--color-orange-border) bg-(--color-orange) px-2 py-1 text-[9px] font-bold text-white hover:bg-(--color-orange-border) transition-colors"
          >
            GO
          </button>
        </div>

        {/* Filters Box */}
        <div className="rounded-xl border border-(--color-border-1) bg-(--color-surface-1)/90 p-4 shadow-2xl">
          <p className="mb-3 text-[9px] font-bold uppercase text-(--color-text-4)">
            Filter by Department
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {DEPARTMENT_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setDepartmentFilter(filter)}
                className={`rounded border px-2 py-1 text-[8px] font-bold ${
                  departmentFilter === filter
                    ? "border-(--color-orange-border) bg-(--color-orange-glow) text-(--color-orange)"
                    : "border-(--color-border-2) text-(--color-text-3)"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <p className="mb-3 text-[9px] font-bold uppercase text-(--color-text-4)">
            Show Layers
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowIncidentsLayer((prev) => !prev)}
              className={`rounded border px-3 py-1 text-[8px] font-bold uppercase ${
                showIncidentsLayer
                  ? "border-(--color-orange-border) bg-(--color-orange-glow) text-(--color-orange)"
                  : "border-(--color-border-2) text-(--color-text-3)"
              }`}
            >
              Incidents
            </button>
          </div>
        </div>
      </div>

      {/* 4. Incident Summary Overlay (Floating Right) */}
      <div className="absolute top-8 right-4 z-20 w-40 rounded-xl border border-(--color-border-1) bg-(--color-surface-1)/90 p-3 shadow-2xl">
        <p className="mb-2 text-[8px] font-bold uppercase text-(--color-text-4)">
          Summary
        </p>
        <div className="space-y-1">
          {visibleSummaryTypes.map((type) => {
            const meta = SUMMARY_TYPE_META[type];
            return (
              <SummaryLine
                key={type}
                color={meta.color}
                label={meta.label}
                count={String(summary.byType[type] ?? 0)}
              />
            );
          })}
          <SummaryLine color="bg-(--color-text-2)" label="Total" count={String(summary.total)} />
        </div>
      </div>

      {/* 5. The Map Base Layer */}
      <div className="h-full w-full">
        <IncidentMap
          onIncidentSelect={setSelectedIncident}
          searchQuery={activeSearchQuery}
          departmentFilter={departmentFilter}
          showIncidentsLayer={showIncidentsLayer}
          onSummaryChange={setSummary}
          showSelectedOnly={false}
          autoFitAllVisible={true}
        />
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

const SummaryLine = ({ color, label, count }: any) => (
  <div className="flex items-center justify-between text-[10px]">
    <div className="flex items-center gap-2 text-(--color-text-3)">
      <div className={`h-1.5 w-1.5 rounded-full ${color}`} /> {label}
    </div>
    <span className="font-bold text-(--color-text-1)">{count}</span>
  </div>
);

export default OperationalMapView;
