"use client";

import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getSignalRConnection } from "./signalr";
import { ingestRealtimeReport } from "./reportsStore";

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

export function useRealtimeReports() {
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const isMounted = useRef(true);
  const isLocalDbEnabled = process.env.NEXT_PUBLIC_USE_LOCAL_DB === "true";

  useEffect(() => {
    if (isLocalDbEnabled) {
      setConnectionStatus("local");
      return;
    }

    isMounted.current = true;
    const connection = getSignalRConnection();

    // 🟢 Listener 1: New Reports
    const handleReportCreated = (report: Report) => {
      if (!isMounted.current) return;
      ingestRealtimeReport(report as unknown as Record<string, unknown>);
    };

    // 🟢 Listener 2: Status Updates (Fixes the warning)
    const handleStatusChanged = (updatedReport: Report) => {
      if (!isMounted.current) return;
      console.log("📡 Real-time status update received:", updatedReport);
      ingestRealtimeReport(updatedReport as unknown as Record<string, unknown>);
    };

    connection.on("reportcreated", handleReportCreated);
    connection.on("reportstatuschanged", handleStatusChanged);

    const startSignalR = async () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        setConnectionStatus("connected");
        return;
      }

      if (connection.state === signalR.HubConnectionState.Connecting) return;

      try {
        await connection.start();
        if (isMounted.current) setConnectionStatus("connected");
      } catch (err: any) {
        if (isMounted.current && !err.toString().includes("stop()")) {
          setConnectionStatus("error");
        }
      }
    };

    startSignalR();

    return () => {
      isMounted.current = false;
      // 🟢 Clean up both listeners
      connection.off("reportcreated", handleReportCreated);
      connection.off("reportstatuschanged", handleStatusChanged);
    };
  }, [isLocalDbEnabled]);

  return { connectionStatus };
}
