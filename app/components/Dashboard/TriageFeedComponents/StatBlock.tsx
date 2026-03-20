export const StatBlock = ({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) => (
  <div className="flex flex-col items-center border-r border-(--color-border-1) last:border-0">
    <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
    <p className="mt-1 text-[9px] font-medium uppercase tracking-tight text-(--color-text-3)">
      {label}
    </p>
  </div>
);
