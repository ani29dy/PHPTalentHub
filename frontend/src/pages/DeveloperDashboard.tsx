import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Profile {
  _id?: string;
  verified: boolean;
  profileImage?: string;
}

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    location: string;
    salary?: string;
    jobType?: string;
    createdBy?: {
      name: string;
      businessProfile?: { companyName: string; verified: boolean };
    };
  };
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
}

interface RecruiterAction {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  message: string;
  createdAt: string;
}

interface DashboardData {
  stats: {
    totalApplications: number;
    pending: number;
    accepted: number;
    rejected: number;
    totalViews: number;
    totalDownloads: number;
    totalPortfolioVisits: number;
    totalHireInquiries: number;
  };
  recruiterActions: RecruiterAction[];
  profileStrength: number;
  insights: string[];
  profile: Profile | null;
  recentInterest: {
    companyName: string;
    logo?: string;
    type: "view" | "download" | "portfolio_visit" | "hire_inquiry";
    industry?: string;
    date: string;
  }[];
}

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [filterType, setFilterType] = useState<string | null>(searchParams.get('filter'));
  const [activeTab, setActiveTab] = useState<"applications" | "actions">("applications");

  useEffect(() => { fetchDashboardData(); fetchApplications(); }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("/api/profiles/me/dashboard-stats");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await axios.get("/api/jobs/my/applications");
      setApplications(res.data);
    } catch (e) { console.error(e); }
    finally { setAppsLoading(false); }
  };

  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "D";
  
  const appStatusColor = (s: string) =>
    s === "accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    s === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
    "bg-yellow-50 text-yellow-700 border-yellow-200";

  const timeAgo = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="skeleton h-8 w-1/3 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-start gap-6 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
        
        <div className="relative z-10 flex items-start gap-6 w-full">
          <div className="relative group">
            <div className={`w-20 h-20 rounded-2xl ${data.profile?.profileImage ? '' : 'bg-violet-600'} flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-xl overflow-hidden`}>
              {data.profile?.profileImage ? (
                <img src={data.profile.profileImage} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(user?.name || "")
              )}
            </div>
            <Link to="/developer/profile/edit" className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg shadow-lg flex items-center justify-center text-xs hover:bg-slate-50 border border-slate-100">
              ✎
            </Link>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-slate-500 text-sm font-medium">Developer Dashboard</p>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-xs font-bold text-violet-600">{data.profileStrength}% Profile Strength</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {data.profile?.verified ? (
              <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black px-4 py-2 rounded-xl shadow-sm">
                ✓ VERIFIED PRO
              </span>
            ) : (
              <Link to="/developer/profile/edit" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-violet-200 transition-all uppercase tracking-wider">
                Upgrade to Premium ✨
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Performance Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button 
          onClick={() => setFilterType(filterType === 'view' ? null : 'view')}
          className={`bg-white rounded-3xl border shadow-sm p-6 group transition-all text-left outline-none ${filterType === 'view' ? 'border-violet-600 ring-2 ring-violet-100' : 'border-slate-100 hover:border-violet-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">👁️</span>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase">Live</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{data.stats.totalViews}</p>
          <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-tight">Profile Views</p>
        </button>
        <button 
          onClick={() => setFilterType(filterType === 'download' ? null : 'download')}
          className={`bg-white rounded-3xl border shadow-sm p-6 group transition-all text-left outline-none ${filterType === 'download' ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-slate-100 hover:border-emerald-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📥</span>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase">Hot</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{data.stats.totalDownloads}</p>
          <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-tight">CV Downloads</p>
        </button>
        <button 
          onClick={() => setFilterType(filterType === 'portfolio_visit' ? null : 'portfolio_visit')}
          className={`bg-white rounded-3xl border shadow-sm p-6 group transition-all text-left outline-none ${filterType === 'portfolio_visit' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-100 hover:border-blue-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🔗</span>
            <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg uppercase">Clicks</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{data.stats.totalPortfolioVisits}</p>
          <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-tight">Portfolio Visits</p>
        </button>
        <button 
          onClick={() => setFilterType(filterType === 'hire_inquiry' ? null : 'hire_inquiry')}
          className={`bg-white rounded-3xl border shadow-sm p-6 group transition-all text-left outline-none ${filterType === 'hire_inquiry' ? 'border-orange-600 ring-2 ring-orange-100' : 'border-slate-100 hover:border-orange-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✉️</span>
            <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg uppercase">Interest</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{data.stats.totalHireInquiries}</p>
          <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-tight">Hire Inquiries</p>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {(["applications", "actions"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab === "applications" ? "My Applications" : "Recruiter Actions"}
                {tab === "actions" && data.recruiterActions.length > 0 && (
                  <span className="ml-2 bg-violet-200 text-violet-800 text-[10px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded-md">{data.recruiterActions.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content: Applications */}
          {activeTab === "applications" && (
            <div className="space-y-4">
              {appsLoading ? (
                [1,2].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)
              ) : applications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No applications yet</h3>
                  <Link to="/jobs" className="inline-block bg-violet-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-violet-700 mt-2 text-sm">Browse Jobs</Link>
                </div>
              ) : (
                applications.map(app => {
                  const job = app.jobId;
                  const companyName = job?.createdBy?.businessProfile?.companyName || job?.createdBy?.name || "Company";
                  return (
                    <div key={app._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900">{job?.title}</h3>
                          <p className="text-slate-500 text-sm mt-0.5">{companyName}</p>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-400">
                            {job?.location && <span>📍 {job.location}</span>}
                            {job?.salary && <span>💰 {job.salary}</span>}
                            <span>• Applied {timeAgo(app.appliedAt)}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex-shrink-0 capitalize ${appStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab Content: Recruiter Actions */}
          {activeTab === "actions" && (
            <div className="space-y-4 animate-fade-in-up">
              {data.recruiterActions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <div className="text-4xl mb-4">👀</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No inquiries yet</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">Enhance your profile and upgrade to Premium to start getting direct messages from recruiters.</p>
                </div>
              ) : (
                data.recruiterActions.map(action => (
                  <div key={action._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-lg flex-shrink-0">
                        {action.sender?.name?.charAt(0).toUpperCase() || "B"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{action.sender?.name || "A Recruiter"}</h4>
                          <span className="text-xs text-slate-400">• {timeAgo(action.createdAt)}</span>
                        </div>
                        <p className="text-slate-700 text-sm font-semibold mb-1">{action.title}</p>
                        <p className="text-slate-500 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">{action.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Insights & Recent Visitors */}
        <div className="space-y-6">
          
          {/* Recent Visitors / Interest */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-slate-900 text-lg mb-1">Recent Interest</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Who's looking at you</p>
              </div>
              {filterType && (
                <button 
                  onClick={() => setFilterType(null)}
                  className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-1 rounded-lg uppercase hover:bg-violet-100 transition-colors"
                >
                  Clear Filter ×
                </button>
              )}
            </div>
            
            <div className="space-y-5">
              {data.recentInterest.filter(i => !filterType || i.type === filterType).length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400 italic">
                    {filterType ? `No ${filterType.replace('_', ' ')} interactions yet.` : "No views yet. Try optimization!"}
                  </p>
                </div>
              ) : (
                data.recentInterest
                  .filter(interest => !filterType || interest.type === filterType)
                  .map((interest, i) => (
                  <div key={i} className="flex items-center gap-4 group/item">
                    <div className={`w-10 h-10 rounded-xl ${interest.logo ? '' : 'bg-slate-50'} flex items-center justify-center text-lg shadow-sm border border-slate-100 overflow-hidden flex-shrink-0`}>
                      {interest.logo ? (
                        <img src={interest.logo} alt={interest.companyName} className="w-full h-full object-cover" />
                      ) : (
                        "🏢"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{interest.companyName}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md 
                          ${interest.type === 'download' ? 'bg-emerald-50 text-emerald-600' : 
                            interest.type === 'view' ? 'bg-blue-50 text-blue-600' :
                            interest.type === 'portfolio_visit' ? 'bg-indigo-50 text-indigo-600' :
                            'bg-orange-50 text-orange-600'}`}>
                          {interest.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">{timeAgo(interest.date)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -z-10" />

            <h3 className="font-black text-slate-900 text-lg mb-1">Profile Strength</h3>
            <p className="text-slate-500 text-sm mb-5">Complete your profile to rank higher</p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className={data.profileStrength === 100 ? "text-emerald-500" : "text-violet-600"}>{data.profileStrength}%</span>
                <span className="text-slate-400">100%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${data.profileStrength === 100 ? "bg-emerald-500" : "bg-violet-600"}`}
                  style={{ width: `${data.profileStrength}%` }}
                />
              </div>
            </div>

            {/* Insights Checklist */}
            <ul className="space-y-3 mb-6">
              {data.profileStrength === 100 ? (
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-sm font-semibold text-slate-700">Perfect! Your profile is fully optimized.</span>
                </li>
              ) : (
                data.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-slate-300 mt-0.5">○</span>
                    <span className="text-sm font-medium text-slate-600">{insight}</span>
                  </li>
                ))
              )}
            </ul>

            <Link to="/developer/profile/edit" className="block w-full bg-slate-900 hover:bg-slate-800 text-white text-center py-3 rounded-xl font-bold text-sm transition-colors">
              Update Profile Now
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DeveloperDashboard;
