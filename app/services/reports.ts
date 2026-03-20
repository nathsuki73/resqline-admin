export const fetchReports = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/reports?sort=date&pageSize=10&pageoffset=0`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch reports");
  }

  return res.json();
};

export const fetchReportById = async (id: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/${id}`,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch report details for ID: ${id}`);
  }

  return res.json();
};

export const updateReportStatus = async (id: string, status: number) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(status),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to update report status");
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
};
