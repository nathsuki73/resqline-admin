import React from "react";
import { Phone, MapPin, X, Send, Eye } from "lucide-react";

const OperationalSidebar = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="absolute top-4 right-4 bottom-4 w-80 z-20 bg-[#121212]/95 backdrop-blur-md border border-gray-800 rounded-xl flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/20">
        <div className="flex items-center gap-2 text-orange-500">
          <MapPin size={16} />
          <h2 className="text-sm font-bold truncate">
            Structure Fire — 3-Storey Bldg
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Mini Map Preview Area */}
        <div className="aspect-video bg-[#0a0a0a] rounded-lg border border-gray-800 mb-6 flex items-center justify-center relative">
          <div className="h-10 w-10 rounded-full border-2 border-red-500 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
          </div>
          <span className="absolute bottom-2 left-2 text-[9px] font-mono text-gray-500">
            14.6574°N · 121.0287°E
          </span>
        </div>

        {/* Incident Info */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
            Incident
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800/30 p-2 rounded border border-gray-800">
              <p className="text-[8px] text-gray-500 uppercase">Type</p>
              <p className="text-xs font-bold text-orange-500">
                Structure Fire
              </p>
            </div>
            <div className="bg-gray-800/30 p-2 rounded border border-gray-800">
              <p className="text-[8px] text-gray-500 uppercase">Severity</p>
              <p className="text-xs font-bold text-red-500">Critical - SOS</p>
            </div>
            <div className="bg-gray-800/30 p-2 rounded border border-gray-800">
              <p className="text-[8px] text-gray-500 uppercase">Department</p>
              <p className="text-xs font-bold text-gray-300">BFP</p>
            </div>
            <div className="bg-gray-800/30 p-2 rounded border border-gray-800">
              <p className="text-[8px] text-gray-500 uppercase">AI Score</p>
              <p className="text-xs font-bold text-orange-500">97%</p>
            </div>
          </div>
        </div>

        {/* Reporter Info */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
            Reporter
          </p>
          <div className="flex items-center justify-between bg-gray-800/20 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-xs text-orange-500 font-bold">
                MS
              </div>
              <div>
                <p className="text-xs font-bold text-gray-200">Maria Santos</p>
                <p className="text-[10px] text-gray-500">+63 917 123 4567</p>
              </div>
            </div>
            <button className="bg-green-900/20 border border-green-700/50 text-green-500 p-1.5 rounded-lg">
              <Phone size={14} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 grid grid-cols-2 gap-2 bg-gray-900/30 border-t border-gray-800">
        <button className="flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/40 text-orange-500 py-2 rounded-lg text-[10px] font-bold uppercase cursor-pointer">
          <Eye size={14} /> View Full Detail
        </button>
        <button className="flex items-center justify-center gap-2 bg-orange-600 text-white py-2 rounded-lg text-[10px] font-bold uppercase cursor-pointer">
          <Send size={14} /> Dispatch
        </button>
      </div>
    </div>
  );
};

export default OperationalSidebar;
