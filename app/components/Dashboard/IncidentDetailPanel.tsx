import React, { useEffect, useState } from "react";
import { Phone, Flame, Play, BrainCircuit, X } from "lucide-react";
import {
  getActiveIncident,
  getIncidentNoteForId,
  INCIDENT_NOTE_UPDATED_EVENT,
  INCIDENT_SELECTED_EVENT,
  setActiveIncident,
  setIncidentNoteForId,
  type BridgeIncident,
  type BridgeNoteUpdate,
} from "./incidentBridge";

const DEFAULT_INCIDENT: BridgeIncident = {
  id: "0441",
  incidentType: "Structure Fire - 3-Storey Building",
  location: "Brgy. Pag-asa, QC",
  reporter: "Maria Santos",
  reporterContact: "+63 917 123 4567",
  department: "BFP",
  severity: "Critical",
  status: "under-review",
  time: "2:41 PM",
  reporterDescription: "Malaking sunog sa 3-storey building sa may Pag-asa. May naririnig pang sigaw sa loob.",
  internalNote: "Units BFP-QC-3 and BFP-QC-7 notified. ETA approximately 8 minutes.",
};

// --- Sub-Components ---

const SectionHeader = ({ title }: { title: string }) => (
  <div className="mb-3 flex items-center gap-2">
    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-text-3)">
      {title}
    </span>
    <div className="h-px w-full bg-(--color-border-1)" />
  </div>
);

