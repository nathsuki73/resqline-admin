import { fetchReports } from "@/app/features/reports/services/reportsApi";
import {
  mapResponderStatusToMobileStatus,
  mergeStatusWithoutRegression,
  type IncidentStatusSlug,
} from "@/app/constants/reportStatus";
import {
  mergeReportCollections,
  normalizeReportId,
  toSyncedReport,
  type TransitionMeta,
} from "@/app/features/reports/services/reportSync";

type ReportsState = {
  reports: any[];
  loading: boolean;
  initialized: boolean;
  lastSyncAt: number | null;
};

let state: ReportsState = {
  reports: [],
  loading: true,
  initialized: false,
  lastSyncAt: null,
};

let inFlightLoad: Promise<void> | null = null;
const listeners = new Set<() => void>();
const pendingTransitionsById: Record<string, TransitionMeta> = {};

export const REPORTS_SYNC_EVENT = "resqline:reports-sync";

type SyncReason =
  | "api-load"
  | "realtime"
  | "optimistic-transition"
  | "transition-reconcile"
  | "transition-rollback";

type SyncDetail = {
  reason: SyncReason;
  reportId?: string;
  transitionId?: string;
};

const emit = (detail?: SyncDetail) => {
  listeners.forEach((listener) => listener());

  if (typeof window !== "undefined" && detail) {
    window.dispatchEvent(
      new CustomEvent(REPORTS_SYNC_EVENT, {
        detail,
      }),
    );
  }
};

export const getReportsState = (): ReportsState => state;

export const getReportById = (id: string) => {
  const normalizedId = normalizeReportId(id);
  if (!normalizedId) return null;
  return state.reports.find((report) => normalizeReportId(report?.id) === normalizedId) ?? null;
};

const mergeIntoState = (
  incomingReports: unknown[],
  reason: SyncReason,
  transitionId?: string,
  reportId?: string,
) => {
  state = {
    ...state,
    reports: mergeReportCollections(state.reports, incomingReports, pendingTransitionsById),
    initialized: true,
    loading: false,
    lastSyncAt: Date.now(),
  };

  emit({ reason, transitionId, reportId });
};

export const subscribeReportsState = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const ingestRealtimeReport = (report: unknown) => {
  mergeIntoState([report], "realtime");
};

export const applyOptimisticTransition = (
  reportId: string,
  nextStatus: IncidentStatusSlug,
  transitionId: string,
) => {
  const normalizedId = normalizeReportId(reportId);
  if (!normalizedId) return;

  pendingTransitionsById[normalizedId] = {
    transitionId,
    targetStatus: nextStatus,
  };

  const existing = getReportById(normalizedId);
  if (existing) {
    const nextMergedStatus = mergeStatusWithoutRegression(existing.status, nextStatus);
    const optimistic = {
      ...existing,
      status: nextMergedStatus,
      mobileStatus: mapResponderStatusToMobileStatus(nextMergedStatus),
    };
    mergeIntoState([optimistic], "optimistic-transition", transitionId, normalizedId);
    return;
  }

  mergeIntoState(
    [
      {
        id: normalizedId,
        status: nextStatus,
      },
    ],
    "optimistic-transition",
    transitionId,
    normalizedId,
  );
};

export const reconcileTransitionReport = (
  report: unknown,
  transitionId: string,
) => {
  const reportLike = report as { id?: unknown; _id?: unknown };
  const normalizedId = normalizeReportId(reportLike?.id ?? reportLike?._id);
  if (!normalizedId) return;

  if (pendingTransitionsById[normalizedId]?.transitionId === transitionId) {
    delete pendingTransitionsById[normalizedId];
  }

  mergeIntoState([report], "transition-reconcile", transitionId, normalizedId);
};

export const rollbackOptimisticTransition = (
  reportId: string,
  fallbackStatus: IncidentStatusSlug,
  transitionId: string,
) => {
  const normalizedId = normalizeReportId(reportId);
  if (!normalizedId) return;

  if (pendingTransitionsById[normalizedId]?.transitionId === transitionId) {
    delete pendingTransitionsById[normalizedId];
  }

  const existing = getReportById(normalizedId);
  if (!existing) return;

  mergeIntoState(
    [
      {
        ...toSyncedReport(existing),
        status: fallbackStatus,
      },
    ],
    "transition-rollback",
    transitionId,
    normalizedId,
  );
};

export const loadReportsShared = async (force = false) => {
  if (inFlightLoad && !force) {
    await inFlightLoad;
    return;
  }

  state = {
    ...state,
    loading: true,
  };
  emit();

  inFlightLoad = (async () => {
    try {
      const data = await fetchReports();
      mergeIntoState(Array.isArray(data) ? data : [], "api-load");
    } catch (error) {
      console.error("Error fetching reports:", error);
      state = {
        ...state,
        loading: false,
        initialized: true,
      };
      emit({ reason: "api-load" });
    } finally {
      inFlightLoad = null;
    }
  })();

  await inFlightLoad;
};
