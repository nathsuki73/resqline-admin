import { describe, expect, it } from "vitest";
import {
  Category,
  mapCategoryCodeToLabel,
  mapCategoryCodeToType,
} from "./reportCategories";

describe("reportCategories", () => {
  it("maps backend numeric category enum values", () => {
    expect(mapCategoryCodeToType(Category.TrafficAccident)).toBe("TRAFFIC");
    expect(mapCategoryCodeToType(Category.FireIncident)).toBe("FIRE");
    expect(mapCategoryCodeToType(Category.Flooding)).toBe("FLOOD");
    expect(mapCategoryCodeToType(Category.StructuralDamage)).toBe("STRUCTURAL");
    expect(mapCategoryCodeToType(Category.MedicalEmergency)).toBe("MEDICAL");
    expect(mapCategoryCodeToType(Category.Other)).toBe("OTHER");
  });

  it("maps backend numeric category enum values when provided as strings", () => {
    expect(mapCategoryCodeToType(String(Category.TrafficAccident))).toBe(
      "TRAFFIC",
    );
    expect(mapCategoryCodeToType(String(Category.FireIncident))).toBe("FIRE");
    expect(mapCategoryCodeToType(String(Category.Flooding))).toBe("FLOOD");
    expect(mapCategoryCodeToType(String(Category.StructuralDamage))).toBe(
      "STRUCTURAL",
    );
    expect(mapCategoryCodeToType(String(Category.MedicalEmergency))).toBe(
      "MEDICAL",
    );
    expect(mapCategoryCodeToType(String(Category.Other))).toBe("OTHER");
  });

  it("keeps text mappings for compatibility", () => {
    expect(mapCategoryCodeToType("traffic accident")).toBe("TRAFFIC");
    expect(mapCategoryCodeToType("fire incident")).toBe("FIRE");
    expect(mapCategoryCodeToType("flooding")).toBe("FLOOD");
    expect(mapCategoryCodeToType("structural damage")).toBe("STRUCTURAL");
    expect(mapCategoryCodeToType("medical emergency")).toBe("MEDICAL");
    expect(mapCategoryCodeToType("other")).toBe("OTHER");
    expect(mapCategoryCodeToType("sos")).toBe("SOS");
  });

  it("maps category values to incident type labels", () => {
    expect(mapCategoryCodeToLabel(Category.TrafficAccident)).toBe(
      "Traffic Accident",
    );
    expect(mapCategoryCodeToLabel(Category.FireIncident)).toBe("Fire Incident");
    expect(mapCategoryCodeToLabel(Category.Flooding)).toBe("Flooding");
    expect(mapCategoryCodeToLabel(Category.StructuralDamage)).toBe(
      "Structural Damage",
    );
    expect(mapCategoryCodeToLabel(Category.MedicalEmergency)).toBe(
      "Medical Emergency",
    );
    expect(mapCategoryCodeToLabel(Category.Other)).toBe("General Incident");
    expect(mapCategoryCodeToLabel("sos")).toBe("SOS");
  });
});
