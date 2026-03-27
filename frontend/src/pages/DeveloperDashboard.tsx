import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import SkillTagSelector from "../components/SkillTagSelector";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Profile {
  _id?: string;
  skills: string[];
  languages: string[];
  experience: string;
  location: string;
  portfolio?: string;
  verified: boolean;
  verificationRequested: boolean;
  subscriptionType?: "free" | "monthly" | "yearly";
  subscriptionExpiresAt?: string;
  bio?: string;
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
  message?: string;
}

const DeveloperDashboard = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "success" });
  const [activeTab, setActiveTab] = useState<"profile" | "applications">("profile");
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#applications") {
      setActiveTab("applications");
    }
  }, [location.hash]);

  const [languagesInput, setLanguagesInput] = useState("");
  const [formData, setFormData] = useState({
    skills: [] as string[],
    languages: [] as string[],
    experience: "0-1 years",
    location: "",
    portfolio: "",
    bio: "",
  });

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => { if (activeTab === "applications") fetchApplications(); }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/profiles/me/profile");
      setProfile(res.data);
      setFormData({
        skills: res.data.skills || [],
        languages: res.data.languages || [],
        experience: res.data.experience || "0-1 years",
        location: res.data.location || "",
        portfolio: res.data.portfolio || "",
        bio: res.data.bio || "",
      });
      setLanguagesInput((res.data.languages || []).join(", "));
    } catch {}
    finally { setLoading(false); }
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await axios.get("/api/jobs/my/applications");
      setApplications(res.data);
    } catch (e) { console.error(e); }
    finally { setAppsLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const langs = languagesInput.split(",").map(s => s.trim()).filter(Boolean);
    try {
      const res = await axios.post("/api/profiles", { ...formData, languages: langs });
      setProfile(res.data);
      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Error updating profile", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    }
  };


  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "D";
  const appStatusColor = (s: string) =>
    s === "accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    s === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
    "bg-yellow-50 text-yellow-700 border-yellow-200";

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    try {
      const { data } = await axios.post("/api/payments/create-order", { plan }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Developer Test Bypass: If the backend hasn't been configured with real Razorpay keys, skip 
      // the actual Razorpay JS Modal (which crashes on fake keys) and simulate instant purchase.
      if (data.key_id === "rzp_test_dummy") {
        const verifyRes = await axios.post("/api/payments/verify", {
          razorpay_order_id: data.order.id,
          razorpay_payment_id: "mock_payment_123",
          razorpay_signature: "mock_signature_123",
          plan
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        setProfile(verifyRes.data.profile);
        setMessage({ text: "TEST MODE: Welcome to Premium! You are now Verified.", type: "success" });
        return;
      }

      const options = {
        key: data.key_id,
        amount: plan === "yearly" ? 1000 : 100, // 10 INR or 1 INR in paise
        currency: "INR",
        name: "PHP Talent Hub",
        description: `Premium Profile Verification — ${plan.toUpperCase()}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post("/api/payments/verify", {
              ...response,
              plan
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setProfile(verifyRes.data.profile);
            setMessage({ text: "Welcome to Premium! You are now Verified.", type: "success" });
          } catch (err: any) {
            setMessage({ text: "Payment verification failed.", type: "error" });
          }
        },
        theme: { color: "#7c3aed" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setMessage({ text: "Failed to initiate payment engine.", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="skeleton h-8 w-1/3 mb-8" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
          {getInitials(user?.name || "")}
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Developer Dashboard</p>
        </div>
        {profile?.verified && (
          <span className="ml-auto flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold px-3 py-1.5 rounded-full">
            ✓ Verified Developer
          </span>
        )}
      </div>

      {/* Toast */}
      {message.text && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium border ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Premium Verification status */}
      {profile && (
        <div className={`mb-6 p-1 rounded-2xl ${profile.verified ? 'bg-gradient-to-r from-emerald-400 to-teal-400 p-[2px]' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 p-[2px]'}`}>
          <div className="bg-white rounded-[14px] p-5">
            {!profile.verified ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <span className="text-xl">✨</span> Upgrade to Premium Developer
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md">
                    Stand out to recruiters! Get the <strong>Verified Badge</strong>, rank higher in search results, and get hired faster on PHP Talent Hub.
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button onClick={() => handleSubscribe('monthly')} className="flex flex-col items-center bg-violet-50 hover:bg-violet-100 border border-violet-200 px-5 py-3 rounded-xl transition-colors cursor-pointer text-left">
                    <span className="text-violet-900 font-black text-lg">₹ 1</span>
                    <span className="text-violet-600 text-xs font-semibold uppercase tracking-wider">Per Month</span>
                  </button>
                  <button onClick={() => handleSubscribe('yearly')} className="flex flex-col items-center bg-violet-600 hover:bg-violet-700 border border-violet-600 shadow-lg shadow-violet-200 px-5 py-3 rounded-xl transition-colors cursor-pointer text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">Save 16%</div>
                    <span className="text-white font-black text-lg mt-1">₹ 10</span>
                    <span className="text-violet-200 text-xs font-semibold uppercase tracking-wider">Per Year</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-emerald-700 text-lg flex items-center gap-2">
                    ✓ Verified Premium Developer
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Your profile is ranking at the top of recruiter searches. 
                    Expires: <strong className="text-slate-900">{new Date(profile.subscriptionExpiresAt || Date.now()).toLocaleDateString()}</strong>
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl border-4 border-emerald-50">
                  🏆
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {(["profile", "applications"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab === "applications" ? `My Applications ${applications.length > 0 ? `(${applications.length})` : ""}` : "My Profile"}
          </button>
        ))}
      </div>

      {/* ===== PROFILE TAB ===== */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">{profile ? "Edit Profile" : "Create Your Profile"}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Skills */}
            <SkillTagSelector
              selectedSkills={formData.skills}
              onChange={skills => setFormData(f => ({ ...f, skills }))}
              label="PHP Skills & Technologies *"
            />

            {/* Languages */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Spoken Languages (comma-separated)</label>
              <input
                type="text"
                value={languagesInput}
                onChange={e => setLanguagesInput(e.target.value)}
                placeholder="e.g. English, Hindi, French"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            {/* Grid: Experience + Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Level *</label>
                <select
                  value={formData.experience}
                  onChange={e => setFormData(f => ({ ...f, experience: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white"
                  required
                >
                  <option value="0-1 years">0–1 years</option>
                  <option value="1-3 years">1–3 years</option>
                  <option value="3-5 years">3–5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                  placeholder="City, Country or Remote"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            {/* Portfolio */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Portfolio / GitHub URL</label>
              <input
                type="url"
                value={formData.portfolio}
                onChange={e => setFormData(f => ({ ...f, portfolio: e.target.value }))}
                placeholder="https://github.com/yourname"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                rows={4}
                placeholder="Tell businesses about yourself, your PHP experience and what you love building..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
            </button>
          </form>
        </div>
      )}

      {/* ===== APPLICATIONS TAB ===== */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {appsLoading ? (
            [1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-500 mb-6">Browse jobs and start applying to see your applications here.</p>
              <a href="/jobs" className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors text-sm">
                Browse Jobs
              </a>
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
                        {job?.salary  && <span>💰 {job.salary}</span>}
                        {job?.jobType && <span className="capitalize">• {job.jobType.replace("-"," ")}</span>}
                        <span>• Applied {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
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
    </div>
  );
};

export default DeveloperDashboard;
