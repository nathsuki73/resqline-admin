import type { IncidentStatusSlug } from "@/app/constants/reportStatus";

export type IncidentDepartment = "bfp" | "ctmo" | "pdrmo" | "pnp";
export type IncidentStatus = IncidentStatusSlug;
export type IncidentSeverity = "critical" | "high" | "medium" | "low";
