export type IncidentCategoryType =
  | "SOS"
  | "MEDICAL"
  | "TRAFFIC"
  | "FIRE"
  | "FLOOD"
  | "STRUCTURAL"
  | "OTHER";

export enum Category {
  Other = 32,
  TrafficAccident = 4,
  FireIncident = 3,
  Flooding = 8,
  StructuralDamage = 9,
  MedicalEmergency = 2,
}

export const INCIDENT_CATEGORY_OPTIONS: Array<{
  label: string;
  value: string;
}> = [
  { label: "Select Category", value: "" },
  { label: "Traffic Accident", value: "traffic accident" },
  { label: "Fire Incident", value: "fire incident" },
  { label: "Flooding", value: "flooding" },
  { label: "Structural Damage", value: "structural damage" },
  { label: "Medical Emergency", value: "medical emergency" },
  { label: "Other / General Incident", value: "other" },
];

export const getReportCategoryInput = (report: unknown): unknown => {
  if (!report || typeof report !== "object") return report;

  const source = report as Record<string, unknown>;
  const candidates = [
    source.categoryValue,
    source.categoryLabel,
    source.categoryName,
    source.categoryType,
    source.categoryCode,
    source.category,
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    if (typeof candidate === "string" && candidate.trim().length === 0)
      continue;
    return candidate;
  }

  return source.category;
};

const normalizeCategoryInput = (category: unknown): string => {
  if (category === null || category === undefined) return "";

  if (typeof category === "object") {
    const source = category as Record<string, unknown>;
    const next = source.value ?? source.label ?? source.name ?? source.type;
    if (next !== undefined && next !== null) {
      return normalizeCategoryInput(next);
    }
  }

  const raw = String(category).trim().toLowerCase();
  return raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ");
};

export const mapCategoryCodeToType = (
  category: unknown,
): IncidentCategoryType => {
  const normalized = normalizeCategoryInput(category);

  if (
    normalized === String(Category.TrafficAccident) ||
    normalized === "traffic accident"
  ) {
    return "TRAFFIC";
  }
  if (
    normalized === String(Category.FireIncident) ||
    normalized === "fire incident"
  ) {
    return "FIRE";
  }
  if (normalized === String(Category.Flooding) || normalized === "flooding") {
    return "FLOOD";
  }
  if (
    normalized === String(Category.StructuralDamage) ||
    normalized === "structural damage"
  ) {
    return "STRUCTURAL";
  }
  if (
    normalized === String(Category.MedicalEmergency) ||
    normalized === "medical emergency"
  ) {
    return "MEDICAL";
  }
  if (
    normalized === String(Category.Other) ||
    normalized === "other" ||
    normalized === "other / general incident"
  ) {
    return "OTHER";
  }

  // SOS remains a dedicated explicit category when API sends it as text.
  if (normalized === "sos" || normalized === "sos report") {
    return "SOS";
  }

  return "OTHER";
};

export const mapCategoryCodeToLabel = (category: unknown): string => {
  const type = mapCategoryCodeToType(category);

  if (type === "SOS") return "SOS";
  if (type === "MEDICAL") return "Medical Emergency";
  if (type === "TRAFFIC") return "Traffic Accident";
  if (type === "FIRE") return "Fire Incident";
  if (type === "FLOOD") return "Flooding";
  if (type === "STRUCTURAL") return "Structural Damage";
  return "General Incident";
};

export const mapCategoryCodeToDepartment = (
  category: unknown,
): "BFP" | "CTMO" | "PDRRMO" => {
  const type = mapCategoryCodeToType(category);
  if (type === "FIRE") return "BFP";
  if (type === "TRAFFIC") return "CTMO";
  return "PDRRMO";
};
