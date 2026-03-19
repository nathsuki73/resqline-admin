"use client";

import { useState } from "react";
import SettingsNav from "./components/SettingsNav";
import SideNav, { SideNavPanel } from "./components/SideNav";
import TriageFeed from "./components/TriageFeed";

export default function ResponderDashboard() {
  const [activePanel, setActivePanel] = useState<SideNavPanel>("triage");

  return (
    <div className="flex flex-row">
      <SideNav activePanel={activePanel} onPanelChange={setActivePanel} />
      {activePanel === "settings" ? <SettingsNav /> : <TriageFeed />}
    </div>
  );
}
