import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "developer" | "business" | "admin";
}

interface ProfileRequest {
  _id: string;
  type: "developer" | "business";
  user: { name: string; email: string };
  profile: {
    skills?: string[];
    experience?: string;
    portfolio?: string;
    bio?: string;
    location?: string;
    companyName?: string;
    companySize?: string;
    industry?: string;
    description?: string;
    benefits?: string[];
    culture?: string;
    website?: string;
    foundedYear?: string;
    socialLinks?: { linkedin?: string; twitter?: string; github?: string; };
  };
}

interface DetailedProfile {
  type: "developer" | "business";
  user: { name: string; email: string };
  profile: ProfileRequest["profile"] & {
    _id: string;
    verified: boolean;
    verificationRequested: boolean;
    createdAt: string;
  };
}

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<ProfileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"requests" | "users">("requests");
  const [selectedProfile, setSelectedProfile] = useState<DetailedProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const loadData = async () => {
    setLoading(true); setError("");
    try {
      const [uRes, rRes] = await Promise.all([
        axios.get("/api/admin/users", authConfig),
        axios.get("/api/admin/verification-requests", authConfig),
      ]);
      setUsers(Array.isArray(uRes.data) ? uRes.data : []);
      setRequests(Array.isArray(rRes.data) ? rRes.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load admin data");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === "admin") loadData(); }, [user]);

  const approveRequest = async (profileId: string) => {
    try {
      await axios.put(`/api/admin/approve-verification/${profileId}`, {}, authConfig);
      setRequests((prev) => prev.filter((item) => item._id !== profileId));
      loadData();
    } catch (err: any) { setError(err?.response?.data?.message || "Could not approve"); }
  };

  const rejectRequest = async (profileId: string) => {
    try {
      await axios.put(`/api/admin/reject-verification/${profileId}`, {}, authConfig);
      setRequests((prev) => prev.filter((item) => item._id !== profileId));
      loadData();
    } catch (err: any) { setError(err?.response?.data?.message || "Could not reject"); }
  };

  const viewProfileDetails = async (profileId: string) => {
    setProfileLoading(true);
    try {
      const response = await axios.get(`/api/admin/profile/${profileId}`, authConfig);
      setSelectedProfile(response.data);
      setShowProfileModal(true);
    } catch (err: any) { setError("Could not load profile details"); }
    finally { setProfileLoading(false); }
  };

  const closeProfileModal = () => { setShowProfileModal(false); setSelectedProfile(null); };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="skeleton h-8 w-1/4 mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">{[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const isDev = (req: any) => req.type === "developer";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Admin Area</h1>
          <p className="text-slate-500 mt-1">Platform overview & verifications</p>
        </div>
        <button onClick={loadData} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2">
          <span>↻</span> Refresh Data
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium text-sm">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover">
          <p className="text-3xl font-black text-slate-900">{users.filter((u) => u.role === "developer").length}</p>
          <p className="text-slate-500 text-sm mt-1 font-semibold">Total Developers</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover">
          <p className="text-3xl font-black text-slate-900">{users.filter((u) => u.role === "business").length}</p>
          <p className="text-slate-500 text-sm mt-1 font-semibold">Total Businesses</p>
        </div>
        <div className={`rounded-2xl border shadow-sm p-5 card-hover ${requests.length > 0 ? "bg-violet-600 border-violet-700 text-white" : "bg-white border-slate-100 text-slate-900"}`}>
          <p className="text-3xl font-black">{requests.length}</p>
          <p className={`text-sm mt-1 font-semibold ${requests.length > 0 ? "text-violet-200" : "text-slate-500"}`}>Pending Verifications</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab("requests")} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "requests" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Verification Requests {requests.length > 0 && <span className="ml-2 bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">{requests.length}</span>}
        </button>
        <button onClick={() => setActiveTab("users")} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "users" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          All Users
        </button>
      </div>

      {/* Verification Requests */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
              <p className="text-slate-500 mt-1">No pending verification requests.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col lg:flex-row gap-4 justify-between card-hover">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-slate-900 text-lg">{req.type === "developer" ? req.user?.name : req.profile.companyName || req.user?.name}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${isDev(req) ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                      {req.type}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-3">{req.user?.email}</p>
                  
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                    {isDev(req) ? (
                      <div className="space-y-1">
                        <p><span className="text-slate-400 font-semibold w-16 inline-block">Skills:</span> <span className="font-medium text-slate-700">{req.profile.skills?.join(", ") || "None"}</span></p>
                        <p><span className="text-slate-400 font-semibold w-16 inline-block">Loc:</span> <span className="font-medium text-slate-700">{req.profile.location}</span></p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p><span className="text-slate-400 font-semibold w-20 inline-block">Industry:</span> <span className="font-medium text-slate-700">{req.profile.industry}</span></p>
                        <p><span className="text-slate-400 font-semibold w-20 inline-block">Size:</span> <span className="font-medium text-slate-700">{req.profile.companySize}</span></p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col gap-2 justify-center lg:min-w-[140px]">
                  <button onClick={() => viewProfileDetails(req._id)} disabled={profileLoading} className="flex-1 lg:flex-none border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                    View Details
                  </button>
                  <button onClick={() => approveRequest(req._id)} className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                    Approve
                  </button>
                  <button onClick={() => rejectRequest(req._id)} className="flex-1 lg:flex-none bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700">Name</th>
                <th className="px-6 py-4 font-bold text-slate-700">Email</th>
                <th className="px-6 py-4 font-bold text-slate-700">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-4 text-slate-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${u.role === "admin" ? "bg-violet-100 text-violet-700" : u.role === "developer" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Profile Details Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
              <div>
                <h2 className="text-xl font-black text-slate-900">Applicant Details</h2>
                <p className="text-sm text-slate-500">{selectedProfile.user.name}</p>
              </div>
              <button onClick={closeProfileModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors text-lg font-bold">&times;</button>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3 text-center">Full Payload</p>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap overflow-x-auto font-mono">
                  {JSON.stringify(selectedProfile.profile, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end">
              <button onClick={closeProfileModal} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
