"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  getActiveIncident,
  INCIDENT_CLEARED_EVENT,
  INCIDENT_SELECTED_EVENT,
  setActiveIncident,
  type BridgeIncident,
} from "./incidentBridge";
import { useReports } from "@/app/hooks/useReports";
import { StatBlock } from "./TriageFeedComponents/StatBlock";
import { FeedItem } from "./TriageFeedComponents/FeedItem";
import { fetchReportById } from "@/app/features/reports/services/reportsApi";
import {
  getReportCategoryInput,
  mapCategoryCodeToDepartment,
  mapCategoryCodeToType,
  type IncidentCategoryType,
} from "@/app/constants/reportCategories";
import {
  type IncidentStatusSlug,
  mapApiStatusToLabel,
  mapApiStatusToSlug,
  mapResponderStatusToMobileStatus,
  mergeStatusWithoutRegression,
} from "@/app/constants/reportStatus";
import { transitionReportStatus } from "@/app/features/reports/services/reportTransitionService";

// --- Types ---
type FeedType = IncidentCategoryType;

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

// --- Main Component ---
const TriageFeed: React.FC = () => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [statusOverridesById, setStatusOverridesById] = useState<
    Record<string, IncidentStatusSlug>
  >({});
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<
    "All" | BridgeIncident["department"]
  >("All");

  const { reports: mergedReports, loading } = useReports();

  // Transform raw reports into Feed Item shape with SignalR + API compatibility
  const liveReportItems: ReportFeedItem[] = useMemo(
    () => {
      // 24 hours in ms
      const now = Date.now();
      const DAY_MS = 24 * 60 * 60 * 1000;
      return mergedReports
        .map((r) => {
          const sourceStatus = mapApiStatusToSlug(r.status);
          const effectiveStatus = mergeStatusWithoutRegression(
            statusOverridesById[r.id] ?? sourceStatus,
            sourceStatus,
          );
          if (effectiveStatus === "rejected") return null;
          const categoryInput = getReportCategoryInput(r);
          const incidentCategoryName = mapCategoryCodeToType(categoryInput);

          // 1. Handle Location Fallback (API uses 'location', SignalR uses 'reportedAt')
          const lat = r.reportedAt?.latitude || r.location?.latitude;
          const lon = r.reportedAt?.longitude || r.location?.longitude;
          const latitude = Number(lat);
          const longitude = Number(lon);
          const geoCode =
            r.reportedAt?.reverseGeoCode || r.location?.reverseGeoCode;
          const locationString =
            geoCode ??
            (lat && lon ? `Lat ${lat}, Lon ${lon}` : "Unknown Location");

          // 2. Handle Date Fallback (API uses 'createdAt', SignalR uses 'dateCreated')
          const rawDate = r.createdAt || r.dateCreated;
          const timeDisplay = rawDate
            ? new Date(rawDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A";

          // 3. Check resolved time for archiving
          let resolvedAt: number | null = null;
          if (effectiveStatus === "resolved") {
            // Prefer r.resolvedAt, fallback to r.updatedAt, fallback to createdAt
            resolvedAt = r.resolvedAt
              ? new Date(r.resolvedAt).getTime()
              : r.updatedAt
                ? new Date(r.updatedAt).getTime()
                : rawDate
                  ? new Date(rawDate).getTime()
                  : null;
            if (resolvedAt && now - resolvedAt > DAY_MS) {
              // Exclude resolved reports older than 24 hours
              return null;
            }
          }

          return {
            id: r.id,
            title: r.description || "No description",
            location: locationString,
            time: timeDisplay,
            type: incidentCategoryName,
            percentage: "90%",
            status: mapApiStatusToLabel(effectiveStatus),
            incident: {
              id: r.id,
              type: incidentCategoryName,
              incidentType: r.description || "General Incident",
              location: locationString,
              latitude: Number.isFinite(latitude) ? latitude : undefined,
              longitude: Number.isFinite(longitude) ? longitude : undefined,
              reporter: r.reportByName || r.reportedBy?.name || "Unknown",
              reporterContact:
                r.reportByPhoneNumber ||
                r.reportedBy?.phoneNumber ||
                "No contact provided",
              aiAnalysis: r.aiProbabilities || {},
              department: mapCategoryCodeToDepartment(
                categoryInput,
              ) as BridgeIncident["department"],
              severity: (r.status === 1 ? "Critical" : "Medium") as
                | "Critical"
                | "High"
                | "Medium"
                | "Low",
              status: effectiveStatus as BridgeIncident["status"],
              mobileStatus: mapResponderStatusToMobileStatus(
                effectiveStatus,
              ),
              time: timeDisplay,
              reporterDescription: r.description || "",
              internalNote: r.internalNote || "",
              images: r.image || r.images || [],
            },
          };
        })
        .filter(Boolean)
        // Sort: resolved reports at the bottom
        .sort((a, b) => {
          const aResolved = a && a.incident.status === "resolved";
          const bResolved = b && b.incident.status === "resolved";
          if (aResolved === bResolved) return 0;
          if (aResolved) return 1;
          if (bResolved) return -1;
          return 0;
        }) as ReportFeedItem[];
    }, [mergedReports, statusOverridesById]);

  // FIXED: Define the missing filteredReportItems variable
  const filteredReportItems = useMemo(() => {
    return selectedDepartmentFilter === "All"
      ? liveReportItems
      : liveReportItems.filter(
          (item) => item.incident.department === selectedDepartmentFilter,
        );
  }, [liveReportItems, selectedDepartmentFilter]);

  useEffect(() => {
    const selected = getActiveIncident();
    setActiveCardId(selected?.id ?? null);
    if (selected?.id && selected.status) {
      setStatusOverridesById((prev) => ({
        ...prev,
        [selected.id]: selected.status as IncidentStatusSlug,
      }));
    }

    const onIncidentSelected = (event: Event) => {
      const detail = (event as CustomEvent<BridgeIncident>).detail;
      setActiveCardId(detail?.id ?? null);
      if (detail?.id && detail?.status) {
        setStatusOverridesById((prev) => ({
          ...prev,
          [detail.id]: detail.status as IncidentStatusSlug,
        }));
      }
    };

    const onIncidentCleared = () => {
      setActiveCardId(null);
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
  }, []);

  // Inside TriageFeed.tsx

  // Inside TriageFeed.tsx -> handleSelectReport
  const handleSelectReport = async (item: ReportFeedItem) => {
    setActiveCardId(item.id);

    // 1. Start with the current state
    setActiveIncident(item.incident);

    try {
      let currentStatusSlug = item.incident.status as IncidentStatusSlug;

      // Move to 'Under Review' if it's currently 'Submitted'
      if (item.status === "Submitted") {
        await transitionReportStatus({
          reportId: item.id,
          nextStatus: "under-review",
          origin: "triage",
        });
        currentStatusSlug = "under-review";
        setStatusOverridesById((prev) => ({
          ...prev,
          [item.id]: currentStatusSlug,
        }));
        setActiveIncident({ ...item.incident, status: currentStatusSlug });
      }

      // 2. Fetch full details
      const fullData = await fetchReportById(item.id);

      // 🟢 THE FIX: Use the LATEST status from the item/server,
      // but don't let it "go backwards" if we know it's being dispatched.
      const fullIncident: BridgeIncident = {
        ...item.incident,
        images: fullData.images || [],
        reporterDescription:
          fullData.description || item.incident.reporterDescription,
        // Avoid regressions from stale payload by keeping the furthest-known status.
        status: mergeStatusWithoutRegression(
          currentStatusSlug,
          mapApiStatusToSlug(fullData.status),
        ) as BridgeIncident["status"],
        mobileStatus: mapResponderStatusToMobileStatus(
          mergeStatusWithoutRegression(
            currentStatusSlug,
            mapApiStatusToSlug(fullData.status),
          ),
        ),
      };

      setStatusOverridesById((prev) => ({
        ...prev,
        [item.id]: fullIncident.status as IncidentStatusSlug,
      }));
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
            .filter((r) => mapCategoryCodeToType(getReportCategoryInput(r)) === "SOS")
            .length.toString()}
          label="SOS"
          color="text-(--color-red)"
        />
        <StatBlock
          value={mergedReports
            .filter((r) => {
              const slug = mapApiStatusToSlug(r.status);
              return slug !== "resolved" && slug !== "rejected";
            })
            .length.toString()}
          label="Active"
          color="text-(--color-orange)"
        />
        <StatBlock
          value={mergedReports
            .filter((r) => mapApiStatusToSlug(r.status) === "submitted")
            .length.toString()}
          label="New"
          color="text-(--color-text-amber)"
        />
        <StatBlock
          value={mergedReports
            .filter((r) => mapApiStatusToSlug(r.status) === "resolved")
            .length.toString()}
          label="Resolved"
          color="text-(--color-text-green)"
        />
      </div>
    </div>
  );
};

export default TriageFeed;
