"use client";

import { useState } from "react";
import AlertsSection from "./components/settings/AlertsSection";
import IncidentMap from "./components/Dashboard/IncidentMap";
import ResponderDashboardShell from "./components/Dashboard/ResponderDashboard";
import DisplaySection from "./components/settings/DisplaySection";
import ProfileSection from "./components/settings/ProfileSection";
import RolesSection from "./components/settings/RolesSection";
import ResponderSection from "./components/Responders/ResponderSection";
import SettingsNav from "./components/SettingsNav";
import SideNav, { SideNavPanel, SideNavTriageItem } from "./components/SideNav";
import TriageFeed from "./components/Dashboard/TriageFeed";

export default function ResponderDashboard() {
  const [activePanel, setActivePanel] = useState<SideNavPanel>("triage");
  const [activeTriageItem, setActiveTriageItem] = useState<SideNavTriageItem>("dashboard");
  const [activeSettingsItem, setActiveSettingsItem] = useState<string>("profile-account");

  const renderTriageContent = () => {
    switch (activeTriageItem) {
      case "dashboard":
        return <ResponderDashboardShell />;
      case "map":
        return (
          <main className="flex h-screen flex-1 flex-col bg-[#0a0a0a] p-4">
            <div className="mb-3">
              <h1 className="text-base font-semibold text-[#f0ede8]">Operational Map</h1>
              <p className="mt-1 text-xs text-[#7a7268]">Live incidents and field unit positions.</p>
            </div>
            <div className="min-h-0 flex-1">
              <IncidentMap />
            </div>
          </main>
        );
      case "reports":
        return (
          <main className="flex h-screen flex-1 items-center justify-center bg-[#191716] p-8">
            <div className="w-full max-w-xl rounded-2xl border border-[#2a2724] bg-[#1e1c1a] p-6">
              <h1 className="text-xl font-semibold text-[#f0ede8]">All Reports</h1>
              <p className="mt-2 text-sm text-[#7a7268]">Report list section is now connected to SideNav and ready for report table integration.</p>
            </div>
          </main>
        );
      case "responders":
        return <ResponderSection />;
      default:
        return <TriageFeed />;
    }
  };

  const renderSettingsContent = () => {
    switch (activeSettingsItem) {
      case "profile-account":
        return <ProfileSection />;
      case "roles-permissions":
        return <RolesSection />;
      case "alerts-sounds":
        return <AlertsSection />;
      case "display-interface":
        return <DisplaySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="flex flex-row pl-16">
      <SideNav
        activePanel={activePanel}
        activeTriageItem={activeTriageItem}
        onPanelChange={setActivePanel}
        onTriageItemSelect={setActiveTriageItem}
        onSettingsItemSelect={setActiveSettingsItem}
      />
      {activePanel === "settings" ? (
        <div className="flex flex-row flex-1">
          <SettingsNav
            defaultActiveItemId={activeSettingsItem}
            onItemSelect={setActiveSettingsItem}
          />
          {renderSettingsContent()}
        </div>
      ) : (
        renderTriageContent()
      )}
    </div>
  );
}
