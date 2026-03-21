"use client";
import React, { useEffect, useMemo, useState } from "react";
import { setActiveIncident, type BridgeIncident } from "./incidentBridge";
import { useRealtimeReports } from "@/app/hooks/useRealTimeReports";
import { useReports } from "@/app/hooks/useReports";
import { StatBlock } from "./TriageFeedComponents/StatBlock";
import { FeedItem } from "./TriageFeedComponents/FeedItem";
import { fetchReportById, updateReportStatus } from "@/app/services/reports";

// --- Types ---
type FeedType = "FIRE" | "CRASH" | "FLOOD" | "MEDICAL" | "CRIME" | "OTHER";

interface ReportFeedItem {
  id: string;
  title: string;
  location: string;
  time: string;
  type: FeedType;
  percentage: string;
  status: string;
  incident: BridgeIncident;
}

// --- Helpers ---
const mapCategoryToType = (category: number): FeedType => {
  switch (category) {
    case 1:
      return "MEDICAL";
    case 2:
      return "CRASH";
    case 3:
      return "FIRE";
    case 4:
      return "FLOOD";
    case 5:
      return "CRIME";
    default:
      return "OTHER";
  }
};

const mapStatus = (status: number): string => {
  const statuses: Record<number, string> = {
    1: "Submitted",
    2: "Under Review",
    3: "In Progress",
    4: "Resolved",
  };
  return statuses[status] || "Submitted";
};

// --- Main Component ---
const TriageFeed: React.FC = () => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<
    "All" | BridgeIncident["department"]
  >("All");

  const { reports: apiReports, loading, mutate } = useReports();
  const { reports: realtimeReports } = useRealtimeReports();

  // Single source of truth for all reports
  const mergedReports = useMemo(
    () => [...realtimeReports, ...apiReports],
    [realtimeReports, apiReports],
  );

  // Transform raw reports into Feed Item shape
  const liveReportItems: ReportFeedItem[] = useMemo(
    () =>
      mergedReports.map((r) => {
        const incidentCategoryName = mapCategoryToType(r.category);

        return {
          id: r.id,
          title: r.description || "No description",
          location:
            r.location?.reverseGeoCode ??
            `Lat ${r.location?.latitude}, Lon ${r.location?.longitude}`,
          time: new Date(r.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: incidentCategoryName,
          percentage: "90%",
          status: mapStatus(r.status),
          incident: {
            id: r.id,
            type: incidentCategoryName, // This now maps "FIRE", "CRASH", etc.
            incidentType: r.description || "General Incident",
            location: r.location?.reverseGeoCode ?? "Unknown",
            reporter: "Unknown",
            reporterContact: "",
            department: (r.category === 3
              ? "BFP"
              : r.category === 2
                ? "CTMO"
                : "PDRRMO") as BridgeIncident["department"],
            severity: (r.status === 1 ? "Critical" : "Medium") as
              | "Critical"
              | "High"
              | "Medium"
              | "Low",
            status: mapStatus(r.status)
              .toLowerCase()
              .replace(/\s+/g, "-") as BridgeIncident["status"],
            time: new Date(r.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            reporterDescription: r.description || "",
            internalNote: "",
          },
        };
      }),
    [mergedReports],
  );

  // FIXED: Define the missing filteredReportItems variable
  const filteredReportItems = useMemo(() => {
    return selectedDepartmentFilter === "All"
      ? liveReportItems
      : liveReportItems.filter(
          (item) => item.incident.department === selectedDepartmentFilter,
        );
  }, [liveReportItems, selectedDepartmentFilter]);

  // Inside TriageFeed.tsx

  const handleSelectReport = async (item: ReportFeedItem) => {
    setActiveCardId(item.id);
    setActiveIncident(item.incident);

    try {
      // 💡 IMPORTANT: Based on your mapStatus, 1 is 'Submitted'.
      // To move to 'Under Review', we must send 2.
      if (item.status === "Submitted") {
        console.log(`🔄 Updating RPT-${item.id} to Under Review (Code 2)...`);

        await updateReportStatus(item.id, 2); // 🟢 Send '2' for Under Review

        // 🟢 Refresh the feed so the orange "Under Review" badge appears
        await mutate();
      }

      // Fetch full details (images, etc.)
      const fullData = await fetchReportById(item.id);

      const fullIncident: BridgeIncident = {
        ...item.incident,
        images: fullData.images || [],
        reporterDescription:
          fullData.description || item.incident.reporterDescription,
        status: "under-review",
      };

      setActiveIncident(fullIncident);
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };
  return (
    <div className="flex h-screen w-77.5 flex-col overflow-hidden border-r border-(--color-border-1) bg-(--color-surface-1) text-(--color-text-2)">
      <div className="z-10 flex shrink-0 items-center justify-between border-b border-(--color-border-1) bg-(--color-surface-1) p-4">
        <h2 className="text-sm font-semibold tracking-tight text-(--color-text-1)">
          Triage Feed
        </h2>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-(--color-text-green)">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-green) opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-(--color-green)"></span>
          </span>
          Live
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Department Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {["All", "BFP", "CTMO", "PDRRMO", "PNP"].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedDepartmentFilter(f as any)}
              className={`cursor-pointer whitespace-nowrap rounded-full border px-4 py-1 text-[10px] font-bold transition-all ${
                selectedDepartmentFilter === f
                  ? "border-(--color-orange-border) bg-(--color-orange-glow) text-(--color-orange)"
                  : "border-(--color-border-2) bg-(--color-surface-2) text-(--color-text-3)"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {loading && (
            <div className="p-4 text-center text-xs text-(--color-text-3)">
              Loading reports...
            </div>
          )}

          {filteredReportItems.map((item) => (
            <FeedItem
              key={item.id}
              {...item}
              active={activeCardId === item.id}
              // 🔴 Update this line to use the handleSelectReport function
              onSelect={() => handleSelectReport(item)}
            />
          ))}

          {!loading && filteredReportItems.length === 0 && (
            <div className="rounded-xl border border-(--color-border-1) bg-(--color-surface-2) px-3 py-4 text-xs text-(--color-text-3)">
              No reports in {selectedDepartmentFilter} right now.
            </div>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid shrink-0 grid-cols-4 border-t border-(--color-border-1) bg-(--color-bg) py-4">
        <StatBlock
          value={mergedReports
            .filter((r) => r.category === 1)
            .length.toString()}
          label="SOS"
          color="text-(--color-red)"
        />
        <StatBlock
          value={mergedReports.filter((r) => r.status < 4).length.toString()}
          label="Active"
          color="text-(--color-orange)"
        />
        <StatBlock
          value={mergedReports.filter((r) => r.status === 1).length.toString()}
          label="New"
          color="text-(--color-text-amber)"
        />
        <StatBlock
          value={mergedReports.filter((r) => r.status === 4).length.toString()}
          label="Resolved"
          color="text-(--color-text-green)"
        />
      </div>
    </div>
  );
};

export default TriageFeed;
