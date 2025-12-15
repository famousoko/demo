import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Server, 
  FileText, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Download,
  ChevronRight,
  LogOut,
  Smartphone,
  Cloud
} from 'lucide-react';

// --- Mock Data ---
const MOCK_COMPANY = "Acme Logistics Ltd";
const MOCK_USER = "Admin User";

const INITIAL_STATS = {
  score: 68,
  devices_total: 24,
  devices_compliant: 19,
  users_total: 15,
  users_mfa: 12,
  last_scan: "2 hours ago"
};

const CRITICAL_ISSUES = [
  { id: 1, title: "MFA Disabled", target: "Sarah Jenkins (Finance)", source: "Microsoft 365", severity: "high" },
  { id: 2, title: "Windows Update Failed", target: "Warehouse-PC-04", source: "Agent", severity: "high" },
  { id: 3, title: "iOS Version Outdated", target: "Director iPad", source: "Intune", severity: "medium" }
];

const CHECKLIST_ITEMS = [
  { id: "firewalls", label: "Firewalls", status: "pass", detail: "Software firewalls active on all 24 endpoints." },
  { id: "config", label: "Secure Configuration", status: "fail", detail: "3 devices have guest accounts enabled." },
  { id: "patching", label: "Security Update Management", status: "warning", detail: "1 device pending critical update (KB5034441)." },
  { id: "access", label: "User Access Control", status: "pass", detail: "Admin privileges restricted correctly." },
  { id: "malware", label: "Malware Protection", status: "pass", detail: "Defender real-time protection active." }
];

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }) => (
  <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
    <div className="p-6 flex items-center gap-3 text-white">
      <div className="bg-blue-600 p-2 rounded-lg">
        <Shield size={24} />
      </div>
      <span className="font-bold text-lg tracking-tight">CE Autopilot</span>
    </div>

    <nav className="flex-1 px-4 space-y-2 mt-4">
      <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" id="dashboard" active={activeTab} set={setActiveTab} />
      <NavItem icon={<FileText size={20} />} label="Assessment & Evidence" id="evidence" active={activeTab} set={setActiveTab} />
      <div className="pt-4 pb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Assets</div>
      <NavItem icon={<Server size={20} />} label="Endpoints (Agents)" id="endpoints" active={activeTab} set={setActiveTab} />
      <NavItem icon={<Users size={20} />} label="Identity (M365)" id="identity" active={activeTab} set={setActiveTab} />
      <NavItem icon={<Smartphone size={20} />} label="Mobile (MDM)" id="mobile" active={activeTab} set={setActiveTab} />
    </nav>

    <div className="p-4 border-t border-slate-800">
      <button className="flex items-center gap-3 text-sm hover:text-white transition-colors w-full p-2">
        <Settings size={18} />
        <span>Settings</span>
      </button>
      <button className="flex items-center gap-3 text-sm hover:text-red-400 transition-colors w-full p-2 mt-1 text-slate-400">
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    </div>
  </div>
);

const NavItem = ({ icon, label, id, active, set }) => (
  <button 
    onClick={() => set(id)}
    className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all ${
      active === id 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
      : 'hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ScoreCard = ({ score }) => {
  let color = "text-red-500";
  let status = "Not Certified";
  let ringColor = "border-red-500";
  
  if (score >= 80) {
    color = "text-yellow-500";
    status = "Almost Ready";
    ringColor = "border-yellow-500";
  }
  if (score === 100) {
    color = "text-green-500";
    status = "Certified Ready";
    ringColor = "border-green-500";
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
      <h3 className="text-slate-500 font-medium text-sm mb-4">Live Compliance Score</h3>
      <div className={`w-32 h-32 rounded-full border-8 ${ringColor} flex items-center justify-center mb-2`}>
        <span className={`text-4xl font-bold ${color}`}>{score}%</span>
      </div>
      <span className={`font-semibold ${color}`}>{status}</span>
      <p className="text-xs text-slate-400 mt-2">Next scan in 15 mins</p>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, alert }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${alert ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
        {icon}
      </div>
      {alert && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="text-xs text-slate-400 mt-1">{subtext}</div>
    </div>
  </div>
);

const IntegrationBadge = ({ name, status, type }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded ${status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
        {type === 'cloud' ? <Cloud size={16} /> : type === 'agent' ? <Server size={16} /> : <Smartphone size={16} />}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-700">{name}</div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          {status === 'connected' ? (
            <><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Syncing</>
          ) : (
            'Disconnected'
          )}
        </div>
      </div>
    </div>
    <button className="text-xs font-medium text-blue-600 hover:text-blue-800">Configure</button>
  </div>
);

const DashboardView = ({ stats, issues, setActiveTab }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Real-time overview for {MOCK_COMPANY}</p>
      </div>
      <div className="flex gap-2">
         <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw size={16} /> Scan Now
         </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <ScoreCard score={stats.score} />
      <StatCard 
        icon={<Users size={24} />} 
        label="Identity Status" 
        value={`${stats.users_mfa}/${stats.users_total}`} 
        subtext="Users MFA Enabled"
        alert={stats.users_mfa !== stats.users_total}
      />
      <StatCard 
        icon={<Server size={24} />} 
        label="Device Health" 
        value={`${stats.devices_compliant}/${stats.devices_total}`} 
        subtext="Endpoints Patched"
        alert={stats.devices_compliant !== stats.devices_total}
      />
      <StatCard 
        icon={<AlertTriangle size={24} />} 
        label="Critical Issues" 
        value={issues.length} 
        subtext="Requires Action"
        alert={true}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800">Action Required</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {issues.map(issue => (
            <div key={issue.id} className="flex items-start gap-4 p-4 rounded-lg bg-red-50 border border-red-100 hover:shadow-md transition-shadow cursor-pointer">
              <AlertTriangle className="text-red-600 shrink-0 mt-1" size={20} />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{issue.title}</h4>
                <p className="text-sm text-slate-600">{issue.target} • via {issue.source}</p>
              </div>
              <button className="bg-white text-slate-700 text-xs px-3 py-1.5 rounded border border-slate-200 font-medium hover:bg-slate-50">
                Fix
              </button>
            </div>
          ))}
          <div className="p-4 rounded-lg bg-green-50 border border-green-100 flex items-center gap-4">
             <CheckCircle className="text-green-600 shrink-0" size={20} />
             <div className="flex-1">
               <h4 className="font-bold text-slate-800 text-sm">Phishing Simulation Complete</h4>
               <p className="text-sm text-slate-600">November Campaign • 98% pass rate</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 mb-6">Data Sources</h3>
        <div className="space-y-3">
          <IntegrationBadge name="Microsoft 365" status="connected" type="cloud" />
          <IntegrationBadge name="Azure AD / Entra" status="connected" type="cloud" />
          <IntegrationBadge name="Local Agents" status="connected" type="agent" />
          <IntegrationBadge name="Intune MDM" status="disconnected" type="mobile" />
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
           <p className="text-xs text-slate-400 mb-2">Last full sync: {stats.last_scan}</p>
           <button className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700">
             Manage Integrations
           </button>
        </div>
      </div>
    </div>
  </div>
);

