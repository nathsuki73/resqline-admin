export type IncidentCategoryType =
  | "MEDICAL"
  | "TRAFFIC"
  | "FIRE"
  | "FLOOD"
  | "STRUCTURAL"
  | "OTHER";

export const INCIDENT_CATEGORY_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Select Category", value: "" },
  { label: "Traffic Accident", value: "traffic accident" },
  { label: "Fire Incident", value: "fire incident" },
  { label: "Flooding", value: "flooding" },
  { label: "Structural Damage", value: "structural damage" },
  { label: "Medical Emergency", value: "medical emergency" },
  { label: "Other / General Incident", value: "other" },
];

export const mapCategoryCodeToType = (category: unknown): IncidentCategoryType => {
  switch (category) {
    case 1:
      return "MEDICAL";
    case 2:
      return "TRAFFIC";
    case 3:
      return "FIRE";
    case 4:
      return "FLOOD";
    case 5:
      return "STRUCTURAL";
    default:
      return "OTHER";
  }
};

export const mapCategoryCodeToDepartment = (
  category: unknown,
): "BFP" | "CTMO" | "PDRRMO" => {
  if (category === 3) return "BFP";
  if (category === 2) return "CTMO";
  return "PDRRMO";
};
