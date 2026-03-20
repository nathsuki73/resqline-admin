export type BridgeIncidentStatus =
  | "submitted"
  | "under-review"
  | "in-progress"
  | "resolved"
  | "rejected";
export type BridgeIncidentDepartment = "BFP" | "CTMO" | "PDRRMO" | "PNP";

export type BridgeIncident = {
  id: string;
  incidentType: string;
  location: string;
  latitude?: number;
  longitude?: number;
  reporter: string;
  reporterContact?: string;
  department: BridgeIncidentDepartment;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: BridgeIncidentStatus;
  mobileStatus?: string;
  time: string;
  reporterDescription: string;
  internalNote?: string;

  images?: string[];
  type?: string;

  aiAnalysis?: {
    fire?: number;
    smoke?: number;
    flood?: number;
    injured_person?: number;
    damaged_structures?: number;
    normal_scene?: number;
    traffic_accident?: number;
  };
};

export type BridgeActionType = "dispatch" | "reject";
export type BridgeNoteUpdate = {
  id: string;
  note: string;
};

const INCIDENT_STORAGE_KEY = "resqline.activeIncident";
const ACTION_STORAGE_KEY = "resqline.pendingIncidentAction";
const NOTES_STORAGE_KEY = "resqline.incidentNotesById";
// This bridge intentionally uses localStorage + browser events as a temporary state bus.
// TODO(API): Replace with server-backed state (React Query/SWR + websocket updates) once endpoints are stable.

export const INCIDENT_SELECTED_EVENT = "resqline:incident-selected";
export const INCIDENT_CLEARED_EVENT = "resqline:incident-cleared";
export const INCIDENT_ACTION_EVENT = "resqline:incident-action";
export const INCIDENT_NOTE_UPDATED_EVENT = "resqline:incident-note-updated";
// Event names are public contracts across Dashboard components. Keep stable to avoid silent desync.

const getIncidentNotesById = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
};

const setIncidentNotesById = (notesById: Record<string, string>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesById));
};

export const getIncidentNoteForId = (id: string): string | null => {
  if (typeof window === "undefined") return null;
  const notesById = getIncidentNotesById();
  return notesById[id] ?? null;
};

export const setIncidentNoteForId = (id: string, note: string) => {
  if (typeof window === "undefined") return;
  const notesById = getIncidentNotesById();
  const nextNotesById = { ...notesById, [id]: note };
  setIncidentNotesById(nextNotesById);
  window.dispatchEvent(
    new CustomEvent<BridgeNoteUpdate>(INCIDENT_NOTE_UPDATED_EVENT, {
      detail: { id, note },
    }),
  );
};
// TODO(API): Mirror this update through PATCH /incidents/:id/internal-note and emit real-time updates via socket.

export const getActiveIncident = (): BridgeIncident | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(INCIDENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BridgeIncident;
  } catch {
    return null;
  }
};

export const setActiveIncident = (incident: BridgeIncident) => {
  if (typeof window === "undefined") return;
  const syncedNote = getIncidentNoteForId(incident.id);
  const nextIncident =
    syncedNote !== null ? { ...incident, internalNote: syncedNote } : incident;
  window.localStorage.setItem(
    INCIDENT_STORAGE_KEY,
    JSON.stringify(nextIncident),
  );
  window.dispatchEvent(
    new CustomEvent<BridgeIncident>(INCIDENT_SELECTED_EVENT, {
      detail: nextIncident,
    }),
  );
};
// TODO(API): Persist active incident context in route/query state or global store instead of localStorage.

export const clearActiveIncident = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(INCIDENT_STORAGE_KEY);
  window.dispatchEvent(new Event(INCIDENT_CLEARED_EVENT));
};
// TODO(API): Use a shared store clear action once route/global incident state replaces localStorage bridge.

export const queueIncidentAction = (action: BridgeActionType) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTION_STORAGE_KEY, action);
  window.dispatchEvent(
    new CustomEvent<BridgeActionType>(INCIDENT_ACTION_EVENT, {
      detail: action,
    }),
  );
};
// TODO(API): Replace queued action localStorage with explicit command endpoint + optimistic UI flow.

export const consumeQueuedIncidentAction = (): BridgeActionType | null => {
  if (typeof window === "undefined") return null;
  const queued = window.localStorage.getItem(
    ACTION_STORAGE_KEY,
  ) as BridgeActionType | null;
  if (!queued) return null;
  window.localStorage.removeItem(ACTION_STORAGE_KEY);
  return queued;
};