const InfoCard = ({
  label,
  value,
  color = "text-(--color-text-2)",
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <div className="rounded-lg border border-(--color-border-1) bg-(--color-surface-2) p-3">
    <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-(--color-text-4)">
      {label}
    </p>
    <p className={`text-xs font-semibold ${color}`}>{value}</p>
  </div>
);

const ConfidenceBar = ({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) => (
  <div className="mb-3">
    <div className="mb-1 flex justify-between text-[11px]">
      <span className="text-(--color-text-2)">{label}</span>
      <span className="text-(--color-text-1)">{value}%</span>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-border-1)">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// --- Main Component ---

const IncidentDetailPanel = () => {
  const [incident, setIncident] = useState<BridgeIncident>(DEFAULT_INCIDENT);
  const [responderNoteDraft, setResponderNoteDraft] = useState(
    DEFAULT_INCIDENT.internalNote ?? ""
  );
  const [noteSaveState, setNoteSaveState] = useState<"unsaved" | "saving" | "saved">("saved");
  const [expandedImage, setExpandedImage] = useState<number | null>(null);

  const hydrateIncidentNote = (nextIncident: BridgeIncident) => {
    const syncedNote = getIncidentNoteForId(nextIncident.id);
    if (syncedNote === null) return nextIncident;
    return { ...nextIncident, internalNote: syncedNote };
  };

  useEffect(() => {
    const current = getActiveIncident();
    if (current) {
      const hydrated = hydrateIncidentNote(current);
      setIncident(hydrated);
      setResponderNoteDraft(hydrated.internalNote ?? "");
      setNoteSaveState("saved");
    }

    const onIncidentSelected = (event: Event) => {
      const detail = (event as CustomEvent<BridgeIncident>).detail;
      if (!detail) return;
      const hydrated = hydrateIncidentNote(detail);
      setIncident(hydrated);
      setResponderNoteDraft(hydrated.internalNote ?? "");
      setNoteSaveState("saved");
    };

    const onIncidentNoteUpdated = (event: Event) => {
      const detail = (event as CustomEvent<BridgeNoteUpdate>).detail;
      if (!detail || detail.id !== incident.id) return;

      setIncident((prev) => ({ ...prev, internalNote: detail.note }));
      setResponderNoteDraft(detail.note);
      setNoteSaveState("saved");
    };

    window.addEventListener(INCIDENT_SELECTED_EVENT, onIncidentSelected as EventListener);
    window.addEventListener(INCIDENT_NOTE_UPDATED_EVENT, onIncidentNoteUpdated as EventListener);

    return () => {
      window.removeEventListener(INCIDENT_SELECTED_EVENT, onIncidentSelected as EventListener);
      window.removeEventListener(INCIDENT_NOTE_UPDATED_EVENT, onIncidentNoteUpdated as EventListener);
    };
  }, [incident.id]);

  const saveResponderNote = () => {
    setNoteSaveState("saving");

    setIncidentNoteForId(incident.id, responderNoteDraft);

    const updatedIncident = {
      ...incident,
      internalNote: responderNoteDraft,
    };
    setIncident(updatedIncident);
    setActiveIncident(updatedIncident);

    setNoteSaveState("saved");
  };

  const initials = incident.reporter
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const incidentTypeShort = incident.incidentType.split(" - ")[0] ?? incident.incidentType;

  return (
    <div className="flex h-full min-h-0 w-92.5 flex-col overflow-hidden border-r border-(--color-border-1) bg-(--color-surface-1) text-(--color-text-2)">
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {/* Reporter Section */}
        <SectionHeader title="Reporter" />
      <div className="mb-6 flex items-center justify-between rounded-xl border border-(--color-border-1) bg-(--color-surface-2) p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-(--color-orange-border) bg-(--color-orange-glow) text-sm font-bold text-(--color-orange)">
            {initials || "RD"}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-(--color-text-1)">
              {incident.reporter}
            </h4>
            <p className="text-xs text-(--color-text-3)">{incident.reporterContact || "No contact provided"}</p>
          </div>
        </div>
        <button type="button" className="ui-btn border border-(--color-green-border) bg-(--color-green-glow) text-(--color-text-green) hover:bg-[rgba(67,160,71,0.2)]">
          <Phone size={14} fill="currentColor" /> Call Now
        </button>
      </div>

      {/* Incident Info Grid */}
      <SectionHeader title="Incident Info" />
      <div className="mb-6 grid grid-cols-2 gap-3">
        <InfoCard label="Type" value={incidentTypeShort} color="text-(--color-orange)" />
        <InfoCard
          label="Severity"
          value={`${incident.severity} · SOS`}
          color="text-(--color-text-red)"
        />
        <InfoCard label="Department" value={incident.department} />
        <InfoCard label="Reported" value={`${incident.time} Today`} />
      </div>

      {/* Media Section */}
      {/* TODO: Replace mock media with API call to fetch incident.mediaItems from backend */}
      <SectionHeader title="Media" />
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div 
          onClick={() => setExpandedImage(0)}
          className="relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border border-(--color-orange-border) bg-(--color-orange-glow) transition-all hover:bg-[rgba(245,124,0,0.18)] hover:scale-105"
        >
          <Flame size={24} className="text-(--color-orange)/60" />
          <span className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-(--color-text-2)">
            Photo · 2.3MB
          </span>
        </div>
        <div 
          onClick={() => setExpandedImage(1)}
          className="relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border border-(--color-orange-border) bg-(--color-orange-glow) transition-all hover:bg-[rgba(245,124,0,0.18)] hover:scale-105"
        >
          <Flame size={24} className="text-(--color-orange)/60" />
          <span className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-(--color-text-2)">
            Photo · 1.8MB
          </span>
        </div>
      </div>

      {/* AI Analysis */}
      {/* TODO: Replace mock confidence data with API call to fetch AI analysis from backend for incident.id */}
      <SectionHeader title="AI Analysis" />
      <div className="mb-6 rounded-xl border-2 border-(--color-blue-border) bg-linear-to-br from-[rgba(30,136,229,0.08)] to-(--color-surface-2) p-5 shadow-lg shadow-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-(--color-text-blue)">
            <BrainCircuit size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wide">
              ResqLine AI — Confidence
            </span>
          </div>
          <span className="text-[10px] text-(--color-text-3)">2:41 PM</span>
        </div>
        <ConfidenceBar
          label="Structure fire detected"
          value={97}
          colorClass="bg-red-500"
        />
        <ConfidenceBar
          label="Multi-storey building"
          value={89}
          colorClass="bg-orange-500"
        />
        <ConfidenceBar
          label="Active flames visible"
          value={84}
          colorClass="bg-orange-500"
        />
        <ConfidenceBar
          label="Civilians possibly trapped"
          value={61}
          colorClass="bg-yellow-500"
        />
      </div>

      {/* Reporter Description */}
      <SectionHeader title="Reporter Description" />
      <div className="mb-6 rounded-xl border border-(--color-border-1) bg-(--color-surface-2) p-4 text-xs italic leading-relaxed text-(--color-text-2)">
        &quot;{incident.reporterDescription}&quot;
      </div>

      {/* Responder Notes */}
      {/* TODO: Replace note storage with API call to save/persist responder notes to backend for incident.id */}
      <SectionHeader title="Responder Note - Dispatcher Only" />
      <div className="rounded-xl border border-(--color-border-1) bg-(--color-surface-2) p-4">
        <textarea
          value={responderNoteDraft}
          onChange={(e) => {
            setResponderNoteDraft(e.target.value);
            setNoteSaveState("unsaved");
          }}
          rows={4}
          placeholder="Add responder note..."
          className="w-full resize-none rounded-lg border border-(--color-border-2) bg-(--color-surface-1) px-3 py-2 text-xs leading-relaxed text-(--color-text-2) placeholder-(--color-text-4) focus:border-(--color-orange-border) focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[10px] text-(--color-text-3)">
            {noteSaveState === "unsaved"
              ? "Unsaved changes"
              : noteSaveState === "saving"
              ? "Saving..."
              : "Saved"}
          </p>
          <button
            type="button"
            onClick={saveResponderNote}
            disabled={noteSaveState === "saving"}
            className="ui-btn ui-btn-primary px-3 py-1.5 text-[10px] disabled:opacity-50"
          >
            Save Note
          </button>
        </div>
        </div>

      {/* Expanded Image Modal */}
      {expandedImage !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setExpandedImage(null)}
        >
          <div 
            className="relative max-h-[90vh] max-w-[90vw] rounded-xl border border-(--color-orange-border) overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 z-10 rounded-lg bg-black/50 p-2 hover:bg-black/70 transition-all"
            >
              <X size={20} className="text-white" />
            </button>
            <div className="flex h-full w-full items-center justify-center bg-(--color-orange-glow) p-4">
              <Flame size={120} className="text-(--color-orange)/60" />
              <span className="absolute bottom-4 left-4 rounded bg-black/50 px-3 py-1.5 text-sm text-(--color-text-2)">
                {expandedImage === 0 ? "Photo · 2.3MB" : "Photo · 1.8MB"}
              </span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default IncidentDetailPanel;
