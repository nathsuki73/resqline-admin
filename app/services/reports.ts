import {
  fetchLocalReportById,
  fetchLocalReports,
  updateLocalReportStatus,
} from "./localReportsDb";

const isLocalDbEnabled = process.env.NEXT_PUBLIC_USE_LOCAL_DB === "true";

type AuthStyle = "none" | "bearer";

const normalizeStoredToken = (raw: string): string => {
  let token = raw.trim();

  if (token.startsWith("\"") && token.endsWith("\"")) {
    try {
      token = JSON.parse(token) as string;
    } catch {
      token = token.slice(1, -1);
    }
  }

  return token.trim();
};

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const tokenKeys = [
    "resqline_auth_token",
    "auth_token",
    "access_token",
    "token",
    "resqline_token",
    "jwt",
    "user_token",
  ];

  for (const key of tokenKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value.trim()) {
      const normalized = normalizeStoredToken(value);
      if (normalized) return normalized;
    }
  }

  return null;
};

const buildJsonHeaders = (authStyle: AuthStyle = "bearer"): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getAuthToken();
  if (!token || authStyle === "none") {
    return headers;
  }

  if (/^Bearer\s+/i.test(token)) {
    headers.Authorization = token;
  } else {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const fetchReports = async () => {
  if (isLocalDbEnabled) {
    return fetchLocalReports();
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/reports?sort=date&pageSize=10&pageOffset=0`;
  const res = await fetch(url, {
    headers: buildJsonHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch reports");
  }

  const data = await res.json();
  return data;
};

export const fetchReportById = async (id: string) => {
  if (isLocalDbEnabled) {
    return fetchLocalReportById(id);
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/${id}`;
  const res = await fetch(url, {
    headers: buildJsonHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch report details for ID: ${id}`);
  }

  const data = await res.json();
  return data;
};

export const updateReportStatus = async (id: string, status: number) => {
  if (isLocalDbEnabled) {
    return updateLocalReportStatus(id, status);
  }

  if (!Number.isInteger(status) || status < 1 || status > 5) {
    throw new Error(`Invalid status code: ${status}. Expected integer 1-5.`);
  }

  const statusUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/${id}/status`;
  const res = await fetch(statusUrl, {
    method: "PATCH",
    headers: buildJsonHeaders("bearer"),
    body: JSON.stringify(status),
  });

  // 🔴 Error Handling
  if (!res.ok) {
    const errorText = await res.text();

    let parsedError: Record<string, unknown> | null = null;
    try {
      parsedError = errorText ? (JSON.parse(errorText) as Record<string, unknown>) : null;
    } catch {
      parsedError = null;
    }

    const title =
      typeof parsedError?.title === "string" ? parsedError.title : "";
    const isAlreadyState =
      res.status === 400 && title.startsWith("Report.Already");

    if (isAlreadyState) {
      return {
        idempotentAccepted: true,
        statusCode: res.status,
        title,
        detail:
          typeof parsedError?.detail === "string" ? parsedError.detail : null,
        raw: parsedError ?? errorText,
      };
    }

    console.error(`PATCH status update failed`, {
      reportId: id,
      statusCode: res.status,
      statusText: res.statusText,
      sentStatus: status,
      hasAuthToken: Boolean(getAuthToken()),
      errorTitle: title,
      errorDetail: parsedError?.detail || errorText,
      fullError: parsedError || errorText,
    });

    throw new Error(`Failed to update report status: ${res.status}`);
  }

  // 🟢 Successful update
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (data) console.table(data);

  return data;
};
