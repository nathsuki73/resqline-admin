import { Building2, Droplets, Flame, ShieldAlert, Truck } from "lucide-react";
import { BridgeIncident } from "../incidentBridge";
import { type IncidentCategoryType } from "@/app/constants/reportCategories";

type FeedType = IncidentCategoryType;

interface ReportFeedItem {
  id: string;
  title: string;
  location: string;
  time: string;
  type: FeedType;
  percentage: string;
  status: string;
  incident: BridgeIncident;
}

// Add this if SosFeedItem is also missing
interface SosFeedItem {
  id: string;
  name: string;
  location: string;
  time: string;
  incident: BridgeIncident;
}

export const FeedItem: React.FC<
  ReportFeedItem & { active?: boolean; onSelect: () => void }
> = ({ title, location, time, type, percentage, status, active, onSelect }) => {
  const configs: Record<FeedType, any> = {
    FIRE: {
      icon: Flame,
      color: "text-(--color-orange)",
      bg: "bg-(--color-orange-glow)",
      border: "border-(--color-orange-border)",
      tag: "bg-(--color-orange-glow) text-(--color-orange)",
    },
    TRAFFIC: {
      icon: Truck,
      color: "text-(--color-text-amber)",
      bg: "bg-(--color-amber-glow)",
      border: "border-(--color-amber-border)",
      tag: "bg-(--color-amber-glow) text-(--color-text-amber)",
    },
    FLOOD: {
      icon: Droplets,
      color: "text-(--color-text-blue)",
      bg: "bg-(--color-blue-glow)",
      border: "border-(--color-blue-border)",
      tag: "bg-(--color-blue-glow) text-(--color-text-blue)",
    },
    STRUCTURAL: {
      icon: Building2,
      color: "text-(--color-text-purple)",
      bg: "bg-(--color-purple-glow)",
      border: "border-(--color-purple-border)",
      tag: "bg-(--color-purple-glow) text-(--color-text-purple)",
    },
    MEDICAL: {
      icon: ShieldAlert,
      color: "text-(--color-red)",
      bg: "bg-(--color-red-glow)",
      border: "border-(--color-red-border)",
      tag: "bg-(--color-red-glow) text-(--color-red)",
    },
    OTHER: {
      icon: ShieldAlert,
      color: "text-(--color-text-3)",
      bg: "bg-(--color-surface-2)",
      border: "border-(--color-border-1)",
      tag: "bg-(--color-surface-2) text-(--color-text-3)",
    },
  };

  const config = configs[type] || configs.OTHER;
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative mb-3 flex w-full cursor-pointer gap-4 rounded-xl border p-4 text-left transition-all ${
        active
          ? "border-(--color-orange-border) bg-(--color-orange-glow)"
          : "border-(--color-border-1) bg-(--color-surface-1) hover:border-(--color-border-2) hover:bg-(--color-surface-2)"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.color}`}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h4 className="truncate text-sm font-semibold text-(--color-text-1)">
            {title}
          </h4>
          <span className="shrink-0 text-[10px] text-(--color-text-3)">
            {time}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-(--color-text-3)">
          {location}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${config.border} ${config.tag}`}
          >
            {type}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-(--color-text-blue)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--color-blue)" />
            {status}
          </span>
        </div>
      </div>
    </button>
  );
};
