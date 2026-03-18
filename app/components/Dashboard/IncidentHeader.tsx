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
    <div className="w-full bg-[#121212] p-4 border-b border-gray-800 shrink-0">
      {/* Top Section */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-medium text-gray-100 tracking-tight">
            {incident.incidentType}
          </h1>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">
            RPT-2026-{incident.id} · {incident.reporter} · {incident.time} · {incident.department}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => runAction("dispatch")}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-lg shadow-orange-900/20"
          >
            <Send size={14} fill="currentColor" />
            Dispatch Unit
          </button>
          <button
            type="button"
            onClick={() => runAction("reject")}
            className="bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            Reject
          </button>
        </div>
      </div>

      {lastActionMessage ? (
        <div className="mb-3 rounded-md border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-[11px] text-orange-400">
          {lastActionMessage}
        </div>
      ) : null}

      {/* Status Stepper - Now smaller */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <StatusPill
          label="Submitted"
          icon={<Check size={12} />}
          variant={statusStep > 1 ? "completed" : statusStep === 1 ? "active" : "disabled"}
        />
        <ChevronRight size={12} className="text-gray-800" />

        <StatusPill
          label="Under Review"
          icon={<Clock size={12} />}
          variant={statusStep > 2 ? "completed" : statusStep === 2 ? "active" : "disabled"}
        />
        <ChevronRight size={12} className="text-gray-800" />

        <StatusPill
          label="In Progress"
          icon={<Star size={12} />}
          variant={statusStep > 3 ? "completed" : statusStep === 3 ? "active" : "disabled"}
        />
        <ChevronRight size={12} className="text-gray-800" />

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
    completed: "bg-green-950/20 border-green-900/30 text-green-600/90",
    active:
      "bg-orange-950/30 border-orange-500/50 text-orange-500 ring-1 ring-orange-500/20",
    disabled: "bg-gray-900/20 border-gray-800/50 text-gray-700",
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-bold uppercase tracking-tight transition-all cursor-default ${styles[variant]}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default IncidentHeader;
