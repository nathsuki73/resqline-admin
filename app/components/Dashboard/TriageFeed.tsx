import React, { useEffect, useMemo, useState } from "react";
import { Flame, Truck, Droplets, ShieldAlert, ChevronUp } from "lucide-react";
import { setActiveIncident, type BridgeIncident } from "./incidentBridge";
import { useRealtimeReports } from "@/app/hooks/useRealTimeReports";

type FeedType = "FIRE" | "CRASH" | "FLOOD" | "MEDICAL" | "CRIME" | "OTHER";

// Map backend type to FeedType
const mapType = (type: string): FeedType => {
  switch (type.toLowerCase()) {
    case "fire incident":
      return "FIRE";
    case "traffic accident":
      return "CRASH";
    case "flooding":
      return "FLOOD";
    case "medical emergency":
      return "MEDICAL";
    default:
      return "OTHER";
  }
};

type ReportFeedItem = {
  id: string;
  title: string;
  location: string;
  time: string;
  type: FeedType;
  percentage: string;
  status: string;
  incident: BridgeIncident;
};

type SosFeedItem = {
  id: string;
  name: string;
  location: string;
  time: string;
  incident: BridgeIncident;
};

// TODO(API): Replace mock report feed with GET /incidents?scope=triage
// Keep this normalized shape so UI components stay decoupled from raw backend DTOs.
const REPORT_FEED_ITEMS: ReportFeedItem[] = [
  {
    id: "report-0441",
    title: "Structure Fire — 3-Storey Building",
    location: "Brgy. Pag-asa, QC",
    time: "2:41 PM",
    type: "FIRE",
    percentage: "97%",
    status: "Under Review",
    incident: {
      id: "0441",
      incidentType: "Structure Fire - 3-Storey Building",
      location: "Brgy. Pag-asa, QC",
      reporter: "Maria Santos",
      reporterContact: "+63 917 123 4567",
      department: "BFP",
      severity: "Critical",
      status: "under-review",
      time: "2:41 PM",
      reporterDescription:
        "May sunog sa ikalawang palapag. Makapal ang usok at may mga tao pang nasa loob.",
      internalNote:
        "Units BFP-QC-3 and BFP-QC-7 notified. ETA approximately 8 minutes.",
    },
  },
  {
    id: "report-0440",
    title: "Major Road Accident",
    location: "Commonwealth Ave, QC",
    time: "2:39 PM",
    type: "CRASH",
    percentage: "94%",
    status: "Submitted",
    incident: {
      id: "0440",
      incidentType: "Major Road Accident - Multi-Vehicle",
      location: "Commonwealth Ave, QC",
      reporter: "Jose Reyes",
      reporterContact: "+63 917 222 0111",
      department: "CTMO",
      severity: "Critical",
      status: "submitted",
      time: "2:39 PM",
      reporterDescription:
        "Tatlong sasakyan ang nagbanggaan. Isang lane lang ang passable ngayon.",
      internalNote:
        "CTMO dispatch escalation requested, ambulance coordination ongoing.",
    },
  },
  {
    id: "report-0439",
    title: "Grass Fire — Vacant Lot",
    location: "Batasan Hills, QC",
    time: "2:28 PM",
    type: "FIRE",
    percentage: "88%",
    status: "In Progress",
    incident: {
      id: "0439",
      incidentType: "Grass Fire - Vacant Lot",
      location: "Batasan Hills, QC",
      reporter: "Carlos Dela Cruz",
      reporterContact: "+63 917 333 1020",
      department: "BFP",
      severity: "High",
      status: "in-progress",
      time: "2:28 PM",
      reporterDescription:
        "Nagsimula ang apoy sa damuhan, malapit sa poste ng kuryente.",
      internalNote:
        "Containment perimeter established. Monitoring wind direction.",
    },
  },
  {
    id: "report-0438",
    title: "Street Flooding",
    location: "Fairview, QC",
    time: "2:15 PM",
    type: "FLOOD",
    percentage: "79%",
    status: "Under Review",
    incident: {
      id: "0438",
      incidentType: "Street Flooding - Knee-Deep Water",
      location: "Fairview, QC",
      reporter: "Ana Ramos",
      reporterContact: "+63 917 987 1100",
      department: "PDRRMO",
      severity: "Medium",
      status: "under-review",
      time: "2:15 PM",
      reporterDescription:
        "Lumalim ang baha hanggang tuhod at mabagal na ang daloy ng sasakyan.",
      internalNote: "PDRRMO assessment requested for drainage obstruction.",
    },
  },
];

