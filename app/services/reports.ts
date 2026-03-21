import {
  fetchLocalReportById,
  fetchLocalReports,
  updateLocalReportStatus,
} from "./localReportsDb";

const isLocalDbEnabled = process.env.NEXT_PUBLIC_USE_LOCAL_DB === "true";

export const fetchReports = async () => {
  if (isLocalDbEnabled) {
    return fetchLocalReports();
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/reports?sort=date&pageSize=10&pageOffset=0`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch reports");
  }

  return res.json();
};

export const fetchReportById = async (id: string) => {
  if (isLocalDbEnabled) {
    return fetchLocalReportById(id);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/${id}`,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch report details for ID: ${id}`);
  }

  return res.json();
};

export const updateReportStatus = async (id: string, status: number) => {
  if (isLocalDbEnabled) {
    return updateLocalReportStatus(id, status);
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/${id}/status`;

  // 🟢 LOG 1: Before calling the API
  console.info(`📡 [API Call] PATCH ${url}`, { id, status });

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    // Verify if your backend expects a raw number or an object:
    // If raw number: JSON.stringify(status)
    // If object: JSON.stringify({ status })
    body: JSON.stringify(status),
  });

  // 🔴 Error Handling
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ [API Error] Status: ${res.status}`, errorText);
    throw new Error(`Failed to update report status: ${res.status}`);
  }

  // 🟢 LOG 2: Successful update
  console.log(`✅ [API Success] Report ${id} updated to status ${status}`);

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  // 🟢 LOG 3: Show the updated record from the database
  if (data) console.table(data);

  return data;
};
