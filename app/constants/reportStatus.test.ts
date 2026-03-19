import { describe, expect, it } from "vitest";
import {
  canTransitionStatus,
  mapApiStatusToSlug,
  mapMobileStatusToLabel,
  mapResponderStatusToMobileStatus,
  mergeStatusWithoutRegression,
} from "./reportStatus";

describe("reportStatus", () => {
  it("maps responder statuses to reporter mobile statuses", () => {
    expect(mapResponderStatusToMobileStatus("submitted")).toBe("received");
    expect(mapResponderStatusToMobileStatus("under-review")).toBe("validated");
    expect(mapResponderStatusToMobileStatus("in-progress")).toBe("responders-en-route");
    expect(mapResponderStatusToMobileStatus("resolved")).toBe("resolved");
    expect(mapResponderStatusToMobileStatus("rejected")).toBe("closed");
  });

  it("prevents backward transitions from terminal states", () => {
    expect(canTransitionStatus("resolved", "in-progress")).toBe(false);
    expect(canTransitionStatus("rejected", "submitted")).toBe(false);
    expect(canTransitionStatus("under-review", "in-progress")).toBe(true);
  });

  it("keeps the furthest-known status when incoming payload is stale", () => {
    expect(mergeStatusWithoutRegression("resolved", "submitted")).toBe("resolved");
    expect(mergeStatusWithoutRegression("in-progress", "under-review")).toBe("in-progress");
    expect(mergeStatusWithoutRegression("submitted", "in-progress")).toBe("in-progress");
  });

  it("provides readable reporter mobile labels", () => {
    expect(mapMobileStatusToLabel("submitted")).toBe("Report Received");
    expect(mapMobileStatusToLabel("in-progress")).toBe("Responders En Route");
    expect(mapMobileStatusToLabel("rejected")).toBe("Case Closed");
  });

  it("normalizes API status strings case-insensitively", () => {
    expect(mapApiStatusToSlug("Resolved")).toBe("resolved");
    expect(mapApiStatusToSlug("UNDER_REVIEW")).toBe("under-review");
    expect(mapApiStatusToSlug("inProgress")).toBe("in-progress");
    expect(mapApiStatusToSlug("in-progress")).toBe("in-progress");
    expect(mapApiStatusToSlug(0)).toBe("submitted");
    expect(mapApiStatusToSlug(2)).toBe("in-progress");
    expect(mapApiStatusToSlug(3)).toBe("resolved");
    expect(mapApiStatusToSlug(4)).toBe("rejected");
  });
});
