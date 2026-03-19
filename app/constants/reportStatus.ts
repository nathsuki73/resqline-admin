export type IncidentStatusSlug =
  | "submitted"
  | "under-review"
  | "in-progress"
  | "resolved"
  | "rejected";

export type ReporterMobileStatusSlug =
  | "received"
  | "validated"
  | "responders-en-route"
  | "resolved"
  | "closed";

const STATUS_STEP: Record<IncidentStatusSlug, number> = {
  submitted: 0,
  "under-review": 1,
  "in-progress": 2,
  resolved: 3,
  rejected: 4,
};

const TERMINAL_STATUSES = new Set<IncidentStatusSlug>(["resolved", "rejected"]);

const ALLOWED_FORWARD_TRANSITIONS: Record<IncidentStatusSlug, IncidentStatusSlug[]> = {
  submitted: ["under-review", "rejected"],
  "under-review": ["in-progress", "rejected"],
  "in-progress": ["resolved", "rejected"],
  resolved: [],
  rejected: [],
};

const RESPONDER_TO_MOBILE_STATUS: Record<IncidentStatusSlug, ReporterMobileStatusSlug> = {
  submitted: "received",
  "under-review": "validated",
  "in-progress": "responders-en-route",
  resolved: "resolved",
  rejected: "closed",
};

export const statusStep = (status: IncidentStatusSlug): number =>
  STATUS_STEP[status];

export const isTerminalStatus = (status: unknown): boolean =>
  TERMINAL_STATUSES.has(mapApiStatusToSlug(status));

const STATUS_ALIASES: Record<IncidentStatusSlug, Array<number | string>> = {
  submitted: [0, "submitted"],
  "under-review": [1, "under-review", "underreview"],
  "in-progress": [2, "in-progress", "inprogress", "dispatched"],
  resolved: [3, "resolved"],
  rejected: [4, "rejected"],
};

const normalizeStatusInput = (status: unknown): unknown => {
  if (typeof status !== "string") return status;

  return status
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
};

export const mapApiStatusToSlug = (status: unknown): IncidentStatusSlug => {
  const normalized = normalizeStatusInput(status);

  if (STATUS_ALIASES.submitted.includes(normalized as number | string)) {
    return "submitted";
  }
  if (STATUS_ALIASES["under-review"].includes(normalized as number | string)) {
    return "under-review";
  }
  if (STATUS_ALIASES["in-progress"].includes(normalized as number | string)) {
    return "in-progress";
  }
  if (STATUS_ALIASES.resolved.includes(normalized as number | string)) {
    return "resolved";
  }
  if (STATUS_ALIASES.rejected.includes(normalized as number | string)) {
    return "rejected";
  }

  return "submitted";
};

export const mapApiStatusToLabel = (status: unknown): string => {
  const slug = mapApiStatusToSlug(status);
  if (slug === "submitted") return "Submitted";
  if (slug === "under-review") return "Under Review";
  if (slug === "in-progress") return "Dispatched";
  if (slug === "resolved") return "Resolved";
  return "Rejected";
};

export const mapResponderStatusToMobileStatus = (
  status: unknown,
): ReporterMobileStatusSlug => RESPONDER_TO_MOBILE_STATUS[mapApiStatusToSlug(status)];

export const mapMobileStatusToLabel = (status: unknown): string => {
  const slug = mapResponderStatusToMobileStatus(status);
  if (slug === "received") return "Report Received";
  if (slug === "validated") return "Verified by Operations";
  if (slug === "responders-en-route") return "Responders En Route";
  if (slug === "resolved") return "Incident Resolved";
  return "Case Closed";
};

export const mapSlugToApiStatus = (status: IncidentStatusSlug): number => {
  if (status === "submitted") return 0;
  if (status === "under-review") return 1;
  if (status === "in-progress") return 2;
  if (status === "resolved") return 3;
  return 4;
};

export const canTransitionStatus = (
  currentStatus: unknown,
  nextStatus: unknown,
): boolean => {
  const current = mapApiStatusToSlug(currentStatus);
  const next = mapApiStatusToSlug(nextStatus);

  if (current === next) return true;
  return ALLOWED_FORWARD_TRANSITIONS[current].includes(next);
};

export const mergeStatusWithoutRegression = (
  currentStatus: unknown,
  incomingStatus: unknown,
): IncidentStatusSlug => {
  const current = mapApiStatusToSlug(currentStatus);
  const incoming = mapApiStatusToSlug(incomingStatus);

  if (current === incoming) return current;

  if (TERMINAL_STATUSES.has(current)) return current;
  if (TERMINAL_STATUSES.has(incoming)) return incoming;

  if (statusStep(incoming) < statusStep(current)) {
    return current;
  }

  return incoming;
};
