"use client";
import React, { useState } from "react";
import { LayoutGrid, Map, FileText, Users, Settings, Zap } from "lucide-react";

export type SideNavPanel = "triage" | "settings";

type NavItem = {
  id: string;
  icon: React.ReactNode;
  badge?: boolean;
};

type SideNavProps = {
  activePanel: SideNavPanel;
  onPanelChange: (panel: SideNavPanel) => void;
};

const SideNav: React.FC<SideNavProps> = ({ activePanel, onPanelChange }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const navItems: NavItem[] = [
    { id: "dashboard", icon: <LayoutGrid size={20} />, badge: false },
    { id: "map", icon: <Map size={20} />, badge: false },
    { id: "reports", icon: <FileText size={20} />, badge: false },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-16 shrink-0 flex-col items-center overflow-hidden border-r border-gray-800 bg-[#121212] py-4 text-gray-400">
      {/* Top Logo */}
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-900/20">
        <Zap size={22} fill="currentColor" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        {navItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveIndex(index);
              onPanelChange("triage");
            }}
            className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 
              ${
                activeIndex === index
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/30"
                  : "hover:bg-gray-800 hover:text-gray-200"
              }`}
          >
            {item.icon}

            {item.badge && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-[#121212]" />
            )}
          </button>
        ))}

        <div className="my-2 h-px w-8 bg-gray-800" />

        <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl hover:bg-gray-800 hover:text-gray-200">
          <Users size={20} />
        </button>
      </nav>

      {/* Bottom */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => onPanelChange("settings")}
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all duration-200 ${
            activePanel === "settings"
              ? "border-orange-500/30 bg-orange-500/10 text-orange-500"
              : "border-transparent text-gray-500 hover:bg-gray-800 hover:text-gray-200"
          }`}
          aria-label="Open settings navigation"
          aria-pressed={activePanel === "settings"}
        >
          <Settings size={20} />
        </button>

        <div className="flex h-8 w-10 items-center justify-center rounded-md border border-orange-500/20 bg-orange-500/5 text-[10px] font-bold text-orange-500">
          BFP
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-500/40 text-[10px] font-bold text-orange-500">
          RD
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
