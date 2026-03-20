import { useEffect, useState } from "react";
import { fetchReports } from "../services/reports";

export const useReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchReports();

        if (Array.isArray(data)) {
          setReports(data);
        } else if (data.data) {
          setReports(data.data);
        } else {
          console.warn("Unexpected API shape:", data);
          setReports([]);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { reports, loading };
};
