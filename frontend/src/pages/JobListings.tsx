import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  createdBy: {
    name: string;
    businessProfile?: {
      companyName: string;
      companySize: string;
      industry: string;
      verified: boolean;
      logo?: string;
    };
  };
}

const JOB_TYPE_COLORS: Record<string, string> = {
  "full-time":  "bg-blue-100 text-blue-700",
  "part-time":  "bg-yellow-100 text-yellow-700",
  "contract":   "bg-purple-100 text-purple-700",
  "freelance":  "bg-orange-100 text-orange-700",
  "remote":     "bg-green-100 text-green-700",
};

const JOB_TYPES = ["full-time", "part-time", "contract", "freelance", "remote"];

const JobListings = () => {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<Record<string, { applied: boolean; status: string | null }>>({});

  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchJobs();
  }, [search, skills, location, jobType]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)   params.append("search",   search);
      if (skills)   params.append("skills",   skills);
      if (location) params.append("location", location);
      if (jobType)  params.append("jobType",  jobType);

      const res = await axios.get(`/api/jobs?${params}`);
      setJobs(res.data);

      if (user?.role === "developer") {
        const statuses: Record<string, { applied: boolean; status: string | null }> = {};
        await Promise.all(
          res.data.map(async (job: Job) => {
            try {
              const s = await axios.get(`/api/jobs/${job._id}/check-application`, authConfig);
              statuses[job._id] = s.data;
            } catch {}
          })
        );
        setApplicationStatus(statuses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch(""); setSkills(""); setLocation(""); setJobType("");
  };

  const hasFilters = search || skills || location || jobType;

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">PHP Job Listings</h1>
        <p className="text-slate-500 mt-1">Find your next PHP development opportunity</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search job titles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white shadow-sm text-slate-900 placeholder-slate-400 text-sm"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ===== FILTER SIDEBAR ===== */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900 text-sm">Filters</h2>
              {hasFilters && (
                <button onClick={clearFilters} className="text-violet-600 hover:text-violet-700 text-xs font-semibold">
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-5">
              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">PHP Skill</label>
                <input
                  type="text"
                  placeholder="e.g. Laravel, Symfony"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Remote, India"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Job Type</label>
                <div className="space-y-1.5">
                  {JOB_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="jobType"
                        value={type}
                        checked={jobType === type}
                        onChange={() => setJobType(jobType === type ? "" : type)}
                        className="w-4 h-4 text-violet-600 border-slate-300"
                      />
                      <span className="text-sm text-slate-600 capitalize group-hover:text-slate-900">
                        {type.replace("-", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== JOB LIST ===== */}
        <div className="flex-1">
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {loading ? "Loading..." : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
            </p>
            {hasFilters && (
              <div className="flex flex-wrap gap-2">
                {search   && <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full">"{search}"</span>}
                {skills   && <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full">{skills}</span>}
                {location && <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full">📍{location}</span>}
                {jobType  && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${JOB_TYPE_COLORS[jobType]}`}>{jobType.replace("-"," ")}</span>}
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="flex gap-4">
                    <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-5 w-1/2" />
                      <div className="skeleton h-4 w-1/3" />
                      <div className="skeleton h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs found</h3>
              <p className="text-slate-500 mb-4">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="bg-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-violet-700 transition-colors text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const company = job.createdBy?.businessProfile;
                const companyName = company?.companyName || job.createdBy?.name;
                const initials = getInitials(companyName);
                const appInfo = applicationStatus[job._id];

                return (
                  <div key={job._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 card-hover">
                    <div className="flex gap-4">
                      {/* Logo */}
                      <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-snug">{job.title}</h3>
                            <p className="text-slate-500 text-sm mt-0.5">
                              {companyName}
                              {company?.verified && (
                                <span className="ml-2 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                  ✓ Verified
                                </span>
                              )}
                            </p>
                          </div>
                          <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(job.createdAt)}</span>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">📍 {job.location}</span>
                          {job.salary && <span className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">💰 {job.salary}</span>}
                          {job.jobType && (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${JOB_TYPE_COLORS[job.jobType]}`}>
                              {job.jobType.replace("-"," ")}
                            </span>
                          )}
                        </div>

                        {/* Description snippet */}
                        <p className="text-slate-500 text-sm leading-relaxed mt-3 line-clamp-2">{job.description}</p>

                        {/* Skill tags */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.slice(0, 5).map((s, i) => (
                            <span key={i} className="bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              {s}
                            </span>
                          ))}
                          {job.skills.length > 5 && <span className="text-xs text-slate-400 px-1 py-1">+{job.skills.length - 5} more</span>}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            View Details
                          </Link>
                          {user?.role === "developer" && appInfo?.applied && (
                            <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                              appInfo.status === "accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              appInfo.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}>
                              Applied — {appInfo.status?.charAt(0).toUpperCase()}{appInfo.status?.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;
