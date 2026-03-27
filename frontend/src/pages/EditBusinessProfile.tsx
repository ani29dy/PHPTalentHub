import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface BusinessProfileData {
  companyName: string;
  companySize: string;
  industry: string;
  location: string;
  website: string;
  description: string;
  benefits: string[];
  culture: string;
  foundedYear: string;
  socialLinks: { linkedin: string; twitter: string; github: string; };
}

const EditBusinessProfile = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  const [businessData, setBusinessData] = useState<BusinessProfileData>({
    companyName: "", companySize: "", industry: "", location: "", website: "",
    description: "", benefits: [], culture: "", foundedYear: "",
    socialLinks: { linkedin: "", twitter: "", github: "" },
  });

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/profiles/business/me/profile", authConfig);
        if (res.data) {
          setBusinessData({
            companyName: res.data.companyName || "",
            companySize: res.data.companySize || "",
            industry: res.data.industry || "",
            location: res.data.location || "",
            website: res.data.website || "",
            description: res.data.description || "",
            benefits: res.data.benefits || [],
            culture: res.data.culture || "",
            foundedYear: res.data.foundedYear || "",
            socialLinks: {
              linkedin: res.data.socialLinks?.linkedin || "",
              twitter: res.data.socialLinks?.twitter || "",
              github: res.data.socialLinks?.github || "",
            }
          });
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError("Failed to load profile details.");
        }
        // If 404, the default empty state is fine (profile doesn't exist yet)
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const socialPlatform = name.split(".")[1];
      setBusinessData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [socialPlatform]: value } }));
    } else {
      setBusinessData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addBenefit = () => {
    if (benefitInput.trim() && !businessData.benefits.includes(benefitInput.trim())) {
      setBusinessData(prev => ({ ...prev, benefits: [...prev.benefits, benefitInput.trim()] }));
      setBenefitInput("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setBusinessData(prev => ({ ...prev, benefits: prev.benefits.filter(b => b !== benefit) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessData.companyName || !businessData.industry || !businessData.location || !businessData.description) {
      setError("Please fill in all required company information"); return;
    }

    setError(""); setSaving(true);
    try {
      await axios.post("/api/profiles/business", businessData, authConfig);
      navigate("/business-dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating business profile");
    } finally {
      setSaving(false);
    }
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Edit Company Profile</h1>
        <p className="text-slate-500 mt-1 font-medium">Update your business details so developers know who they're working with.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-start gap-2"><span className="shrink-0 mt-0.5">⚠</span>{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Company Name *</label>
              <input name="companyName" type="text" required value={businessData.companyName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Company Size *</label>
              <select name="companySize" required value={businessData.companySize} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all">
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-1000">201-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Industry *</label>
              <input name="industry" type="text" required value={businessData.industry} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Location *</label>
              <input name="location" type="text" required value={businessData.location} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Company Description *</label>
            <textarea name="description" required rows={4} value={businessData.description} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all resize-none" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Website <span className="text-slate-400 font-normal">(optional)</span></label>
            <input name="website" type="url" value={businessData.website} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Benefits & Perks <span className="text-slate-400 font-normal">(optional)</span></label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }}
                placeholder="e.g. Remote work, Health insurance"
                className="flex-1 px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all"
              />
              <button type="button" onClick={addBenefit} className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-sm transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {businessData.benefits.map((benefit, i) => (
                <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  {benefit}
                  <button type="button" onClick={() => removeBenefit(benefit)} className="text-emerald-500 hover:text-emerald-700 text-lg leading-none">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 shadow-lg shadow-emerald-200">
              {saving ? "Saving Profile..." : "Save Profile Details"}
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

export default EditBusinessProfile;
