import {
  canTransitionStatus,
  mapApiStatusToSlug,
  mapResponderStatusToMobileStatus,
  mapSlugToApiStatus,
  type IncidentStatusSlug,
} from "../../../constants/reportStatus";
import {
  applyOptimisticTransition,
  getReportById,
  loadReportsShared,
  reconcileTransitionReport,
  rollbackOptimisticTransition,
} from "../../../hooks/reportsStore";
import { fetchReportById, updateReportStatus } from "./reportsApi";
import { normalizeReportId } from "./reportSync";

type TransitionOrigin = "dashboard" | "operational-map" | "all-reports" | "triage" | "unknown";

export type StatusTransitionResult = {
  transitionId: string;
  reportId: string;
  status: IncidentStatusSlug;
  mobileStatus: string;
  skipped: boolean;
  apiResult: unknown;
};

type TransitionRequest = {
  reportId: string;
  nextStatus: IncidentStatusSlug;
  origin?: TransitionOrigin;
};

let transitionSequence = 0;

const makeTransitionId = (reportId: string): string => {
  transitionSequence += 1;
  const seq = String(transitionSequence).padStart(4, "0");
  return `tx-${Date.now()}-${reportId}-${seq}`;
};

const extractStatusValue = (payload: unknown): unknown => {
  if (!payload || typeof payload !== "object") return undefined;
  const source = payload as Record<string, unknown>;
  return (
    source.status ??
    source.statusCode ??
    source.reportStatus ??
    source.reportStatusCode ??
    source.state
  );
};

export const transitionReportStatus = async ({
  reportId,
  nextStatus,
  origin = "unknown",
}: TransitionRequest): Promise<StatusTransitionResult> => {
  const normalizedId = normalizeReportId(reportId);
  const transitionId = makeTransitionId(normalizedId || "unknown");
  const existing = normalizedId ? getReportById(normalizedId) : null;
  const localStatus = existing?.status ?? "submitted";
  let currentStatus = localStatus;

  if (!normalizedId) {
    throw new Error("Cannot transition report with empty id.");
  }

  try {
    const latestBeforePatch = await fetchReportById(normalizedId);
    const latestStatus = mapApiStatusToSlug(extractStatusValue(latestBeforePatch));
    currentStatus = latestStatus;
    reconcileTransitionReport(latestBeforePatch, transitionId);

    if (!canTransitionStatus(latestStatus, nextStatus)) {
      return {
        transitionId,
        reportId: normalizedId,
        status: latestStatus,
        mobileStatus: mapResponderStatusToMobileStatus(latestStatus),
        skipped: true,
        apiResult: {
          invalidTransition: true,
          from: latestStatus,
          to: nextStatus,
        },
      };
    }

    if (latestStatus === nextStatus) {
      const mobileStatus = mapResponderStatusToMobileStatus(latestStatus);
      return {
        transitionId,
        reportId: normalizedId,
        status: latestStatus,
        mobileStatus,
        skipped: true,
        apiResult: {
          preflightReconciled: true,
        },
      };
    }
  } catch {
    // Ignore preflight fetch failures and continue normal optimistic PATCH path.
  }

  applyOptimisticTransition(normalizedId, nextStatus, transitionId);

  try {
    const statusCode = mapSlugToApiStatus(nextStatus);
    const apiResult = await updateReportStatus(normalizedId, statusCode);
    const idempotentAccepted = Boolean(
      (apiResult as { idempotentAccepted?: unknown } | null)?.idempotentAccepted,
    );

    let latest = null;
    try {
      latest = await fetchReportById(normalizedId);
    } catch {
      latest = null;
    }

    if (latest) {
      reconcileTransitionReport(latest, transitionId);
    } else {
      await loadReportsShared(true);
    }

    const finalReport = getReportById(normalizedId);
    const finalStatus = (finalReport?.status ?? nextStatus) as IncidentStatusSlug;
    const mobileStatus = mapResponderStatusToMobileStatus(finalStatus);

    return {
      transitionId,
      reportId: normalizedId,
      status: finalStatus,
      mobileStatus,
      skipped: false,
      apiResult: {
        idempotentAccepted,
        raw: apiResult,
      },
    };
  } catch (error) {
    try {
      const latestOnError = await fetchReportById(normalizedId);
      const latestStatus = mapApiStatusToSlug(extractStatusValue(latestOnError));

      reconcileTransitionReport(latestOnError, transitionId);

      if (latestStatus === nextStatus) {
        const mobileStatus = mapResponderStatusToMobileStatus(latestStatus);

        return {
          transitionId,
          reportId: normalizedId,
          status: latestStatus,
          mobileStatus,
          skipped: false,
          apiResult: {
            reconciledAfterError: true,
            error: error instanceof Error ? error.message : String(error),
          },
        };
      }
    } catch {
      // Ignore fallback fetch failures and continue with rollback.
    }

    try {
      await loadReportsShared(true);
      const latestFromStore = getReportById(normalizedId);
      const latestStatusFromStore = mapApiStatusToSlug(latestFromStore?.status);

      if (latestStatusFromStore === nextStatus) {
        const mobileStatus = mapResponderStatusToMobileStatus(latestStatusFromStore);
        console.info(`[status-transition:${transitionId}] reconciled-from-store-after-error`, {
          reportId: normalizedId,
          origin,
          currentStatus,
          nextStatus,
          finalStatus: latestStatusFromStore,
          mobileStatus,
          error,
        });

        return {
          transitionId,
          reportId: normalizedId,
          status: latestStatusFromStore,
          mobileStatus,
          skipped: false,
          apiResult: {
            reconciledFromStoreAfterError: true,
            error: error instanceof Error ? error.message : String(error),
          },
        };
      }
    } catch {
      // Ignore fallback load failures and continue with rollback.
    }

    rollbackOptimisticTransition(normalizedId, currentStatus, transitionId);
    console.error(`[status-transition:${transitionId}] failed`, {
      reportId: normalizedId,
      origin,
      currentStatus,
      nextStatus,
      error,
    });
    throw error;
  }
};
