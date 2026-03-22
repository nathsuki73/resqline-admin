export const getIncidentStatusClasses = (status: string): string => {
  if (status === "under-review") return "border-[var(--color-blue-border)] bg-[var(--color-blue-glow)] text-[var(--color-text-blue)]";
  if (status === "submitted") return "border-[var(--color-border-2)] bg-[var(--color-surface-2)] text-[var(--color-text-3)]";
  if (status === "in-progress") return "border-[var(--color-orange-border)] bg-[var(--color-orange-glow)] text-[var(--color-orange)]";
  if (status === "rejected") return "border-[var(--color-red-border)] bg-[var(--color-red-glow)] text-[var(--color-text-red)]";
  return "border-[var(--color-green-border)] bg-[var(--color-green-glow)] text-[var(--color-text-green)]";
};

export const getIncidentDepartmentClasses = (department: string): string => {
  if (department === "bfp") return "border-[var(--color-orange-border)] bg-[var(--color-orange-glow)] text-[var(--color-orange)]";
  if (department === "ctmo") return "border-[var(--color-amber-border)] bg-[var(--color-amber-glow)] text-[var(--color-text-amber)]";
  if (department === "pdrmo") return "border-[var(--color-blue-border)] bg-[var(--color-blue-glow)] text-[var(--color-text-blue)]";
  return "border-[var(--color-purple-border)] bg-[var(--color-purple-glow)] text-[var(--color-text-purple)]";
};
