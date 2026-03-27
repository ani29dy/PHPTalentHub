import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import SkillTagSelector from "../components/SkillTagSelector";

const JOB_TYPES = ["full-time", "part-time", "contract", "freelance", "remote"];

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [formData, setFormData] = useState({ title: "", description: "", skills: [] as string[], location: "", salary: "", jobType: "full-time" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`/api/jobs/${id}`);
        setFormData({
          title: res.data.title || "",
          description: res.data.description || "",
          skills: res.data.skills || [],
          location: res.data.location || "",
          salary: res.data.salary || "",
          jobType: res.data.jobType || "full-time"
        });
      } catch (err: any) {
        setError("Error fetching job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.skills.length === 0) { setError("Please add at least one required skill."); return; }
    setError(""); setSaving(true);
    try {
      await axios.put(`/api/jobs/${id}`, formData, authConfig);
      navigate("/business-dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating job");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="skeleton h-12 w-1/3 mb-8" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Edit Job Listing</h1>
        <p className="text-slate-500 mt-1">Update your job requirements and details.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Job Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior PHP Developer" className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all" required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Job Type *</label>
              <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all">
                {JOB_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace("-", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Remote" className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Job Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={7} placeholder="Describe the role..." className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all resize-none" required />
          </div>
          <SkillTagSelector selectedSkills={formData.skills} onChange={skills => setFormData(f => ({ ...f, skills }))} label="Required PHP Skills *" />
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Salary / Rate <span className="font-normal text-slate-400">(optional)</span></label>
            <input type="text" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. $60k–80k" className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 shadow-lg shadow-violet-200">
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => navigate("/business-dashboard")} className="px-6 py-3.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;
