"use client";

import { useState } from "react";
import AlertsSection from "./components/settings/AlertsSection";
import AllReportsSection from "./components/AllReports/AllReportsSection";
import IncidentMap from "./components/Dashboard/IncidentMap";
import ResponderDashboardShell from "./components/Dashboard/ResponderDashboard";
import DisplaySection from "./components/settings/DisplaySection";
import ProfileSection from "./components/settings/ProfileSection";
import RolesSection from "./components/settings/RolesSection";
import ResponderSection from "./components/Responders/ResponderSection";
import SettingsNav from "./components/SettingsNav";
import SideNav, { SideNavPanel, SideNavTriageItem } from "./components/SideNav";
import TriageFeed from "./components/Dashboard/TriageFeed";
import OperationalMapView from "./components/MapView/OperationalMapView";

export default function ResponderDashboard() {
  const [activePanel, setActivePanel] = useState<SideNavPanel>("triage");
  const [activeTriageItem, setActiveTriageItem] =
    useState<SideNavTriageItem>("dashboard");
  const [activeSettingsItem, setActiveSettingsItem] =
    useState<string>("profile-account");

  // TODO: Replace with API call to detect active SOS incidents from backend
  const hasSosAlerts = true; // Currently hardcoded; will be dynamic from API

  const renderTriageContent = () => {
    switch (activeTriageItem) {
      case "dashboard":
        return <ResponderDashboardShell />;
      case "map":
        return (
          <main className="flex h-screen w-full flex-col bg-[#0a0a0a] overflow-hidden">
            <div className="flex-1 relative">
              <OperationalMapView
                onClose={() => setActiveTriageItem("dashboard")}
              />
            </div>
          </main>
        );
      case "reports":
        return (
          <AllReportsSection
            onOpenDashboard={() => setActiveTriageItem("dashboard")}
          />
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
        hasSosAlerts={hasSosAlerts}
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
