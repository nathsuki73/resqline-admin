"use client";
import { useEffect, useState } from "react";
import {
  getReportsState,
  loadReportsShared,
  subscribeReportsState,
} from "./reportsStore";

export function useReports() {
  const [snapshot, setSnapshot] = useState(getReportsState());

  useEffect(() => {
    const unsubscribe = subscribeReportsState(() => {
      setSnapshot(getReportsState());
    });

    const current = getReportsState();
    if (!current.initialized && !current.loading) {
      void loadReportsShared();
    }
    if (!current.initialized && current.loading) {
      void loadReportsShared();
    }

    return unsubscribe;
  }, []);

  const mutate = async () => {
    await loadReportsShared(true);
  };

  return {
    reports: snapshot.reports,
    loading: snapshot.loading,
    mutate,
  };
}
