"use client";
import React from "react";
import IncidentMap from "../Dashboard/IncidentMap"; // Using your existing map
import OperationalMapHeader from "./OperationalMapHeader";
import OperationalSidebar from "./OperationalSideBar";
import { Search, Layers, LayoutGrid } from "lucide-react";

const OperationalMapView = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="relative h-full w-full bg-[#0a0a0a] flex overflow-hidden">
      {/* 1. Header Overlay */}
      <OperationalMapHeader />

      {/* 2. Left Search & Filter Overlays */}
      <div className="absolute top-24 left-4 z-20 flex flex-col gap-4 w-64">
        {/* Search Bar */}
        <div className="relative group">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search barangay, address..."
            className="w-full bg-[#121212]/90 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-xs focus:border-orange-500 focus:outline-none transition-all"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 text-white text-[9px] font-bold px-2 py-1 rounded">
            GO
          </button>
        </div>

        {/* Filters Box */}
        <div className="bg-[#121212]/90 border border-gray-800 p-4 rounded-xl shadow-2xl">
          <p className="text-[9px] font-bold text-gray-600 uppercase mb-3">
            Filter by Department
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {["All", "BFP", "CTMO", "PDRRMO", "PNP"].map((f, i) => (
              <button
                key={f}
                className={`px-2 py-1 rounded border text-[8px] font-bold ${i === 0 ? "bg-orange-500/20 border-orange-500 text-orange-500" : "border-gray-800 text-gray-500"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="text-[9px] font-bold text-gray-600 uppercase mb-3">
            Show Layers
          </p>
          <div className="flex gap-2">
            <button className="bg-orange-500/10 border border-orange-500/50 text-orange-500 px-3 py-1 rounded text-[8px] font-bold uppercase">
              Incidents
            </button>
            <button className="border border-gray-800 text-gray-500 px-3 py-1 rounded text-[8px] font-bold uppercase">
              Units
            </button>
            <button className="border border-gray-800 text-gray-500 px-3 py-1 rounded text-[8px] font-bold uppercase">
              Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Left Deployed Units Overlay */}
      <div className="absolute bottom-16 left-4 z-20 w-48 bg-[#121212]/90 border border-gray-800 rounded-xl p-4 shadow-2xl">
        <p className="text-[9px] font-bold text-gray-600 uppercase mb-3">
          Deployed Units
        </p>
        <div className="space-y-3">
          <UnitStatus
            label="BFP-QC-3"
            status="En Route"
            color="text-green-500"
          />
          <UnitStatus
            label="BFP-QC-7"
            status="On Scene"
            color="text-green-500"
          />
          <UnitStatus label="CTMO-1" status="En Route" color="text-blue-500" />
          <UnitStatus
            label="PNP-QC-2"
            status="Standby"
            color="text-purple-500"
          />
        </div>
      </div>

      {/* 4. Incident Summary Overlay (Floating Right) */}
      <div className="absolute top-24 right-96 z-20 w-32 bg-[#121212]/90 border border-gray-800 p-3 rounded-xl shadow-2xl">
        <p className="text-[8px] font-bold text-gray-600 uppercase mb-2">
          Summary
        </p>
        <div className="space-y-1">
          <SummaryLine color="bg-red-500" label="SOS" count="2" />
          <SummaryLine color="bg-orange-500" label="Fire" count="3" />
          <SummaryLine color="bg-blue-500" label="Flood" count="1" />
          <SummaryLine color="bg-green-500" label="Units" count="4" />
        </div>
      </div>

      {/* 5. The Map Base Layer */}
      <div className="h-full w-full">
        <IncidentMap />
      </div>

      {/* 6. The Sidebar Panel */}
      <OperationalSidebar onClose={onClose} />

      {/* 7. Coordinates Footer */}
      <div className="absolute bottom-4 left-4 z-20 text-[9px] text-gray-600 font-mono">
        14.6700°N · 121.0437°E · Quezon City
      </div>
    </div>
  );
};

// --- Helpers ---
const UnitStatus = ({ label, status, color }: any) => (
  <div className="flex items-center justify-between text-[9px] font-bold">
    <div className="flex items-center gap-2 text-gray-300">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-700" /> {label}
    </div>
    <span className={color}>{status}</span>
  </div>
);

const SummaryLine = ({ color, label, count }: any) => (
  <div className="flex items-center justify-between text-[10px]">
    <div className="flex items-center gap-2 text-gray-400">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} /> {label}
    </div>
    <span className="text-gray-200 font-bold">{count}</span>
  </div>
);

export default OperationalMapView;
