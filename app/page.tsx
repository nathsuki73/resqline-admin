import SideNav from "./components/SideNav";
import ResponderDashboardComponent from "./components/Dashboard/ResponderDashboard";

export default function MainPage() {
  return (
    <div className="flex flex-row">
      <SideNav />
      <ResponderDashboardComponent />
    </div>
  );
}
