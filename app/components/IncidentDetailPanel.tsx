import React from "react";
import { Phone, Flame, Play, BrainCircuit } from "lucide-react";

// --- Sub-Components ---

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase whitespace-nowrap">
      {title}
    </span>
    <div className="h-[1px] w-full bg-gray-800" />
  </div>
);

const InfoCard = ({
  label,
  value,
  color = "text-gray-300",
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <div className="bg-gray-900/40 border border-gray-800 p-3 rounded-lg">
    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className={`text-xs font-semibold ${color}`}>{value}</p>
  </div>
);

const ConfidenceBar = ({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) => (
  <div className="mb-3">
    <div className="flex justify-between text-[11px] mb-1">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono text-gray-300">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// --- Main Component ---

const IncidentDetailPanel = () => {
  return (
    <div className="w-[400px] bg-[#121212] p-5 h-screen overflow-y-auto custom-scrollbar border-r border-gray-800">
      {/* Reporter Section */}
      <SectionHeader title="Reporter" />
      <div className="flex items-center justify-between bg-gray-900/40 border border-gray-800 p-4 rounded-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-900/30 border border-orange-500/30 flex items-center justify-center text-orange-500 font-bold text-sm">
            MS
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-200">
              Maria Santos
            </h4>
            <p className="text-xs text-gray-500">+63 917 123 4567</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-green-900/20 border border-green-700/50 text-green-500 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-green-900/30 transition-colors cursor-pointer">
          <Phone size={14} fill="currentColor" /> Call Now
        </button>
      </div>

      {/* Incident Info Grid */}
      <SectionHeader title="Incident Info" />
      <div className="grid grid-cols-2 gap-3 mb-6">
        <InfoCard label="Type" value="Structure Fire" color="text-orange-500" />
        <InfoCard
          label="Severity"
          value="Critical · SOS"
          color="text-red-500"
        />
        <InfoCard label="Department" value="BFP" />
        <InfoCard label="Reported" value="2:41 PM Today" />
      </div>

      {/* Media Section */}
      <SectionHeader title="Media" />
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="aspect-video bg-orange-950/20 border border-orange-900/30 rounded-lg flex flex-col items-center justify-center relative cursor-pointer hover:bg-orange-950/30 transition-all">
          <Flame size={24} className="text-orange-500/50" />
          <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-gray-300">
            Photo · 2.3MB
          </span>
        </div>
        <div className="aspect-video bg-blue-950/20 border border-blue-900/30 rounded-lg flex flex-col items-center justify-center relative cursor-pointer hover:bg-blue-950/30 transition-all">
          <Play size={24} className="text-blue-500/50" fill="currentColor" />
          <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-gray-300">
            Video · 12.1MB
          </span>
        </div>
      </div>

      {/* AI Analysis */}
      <SectionHeader title="AI Analysis" />
      <div className="bg-[#0f1115] border border-blue-900/20 p-4 rounded-xl mb-6 shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-400">
            <BrainCircuit size={16} />
            <span className="text-[11px] font-bold uppercase tracking-tight">
              ResqLine AI — Confidence
            </span>
          </div>
          <span className="text-[10px] text-gray-500">2:41 PM</span>
        </div>
        <ConfidenceBar
          label="Structure fire detected"
          value={97}
          colorClass="bg-red-500"
        />
        <ConfidenceBar
          label="Multi-storey building"
          value={89}
          colorClass="bg-orange-500"
        />
        <ConfidenceBar
          label="Active flames visible"
          value={84}
          colorClass="bg-orange-500"
        />
        <ConfidenceBar
          label="Civilians possibly trapped"
          value={61}
          colorClass="bg-yellow-500"
        />
      </div>

      {/* Reporter Description */}
      <SectionHeader title="Reporter Description" />
      <div className="bg-gray-900/20 border border-gray-800 p-4 rounded-xl italic text-xs text-gray-400 leading-relaxed mb-6">
        &quot;Malaking sunog sa 3-storey building sa may Pag-asa. May naririnig pang
        sigaw sa loob.&quot;
      </div>

      {/* Internal Notes */}
      <SectionHeader title="Internal Notes" />
      <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-xl text-xs text-gray-300 leading-relaxed">
        Units BFP-QC-3 and BFP-QC-7 notified. ETA ~8 mins.
      </div>
    </div>
  );
};

export default IncidentDetailPanel;
