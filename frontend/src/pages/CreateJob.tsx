import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SkillTagSelector from "../components/SkillTagSelector";

const JOB_TYPES = ["full-time", "part-time", "contract", "freelance", "remote"];

const CreateJob = () => {
  const [formData, setFormData] = useState({ title: "", description: "", skills: [] as string[], location: "", salary: "", jobType: "full-time" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.skills.length === 0) { setError("Please add at least one required skill."); return; }
    setError(""); setLoading(true);
    try {
      await axios.post("/api/jobs", formData);
      navigate("/business-dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error creating job");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Post a PHP Job</h1>
        <p className="text-slate-500 mt-1">Reach hundreds of verified PHP developers instantly</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior PHP Developer – Laravel" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Job Type *</label>
              <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white">
                {JOB_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace("-", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bangalore, India or Remote" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={7} placeholder="Describe the role, responsibilities, tech stack..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none" required />
          </div>
          <SkillTagSelector selectedSkills={formData.skills} onChange={skills => setFormData(f => ({ ...f, skills }))} label="Required PHP Skills *" />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Salary / Rate <span className="font-normal text-slate-400">(optional)</span></label>
            <input type="text" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. ₹8–12 LPA, $60k–80k, $50/hr" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
              {loading ? "Posting..." : "Post Job"}
            </button>
            <button type="button" onClick={() => navigate("/business-dashboard")} className="px-6 py-3.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
