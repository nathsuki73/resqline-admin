export type IncidentStatusSlug =
  | "submitted"
  | "under-review"
  | "in-progress"
  | "resolved"
  | "rejected";

const STATUS_STEP: Record<IncidentStatusSlug, number> = {
  submitted: 1,
  "under-review": 2,
  "in-progress": 3,
  resolved: 4,
  rejected: 5,
};

export const statusStep = (status: IncidentStatusSlug): number =>
  STATUS_STEP[status];

export const mapApiStatusToSlug = (status: unknown): IncidentStatusSlug => {
  if (status === 1 || status === "submitted") return "submitted";
  if (status === 2 || status === "under-review") return "under-review";
  if (status === 3 || status === "in-progress" || status === "dispatched") {
    return "in-progress";
  }
  if (status === 4 || status === "resolved") return "resolved";
  if (status === 5 || status === "rejected") return "rejected";
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

export const mapSlugToApiStatus = (status: IncidentStatusSlug): number => {
  if (status === "submitted") return 1;
  if (status === "under-review") return 2;
  if (status === "in-progress") return 3;
  if (status === "resolved") return 4;
  return 5;
};
