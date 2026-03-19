import React from "react";
import {
  Send,
  Check,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const IncidentHeader = () => {
  return (
    <div className="w-full bg-[#121212] p-4 border-b border-gray-800">
      {/* Top Section: Title and Main Actions */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-100 tracking-tight">
            Structure Fire — 3-Storey Building
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
            RPT-2025-0441 · Maria Santos · 2:41 PM · BFP
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer shadow-lg shadow-orange-900/20">
            <Send size={16} fill="currentColor" />
            Dispatch Unit
          </button>
          <button className="bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer">
            Reject
          </button>
        </div>
      </div>

      {/* Bottom Section: Status Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <StatusPill
          label="Submitted"
          icon={<Check size={14} />}
          variant="completed"
        />
        <ChevronRight size={14} className="text-gray-700" />

        <StatusPill
          label="Under Review"
          icon={<Clock size={14} />}
          variant="active"
        />
        <ChevronRight size={14} className="text-gray-700" />

        <StatusPill
          label="In Progress"
          icon={<Star size={14} />}
          variant="disabled"
        />
        <ChevronRight size={14} className="text-gray-700" />

        <StatusPill
          label="Resolved"
          icon={<CheckCircle2 size={14} />}
          variant="disabled"
        />
      </div>
    </div>
  );
};

// --- Sub-component for Status Pills ---

interface StatusPillProps {
  label: string;
  icon: React.ReactNode;
  variant: "completed" | "active" | "disabled";
}

const StatusPill: React.FC<StatusPillProps> = ({ label, icon, variant }) => {
  const styles = {
    completed: "bg-green-950/30 border-green-900/50 text-green-500",
    active:
      "bg-orange-950/40 border-orange-500 text-orange-500 ring-1 ring-orange-500/30",
    disabled: "bg-gray-900/30 border-gray-800 text-gray-600",
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider transition-all cursor-default ${styles[variant]}`}
    >
      {icon}
      {label}
    </div>
  );
};

export default IncidentHeader;
