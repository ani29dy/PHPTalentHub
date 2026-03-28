import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import SkillTagSelector from "../components/SkillTagSelector";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface WorkExperience {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  fieldOfStudy: string;
}

interface Project {
  title: string;
  description: string;
  link: string;
  techStack: string[];
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
  link: string;
}

interface Profile {
  _id?: string;
  skills: string[];
  languages: string[];
  experience: string;
  location: string;
  portfolio?: string;
  linkedin?: string;
  verified: boolean;
  verificationRequested: boolean;
  subscriptionType?: "free" | "monthly" | "yearly";
  subscriptionExpiresAt?: string;
  bio?: string;
  workExperience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  hobbies: string[];
  resumeUrl?: string;
  resumeName?: string;
  profileImage?: string;
  specializations: string[];
  updatedAt?: string;
  userId?: { _id: string; name: string; email: string };
}

const EditDeveloperProfile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "success" });

  const [languagesInput, setLanguagesInput] = useState("");
  const [hobbiesInput, setHobbiesInput] = useState("");
  const [formData, setFormData] = useState({
    skills: [] as string[],
    languages: [] as string[],
    experience: "0-1 years",
    location: "",
    portfolio: "",
    linkedin: "",
    bio: "",
    workExperience: [] as WorkExperience[],
    education: [] as Education[],
    projects: [] as Project[],
    certifications: [] as Certification[],
    hobbies: [] as string[],
    resumeUrl: "",
    resumeName: "",
    specializations: [] as string[],
  });

  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/profiles/me/profile");
      setProfile(res.data);
        setFormData({
          skills: res.data.skills || [],
          languages: res.data.languages || [],
          specializations: res.data.specializations || [],
          experience: res.data.experience || "0-1 years",
          location: res.data.location || "",
          portfolio: res.data.portfolio || "",
          linkedin: res.data.linkedin || "",
          bio: res.data.bio || "",
          workExperience: res.data.workExperience || [],
          education: res.data.education || [],
          projects: res.data.projects || [],
          certifications: res.data.certifications || [],
          hobbies: res.data.hobbies || [],
          resumeUrl: res.data.resumeUrl || "",
          resumeName: res.data.resumeName || "",
        });
      setLanguagesInput((res.data.languages || []).join(", "));
      setHobbiesInput((res.data.hobbies || []).join(", "));
    } catch {}
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const langs = languagesInput.split(",").map(s => s.trim()).filter(Boolean);
    const hobs = hobbiesInput.split(",").map(s => s.trim()).filter(Boolean);
    try {
      const res = await axios.post("/api/profiles", { 
        ...formData, 
        languages: langs,
        hobbies: hobs
      });
      setProfile(res.data);
      setMessage({ text: "Profile updated successfully!", type: "success" });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Error updating profile", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    }
  };

  const addExperience = () => {
    const newExp: WorkExperience = { jobTitle: "", company: "", location: "", startDate: "", isCurrent: false, description: "" };
    setFormData(f => ({ ...f, workExperience: [...f.workExperience, newExp] }));
  };

  const removeExperience = (index: number) => {
    setFormData(f => ({ ...f, workExperience: f.workExperience.filter((_, i) => i !== index) }));
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const newWork = [...formData.workExperience];
    newWork[index] = { ...newWork[index], [field]: value };
    setFormData(f => ({ ...f, workExperience: newWork }));
  };

  const addEducation = () => {
    const newEdu: Education = { degree: "", institution: "", year: "", fieldOfStudy: "" };
    setFormData(f => ({ ...f, education: [...f.education, newEdu] }));
  };

  const removeEducation = (index: number) => {
    setFormData(f => ({ ...f, education: f.education.filter((_, i) => i !== index) }));
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const newEdu = [...formData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData(f => ({ ...f, education: newEdu }));
  };

  const addProject = () => {
    const newProj: Project = { title: "", description: "", link: "", techStack: [] };
    setFormData(f => ({ ...f, projects: [...f.projects, newProj] }));
  };

  const removeProject = (index: number) => {
    setFormData(f => ({ ...f, projects: f.projects.filter((_, i) => i !== index) }));
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const newProjs = [...formData.projects];
    newProjs[index] = { ...newProjs[index], [field]: value };
    setFormData(f => ({ ...f, projects: newProjs }));
  };

  const addCertification = () => {
    const newCert: Certification = { name: "", issuer: "", year: "", link: "" };
    setFormData(f => ({ ...f, certifications: [...f.certifications, newCert] }));
  };

  const removeCertification = (index: number) => {
    setFormData(f => ({ ...f, certifications: f.certifications.filter((_, i) => i !== index) }));
  };

  const updateCertification = (index: number, field: keyof Certification, value: any) => {
    const newCerts = [...formData.certifications];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setFormData(f => ({ ...f, certifications: newCerts }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("resume", file);

    setUploadingResume(true);
    try {
      const res = await axios.post("/api/profiles/resume/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData(f => ({ 
        ...f, 
        resumeUrl: res.data.resumeUrl,
        resumeName: res.data.resumeName 
      }));
      setMessage({ text: "Resume uploaded successfully!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Upload failed", type: "error" });
    } finally {
      setUploadingResume(false);
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", file);

    setSaving(true);
    try {
      const res = await axios.post("/api/profiles/avatar/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfile(p => p ? { ...p, profileImage: res.data.profileImage } : p);
      setMessage({ text: "Profile picture updated!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Upload failed", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    }
  };

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    try {
      const { data } = await axios.post("/api/payments/create-order", { plan }, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
        amount: plan === "yearly" ? 1000 : 100,
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
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sticky Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Profile Sections</h3>
              {[
                { id: "basic", label: "Basic Details", icon: "👤" },
                { id: "resume", label: "Resume Hub", icon: "📎" },
                { id: "about", label: "About Me", icon: "📝" },
                { id: "skills", label: "Skills", icon: "⚡" },
                { id: "experience", label: "Experience", icon: "💼" },
                { id: "education", label: "Education", icon: "🎓" },
                { id: "projects", label: "Projects", icon: "🚀" },
                { id: "certifications", label: "Certifications", icon: "📜" },
                { id: "hobbies", label: "Hobbies", icon: "🎨" },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-all flex items-center gap-3"
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className={`w-24 h-24 rounded-2xl ${profile?.profileImage ? '' : 'bg-slate-100'} overflow-hidden border-4 border-white shadow-xl relative flex items-center justify-center`}>
                    {profile?.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-3xl text-slate-300 font-black tracking-tighter">
                        {profile?.userId?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "DP"}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">Update</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  {saving && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center text-violet-600 font-bold text-[10px]">Uploading...</div>}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Edit Professional Profile</h1>
                  <p className="text-sm text-slate-500 font-medium">{profile?.userId?.name}</p>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-200 disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save All Changes"}
              </button>
            </div>

            {message.text && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium border animate-fade-in ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                {message.text}
              </div>
            )}

            {/* Premium Banner */}
            {profile && !profile.verified && (
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full transform group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-1 flex items-center gap-2">✨ Get Verified. Get Hired.</h3>
                  <p className="text-violet-100 text-sm max-w-md mb-4 opacity-90">Verified developers rank 5x higher in search results and receive more direct hire inquiries.</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleSubscribe('monthly')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-white/20">Monthly Plan (₹ 1)</button>
                    <button onClick={() => handleSubscribe('yearly')} className="bg-white text-violet-600 px-4 py-2 rounded-lg text-xs font-black transition-all hover:bg-violet-50">Yearly Plan (₹ 10)</button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Details */}
              <div id="basic" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">👤</div>
                  <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                      placeholder="e.g. Mumbai, India or Remote"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Experience Level *</label>
                    <select
                      value={formData.experience}
                      onChange={e => setFormData(f => ({ ...f, experience: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20"
                      required
                    >
                      <option value="0-1 years">0–1 years (Fresher)</option>
                      <option value="1-3 years">1–3 years (Junior)</option>
                      <option value="3-5 years">3–5 years (Senior)</option>
                      <option value="5+ years">5+ years (Expert)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio / GitHub Link</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400">🔗</span>
                        <input
                          type="url"
                          value={formData.portfolio}
                          onChange={e => setFormData(f => ({ ...f, portfolio: e.target.value }))}
                          placeholder="https://github.com/..."
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">LinkedIn Profile Link</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400">🔗</span>
                        <input
                          type="url"
                          value={formData.linkedin}
                          onChange={e => setFormData(f => ({ ...f, linkedin: e.target.value }))}
                          placeholder="https://linkedin.com/..."
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Hub */}
              <div id="resume" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-24 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50/50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-xl">📎</div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Resume Hub</h2>
                      <p className="text-xs text-slate-500 font-medium italic">Naukri style - Keep your CV updated to rank higher!</p>
                    </div>
                  </div>
                  {profile?.updatedAt && (
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Last Active</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        {new Date(profile.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative z-10">
                  {formData.resumeUrl ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4 flex items-center justify-between group/file transition-all hover:border-violet-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-2xl border border-slate-100">📄</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] md:max-w-xs">{formData.resumeName || "My_Resume.pdf"}</p>
                          <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-violet-600 hover:text-violet-700 mt-0.5 inline-block">View Current Resume ↗</a>
                        </div>
                      </div>
                      <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm">
                        {uploadingResume ? "Uploading..." : "Update CV"}
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploadingResume} />
                      </label>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-violet-300 transition-all bg-slate-50/50">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm border border-slate-100">📤</div>
                      <h3 className="text-base font-black text-slate-900 mb-1">No Resume Uploaded</h3>
                      <p className="text-xs text-slate-500 mb-6 max-w-[200px] mx-auto">Upload your CV to attract 5x more recruiter inquiries.</p>
                      <label className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-xl shadow-violet-200 cursor-pointer inline-block">
                        {uploadingResume ? "Uploading..." : "Upload Resume"}
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploadingResume} />
                      </label>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1.5 justify-center">
                    <span className="w-1 h-1 bg-slate-400 rounded-full" /> Supported: PDF, DOCX (Max 10MB)
                  </p>
                </div>
              </div>

              {/* About Me / Summary */}
              <div id="about" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">📝</div>
                  <h2 className="text-lg font-bold text-slate-900">Professional Summary</h2>
                </div>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                  rows={5}
                  placeholder="Describe your expertise, what you've built, and what you're looking for in your next role..."
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 leading-relaxed resize-none"
                />
              </div>

              {/* Skills & Hub */}
              <div id="skills" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-xl">⚡</div>
                  <h2 className="text-lg font-bold text-slate-900">Skills & Hub</h2>
                </div>
                <div className="space-y-6">
                  <SkillTagSelector
                    selectedSkills={formData.skills}
                    onChange={skills => setFormData(f => ({ ...f, skills }))}
                    label="Core PHP Skills & Technologies *"
                  />
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Spoken Languages</label>
                    <input
                      type="text"
                      value={languagesInput}
                      onChange={e => setLanguagesInput(e.target.value)}
                      placeholder="e.g. English, Hindi, Spanish (Comma separated)"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Specialized Software Expertise */}
              <div id="specialization" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-24 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl">🏆</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Specialized PHP Software/CRM</h2>
                    <p className="text-xs text-slate-500 font-medium italic">Expertise in niche PHP ecosystems (CRMs, CMS, E-commerce)</p>
                  </div>
                </div>

                <div className="space-y-6 mt-6 relative z-10">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Major PHP Products</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "SuiteCRM", "Vtiger", "Magento", "WooCommerce", "WordPress", 
                        "Drupal", "Joomla", "Dolibarr", "OctoberCMS", "Laravel", "Symfony"
                      ].map(spec => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => {
                            const newSpecs = formData.specializations.includes(spec)
                              ? formData.specializations.filter(s => s !== spec)
                              : [...formData.specializations, spec];
                            setFormData({ ...formData, specializations: newSpecs });
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                            formData.specializations.includes(spec)
                              ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
                              : 'bg-white border-slate-100 text-slate-500 hover:border-orange-200'
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Other Specializations</label>
                    <p className="text-[10px] text-slate-400 mb-3 italic">Add any other PHP-related software (e.g. SugarCRM, PrestaShop)</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type and press Enter..."
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-100 focus:border-orange-400 outline-none transition-all text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.currentTarget as HTMLInputElement).value.trim();
                            if (val && !formData.specializations.includes(val)) {
                              setFormData({ ...formData, specializations: [...formData.specializations, val] });
                              (e.currentTarget as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.specializations.filter(s => ![
                        "SuiteCRM", "Vtiger", "Magento", "WooCommerce", "WordPress", 
                        "Drupal", "Joomla", "Dolibarr", "OctoberCMS", "Laravel", "Symfony"
                      ].includes(s)).map(spec => (
                        <span key={spec} className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1.5 rounded-xl text-xs font-black">
                          {spec}
                          <button type="button" onClick={() => setFormData({ ...formData, specializations: formData.specializations.filter(s => s !== spec) })} className="hover:text-red-500 text-orange-400">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div id="experience" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-24">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">💼</div>
                    <h2 className="text-lg font-bold text-slate-900">Work Experience</h2>
                  </div>
                  <button type="button" onClick={addExperience} className="text-violet-600 hover:text-violet-700 text-sm font-bold">+ Add Experience</button>
                </div>
                <div className="space-y-6">
                  {formData.workExperience.map((exp, idx) => (
                    <div key={idx} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 relative group transition-all">
                      <button type="button" onClick={() => removeExperience(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">🗑️</button>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Job Title</label>
                          <input type="text" value={exp.jobTitle} onChange={e => updateExperience(idx, 'jobTitle', e.target.value)} placeholder="e.g. Senior PHP Developer" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500 bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Company</label>
                          <input type="text" value={exp.company} onChange={e => updateExperience(idx, 'company', e.target.value)} placeholder="e.g. Acme Corp" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location</label>
                          <input type="text" value={exp.location} onChange={e => updateExperience(idx, 'location', e.target.value)} placeholder="e.g. Remote" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Start Date</label>
                          <input type="date" value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ""} onChange={e => updateExperience(idx, 'startDate', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" />
                        </div>
                        {!exp.isCurrent && (
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">End Date</label>
                            <input type="date" value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ""} onChange={e => updateExperience(idx, 'endDate', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" />
                          </div>
                        )}
                        <div className="md:col-span-2 flex items-center gap-2 py-1">
                          <input type="checkbox" id={`current-${idx}`} checked={exp.isCurrent} onChange={e => updateExperience(idx, 'isCurrent', e.target.checked)} className="rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                          <label htmlFor={`current-${idx}`} className="text-sm font-medium text-slate-600">I am currently working here</label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                          <textarea rows={3} value={exp.description} onChange={e => updateExperience(idx, 'description', e.target.value)} placeholder="What were your key responsibilities and achievements?" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white resize-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.workExperience.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
                      <p className="text-slate-400 text-sm">No work experience added yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              <div id="education" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-24">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-xl">🎓</div>
                    <h2 className="text-lg font-bold text-slate-900">Education</h2>
                  </div>
                  <button type="button" onClick={addEducation} className="text-violet-600 hover:text-violet-700 text-sm font-bold">+ Add Education</button>
                </div>
                <div className="space-y-4">
                  {formData.education.map((edu, idx) => (
                    <div key={idx} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 relative group">
                      <button type="button" onClick={() => removeEducation(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Degree / Qualification</label>
                          <input type="text" value={edu.degree} onChange={e => updateEducation(idx, 'degree', e.target.value)} placeholder="e.g. B.Tech Computer Science" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Institution</label>
                          <input type="text" value={edu.institution} onChange={e => updateEducation(idx, 'institution', e.target.value)} placeholder="e.g. IIT Bombay" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Field of Study</label>
                          <input type="text" value={edu.fieldOfStudy} onChange={e => updateEducation(idx, 'fieldOfStudy', e.target.value)} placeholder="e.g. Engineering" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Passing Year</label>
                          <input type="text" value={edu.year} onChange={e => updateEducation(idx, 'year', e.target.value)} placeholder="e.g. 2021" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div id="projects" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-24">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl">🚀</div>
                    <h2 className="text-lg font-bold text-slate-900">Key Projects</h2>
                  </div>
                  <button type="button" onClick={addProject} className="text-violet-600 hover:text-violet-700 text-sm font-bold">+ Add Project</button>
                </div>
                <div className="space-y-4">
                  {formData.projects.map((proj, idx) => (
                    <div key={idx} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 relative group">
                      <button type="button" onClick={() => removeProject(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Project Title</label>
                            <input type="text" value={proj.title} onChange={e => updateProject(idx, 'title', e.target.value)} placeholder="e.g. E-Commerce API" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Project Link (Live/GitHub)</label>
                            <input type="url" value={proj.link} onChange={e => updateProject(idx, 'link', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Project Description</label>
                          <textarea rows={2} value={proj.description} onChange={e => updateProject(idx, 'description', e.target.value)} placeholder="Briefly describe what this project does and your role in it..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white resize-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tech Stack (comma separated)</label>
                          <input 
                            type="text" 
                            value={proj.techStack?.join(", ") || ""} 
                            onChange={e => updateProject(idx, 'techStack', e.target.value.split(",").map(s => s.trim()))} 
                            placeholder="e.g. PHP, Laravel, MySQL" 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div id="certifications" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-24">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl">📜</div>
                    <h2 className="text-lg font-bold text-slate-900">Certifications</h2>
                  </div>
                  <button type="button" onClick={addCertification} className="text-violet-600 hover:text-violet-700 text-sm font-bold">+ Add Certification</button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {formData.certifications.map((cert, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 relative group">
                      <button type="button" onClick={() => removeCertification(idx)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
                      <input type="text" value={cert.name} onChange={e => updateCertification(idx, 'name', e.target.value)} placeholder="Certification Name" className="w-full px-2 py-1 mb-2 border-b border-transparent focus:border-violet-500 bg-transparent text-sm font-bold outline-none" />
                      <input type="text" value={cert.issuer} onChange={e => updateCertification(idx, 'issuer', e.target.value)} placeholder="Issuer (e.g. AWS, Zend)" className="w-full px-2 py-1 mb-1 bg-transparent text-xs text-slate-500 outline-none" />
                      <div className="flex gap-2">
                        <input type="text" value={cert.year} onChange={e => updateCertification(idx, 'year', e.target.value)} placeholder="Year" className="w-20 px-2 py-1 bg-transparent text-xs text-slate-400 outline-none" />
                        <input type="url" value={cert.link} onChange={e => updateCertification(idx, 'link', e.target.value)} placeholder="Certificate URL" className="flex-1 px-2 py-1 bg-transparent text-xs text-violet-500 outline-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Hobbies */}
              <div id="hobbies" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-xl">🎨</div>
                  <h2 className="text-lg font-bold text-slate-900">Hobbies & Interests</h2>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">My Interests (Comma separated)</label>
                  <input
                    type="text"
                    value={hobbiesInput}
                    onChange={e => setHobbiesInput(e.target.value)}
                    placeholder="e.g. Chess, Open Source, Photography, Hiking"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                  <p className="mt-2 text-xs text-slate-400 italic">Showing your personality helps recruiters feel more connected to your profile.</p>
                </div>
              </div>

              {/* Final Save */}
              <div className="pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-violet-200 transform active:scale-[0.99] disabled:opacity-50"
                >
                  {saving ? "Saving All Changes..." : "Complete & Save Profile"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDeveloperProfile;
