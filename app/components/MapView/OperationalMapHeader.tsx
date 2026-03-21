import React from "react";
import { RefreshCw, Circle } from "lucide-react";

const OperationalMapHeader = ({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between border-b border-(--color-border-1) bg-(--color-surface-1) p-4">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold uppercase tracking-tight text-(--color-text-1)">
          Operational Map
        </h1>
        <p className="text-[10px] text-(--color-text-3)">
          Live incident feed · 7 active incidents · 4 units deployed
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-(--color-text-green)">
          <Circle size={8} fill="currentColor" className="animate-pulse" />
          Live
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="ui-btn ui-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
};

export default OperationalMapHeader;
