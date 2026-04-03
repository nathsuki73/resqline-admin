"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BellRing, ExternalLink, X } from "lucide-react";

import { mapApiStatusToLabel } from "@/app/constants/reportStatus";
import { REPORTS_SYNC_EVENT, getReportById } from "@/app/hooks/reportsStore";

type IncomingReportAlert = {
  id: string;
  title: string;
  location: string;
  status: string;
  time: string;
};

const getReportLocation = (report: Record<string, unknown>) => {
  const reportedAt = report.reportedAt;
  const location = report.location;

  const reportedAtObject = reportedAt && typeof reportedAt === "object" ? (reportedAt as Record<string, unknown>) : null;
  const locationObject = location && typeof location === "object" ? (location as Record<string, unknown>) : null;

  const reverseGeoCode = reportedAtObject?.reverseGeoCode ?? locationObject?.reverseGeoCode;
  if (typeof reverseGeoCode === "string" && reverseGeoCode.trim().length > 0) {
    return reverseGeoCode;
  }

  const latitude = reportedAtObject?.latitude ?? locationObject?.latitude;
  const longitude = reportedAtObject?.longitude ?? locationObject?.longitude;

  if (typeof latitude === "number" && typeof longitude === "number") {
    return `Lat ${latitude}, Lon ${longitude}`;
  }

  return "Unknown location";
};

export default function IncomingReportToast({
  onViewReport,
}: {
  onViewReport: (reportId: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [alert, setAlert] = useState<IncomingReportAlert | null>(null);

  useEffect(() => {
    setMounted(true);

    const handleSync = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string; reportId?: string }>).detail;
      if (!detail || detail.reason !== "realtime-create" || !detail.reportId) return;

      const report = getReportById(detail.reportId) as Record<string, unknown> | null;
      if (!report) return;

      const rawDate = report.createdAt || report.dateCreated || report.timestamp;

      setAlert({
        id: String(report.id ?? detail.reportId),
        title: String(report.description ?? "New report received"),
        location: getReportLocation(report),
        status: mapApiStatusToLabel(report.status),
        time:
          typeof rawDate === "string"
            ? new Date(rawDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Just now",
      });
    };

    window.addEventListener(REPORTS_SYNC_EVENT, handleSync as EventListener);

    return () => {
      window.removeEventListener(REPORTS_SYNC_EVENT, handleSync as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!alert) return;

    const timeoutId = window.setTimeout(() => {
      setAlert(null);
    }, 9000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [alert]);

  if (!mounted || !alert) return null;

  return createPortal(
    <div className="fixed right-4 top-4 z-120 w-[min(92vw,24rem)]">
      <div className="rounded-2xl border border-[rgba(247,162,70,0.35)] bg-[#171411] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(247,162,70,0.35)] bg-[rgba(247,162,70,0.12)] text-[#f7a246]">
            <BellRing size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#f7a246]">
              New Report
            </p>
            <h3 className="mt-1 truncate text-sm font-semibold text-[#f7f1ea]">
              {alert.title}
            </h3>
            <p className="mt-1 text-xs text-[#c5bdb3]">{alert.location}</p>
            <p className="mt-1 text-[11px] text-[#8e8173]">
              {alert.status} · {alert.time}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewReport(alert.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-[rgba(247,162,70,0.35)] bg-[rgba(247,162,70,0.12)] px-3 py-2 text-xs font-semibold text-[#f7f1ea] transition-colors hover:bg-[rgba(247,162,70,0.18)]"
              >
                <ExternalLink size={14} />
                View report
              </button>
              <button
                type="button"
                onClick={() => setAlert(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#c5bdb3] transition-colors hover:text-[#f7f1ea]"
                aria-label="Dismiss report alert"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}