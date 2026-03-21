"use client";

import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getSignalRConnection } from "./signalr";

export type Report = {
  id: string;
  title: string;
  type: string;
  longitude: number;
  latitude: number;
  confidence: number;
  status: string;
  timestamp: string;
  is_active: boolean;
};

export function useRealtimeReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const connection = getSignalRConnection(); // Get the singleton instance

    const handleReportCreated = (report: Report) => {
      if (!isMounted.current) return;
      setReports((prev) => {
        if (prev.find((r) => r.id === report.id)) return prev;
        return [report, ...prev];
      });
    };

    connection.on("reportcreated", handleReportCreated);

    const startSignalR = async () => {
      // If already connected, just update status
      if (connection.state === signalR.HubConnectionState.Connected) {
        setConnectionStatus("connected");
        return;
      }

      // If currently connecting, wait a bit then check again
      if (connection.state === signalR.HubConnectionState.Connecting) {
        return;
      }

      try {
        await connection.start();
        if (isMounted.current) setConnectionStatus("connected");
      } catch (err: any) {
        // Ignore the specific "stop() called" error as it's a known race condition
        if (isMounted.current && !err.toString().includes("stop()")) {
          setConnectionStatus("error");
        }
      }
    };

    startSignalR();

    return () => {
      isMounted.current = false;
      // 🟢 IMPORTANT: Remove listeners but DON'T stop the connection
      connection.off("reportcreated", handleReportCreated);
    };
  }, []);

  return { reports, connectionStatus };
}
