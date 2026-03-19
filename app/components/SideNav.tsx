"use client";
import Image from "next/image";
import React, { useState } from "react";
import { LayoutGrid, Map, FileText, Users, Settings } from "lucide-react";

export type SideNavPanel = "triage" | "settings";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: boolean;
};

type SideNavProps = {
  activePanel: SideNavPanel;
  onPanelChange: (panel: SideNavPanel) => void;
  onSettingsItemSelect?: (itemId: string) => void;
};

const SideNav: React.FC<SideNavProps> = ({
  activePanel,
  onPanelChange,
  onSettingsItemSelect,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const isTriagePanel = activePanel === "triage";

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutGrid size={20} />, badge: false },
    { id: "map", label: "Full Map", icon: <Map size={20} />, badge: false },
    { id: "reports", label: "All Reports", icon: <FileText size={20} />, badge: false },
  ];

  return (
    <aside className="sidebar-shell fixed inset-y-0 left-0 z-50 flex h-screen w-16 shrink-0 flex-col items-center overflow-visible py-4">
      {/* Top Logo */}
      <div className="sidebar-logo-tile mb-6 flex h-10 w-10 items-center justify-center rounded-xl p-1">
        <Image
          src="/images/ResqlineLogo.svg"
          alt="ResqLine"
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        {navItems.map((item, index) => (
          <div key={item.id} className="sidebar-tooltip-wrap group relative">
            <button
              onClick={() => {
                setActiveIndex(index);
                onPanelChange("triage");
              }}
              className={`sidebar-nav-btn relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl 
                ${
                  isTriagePanel && activeIndex === index
                    ? "is-active"
                    : ""
                }`}
              aria-label={item.label}
              title={item.label}
            >
              {item.icon}

              {item.badge && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#171411] bg-red-500" />
              )}
            </button>
            <span className="sidebar-tooltip" role="tooltip">
              {item.label}
            </span>
          </div>
        ))}

        <div className="sidebar-divider my-2 h-px w-8" />

        <div className="sidebar-tooltip-wrap group relative">
          <button
            className="sidebar-nav-btn flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl"
            aria-label="Responders"
            title="Responders"
          >
            <Users size={20} />
          </button>
          <span className="sidebar-tooltip" role="tooltip">
            Responders
          </span>
        </div>
      </nav>

      {/* Bottom */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <div className="sidebar-tooltip-wrap group relative">
          <button
            type="button"
            onClick={() => onPanelChange("settings")}
            className={`sidebar-nav-btn flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl ${
              activePanel === "settings"
                ? "is-active"
                : ""
            }`}
            aria-label="Settings"
            title="Settings"
            aria-pressed={activePanel === "settings"}
          >
            <Settings size={20} />
          </button>
          <span className="sidebar-tooltip" role="tooltip">
            Settings
          </span>
        </div>

        <div className="flex h-8 w-10 items-center justify-center rounded-md border border-orange-500/20 bg-orange-500/5 text-[10px] font-bold text-orange-500">
          BFP
        </div>

        <div className="sidebar-tooltip-wrap group relative">
          <button
            type="button"
            onClick={() => {
              onSettingsItemSelect?.("profile-account");
              onPanelChange("settings");
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-500/40 text-[10px] font-bold text-orange-500 transition-colors hover:bg-orange-500/10"
            aria-label="Profile"
            title="Profile"
          >
            RD
          </button>
          <span className="sidebar-tooltip" role="tooltip">
            Profile
          </span>
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
