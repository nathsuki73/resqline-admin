"use client";
import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Send, Truck, X } from "lucide-react";
import useModalDissolve from "../settings/ui/useModalDissolve";

const MODAL_EXIT_MS = 260;

export type DispatchUnit = {
  id: string;
  name: string;
  status: "AVAILABLE" | "EN ROUTE" | "ON SCENE";
  personnel: number;
  equipment: string;
  eta: string;
  distance: string;
};
// Keep unit shape backend-agnostic so API DTO changes only need one mapper layer.

export const DEFAULT_AVAILABLE_UNITS: DispatchUnit[] = [
  {
    id: "BFP-QC-3",
    name: "BFP-QC-3 · Engine Company",
    status: "AVAILABLE",
    personnel: 5,
    equipment: "Ladder Truck",
    eta: "4 min",
    distance: "1.2 km",
  },
  {
    id: "BFP-QC-1",
    name: "BFP-QC-1 · Command Vehicle",
    status: "AVAILABLE",
    personnel: 3,
    equipment: "Command Unit",
    eta: "9 min",
    distance: "2.8 km",
  },
];
// TODO(API): Replace mock units with GET /units/available?incidentId=:id

export const DEFAULT_DEPLOYED_UNITS: DispatchUnit[] = [
  {
    id: "BFP-QC-7",
    name: "BFP-QC-7 · Rescue Company",
    status: "EN ROUTE",
    personnel: 6,
    equipment: "Rescue Equipment",
    eta: "8 min",
    distance: "1.5 km",
  },
  {
    id: "BFP-QC-5",
    name: "BFP-QC-5 · Tanker Unit",
    status: "ON SCENE",
    personnel: 4,
    equipment: "Water Tanker",
    eta: "2 min",
    distance: "0.8 km",
  },
];
// TODO(API): Replace with GET /incidents/:id/deployments to prevent reassignment conflicts.

type DispatchUnitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string;
  incidentType: string;
  location: string;
  coordinates: string;
  severity: string;
  availableUnits: DispatchUnit[];
  deployedUnits: DispatchUnit[];
  onDispatch?: (selectedUnitIds: string[], note: string) => void;
};

const getStatusPillClass = (status: DispatchUnit["status"]) => {
  if (status === "AVAILABLE") {
    return "border-(--color-green-border) bg-(--color-green-glow) text-(--color-text-green)";
  }
  if (status === "EN ROUTE") {
    return "border-(--color-amber-border) bg-(--color-amber-glow) text-(--color-text-amber)";
  }
  return "border-(--color-red-border) bg-(--color-red-glow) text-(--color-text-red)";
};

const getSeverityClass = (severity: string) => {
  const normalized = severity.toLowerCase();
  if (normalized.includes("critical") || normalized.includes("sos")) {
    return "border-(--color-red-border) bg-(--color-red-glow) text-(--color-text-red)";
  }
  if (normalized.includes("high")) {
    return "border-(--color-orange-border) bg-(--color-orange-glow) text-(--color-orange)";
  }
  if (normalized.includes("medium")) {
    return "border-(--color-amber-border) bg-(--color-amber-glow) text-(--color-text-amber)";
  }
  return "border-(--color-blue-border) bg-(--color-blue-glow) text-(--color-text-blue)";
};

