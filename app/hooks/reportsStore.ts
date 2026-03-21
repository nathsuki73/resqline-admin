import { fetchReports } from "@/app/services/reports";

type ReportsState = {
  reports: any[];
  loading: boolean;
  initialized: boolean;
};

let state: ReportsState = {
  reports: [],
  loading: true,
  initialized: false,
};

let inFlightLoad: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const getReportsState = (): ReportsState => state;

export const subscribeReportsState = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
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
      state = {
        reports: Array.isArray(data) ? data : [],
        loading: false,
        initialized: true,
      };
    } catch (error) {
      console.error("Error fetching reports:", error);
      state = {
        ...state,
        loading: false,
        initialized: true,
      };
    } finally {
      inFlightLoad = null;
      emit();
    }
  })();

  await inFlightLoad;
};
