"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchReports } from "@/app/services/reports";

export function useReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Create a memoized fetch function
  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // 🟢 Export 'mutate' (or 'refresh') so the UI can trigger a reload
  return { reports, loading, mutate: loadReports };
}