const DispatchUnitModal: React.FC<DispatchUnitModalProps> = ({
  isOpen,
  onClose,
  incidentId,
  incidentType,
  location,
  coordinates,
  severity,
  availableUnits,
  deployedUnits,
  onDispatch,
}) => {
  const { shouldRender, isVisible } = useModalDissolve(isOpen, MODAL_EXIT_MS);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [dispatchNote, setDispatchNote] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  const selectedUnitIds = useMemo(() => new Set(selectedUnits), [selectedUnits]);

  const closestEta = useMemo(() => {
    // Derived summary metric used by UI header for quick triage scanning.
    if (availableUnits.length === 0) return "N/A";
    const sortedByEta = [...availableUnits].sort((a, b) => {
      const etaA = Number.parseInt(a.eta, 10);
      const etaB = Number.parseInt(b.eta, 10);
      return etaA - etaB;
    });
    return sortedByEta[0]?.eta ?? "N/A";
  }, [availableUnits]);

  useEffect(() => {
    // Reset modal-scoped draft state on close to avoid leaking previous selection between incidents.
    if (!isOpen) {
      setSelectedUnits([]);
      setDispatchNote("");
      setIsDispatching(false);
    }
  }, [isOpen]);

  const toggleUnitSelection = (unitId: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const handleDispatch = () => {
    if (selectedUnits.length === 0) return;
    setIsDispatching(true);
    // TODO(API): Wire to POST /incidents/:incidentId/dispatch with selected unit IDs + note
    onDispatch?.(selectedUnits, dispatchNote.trim());
    setIsDispatching(false);
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`modal-overlay-dissolve fixed inset-0 z-(--z-modal) flex items-center justify-center bg-black/50 p-4 ${
        isVisible ? "is-open" : "is-closed"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <section
        className={`modal-card-dissolve w-full max-w-3xl rounded-2xl border border-(--color-border-1) bg-(--color-surface-1) shadow-xl ${
          isVisible ? "is-open" : "is-closed"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Dispatch units"
      >
        <header className="flex items-start justify-between border-b border-(--color-border-1) px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-(--color-text-1)">Dispatch Unit</h2>
            <p className="mt-1 text-xs text-(--color-text-3)">
              Assign response units to {incidentId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-(--color-text-3) transition-colors hover:bg-(--color-surface-2) hover:text-(--color-text-1)"
            aria-label="Close dispatch modal"
          >
            <X size={16} />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-xl border border-(--color-border-2) bg-(--color-surface-2) p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-(--color-text-1)">{incidentType}</p>
                <p className="mt-1 text-xs text-(--color-text-3)">{location}</p>
                <p className="mt-0.5 text-[11px] text-(--color-text-3)">{coordinates}</p>
              </div>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${getSeverityClass(severity)}`}>
                {severity}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-(--color-text-3)">
              {availableUnits.length} available • {deployedUnits.length} deployed • closest ETA {closestEta}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-3)">Available Units</h3>
              <p className="text-[11px] text-(--color-text-3)">{selectedUnits.length} selected</p>
            </div>
            <div className="max-h-64 space-y-2 overflow-auto custom-scrollbar">
              {availableUnits.map((unit) => {
                const selected = selectedUnitIds.has(unit.id);
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => toggleUnitSelection(unit.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selected
                        ? "border-(--color-orange-border) bg-[rgba(245,124,0,0.13)]"
                        : "border-(--color-border-1) bg-(--color-surface-2) hover:border-(--color-border-2)"
                    }`}
                    aria-pressed={selected}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-(--color-orange) ${
                        selected ? "bg-[rgba(245,124,0,0.16)]" : "bg-(--color-surface-1)"
                      }`}>
                        {selected ? <CheckCircle2 size={16} /> : <Truck size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-(--color-text-1)">{unit.name}</p>
                          <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getStatusPillClass(unit.status)}`}>
                            {unit.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-(--color-text-3)">
                          {unit.personnel} personnel • {unit.equipment} • {unit.distance} • {unit.eta} ETA
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {deployedUnits.length > 0 ? (
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-(--color-text-3)">Already Deployed</h3>
              <div className="space-y-2">
                {deployedUnits.map((unit) => (
                  <div key={unit.id} className="rounded-xl border border-(--color-border-1) bg-(--color-surface-2) p-3 opacity-70">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-(--color-text-2)">{unit.name}</p>
                      <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getStatusPillClass(unit.status)}`}>
                        {unit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-3)">Dispatch Note</label>
              <span className="text-[10px] text-(--color-text-4)">Optional</span>
            </div>
            <textarea
              value={dispatchNote}
              onChange={(event) => setDispatchNote(event.target.value)}
              placeholder="Add direction for responding units"
              rows={3}
              className="w-full resize-none rounded-lg border border-(--color-border-2) bg-(--color-surface-2) px-3 py-2 text-xs text-(--color-text-2) placeholder-(--color-text-4) focus:border-(--color-orange-border) focus:outline-none"
            />
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-(--color-border-1) px-5 py-4">
          <p className="text-xs text-(--color-text-3)">
            {selectedUnits.length === 0 ? "Select at least one unit" : `${selectedUnits.length} unit(s) selected`}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="ui-btn ui-btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispatch}
              disabled={selectedUnits.length === 0 || isDispatching}
              className="ui-btn ui-btn-primary disabled:opacity-50"
            >
              <Send size={14} fill="currentColor" />
              {isDispatching ? "Sending..." : "Send Dispatch"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default DispatchUnitModal;
