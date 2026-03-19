import React from "react";
import { RefreshCw, Circle } from "lucide-react";

const OperationalMapHeader = () => {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-[#0a0a0a] to-transparent">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500/20 p-1.5 rounded">
            <RefreshCw size={16} className="text-orange-500" />
          </div>
          <h1 className="text-lg font-bold text-gray-100 uppercase tracking-tight">
            Operational Map
          </h1>
        </div>
        <p className="text-[10px] text-gray-500 ml-9">
          Live incident feed · 7 active incidents · 4 units deployed
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase">
          <Circle size={8} fill="currentColor" className="animate-pulse" />{" "}
          Real-time
        </div>
        <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
    </div>
  );
};

export default OperationalMapHeader;
