import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Send,
  Check,
  Clock,
  Star,
  CheckCircle2,
  X,
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
import DispatchUnitModal, {
  DEFAULT_AVAILABLE_UNITS,
  DEFAULT_DEPLOYED_UNITS,
} from "./DispatchUnitModal";
import useModalDissolve from "../settings/ui/useModalDissolve";

const MODAL_EXIT_MS = 260;

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
  internalNote:
    "Units BFP-QC-3 and BFP-QC-7 notified. ETA approximately 8 minutes.",
};
// TODO(API): Replace fallback with latest selected incident payload from dashboard bootstrap endpoint.

const IncidentHeader = () => {
  const [incident, setIncident] = useState<BridgeIncident>(DEFAULT_INCIDENT);
  const [lastActionMessage, setLastActionMessage] = useState<string>("");
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const runAction = (action: BridgeActionType) => {
    // Keep action side-effects centralized so queue-driven and button-driven actions remain identical.
    if (action === "dispatch") {
      setIsDispatchModalOpen(true);
      return;
    }

    // TODO(API): POST /incidents/:id/reject with actor + reason when rejection workflow is finalized.
    setLastActionMessage(`Report #${incident.id} rejected.`);
  };

  const handleDispatchUnits = (selectedUnitIds: string[], _note: string) => {
    // TODO: Call API to dispatch units
    // await dispatchUnitsAPI(incident.id, selectedUnitIds, _note);
    setLastActionMessage(
      `Dispatch initiated for report #${incident.id}. ${selectedUnitIds.length} unit(s) dispatched.`,
    );
  };

  useEffect(() => {
    // Bridge subscriptions keep header decoupled from feed implementation details.
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

    window.addEventListener(
      INCIDENT_SELECTED_EVENT,
      onIncidentSelected as EventListener,
    );
    window.addEventListener(
      INCIDENT_ACTION_EVENT,
      onIncidentAction as EventListener,
    );

    return () => {
      window.removeEventListener(
        INCIDENT_SELECTED_EVENT,
        onIncidentSelected as EventListener,
      );
      window.removeEventListener(
        INCIDENT_ACTION_EVENT,
        onIncidentAction as EventListener,
      );
    };
  }, [incident.id]);

  const statusStep = useMemo(() => {
    if (!incident) return 0;
    if (incident.status === "submitted") return 1;
    if (incident.status === "under-review") return 2;
    if (incident.status === "in-progress") return 3;
    if (incident.status === "resolved") return 4;
    if (incident.status === "rejected") return 5; // New step for Rejected
    return 1;
  }, [incident?.status]);

  if (!incident) return null;

  return (
    <div className="w-full shrink-0 border-b border-(--color-border-1) bg-(--color-surface-1) p-4">
      {/* Top Section */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-(--color-text-1)">
            {incident.incidentType}
          </h1>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-(--color-text-3)">
            RPT-2026-{incident.id} · {incident.reporter} · {incident.time} ·{" "}
            {incident.department}
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
            onClick={() => setIsRejectModalOpen(true)}
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

      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
        <StatusPill
          label="Submitted"
          icon={<Check size={12} />}
          variant={
            statusStep > 1
              ? "completed"
              : statusStep === 1
                ? "active"
                : "disabled"
          }
        />
        <ChevronRight size={12} className="text-(--color-text-4)" />

        <StatusPill
          label="Under Review"
          icon={<Clock size={12} />}
          variant={
            statusStep > 2
              ? "completed"
              : statusStep === 2
                ? "active"
                : "disabled"
          }
        />
        <ChevronRight size={12} className="text-(--color-text-4)" />

        {/* Displaying In-Progress as "Dispatched" */}
        <StatusPill
          label="Dispatched"
          icon={<Star size={12} />}
          variant={
            statusStep > 3
              ? "completed"
              : statusStep === 3
                ? "active"
                : "disabled"
          }
        />
        <ChevronRight size={12} className="text-(--color-text-4)" />

        {/* Only show Resolved or Rejected as the final step */}
        {statusStep === 5 ? (
          <StatusPill
            label="Rejected"
            icon={<X size={12} />}
            variant="rejected" // Custom variant for Red
          />
        ) : (
          <StatusPill
            label="Resolved"
            icon={<CheckCircle2 size={12} />}
            variant={statusStep === 4 ? "completed" : "disabled"}
          />
        )}
      </div>

      {/* Dispatch Unit Modal */}
      <DispatchUnitModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        incidentId={`RPT-2026-${incident.id}`}
        incidentType={incident.incidentType}
        location={incident.location}
        coordinates="Coordinates from incident geolocation"
        severity={`${incident.severity} - SOS`}
        availableUnits={DEFAULT_AVAILABLE_UNITS}
        deployedUnits={DEFAULT_DEPLOYED_UNITS}
        onDispatch={handleDispatchUnits}
      />

      <RejectIncidentModal
        isOpen={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        onConfirm={() => {
          setIsRejectModalOpen(false);
          runAction("reject");
        }}
        reportTitle={incident.incidentType}
      />
    </div>
  );
};

// --- Sub-component ---

interface StatusPillProps {
  label: string;
  icon: React.ReactNode;
  variant: "completed" | "active" | "disabled";
}

const StatusPill: React.FC<{
  label: string;
  icon: React.ReactNode;
  variant: "completed" | "active" | "disabled" | "rejected";
}> = ({ label, icon, variant }) => {
  const styles = {
    completed:
      "border-(--color-green-border) bg-(--color-green-glow) text-(--color-text-green)",
    active:
      "border-(--color-orange-border) bg-(--color-orange-glow) text-(--color-orange) ring-1 ring-(--color-orange-glow)",
    disabled:
      "border-(--color-border-2) bg-(--color-surface-2) text-(--color-text-3)",
    rejected:
      "border-(--color-red-border) bg-(--color-red-glow) text-(--color-text-red)",
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

const RejectIncidentModal = ({
  isOpen,
  onCancel,
  onConfirm,
  reportTitle,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  reportTitle: string;
}) => {
  const { shouldRender, isVisible } = useModalDissolve(isOpen, MODAL_EXIT_MS);

  if (!shouldRender) return null;

  return (
    <div
      className={`modal-overlay-dissolve fixed inset-0 z-(--z-modal) flex items-center justify-center bg-black/50 p-4 ${
        isVisible ? "is-open" : "is-closed"
      }`}
    >
      <div
        className={`modal-card-dissolve w-full max-w-sm rounded-2xl border border-(--color-border-1) bg-(--color-surface-1) p-5 shadow-xl ${
          isVisible ? "is-open" : "is-closed"
        }`}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-red-border) bg-(--color-red-glow) text-(--color-text-red)">
              <AlertTriangle size={16} />
            </div>
            <h3 className="text-lg font-semibold text-(--color-text-1)">
              Reject Incident
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-1.5 text-(--color-text-3) transition-colors hover:bg-(--color-surface-2) hover:text-(--color-text-1)"
            aria-label="Close reject modal"
          >
            <X size={14} />
          </button>
        </div>

        <p className="text-sm text-(--color-text-2)">
          Reject this incident now?
        </p>
        <p className="mt-1 text-xs text-(--color-text-3)">{reportTitle}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="ui-btn ui-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="ui-btn border border-(--color-red-border) bg-(--color-red-glow) text-(--color-text-red) hover:bg-[rgba(229,57,53,0.2)]"
          >
            Reject Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentHeader;
