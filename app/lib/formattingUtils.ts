export const getTimeValue = (isoValue: string): number => {
  const stamp = Date.parse(isoValue);
  return Number.isNaN(stamp) ? 0 : stamp;
};

export const formatDateForFilename = (date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
