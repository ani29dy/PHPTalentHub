import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  salary?: string;
  jobType?: string;
  createdAt: string;
}

interface Application {
  _id: string;
  jobId: { title: string };
  developerId: { name: string; email: string };
  developerProfile: {
    skills: string[];
    experience: string;
    location: string;
    portfolio?: string;
    bio?: string;
    verified: boolean;
  };
  status: "pending" | "accepted" | "rejected";
  message?: string;
  appliedAt: string;
}

const JOB_TYPE_COLORS: Record<string, string> = {
  "full-time": "bg-blue-100 text-blue-700",
  "part-time": "bg-yellow-100 text-yellow-700",
  "contract":  "bg-purple-100 text-purple-700",
  "freelance": "bg-orange-100 text-orange-700",
  "remote":    "bg-green-100 text-green-700",
};

const BusinessDashboard = () => {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#applications") {
      setActiveTab("applications");
    }
  }, [location.hash]);

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [jobRes, appRes] = await Promise.all([
        axios.get("/api/jobs/my/jobs", authConfig),
        axios.get("/api/jobs/applications/my/list", authConfig),
      ]);
      setJobs(jobRes.data);
      setApplications(appRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const deleteJob = async (jobId: string) => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await axios.delete(`/api/jobs/${jobId}`, authConfig);
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (err) { console.error(err); }
  };

  const updateAppStatus = async (appId: string, status: "accepted" | "rejected") => {
    setProcessingId(appId);
    try {
      await axios.put(`/api/jobs/${appId}/status`, { status }, authConfig);
      await fetchData();
    } catch (err) { console.error(err); }
    finally { setProcessingId(null); }
  };

  const timeAgo = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const pendingCount = applications.filter(a => a.status === "pending").length;
  const initials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="skeleton h-8 w-1/3 mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Business Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/business/profile/edit" className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
            ✎ Edit Profile
          </Link>
          <Link to="/create-job" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-200">
            + Post a Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-3xl font-black text-slate-900">{jobs.length}</p>
          <p className="text-slate-500 text-sm mt-1">Active Job Postings</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-3xl font-black text-slate-900">{applications.length}</p>
          <p className="text-slate-500 text-sm mt-1">Total Applications</p>
        </div>
        <div className={`rounded-2xl border shadow-sm p-5 ${pendingCount > 0 ? "bg-yellow-50 border-yellow-200" : "bg-white border-slate-100"}`}>
          <p className={`text-3xl font-black ${pendingCount > 0 ? "text-yellow-700" : "text-slate-900"}`}>{pendingCount}</p>
          <p className={`text-sm mt-1 ${pendingCount > 0 ? "text-yellow-600 font-semibold" : "text-slate-500"}`}>
            {pendingCount > 0 ? "⚡ Pending Reviews" : "Pending Reviews"}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link to="/search" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover flex items-center gap-4">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🔍</div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Find Developers</p>
            <p className="text-slate-500 text-xs mt-0.5">Search & filter verified PHP talent</p>
          </div>
        </Link>
        <Link to="/jobs" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💼</div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Browse All Jobs</p>
            <p className="text-slate-500 text-xs mt-0.5">See how your postings compare</p>
          </div>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {(["jobs", "applications"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab === "jobs" ? `My Jobs (${jobs.length})` : `Applications (${applications.length})`}
            {tab === "applications" && pendingCount > 0 && (
              <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ===== MY JOBS ===== */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs posted yet</h3>
              <p className="text-slate-500 mb-6">Post your first job to start receiving applications from verified PHP developers.</p>
              <Link to="/create-job" className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-violet-700 transition-colors">
                Post Your First Job
              </Link>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{job.title}</h3>
                      {job.jobType && (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${JOB_TYPE_COLORS[job.jobType] || "bg-slate-100 text-slate-600"}`}>
                          {job.jobType.replace("-", " ")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                      <span>📍 {job.location}</span>
                      {job.salary && <span>💰 {job.salary}</span>}
                      <span>📅 {timeAgo(job.createdAt)}</span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 4).map((s, i) => (
                        <span key={i} className="bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full">{s}</span>
                      ))}
                      {job.skills.length > 4 && <span className="text-xs text-slate-400 px-1 py-1">+{job.skills.length - 4}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/edit-job/${job._id}`} className="text-slate-300 hover:text-violet-600 transition-colors p-1" title="Edit job">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </Link>
                    <button onClick={() => deleteJob(job._id)} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Delete job">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== APPLICATIONS ===== */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <div className="text-5xl mb-4">📥</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-500">Applications from developers will appear here once they apply to your jobs.</p>
            </div>
          ) : (
            applications.map(app => (
              <div key={app._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {initials(app.developerId?.name || "D")}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{app.developerId?.name}</h3>
                      <p className="text-slate-500 text-xs">{app.developerId?.email}</p>
                      <p className="text-violet-600 text-xs font-medium mt-0.5">Applied for: {app.jobId?.title}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize flex-shrink-0 ${
                    app.status === "accepted" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    app.status === "rejected" ? "bg-red-50 text-red-700 border border-red-200" :
                    "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  }`}>
                    {app.status}
                  </span>
                </div>

                {app.developerProfile && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="grid sm:grid-cols-3 gap-3 text-sm mb-3">
                      <div><span className="text-slate-400 text-xs">Experience</span><p className="font-semibold text-slate-800">{app.developerProfile.experience}</p></div>
                      <div><span className="text-slate-400 text-xs">Location</span><p className="font-semibold text-slate-800">{app.developerProfile.location}</p></div>
                      <div><span className="text-slate-400 text-xs">Status</span><p className="font-semibold text-emerald-600">{app.developerProfile.verified ? "✓ Verified" : "Unverified"}</p></div>
                    </div>
                    {app.developerProfile.bio && <p className="text-slate-500 text-xs line-clamp-2 mb-3">{app.developerProfile.bio}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {app.developerProfile.skills?.slice(0, 5).map((s, i) => (
                        <span key={i} className="bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {app.message && (
                  <div className="border border-slate-100 rounded-xl p-4 mb-4 bg-white">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Cover Letter</p>
                    <p className="text-slate-600 text-sm line-clamp-3">{app.message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{timeAgo(app.appliedAt)}</span>
                  {app.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => updateAppStatus(app._id, "accepted")} disabled={processingId === app._id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                        Accept
                      </button>
                      <button onClick={() => updateAppStatus(app._id, "rejected")} disabled={processingId === app._id}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
