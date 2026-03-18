export type BridgeIncidentStatus = "under-review" | "submitted" | "in-progress" | "resolved";
export type BridgeIncidentDepartment = "BFP" | "CTMO" | "PDRRMO" | "PNP";

export type BridgeIncident = {
	id: string;
	incidentType: string;
	location: string;
	reporter: string;
	reporterContact?: string;
	department: BridgeIncidentDepartment;
	severity: "Critical" | "High" | "Medium" | "Low";
	status: BridgeIncidentStatus;
	time: string;
	reporterDescription: string;
	internalNote?: string;
};

export type BridgeActionType = "dispatch" | "reject";

const INCIDENT_STORAGE_KEY = "resqline.activeIncident";
const ACTION_STORAGE_KEY = "resqline.pendingIncidentAction";

export const INCIDENT_SELECTED_EVENT = "resqline:incident-selected";
export const INCIDENT_ACTION_EVENT = "resqline:incident-action";

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
	window.localStorage.setItem(INCIDENT_STORAGE_KEY, JSON.stringify(incident));
	window.dispatchEvent(new CustomEvent<BridgeIncident>(INCIDENT_SELECTED_EVENT, { detail: incident }));
};

export const queueIncidentAction = (action: BridgeActionType) => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(ACTION_STORAGE_KEY, action);
	window.dispatchEvent(new CustomEvent<BridgeActionType>(INCIDENT_ACTION_EVENT, { detail: action }));
};

export const consumeQueuedIncidentAction = (): BridgeActionType | null => {
	if (typeof window === "undefined") return null;
	const queued = window.localStorage.getItem(ACTION_STORAGE_KEY) as BridgeActionType | null;
	if (!queued) return null;
	window.localStorage.removeItem(ACTION_STORAGE_KEY);
	return queued;
};
