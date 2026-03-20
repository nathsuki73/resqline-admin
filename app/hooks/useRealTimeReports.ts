"use client";

import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

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

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://resqline-backend.onrender.com/hub/Notification", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // 🔥 IMPORTANT: adjust event name if needed
    connection.on("reportcreated", (report: Report) => {
      console.log("📡 Incoming report:", report);

      setReports((prev) => {
        // prevent duplicates
        const exists = prev.find((r) => r.id === report.id);
        if (exists) return prev;

        return [report, ...prev];
      });
    });

    connection
      .start()
      .then(() => {
        console.log("✅ Connected to SignalR");
        setConnectionStatus("connected");
      })
      .catch((err) => {
        console.error("❌ SignalR Connection Error:", err);
        setConnectionStatus("error");
      });

    connection.onreconnecting(() => setConnectionStatus("reconnecting"));
    connection.onreconnected(() => setConnectionStatus("connected"));
    connection.onclose(() => setConnectionStatus("disconnected"));

    return () => {
      connection.stop();
    };
  }, []);

  return { reports, connectionStatus };
}
