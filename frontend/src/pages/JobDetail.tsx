import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
    _id?: string;
    name: string;
    email?: string;
    businessProfile?: {
      companyName: string;
      companySize: string;
      industry: string;
      location: string;
      description: string;
      benefits: string[];
      culture?: string;
      verified: boolean;
      website?: string;
      logo?: string;
      founded?: number;
      socialLinks?: { linkedin?: string; twitter?: string; github?: string };
    };
  };
}

const JOB_TYPE_COLORS: Record<string, string> = {
  "full-time":  "bg-blue-100 text-blue-700 border-blue-200",
  "part-time":  "bg-yellow-100 text-yellow-700 border-yellow-200",
  "contract":   "bg-purple-100 text-purple-700 border-purple-200",
  "freelance":  "bg-orange-100 text-orange-700 border-orange-200",
  "remote":     "bg-green-100 text-green-700 border-green-200",
};

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!id) return;
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (job && user?.role === "developer") checkApplication();
  }, [job]);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`/api/jobs/${id}`);
      setJob(res.data);
    } catch {
      setError("Job not found or has been removed.");
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      const res = await axios.get(`/api/jobs/${id}/check-application`, authHeaders);
      setApplied(res.data.applied);
      setAppStatus(res.data.status);
    } catch {}
  };

  const handleApply = async () => {
    if (!user) { navigate("/login"); return; }
    setSubmitting(true);
    try {
      await axios.post(`/api/jobs/${id}/apply`, { message: coverLetter }, authHeaders);
      setApplied(true);
      setAppStatus("pending");
      setShowModal(false);
      setSubmitMsg("🎉 Application submitted successfully!");
      setTimeout(() => setSubmitMsg(""), 4000);
    } catch (e: any) {
      setSubmitMsg(e.response?.data?.message || "Error submitting application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="skeleton h-8 w-1/3 mb-4" />
        <div className="skeleton h-4 w-1/2 mb-8" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Job not found</h1>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link to="/jobs" className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors">
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  const company = job.createdBy.businessProfile;
  const jobTypeColor = JOB_TYPE_COLORS[job.jobType || "full-time"] || "bg-slate-100 text-slate-600 border-slate-200";
  const companyName = company?.companyName || job.createdBy.name;
  const initials = companyName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors">
        ← Back to Jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* ===== MAIN CONTENT ===== */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{job.title}</h1>
                <p className="text-slate-500 font-medium mt-1">
                  {companyName}
                  {company?.verified && (
                    <span className="ml-2 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 mt-5">
              <span className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                📍 {job.location}
              </span>
              {job.salary && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  💰 {job.salary}
                </span>
              )}
              {job.jobType && (
                <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg border capitalize ${jobTypeColor}`}>
                  {job.jobType.replace("-", " ")}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-slate-400 px-3 py-1.5">
                📅 Posted {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Job Description</h2>
            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{job.description}</div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                <span key={i} className="bg-violet-50 border border-violet-200 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Status message */}
          {submitMsg && (
            <div className={`p-4 rounded-xl font-medium text-sm ${submitMsg.includes("🎉") ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {submitMsg}
            </div>
          )}

          {/* Apply button (mobile) */}
          <div className="lg:hidden">
            {user?.role === "developer" ? (
              applied ? (
                <div className={`w-full text-center py-3 rounded-xl font-bold text-sm border ${appStatus === "accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : appStatus === "rejected" ? "bg-red-50 text-red-700 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                  Applied — {appStatus?.charAt(0).toUpperCase()}{appStatus?.slice(1)}
                </div>
              ) : (
                <button onClick={() => setShowModal(true)} className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-violet-200">
                  Apply Now
                </button>
              )
            ) : !user ? (
              <Link to="/register" className="block w-full text-center bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-bold text-lg transition-colors">
                Sign Up to Apply
              </Link>
            ) : null}
          </div>
        </div>

        {/* ===== SIDEBAR ===== */}
        <div className="space-y-5">

          {/* Apply box */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hidden lg:block">
            {user?.role === "developer" ? (
              applied ? (
                <div className={`w-full text-center py-3 rounded-xl font-bold text-sm border ${appStatus === "accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : appStatus === "rejected" ? "bg-red-50 text-red-700 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                  Applied — {appStatus?.charAt(0).toUpperCase()}{appStatus?.slice(1)}
                </div>
              ) : (
                <button onClick={() => setShowModal(true)} className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-violet-200 mb-3">
                  Apply Now
                </button>
              )
            ) : !user ? (
              <>
                <Link to="/register" className="block w-full text-center bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold transition-colors mb-2">
                  Sign Up to Apply
                </Link>
                <Link to="/login" className="block w-full text-center border border-slate-200 text-slate-600 hover:bg-slate-50 py-3 rounded-xl font-semibold transition-colors text-sm">
                  Already have an account? Log in
                </Link>
              </>
            ) : null}
            <p className="text-xs text-slate-400 text-center mt-3">Your profile will be shared with the employer</p>
          </div>

          {/* Company card */}
          {company && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4">About the Company</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center font-bold text-violet-700 text-sm">{initials}</div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{company.companyName}</p>
                  <p className="text-slate-500 text-xs">{company.industry}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between"><span className="text-slate-400">Size</span><span className="font-medium">{company.companySize} employees</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Location</span><span className="font-medium">{company.location}</span></div>
                {company.founded && <div className="flex justify-between"><span className="text-slate-400">Founded</span><span className="font-medium">{company.founded}</span></div>}
              </div>
              {company.description && (
                <p className="text-slate-500 text-xs leading-relaxed mt-4 border-t border-slate-100 pt-4 line-clamp-3">{company.description}</p>
              )}
              {company.benefits && company.benefits.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Benefits</p>
                  <div className="flex flex-wrap gap-1.5">
                    {company.benefits.map((b, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-medium px-2.5 py-1 rounded-full">{b}</span>
                    ))}
                  </div>
                </div>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="mt-4 block text-violet-600 hover:text-violet-700 text-sm font-medium">
                  Visit Website →
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== APPLY MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Apply for this job</h3>
                  <p className="text-slate-500 text-sm mt-1">{job.title} at {companyName}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Letter <span className="font-normal text-slate-400">(optional)</span></label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={6}
                placeholder="Introduce yourself. Why are you a great fit for this role? Share relevant experience with PHP, Laravel, or the required skills..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none"
              />
              <p className="text-xs text-slate-400 mt-2">Your profile (skills, experience, portfolio) will automatically be shared with the employer.</p>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleApply} disabled={submitting} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
