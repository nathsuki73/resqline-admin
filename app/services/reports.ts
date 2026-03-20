export const fetchReports = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/reports?sort=date&pageSize=10&pageoffset=0`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch reports");
  }

  return res.json();
};