// TODO(API): Replace mock SOS feed with GET /incidents/sos/active
// SOS payload intentionally supports location-first incidents before caller narrative is provided.
const SOS_FEED_ITEMS: SosFeedItem[] = [
  {
    id: "sos-901",
    name: "Maria Santos",
    location: "Brgy. Pag-asa, Quezon City",
    time: "0:52",
    incident: {
      id: "901",
      incidentType: "SOS Alert - Possible Structure Fire",
      location: "Brgy. Pag-asa, Quezon City",
      reporter: "Maria Santos",
      reporterContact: "+63 917 123 4567",
      department: "PDRRMO",
      severity: "Critical",
      status: "submitted",
      time: "0:52",
      reporterDescription:
        "SOS received with partial voice note: may makapal na usok at may na-trap sa loob. Caller sent location first before full report details.",
      internalNote:
        "Location-first SOS. Verify scene, call reporter immediately, and capture photos/video evidence on arrival.",
    },
  },
  {
    id: "sos-902",
    name: "Jose Reyes",
    location: "Commonwealth Ave, QC",
    time: "1:24",
    incident: {
      id: "902",
      incidentType: "SOS Alert - Medical Distress",
      location: "Commonwealth Ave, QC",
      reporter: "Jose Reyes",
      reporterContact: "+63 917 222 0111",
      department: "PDRRMO",
      severity: "Critical",
      status: "submitted",
      time: "1:24",
      reporterDescription:
        "SOS triggered. Caller texted: nahihirapan huminga ang kasama, exact medical details not yet provided.",
      internalNote:
        "Dispatch nearest available unit for welfare check and EMS triage. Gather scene photos and caller condition details.",
    },
  },
];

// --- Sub-Components ---

const SOSCard: React.FC<{
  name: string;
  location: string;
  time: string;
  active?: boolean;
  onSelect: () => void;
}> = ({ name, location, time, active, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={active}
    className={`mb-2 w-full rounded-xl border p-3 text-left transition-all ${
      active
        ? "border-(--color-red) bg-(--color-red-glow)"
        : "border-(--color-border-1) bg-(--color-surface-1) hover:border-(--color-red-border) hover:bg-(--color-surface-2)"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-red-border) bg-(--color-red) text-white">
        <span className="absolute inline-flex h-10 w-10 animate-pulse rounded-full bg-(--color-red) opacity-20" />
        <ChevronUp size={22} strokeWidth={3} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-(--color-text-1)">
            {name}
          </h4>
          <span className="shrink-0 text-[10px] text-(--color-text-3)">
            {time}
          </span>
        </div>
        <p className="truncate text-xs text-(--color-text-red)">{location}</p>
        <p className="mt-1 text-[10px] text-(--color-text-3)">
          Location ping received. Waiting for user details.
        </p>
      </div>
    </div>
  </button>
);

const FeedItem: React.FC<{
  title: string;
  location: string;
  time: string;
  type: FeedType;
  percentage: string;
  status: string;
  active?: boolean;
  onSelect: () => void;
}> = ({
  title,
  location,
  time,
  type,
  percentage,
  status,
  active,
  onSelect,
}) => {

  
  const configs: Record<FeedType, any> = {
  FIRE: {
    icon: Flame,
    color: "text-(--color-orange)",
    bg: "bg-(--color-orange-glow)",
    border: "border-(--color-orange-border)",
    tag: "bg-(--color-orange-glow) text-(--color-orange)",
  },
  CRASH: {
    icon: Truck,
    color: "text-(--color-text-amber)",
    bg: "bg-(--color-amber-glow)",
    border: "border-(--color-amber-border)",
    tag: "bg-(--color-amber-glow) text-(--color-text-amber)",
  },
  FLOOD: {
    icon: Droplets,
    color: "text-(--color-text-blue)",
    bg: "bg-(--color-blue-glow)",
    border: "border-(--color-blue-border)",
    tag: "bg-(--color-blue-glow) text-(--color-text-blue)",
  },
  CRIME: {
    icon: ShieldAlert,
    color: "text-(--color-text-purple)",
    bg: "bg-(--color-purple-glow)",
    border: "border-(--color-purple-border)",
    tag: "bg-(--color-purple-glow) text-(--color-text-purple)",
  },
  MEDICAL: {
    icon: ShieldAlert,
    color: "text-(--color-red)",
    bg: "bg-(--color-red-glow)",
    border: "border-(--color-red-border)",
    tag: "bg-(--color-red-glow) text-(--color-red)",
  },
  OTHER: {
    icon: ShieldAlert,
    color: "text-(--color-text-3)",
    bg: "bg-(--color-surface-2)",
    border: "border-(--color-border-1)",
    tag: "bg-(--color-surface-2) text-(--color-text-3)",
  },
};

// Map live report types to FeedType
const mapTypeToFeedType = (type: string): FeedType => {
  switch (type.toLowerCase()) {
    case "fire incident":
    case "fire":
      return "FIRE";
    case "traffic accident":
    case "crash":
      return "CRASH";
    case "flooding":
    case "flood":
      return "FLOOD";
    case "medical emergency":
      return "MEDICAL";
    case "crime":
      return "CRIME";
    default:
      return "OTHER";
  }
};

// Usage inside FeedItem
const feedType: FeedType = mapTypeToFeedType(type);
const config = configs[feedType]; // now always safe
const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`relative mb-3 flex w-full cursor-pointer gap-4 rounded-xl border p-4 text-left transition-all ${
        active
          ? "border-(--color-orange-border) bg-(--color-orange-glow)"
          : "border-(--color-border-1) bg-(--color-surface-1) hover:border-(--color-border-2) hover:bg-(--color-surface-2)"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.color}`}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold text-(--color-text-1)">
            {title}
          </h4>
          <span className="shrink-0 text-[10px] text-(--color-text-3)">
            {time}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-(--color-text-3)">{location}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${config.border} ${config.tag}`}
          >
            {type} · {percentage}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-(--color-text-blue)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--color-blue)" />
            {status}
          </span>
        </div>
      </div>
    </button>
  );
};

