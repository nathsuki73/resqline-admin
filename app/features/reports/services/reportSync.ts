import {
  mapApiStatusToSlug,
  mapResponderStatusToMobileStatus,
  mergeStatusWithoutRegression,
  type IncidentStatusSlug,
  type ReporterMobileStatusSlug,
} from "../../../constants/reportStatus";

export type SyncSource = "api" | "realtime" | "optimistic";

export type TransitionMeta = {
  transitionId: string;
  targetStatus: IncidentStatusSlug;
};

export type SyncedReport = Record<string, unknown> & {
  id: string;
  status: IncidentStatusSlug;
  mobileStatus: ReporterMobileStatusSlug;
};

const EMPTY_ID = "";

export const normalizeReportId = (value: unknown): string => {
  if (value === null || value === undefined) return EMPTY_ID;
  const text = String(value).trim();
  if (!text) return EMPTY_ID;
  return text.replace(/^RPT-\d+-/, "");
};

const toTimestamp = (value: unknown): number => {
  if (typeof value !== "string" || value.trim().length === 0) return 0;
  const stamp = Date.parse(value);
  return Number.isNaN(stamp) ? 0 : stamp;
};

const getCreatedAtValue = (report: Record<string, unknown>): number => {
  return toTimestamp(report.createdAt) || toTimestamp(report.dateCreated);
};

const asObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return {};
};

export const toSyncedReport = (report: Record<string, unknown>): SyncedReport => {
  const normalizedId = normalizeReportId(report.id ?? report._id);
  const status = mapApiStatusToSlug(report.status);

  return {
    ...report,
    id: normalizedId,
    status,
    mobileStatus: mapResponderStatusToMobileStatus(status),
  } as SyncedReport;
};

export const mergeReportRecord = (
  existing: SyncedReport | undefined,
  incomingRaw: Record<string, unknown>,
  pendingTransition?: TransitionMeta,
): SyncedReport => {
  const incoming = toSyncedReport(incomingRaw);

  if (!existing) {
    if (pendingTransition) {
      const mergedPendingStatus = mergeStatusWithoutRegression(
        incoming.status,
        pendingTransition.targetStatus,
      );
      return {
        ...incoming,
        status: mergedPendingStatus,
        mobileStatus: mapResponderStatusToMobileStatus(mergedPendingStatus),
      };
    }
    return incoming;
  }

  const mergedStatus = mergeStatusWithoutRegression(existing.status, incoming.status);
  const next = {
    ...existing,
    ...incoming,
    status: mergedStatus,
    mobileStatus: mapResponderStatusToMobileStatus(mergedStatus),
  } as SyncedReport;

  if (!pendingTransition) return next;

  const guardedStatus = mergeStatusWithoutRegression(next.status, pendingTransition.targetStatus);
  return {
    ...next,
    status: guardedStatus,
    mobileStatus: mapResponderStatusToMobileStatus(guardedStatus),
  };
};

export const mergeReportCollections = (
  currentReports: unknown[],
  incomingReports: unknown[],
  pendingTransitionsById: Record<string, TransitionMeta> = {},
): SyncedReport[] => {
  const byId = new Map<string, SyncedReport>();

  currentReports.forEach((item) => {
    const report = toSyncedReport(asObject(item));
    if (!report.id) return;
    byId.set(report.id, report);
  });

  incomingReports.forEach((item) => {
    const incoming = asObject(item);
    const incomingId = normalizeReportId(incoming.id ?? incoming._id);
    if (!incomingId) return;

    const existing = byId.get(incomingId);
    const pending = pendingTransitionsById[incomingId];
    const merged = mergeReportRecord(existing, incoming, pending);
    byId.set(incomingId, merged);
  });

  return [...byId.values()].sort((a, b) => {
    const stampDiff = getCreatedAtValue(b) - getCreatedAtValue(a);
    if (stampDiff !== 0) return stampDiff;
    return a.id.localeCompare(b.id);
  });
};
