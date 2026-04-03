"use client";

import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { fetchReportById } from "@/app/features/reports/services/reportsApi";
import { normalizeReportId } from "@/app/features/reports/services/reportSync";
import { getSignalRConnection } from "./signalr";
import { ingestRealtimeReportWithReason } from "./reportsStore";

export type Report = {
  id: string;
  title: string;
  type: string;
  longitude: number;
  latitude: number;
  confidence: number;
  status: string | number; // Updated to handle both string slugs and numeric enums
  timestamp: string;
  is_active: boolean;
};

let listenersAttached = false;
let startPromise: Promise<void> | null = null;
const hydrationPromisesById = new Map<string, Promise<void>>();

const ingestHydratedRealtimeReport = async (report: Report) => {
  const normalizedId = normalizeReportId(report.id ?? report.title ?? report.timestamp);

  if (!normalizedId) {
    ingestRealtimeReportWithReason(report as unknown as Record<string, unknown>, "realtime-create");
    return;
  }

  const inFlight = hydrationPromisesById.get(normalizedId);
  if (inFlight) {
    await inFlight;
    return;
  }

  const hydrationPromise = (async () => {
    try {
      const fullReport = await fetchReportById(normalizedId);
      ingestRealtimeReportWithReason(fullReport as Record<string, unknown>, "realtime-create");
    } catch (error) {
      console.warn("Falling back to realtime payload for report hydration:", error);
      ingestRealtimeReportWithReason(report as unknown as Record<string, unknown>, "realtime-create");
    } finally {
      hydrationPromisesById.delete(normalizedId);
    }
  })();

  hydrationPromisesById.set(normalizedId, hydrationPromise);
  await hydrationPromise;
};

const handleReportCreated = (report: Report) => {
  void ingestHydratedRealtimeReport(report);
};

const handleStatusChanged = (updatedReport: Report) => {
  console.log("📡 Real-time status update received:", updatedReport);
  void (async () => {
    const normalizedId = normalizeReportId(updatedReport.id);
    if (!normalizedId) return;

    try {
      const fullReport = await fetchReportById(normalizedId);
      ingestRealtimeReportWithReason(fullReport as Record<string, unknown>, "realtime-status");
    } catch (error) {
      console.warn("Falling back to realtime status payload:", error);
      ingestRealtimeReportWithReason(updatedReport as unknown as Record<string, unknown>, "realtime-status");
    }
  })();
};

export function useRealtimeReports() {
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const isLocalDbEnabled = process.env.NEXT_PUBLIC_USE_LOCAL_DB === "true";

  useEffect(() => {
    if (isLocalDbEnabled) {
      setConnectionStatus("local");
      return;
    }

    const connection = getSignalRConnection();

    if (!listenersAttached) {
      connection.on("reportcreated", handleReportCreated);
      connection.on("reportstatuschanged", handleStatusChanged);
      listenersAttached = true;
    }

    const startSignalR = async () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        setConnectionStatus("connected");
        return;
      }

      if (connection.state === signalR.HubConnectionState.Connecting) {
        if (startPromise) {
          try {
            await startPromise;
            setConnectionStatus("connected");
          } catch (err: any) {
            if (!err.toString().includes("stop()")) {
              setConnectionStatus("error");
            }
          }
        }
        return;
      }

      try {
        if (!startPromise) {
          startPromise = connection.start();
        }
        await startPromise;
        setConnectionStatus("connected");
      } catch (err: any) {
        if (!err.toString().includes("stop()")) {
          setConnectionStatus("error");
        }
      } finally {
        startPromise = null;
      }
    };

    startSignalR();

  }, [isLocalDbEnabled]);

  return { connectionStatus };
}