// --- Main Component ---
const mapStatusToBridgeIncident = (
  status: string,
): BridgeIncident["status"] => {
  switch (status.toLowerCase()) {
    case "submitted":
      return "submitted";
    case "under review":
      return "under-review";
    case "in progress":
      return "in-progress";
    case "resolved":
      return "resolved";
    default:
      return "submitted"; // fallback to a safe default
  }
};

const TriageFeed: React.FC = () => {
  const filters: Array<"All" | BridgeIncident["department"]> = [
    "All",
    "BFP",
    "CTMO",
    "PDRRMO",
    "PNP",
  ];
  const [activeCardId, setActiveCardId] = useState<string>(
    REPORT_FEED_ITEMS[0].id,
  );
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<
    "All" | BridgeIncident["department"]
  >("All");

  const { reports: realtimeReports, connectionStatus } = useRealtimeReports();

  const liveReportItems: ReportFeedItem[] = useMemo(
    () =>
      realtimeReports.map((r) => ({
        id: r.id,
        title: r.title,
        location: `Lat ${r.latitude.toFixed(3)}, Lon ${r.longitude.toFixed(3)}`,
        time: new Date(r.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: r.type as FeedType,
        percentage: `${r.confidence}%`,
        status: r.status,
        incident: {
          id: r.id,
          incidentType: `${r.type} - ${r.title}`,
          location: `Lat ${r.latitude.toFixed(3)}, Lon ${r.longitude.toFixed(3)}`,
          reporter: "Unknown",
          reporterContact: "",
          department: "BFP",
          severity: "Medium",
          status: mapStatusToBridgeIncident(r.status),
          time: new Date(r.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          reporterDescription: "",
          internalNote: "",
        },
      })),
    [realtimeReports],
  );

  const filteredReportItems = useMemo(
    () =>
      selectedDepartmentFilter === "All"
        ? liveReportItems
        : liveReportItems.filter(
            (item) => item.incident.department === selectedDepartmentFilter,
          ),
    [selectedDepartmentFilter, liveReportItems],
  );

  useEffect(() => {
    // Initialize dashboard detail/header context with the highest-priority report on first load.
    setActiveIncident(REPORT_FEED_ITEMS[0].incident);
  }, []);

  useEffect(() => {
    // Do not override SOS selections with report fallback logic.
    if (activeCardId.startsWith("sos-")) return;

    // If current selection is filtered out, move focus to first visible card.
    // This prevents stale selection IDs when responders switch department tabs.
    const isActiveReportVisible = filteredReportItems.some(
      (item) => item.id === activeCardId,
    );
    if (isActiveReportVisible) return;

    const nextReport = filteredReportItems[0];
    if (!nextReport) return;

    setActiveCardId(nextReport.id);
    setActiveIncident(nextReport.incident);
  }, [filteredReportItems, activeCardId]);

  const handleSelectReport = (item: ReportFeedItem) => {
    // Single source of truth: selecting a card updates the bridge incident consumed by header/detail/map.
    setActiveCardId(item.id);
    setActiveIncident(item.incident);
  };

  const handleSelectSos = (item: SosFeedItem) => {
    // SOS cards push a location-first placeholder incident for immediate responder context.
    setActiveCardId(item.id);
    setActiveIncident(item.incident);
  };

  return (
    <div className="flex h-screen w-77.5 flex-col overflow-hidden border-r border-(--color-border-1) bg-(--color-surface-1) text-(--color-text-2)">
      {/* Header */}
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

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-(--color-text-red)">
              <span className="relative h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-red) opacity-100"></span>
                <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-(--color-red) opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-(--color-red)"></span>
              </span>
              SOS ACTIVE
            </div>
            <span className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-(--color-red) bg-(--color-red) text-[10px] font-bold text-white shadow-lg">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-(--color-red) opacity-30"></span>
              <span className="relative">2</span>
            </span>
          </div>
          {SOS_FEED_ITEMS.map((item) => (
            <SOSCard
              key={item.id}
              name={item.name}
              location={item.location}
              time={item.time}
              active={activeCardId === item.id}
              onSelect={() => handleSelectSos(item)}
            />
          ))}
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedDepartmentFilter(f)}
              aria-pressed={selectedDepartmentFilter === f}
              className={`cursor-pointer whitespace-nowrap rounded-full border px-4 py-1 text-[10px] font-bold transition-all ${
                selectedDepartmentFilter === f
                  ? "border-(--color-orange-border) bg-(--color-orange-glow) text-(--color-orange)"
                  : "border-(--color-border-2) bg-(--color-surface-2) text-(--color-text-3) hover:border-(--color-border-3) hover:text-(--color-text-2)"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Incident Feed Items */}
        <div className="flex flex-col gap-1">
          {filteredReportItems.map((item) => (
            <FeedItem
              key={item.id}
              title={item.title}
              location={item.location}
              time={item.time}
              type={item.type}
              percentage={item.percentage}
              status={item.status}
              active={activeCardId === item.id}
              onSelect={() => handleSelectReport(item)}
            />
          ))}
          {filteredReportItems.length === 0 ? (
            <div className="rounded-xl border border-(--color-border-1) bg-(--color-surface-2) px-3 py-4 text-xs text-(--color-text-3)">
              No reports in {selectedDepartmentFilter} right now.
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer Stats - Fixed at bottom */}
      {/* TODO(API): Replace static counters with aggregate metrics from triage summary endpoint */}
      <div className="grid shrink-0 grid-cols-4 border-t border-(--color-border-1) bg-(--color-bg) py-4">
        <StatBlock value="2" label="SOS" color="text-(--color-red)" />
        <StatBlock value="8" label="Active" color="text-(--color-orange)" />
        <StatBlock
          value="3"
          label="Pending"
          color="text-(--color-text-amber)"
        />
        <StatBlock
          value="14"
          label="Resolved"
          color="text-(--color-text-green)"
        />
      </div>
    </div>
  );
};

// Helper for the footer to keep code dry
const StatBlock = ({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) => (
  <div className="flex flex-col items-center border-r border-(--color-border-1) last:border-0">
    <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
    <p className="mt-1 text-[9px] font-medium uppercase tracking-tight text-(--color-text-3)">
      {label}
    </p>
  </div>
);

export default TriageFeed;
