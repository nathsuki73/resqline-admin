import React from "react";
import {
  Flame,
  Truck,
  Droplets,
  ShieldAlert,
  Circle,
  ChevronUp,
} from "lucide-react";

// --- Sub-Components ---

const SOSCard: React.FC<{ name: string; location: string; time: string }> = ({
  name,
  location,
  time,
}) => (
  <div className="flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/20 p-3 mb-2 transition-hover hover:bg-red-950/30 cursor-pointer">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-900/40">
      <ChevronUp size={24} strokeWidth={3} />
    </div>
    <div className="flex-1 overflow-hidden">
      <h4 className="truncate text-sm font-semibold text-red-100">{name}</h4>
      <p className="truncate text-xs text-red-400/80">{location}</p>
    </div>
    <span className="text-xs font-mono text-red-500">{time}</span>
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
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/50",
      tag: "bg-orange-950/40 text-orange-500",
    },
    CRASH: {
      icon: Truck,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      tag: "bg-yellow-950/40 text-yellow-500",
    },
    FLOOD: {
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      tag: "bg-blue-950/40 text-blue-500",
    },
    CRIME: {
      icon: ShieldAlert,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      tag: "bg-purple-950/40 text-purple-500",
    },
  };
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      className={`relative flex gap-4 rounded-xl border p-4 mb-3 cursor-pointer transition-all hover:bg-white/5 
      ${active ? "border-orange-500 bg-white/5 shadow-lg shadow-orange-900/10" : "border-gray-800 bg-[#1a1a1a]"}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.color}`}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-medium text-gray-200">{title}</h4>
          <span className="text-[10px] text-gray-500">{time}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{location}</p>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${config.tag}`}
          >
            {type} - {percentage}
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-900/20 text-blue-400 text-[10px] font-medium border border-blue-900/30">
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
    <div className="flex h-screen w-80 flex-col bg-[#121212] text-gray-300 shadow-2xl overflow-hidden border-r border-gray-800">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between p-4 border-b border-gray-800 bg-[#121212] z-10">
        <h2 className="text-sm font-semibold tracking-tight text-gray-100">
          Triage Feed
        </h2>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live
        </div>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* SOS Section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              SOS ACTIVE
            </div>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg shadow-red-900/40">
              2
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
              className={`whitespace-nowrap rounded-full px-4 py-1 text-[10px] font-bold border transition-all cursor-pointer
      ${
        i === 0
          ? "bg-orange-500/20 border-orange-500 text-orange-500"
          : "bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
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
      <div className="grid grid-cols-4 border-t border-gray-800 bg-[#0a0a0a] py-4 shrink-0">
        <StatBlock value="2" label="SOS" color="text-red-500" />
        <StatBlock value="8" label="Active" color="text-orange-500" />
        <StatBlock value="3" label="Pending" color="text-yellow-500" />
        <StatBlock value="14" label="Resolved" color="text-green-500" />
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
  <div className="flex flex-col items-center border-r border-gray-800 last:border-0">
    <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
    <p className="mt-1 text-[9px] font-medium uppercase tracking-tighter text-gray-500">
      {label}
    </p>
  </div>
);

export default TriageFeed;
