"use client";

import { useMemo, useState } from "react";
import AlertsSection from "./components/settings/AlertsSection";
import AllReportsSection from "./components/AllReports/AllReportsSection";
import ResponderDashboardShell from "./components/Dashboard/ResponderDashboard";
import DisplaySection from "./components/settings/DisplaySection";
import ProfileSection from "./components/settings/ProfileSection";
import RolesSection from "./components/settings/RolesSection";
import ResponderSection from "./components/Responders/ResponderSection";
import SettingsNav from "./components/SettingsNav";
import SideNav, { SideNavPanel, SideNavTriageItem } from "./components/SideNav";
import TriageFeed from "./components/Dashboard/TriageFeed";
import OperationalMapView from "./components/MapView/OperationalMapView";
import { useReports } from "./hooks/useReports";
import { isTerminalStatus } from "./constants/reportStatus";

export default function ResponderDashboard() {
  const [activePanel, setActivePanel] = useState<SideNavPanel>("triage");
  const [activeTriageItem, setActiveTriageItem] =
    useState<SideNavTriageItem>("dashboard");
  const [activeSettingsItem, setActiveSettingsItem] =
    useState<string>("profile-account");

  const { reports } = useReports();

  const hasSosAlerts = useMemo(() => {
    const isSosReport = (report: any) => {
      const type = typeof report?.type === "string" ? report.type.toLowerCase() : "";
      return report?.category === 1 || type === "sos" || type === "medical";
    };

    return reports.some((report: any) => isSosReport(report) && !isTerminalStatus(report?.status));
  }, [reports]);

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
