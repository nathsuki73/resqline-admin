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
    <div className="w-full bg-[#121212] p-4 border-b border-gray-800 shrink-0">
      {/* Top Section */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-medium text-gray-100 tracking-tight">
            Structure Fire — 3-Storey Building
          </h1>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">
            RPT-2025-0441 · Maria Santos · 2:41 PM · BFP
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-lg shadow-orange-900/20">
            <Send size={14} fill="currentColor" />
            Dispatch Unit
          </button>
          <button className="bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95">
            Reject
          </button>
        </div>
      </div>

      {/* Status Stepper - Now smaller */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <StatusPill
          label="Submitted"
          icon={<Check size={12} />}
          variant="completed"
        />
        <ChevronRight size={12} className="text-gray-800" />

        <StatusPill
          label="Under Review"
          icon={<Clock size={12} />}
          variant="active"
        />
        <ChevronRight size={12} className="text-gray-800" />

        <StatusPill
          label="In Progress"
          icon={<Star size={12} />}
          variant="disabled"
        />
        <ChevronRight size={12} className="text-gray-800" />

        <StatusPill
          label="Resolved"
          icon={<CheckCircle2 size={12} />}
          variant="disabled"
        />
      </div>
    </div>
  );
};

// --- Sub-component ---

interface StatusPillProps {
  label: string;
  icon: React.ReactNode;
  variant: "completed" | "active" | "disabled";
}

const StatusPill: React.FC<StatusPillProps> = ({ label, icon, variant }) => {
  const styles = {
    completed: "bg-green-950/20 border-green-900/30 text-green-600/90",
    active:
      "bg-orange-950/30 border-orange-500/50 text-orange-500 ring-1 ring-orange-500/20",
    disabled: "bg-gray-900/20 border-gray-800/50 text-gray-700",
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-bold uppercase tracking-tight transition-all cursor-default ${styles[variant]}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default IncidentHeader;