const EvidenceView = ({ checklist }) => {
  const [generating, setGenerating] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setComplete(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold text-slate-800">Evidence & Assessment</h2>
        <p className="text-slate-500">Cyber Essentials Questionnaire (IASME v3.1)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           {checklist.map(item => (
             <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
                <div className={`mt-1 ${item.status === 'pass' ? 'text-green-500' : item.status === 'fail' ? 'text-red-500' : 'text-yellow-500'}`}>
                   {item.status === 'pass' && <CheckCircle size={24} />}
                   {item.status === 'fail' && <XCircle size={24} />}
                   {item.status === 'warning' && <AlertTriangle size={24} />}
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-center mb-1">
                     <h4 className="font-bold text-slate-800">{item.label}</h4>
                     <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.status === 'pass' ? 'bg-green-100 text-green-700' : 
                        item.status === 'fail' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                     }`}>
                        {item.status.toUpperCase()}
                     </span>
                   </div>
                   <p className="text-sm text-slate-600">{item.detail}</p>
                </div>
                <button className="text-slate-400 hover:text-blue-600">
                   <ChevronRight />
                </button>
             </div>
           ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-fit sticky top-6">
           <h3 className="font-bold text-slate-800 mb-4">Evidence Pack</h3>
           <p className="text-sm text-slate-500 mb-6">
             Generate a PDF report containing all telemetry data mapped to the 5 key controls.
           </p>

           <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
              <div className="flex justify-between text-sm mb-2">
                 <span className="text-slate-600">Controls Met:</span>
                 <span className="font-bold text-slate-800">4/5</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                 <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-red-500">Warning: Fix "Secure Configuration" before generating final report.</p>
           </div>

           {!complete ? (
             <button 
               onClick={handleGenerate}
               disabled={generating}
               className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${
                 generating ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20'
               }`}
             >
                {generating ? <RefreshCw className="animate-spin" size={20} /> : <FileText size={20} />}
                {generating ? "Compiling PDF..." : "Generate Draft Pack"}
             </button>
           ) : (
             <div className="space-y-3">
                <button className="w-full py-3 bg-green-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-900/20">
                   <Download size={20} /> Download PDF
                </button>
                <button 
                  onClick={() => setComplete(false)}
                  className="w-full py-2 text-slate-500 text-sm hover:text-slate-800"
                >
                  Generate New Version
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(INITIAL_STATS);
  const [issues, setIssues] = useState(CRITICAL_ISSUES);

  // Simulation of "Live" data updates
  useEffect(() => {
    const interval = setInterval(() => {
       // Randomly toggle a stat slightly to make it feel alive
       setStats(prev => ({
         ...prev,
         score: prev.score < 100 ? prev.score : 100, // Just a placeholder for potential logic
       }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">AL</div>
              <div>
                 <h1 className="text-sm font-bold text-slate-800">{MOCK_COMPANY}</h1>
                 <p className="text-xs text-slate-500">Premium Plan • MSP Managed</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">Welcome, {MOCK_USER}</span>
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
           {activeTab === 'dashboard' && <DashboardView stats={stats} issues={issues} setActiveTab={setActiveTab} />}
           {activeTab === 'evidence' && <EvidenceView checklist={CHECKLIST_ITEMS} />}
           {(activeTab !== 'dashboard' && activeTab !== 'evidence') && (
             <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <Server size={64} className="mb-4 opacity-50" />
                <h2 className="text-xl font-bold text-slate-600">Module Under Construction</h2>
                <p>This prototype focuses on the Dashboard and Evidence views.</p>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Return to Dashboard
                </button>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}