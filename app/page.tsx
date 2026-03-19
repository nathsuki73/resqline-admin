import SideNav from "./components/SideNav";
import TriageFeed from "./components/TriageFeed";

export default function ResponderDashboard() {
  return (
    <div className="flex flex-row">
      <SideNav />
      <TriageFeed />
    </div>
  );
}
