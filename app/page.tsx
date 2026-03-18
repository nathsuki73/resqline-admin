import {
  Bell,
  MapPin,
  AlertTriangle,
  Clock,
  Filter,
  ChevronRight,
  User,
  Phone,
  ShieldAlert,
} from "lucide-react";

export default function ResponderDashboard() {
  return (
    <div className="flex h-screen bg-[#F4F5F7] font-sans text-slate-900">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-[#FF8200] tracking-tight">
            Resqline
          </h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem
            icon={<AlertTriangle size={20} />}
            label="Live Triage"
            active
          />
          <NavItem icon={<MapPin size={20} />} label="Incident Map" />
          <NavItem icon={<Clock size={20} />} label="Recent Reports" />
          <NavItem
            icon={<ShieldAlert size={20} />}
            label="SOS Alerts"
            highlight
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Joko Comia</p>
              <p className="text-xs text-slate-500">BFP Responder</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header / Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold">Real-Time Triage</h2>
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full animate-pulse">
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500">
              <Filter size={18} />
              <span className="text-sm font-medium">Filter: Fire Dept</span>
            </div>
            <Bell className="text-slate-400 cursor-pointer hover:text-orange-500 transition-colors" />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-auto p-8 grid grid-cols-12 gap-6">
          {/* 1. AUTO-UPDATING FEED (SignalR Ready) */}
          <section className="col-span-4 space-y-4 overflow-y-auto pr-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Incoming Reports
            </h3>

            {/* SOS High Priority Card */}
            <div className="bg-white border-l-4 border-red-500 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ring-2 ring-red-100">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  CRITICAL SOS
                </span>
                <span className="text-xs text-slate-400">2m ago</span>
              </div>
              <h4 className="font-bold text-slate-800">
                Structural Fire - Residential
              </h4>
              <p className="text-xs text-slate-500 mt-1 truncate">
                San Rafael, San Pablo City, Laguna
              </p>
              <div className="mt-3 flex gap-2">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">
                  AI: FIRE (98%)
                </span>
              </div>
            </div>

            {/* Standard Report Card */}
            <ReportCard
              type="Power"
              location="Brgy. Del Remedio"
              time="15m ago"
              aiTag="Electrical Fault (72%)"
              color="text-yellow-500"
              bgColor="bg-yellow-500"
            />
          </section>

          {/* 2. COMPREHENSIVE DETAIL VIEW */}
          <section className="col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {/* Map Placeholder */}
            <div className="h-64 bg-slate-200 relative flex items-center justify-center">
              <p className="text-slate-400 font-medium">
                Interactive Map Integration (Mapbox/Google)
              </p>
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-full text-white">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 leading-none">
                    Coordinates
                  </p>
                  <p className="text-sm font-bold italic">
                    14.0708° N, 121.3256° E
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Structural Fire - Residential
                  </h2>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={16} />
                    <span className="text-sm">
                      San Rafael, San Pablo City, Laguna
                    </span>
                  </div>
                </div>

                {/* 3. STATUS & DISPATCH MANAGEMENT */}
                <div className="flex flex-col items-end gap-2">
                  <select className="bg-orange-500 text-white font-bold text-sm px-4 py-2 rounded-lg outline-none cursor-pointer">
                    <option>Submitted</option>
                    <option>Under Review</option>
                    <option selected>In Progress</option>
                    <option>Resolved</option>
                    <option>Rejected</option>
                  </select>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Update Status
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Media & AI Tag Review */}
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">
                    Evidence & AI Review
                  </h4>
                  <div className="aspect-video bg-slate-100 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">
                      User Submitted Photo
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm leading-relaxed text-slate-600 italic">
                      "Heavy smoke coming from the second floor of the apartment
                      building near the bakery."
                    </p>
                  </div>
                </div>

                {/* Reporter Info & Notes */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">
                      Reporter Info
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="font-bold">Joko Comia</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Phone size={14} /> +63 912 345 6789
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">
                      Internal Operational Notes
                    </h4>
                    <textarea
                      placeholder="Add dispatcher notes here..."
                      className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({
  icon,
  label,
  active = false,
  highlight = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
      flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all font-bold text-sm
      ${active ? "bg-orange-50 text-[#FF8200]" : "text-slate-500 hover:bg-slate-50"}
      ${highlight ? "border border-red-100 text-red-600 hover:bg-red-50" : ""}
    `}
    >
      {icon}
      {label}
    </div>
  );
}

function ReportCard({ type, location, time, aiTag, color, bgColor }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-orange-200 transition-all">
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${bgColor} text-white`}
        >
          {type}
        </span>
        <span className="text-xs text-slate-400">{time}</span>
      </div>
      <h4 className="font-bold text-slate-800">{type} Incident</h4>
      <p className="text-xs text-slate-500 mt-1 truncate">{location}</p>
      <div className="mt-3 flex gap-2">
        <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded font-bold border border-slate-100">
          AI: {aiTag}
        </span>
      </div>
    </div>
  );
}
