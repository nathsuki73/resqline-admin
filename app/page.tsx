"use client";

import { useState } from "react";
import AlertsSection from "./components/settings/AlertsSection";
import DisplaySection from "./components/settings/DisplaySection";
import ProfileSection from "./components/settings/ProfileSection";
import RolesSection from "./components/settings/RolesSection";
import SettingsNav from "./components/SettingsNav";
import SideNav, { SideNavPanel } from "./components/SideNav";
import TriageFeed from "./components/TriageFeed";

export default function ResponderDashboard() {
  const [activePanel, setActivePanel] = useState<SideNavPanel>("triage");
  const [activeSettingsItem, setActiveSettingsItem] = useState<string>("profile-account");

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
      <SideNav activePanel={activePanel} onPanelChange={setActivePanel} />
      {activePanel === "settings" ? (
        <div className="flex flex-row flex-1">
          <SettingsNav onItemSelect={setActiveSettingsItem} />
          {renderSettingsContent()}
        </div>
      ) : (
        <TriageFeed />
      )}
    </div>
  );
}
