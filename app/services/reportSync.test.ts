import { describe, expect, it } from "vitest";
import { mergeReportCollections, normalizeReportId } from "../features/reports/services/reportSync";

describe("reportSync", () => {
  it("normalizes report ids from prefixed and raw values", () => {
    expect(normalizeReportId("RPT-2026-1001")).toBe("1001");
    expect(normalizeReportId("1001")).toBe("1001");
  });

  it("prevents stale api payload from regressing resolved incidents", () => {
    const current = [
      {
        id: "1001",
        status: "resolved",
        createdAt: "2026-03-21T08:35:00.000Z",
      },
    ];

    const incoming = [
      {
        id: "RPT-2026-1001",
        status: "submitted",
        createdAt: "2026-03-21T08:35:00.000Z",
      },
    ];

    const merged = mergeReportCollections(current, incoming);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("1001");
    expect(merged[0].status).toBe("resolved");
    expect(merged[0].mobileStatus).toBe("resolved");
  });

  it("keeps optimistic transition target when realtime payload lags", () => {
    const current = [
      {
        id: "1002",
        status: "under-review",
        createdAt: "2026-03-21T08:20:00.000Z",
      },
    ];

    const incoming = [
      {
        id: "1002",
        status: "under-review",
        createdAt: "2026-03-21T08:20:00.000Z",
      },
    ];

    const merged = mergeReportCollections(current, incoming, {
      "1002": {
        transitionId: "tx-1",
        targetStatus: "in-progress",
      },
    });

    expect(merged[0].status).toBe("in-progress");
    expect(merged[0].mobileStatus).toBe("responders-en-route");
  });
});
