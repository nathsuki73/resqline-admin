import React, { useEffect, useMemo, useState } from "react";
import {
  Send,
  Check,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  consumeQueuedIncidentAction,
  getActiveIncident,
  INCIDENT_ACTION_EVENT,
  INCIDENT_SELECTED_EVENT,
  type BridgeActionType,
  type BridgeIncident,
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
  reporterDescription: "Malaking sunog sa 3-storey building sa may Pag-asa.",
  internalNote: "Units BFP-QC-3 and BFP-QC-7 notified. ETA approximately 8 minutes.",
};

const IncidentHeader = () => {
  const [incident, setIncident] = useState<BridgeIncident>(DEFAULT_INCIDENT);
  const [lastActionMessage, setLastActionMessage] = useState<string>("");

  const runAction = (action: BridgeActionType) => {
    if (action === "dispatch") {
      setLastActionMessage(`Dispatch initiated for report #${incident.id}.`);
      return;
    }

    setLastActionMessage(`Report #${incident.id} was marked for rejection review.`);
  };

  useEffect(() => {
    const current = getActiveIncident();
    if (current) setIncident(current);

    const queued = consumeQueuedIncidentAction();
    if (queued) runAction(queued);

    const onIncidentSelected = (event: Event) => {
      const detail = (event as CustomEvent<BridgeIncident>).detail;
      if (detail) setIncident(detail);
    };

    const onIncidentAction = (event: Event) => {
      const action = (event as CustomEvent<BridgeActionType>).detail;
      if (action) runAction(action);
    };

    window.addEventListener(INCIDENT_SELECTED_EVENT, onIncidentSelected as EventListener);
    window.addEventListener(INCIDENT_ACTION_EVENT, onIncidentAction as EventListener);

    return () => {
      window.removeEventListener(INCIDENT_SELECTED_EVENT, onIncidentSelected as EventListener);
      window.removeEventListener(INCIDENT_ACTION_EVENT, onIncidentAction as EventListener);
    };
  }, [incident.id]);

  const statusStep = useMemo(() => {
    if (incident.status === "submitted") return 1;
    if (incident.status === "under-review") return 2;
    if (incident.status === "in-progress") return 3;
    return 4;
  }, [incident.status]);

  return (
    <div className="w-full shrink-0 border-b border-(--color-border-1) bg-(--color-surface-1) p-4">
      {/* Top Section */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-(--color-text-1)">
            {incident.incidentType}
          </h1>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-(--color-text-3)">
            RPT-2026-{incident.id} · {incident.reporter} · {incident.time} · {incident.department}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => runAction("dispatch")}
            className="ui-btn ui-btn-primary"
          >
            <Send size={14} fill="currentColor" />
            Dispatch Unit
          </button>
          <button
            type="button"
            onClick={() => runAction("reject")}
            className="ui-btn border border-(--color-red-border) bg-(--color-red-glow) text-(--color-text-red) hover:bg-[rgba(229,57,53,0.2)]"
          >
            Reject
          </button>
        </div>
      </div>

      {lastActionMessage ? (
        <div className="mb-3 rounded-md border border-(--color-orange-border) bg-(--color-orange-glow) px-3 py-2 text-[11px] text-(--color-orange)">
          {lastActionMessage}
        </div>
      ) : null}

      {/* Status Stepper */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
        <StatusPill
          label="Submitted"
          icon={<Check size={12} />}
          variant={statusStep > 1 ? "completed" : statusStep === 1 ? "active" : "disabled"}
        />
        <ChevronRight size={12} className="text-(--color-text-4)" />

        <StatusPill
          label="Under Review"
          icon={<Clock size={12} />}
          variant={statusStep > 2 ? "completed" : statusStep === 2 ? "active" : "disabled"}
        />
        <ChevronRight size={12} className="text-(--color-text-4)" />

        <StatusPill
          label="In Progress"
          icon={<Star size={12} />}
          variant={statusStep > 3 ? "completed" : statusStep === 3 ? "active" : "disabled"}
        />
        <ChevronRight size={12} className="text-(--color-text-4)" />

        <StatusPill
          label="Resolved"
          icon={<CheckCircle2 size={12} />}
          variant={statusStep === 4 ? "active" : "disabled"}
        />
      </div>
    </div>
  );
};

// --- Sub-component ---

interface StatusPillProps {
  label: string;
  icon: React.ReactNode;
  variant: "completed" | "active" | "disabled";
}

const StatusPill: React.FC<StatusPillProps> = ({ label, icon, variant }) => {
  const styles = {
    completed: "border-(--color-green-border) bg-(--color-green-glow) text-(--color-text-green)",
    active:
      "border-(--color-orange-border) bg-(--color-orange-glow) text-(--color-orange) ring-1 ring-(--color-orange-glow)",
    disabled: "border-(--color-border-2) bg-(--color-surface-2) text-(--color-text-3)",
  };

  return (
    <div
      className={`cursor-default rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wide transition-all ${styles[variant]} flex items-center gap-1.5`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default IncidentHeader;
