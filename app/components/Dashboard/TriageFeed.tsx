import React from "react";
import { Flame, Truck, Droplets, ShieldAlert, ChevronUp } from "lucide-react";

// --- Sub-Components ---

const SOSCard: React.FC<{ name: string; location: string; time: string }> = ({
  name,
  location,
  time,
}) => (
  <div className="relative mb-2 flex cursor-pointer items-center gap-3 rounded-lg border-2 border-(--color-red-border) bg-(--color-red-glow) p-3 transition-all hover:border-(--color-red) hover:shadow-lg">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-red-border) bg-(--color-red) text-white shadow-lg">
      <span className="absolute inline-flex h-10 w-10 animate-pulse rounded-full bg-(--color-red) opacity-20"></span>
      <ChevronUp size={24} strokeWidth={3} />
    </div>
    <div className="flex-1 overflow-hidden">
      <h4 className="truncate text-sm font-semibold text-(--color-text-1)">{name}</h4>
      <p className="truncate text-xs text-(--color-text-red)">{location}</p>
    </div>
    <span className="shrink-0 text-xs font-bold text-(--color-text-red)">{time}</span>
  </div>
);

const FeedItem: React.FC<{
  title: string;
  location: string;
  time: string;
  type: "FIRE" | "CRASH" | "FLOOD" | "CRIME";
  percentage: string;
  status: string;
  active?: boolean;
}> = ({ title, location, time, type, percentage, status, active }) => {
  const configs = {
    FIRE: {
      icon: Flame,
      color: "text-(--color-orange)",
      bg: "bg-(--color-orange-glow)",
      border: "border-(--color-orange-border)",
      tag: "bg-(--color-orange-glow) text-(--color-orange)",
    },
    CRASH: {
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
    CRIME: {
      icon: ShieldAlert,
      color: "text-(--color-text-purple)",
      bg: "bg-(--color-purple-glow)",
      border: "border-(--color-purple-border)",
      tag: "bg-(--color-purple-glow) text-(--color-text-purple)",
    },
  };
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      className={`relative mb-3 flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors ${
        active
          ? "border-(--color-orange-border) bg-(--color-orange-glow) shadow-(--shadow-panel)"
          : "border-(--color-border-1) bg-(--color-surface-1) hover:border-(--color-border-2) hover:bg-(--color-surface-2)"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.color}`}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold text-(--color-text-1)">{title}</h4>
          <span className="shrink-0 text-[10px] text-(--color-text-3)">{time}</span>
        </div>
        <p className="mt-0.5 text-xs text-(--color-text-3)">{location}</p>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${config.border} ${config.tag}`}
          >
            {type} - {percentage}
          </span>
          <span className="rounded border border-(--color-blue-border) bg-(--color-blue-glow) px-2 py-0.5 text-[10px] font-medium text-(--color-text-blue)">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const TriageFeed: React.FC = () => {
  const filters = ["All", "BFP", "CTMO", "PDRRMO", "PNP"];

  return (
    <div className="flex h-screen w-77.5 flex-col overflow-hidden border-r border-(--color-border-1) bg-(--color-surface-1) text-(--color-text-2)">
      {/* Header */}
      <div className="z-10 flex shrink-0 items-center justify-between border-b border-(--color-border-1) bg-(--color-surface-1) p-4">
        <h2 className="text-sm font-semibold tracking-tight text-(--color-text-1)">
          Triage Feed
        </h2>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-(--color-text-green)">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-green) opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-(--color-green)"></span>
          </span>
          Live
        </div>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
  <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-(--color-text-red)">
              <span className="relative h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-red) opacity-100"></span>
                <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-(--color-red) opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-(--color-red)"></span>
              </span>
              SOS ACTIVE
            </div>
            <span className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-(--color-red) bg-(--color-red) text-[10px] font-bold text-white shadow-lg">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-(--color-red) opacity-30"></span>
              <span className="relative">2</span>
            </span>
          </div>
          <SOSCard
            name="Maria Santos"
            location="Brgy. Pag-asa, Quezon City"
            time="0:52"
          />
          <SOSCard
            name="Jose Reyes"
            location="Commonwealth Ave, QC"
            time="1:24"
          />
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          {filters.map((f, i) => (
            <button
              key={f}
              className={`cursor-pointer whitespace-nowrap rounded-full border px-4 py-1 text-[10px] font-bold transition-all ${
                i === 0
                  ? "border-(--color-orange-border) bg-(--color-orange-glow) text-(--color-orange)"
                  : "border-(--color-border-2) bg-(--color-surface-2) text-(--color-text-3) hover:border-(--color-border-3) hover:text-(--color-text-2)"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Incident Feed Items */}
        <div className="flex flex-col gap-1">
          <FeedItem
            title="Structure Fire — 3-Storey Building"
            location="Brgy. Pag-asa..."
            time="2:41 PM"
            type="FIRE"
            percentage="97%"
            status="Under Review"
            active
          />
          <FeedItem
            title="Major Road Accident"
            location="Commonwealth Ave..."
            time="2:39 PM"
            type="CRASH"
            percentage="94%"
            status="Submitted"
          />
          <FeedItem
            title="Grass Fire — Vacant Lot"
            location="Batasan Hills..."
            time="2:28 PM"
            type="FIRE"
            percentage="88%"
            status="In Progress"
          />
          <FeedItem
            title="Street Flooding"
            location="Fairview, QC"
            time="2:15 PM"
            type="FLOOD"
            percentage="79%"
            status="Under Review"
          />
        </div>
      </div>

      {/* Footer Stats - Fixed at bottom */}
      <div className="grid shrink-0 grid-cols-4 border-t border-(--color-border-1) bg-(--color-bg) py-4">
        <StatBlock value="2" label="SOS" color="text-(--color-text-red)" />
        <StatBlock value="8" label="Active" color="text-(--color-orange)" />
        <StatBlock value="3" label="Pending" color="text-(--color-text-amber)" />
        <StatBlock value="14" label="Resolved" color="text-(--color-text-green)" />
      </div>
    </div>
  );
};

// Helper for the footer to keep code dry
const StatBlock = ({
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

export default TriageFeed;
