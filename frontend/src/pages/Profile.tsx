import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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
  _id: string;
  userId: { _id: string; name: string; email: string };
  skills: string[];
  languages: string[];
  experience: string;
  location: string;
  portfolio?: string;
  linkedin?: string;
  verified: boolean;
  bio?: string;
  workExperience?: WorkExperience[];
  education?: Education[];
  projects?: Project[];
  certifications?: Certification[];
  hobbies?: string[];
  resumeUrl?: string;
  resumeName?: string;
  profileImage?: string;
  specializations?: string[];
  updatedAt?: string;
}

const AVATAR_COLORS = ["bg-violet-600", "bg-blue-600", "bg-indigo-600", "bg-purple-600", "bg-sky-600"];

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hireModal, setHireModal] = useState(false);
  const [hirePosition, setHirePosition] = useState("");
  const [hireSending, setHireSending] = useState(false);
  const [hireSuccess, setHireSuccess] = useState("");
  const [hireError, setHireError] = useState("");

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      const res = await axios.get(`/api/profiles/${userId}`, { headers });
      setProfile(res.data);
    } catch {
      setError("Profile not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="skeleton h-48 rounded-2xl mb-6" />
        <div className="skeleton h-32 rounded-2xl mb-4" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h1>
        <p className="text-slate-500">{error || "This developer profile doesn't exist or isn't public yet."}</p>
      </div>
    );
  }

  const name = profile.userId?.name || "Developer";
  const email = profile.userId?.email || "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const avatarColor = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const handleHireClick = () => {
    if (!token || user?.role !== "business") {
      alert("Please log in as a Business to send a hire inquiry.");
      return;
    }
    setHireModal(true);
    setHireError("");
    setHirePosition("");
  };

  const handleConfirmHire = async () => {
    if (!hirePosition.trim()) {
      setHireError("Please enter the position you are hiring for.");
      return;
    }
    setHireSending(true);
    setHireError("");
    try {
      const res = await axios.post(
        `/api/profiles/${userId}/hire-notify`,
        { position: hirePosition.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setHireModal(false);
      setHireSuccess(res.data.message || `Hire inquiry sent to ${name} successfully!`);
      setTimeout(() => setHireSuccess(""), 6000);
    } catch (err: any) {
      setHireError(err.response?.data?.message || "Failed to send inquiry. Please try again.");
    } finally {
      setHireSending(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Hire Inquiry Modal */}
      {hireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 animate-fade-in-up">
            <h3 className="text-xl font-black text-slate-900 mb-1">Send Hire Inquiry</h3>
            <p className="text-slate-500 text-sm mb-6">
              An email will be sent to <strong>{name}</strong> with your company details and the position you're hiring for.
            </p>
            <label className="block text-sm font-bold text-slate-700 mb-2">Position / Role</label>
            <input
              type="text"
              autoFocus
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 outline-none mb-3"
              placeholder="e.g. Senior PHP Developer, Backend Engineer"
              value={hirePosition}
              onChange={(e) => setHirePosition(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmHire()}
            />
            {hireError && (
              <p className="text-red-600 text-xs font-semibold mb-3">{hireError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setHireModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHire}
                disabled={hireSending}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-sm transition-colors disabled:opacity-60"
              >
                {hireSending ? "Sending..." : "✉ Send Inquiry"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">

        {/* Success Banner */}
        {hireSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl flex items-start gap-3 shadow-sm animate-fade-in-up">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-sm">{hireSuccess}</p>
              <p className="text-xs text-emerald-600 mt-0.5">The developer will receive an email with your company details and position info.</p>
            </div>
          </div>
        )}

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-violet-600 to-indigo-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className={`w-20 h-20 rounded-2xl ${profile.profileImage ? '' : avatarColor} overflow-hidden flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-lg shadow-black/10`}>
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {profile.verified && (
                <span className="mb-1 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold px-3 py-1.5 rounded-full">
                  ✓ Verified Developer
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900">{name}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
              <span>📍 {profile.location}</span>
              <span>• {profile.experience} experience</span>
            </div>
            {profile.bio && (
              <p className="text-slate-600 leading-relaxed mt-4">{profile.bio}</p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-5">
              {profile.resumeUrl && (
                <button 
                  onClick={() => {
                    if (!user) {
                      alert("Please login to download the resume.");
                      return;
                    }
                    if (user.role === 'business' || user.id === profile.userId._id) {
                      const token = localStorage.getItem('token');
                      window.open(`/api/profiles/resume/download/${profile.userId._id}?token=${token}`, "_blank");
                    } else {
                      alert("Resume downloads are reserved for Businesses and Profile Owners.");
                    }
                  }} 
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-100"
                >
                  📄 Download CV
                </button>
              )}
              <button onClick={handleHireClick} className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-200">
                ✉ Send Hire Inquiry
              </button>
              {profile.portfolio && (
                <button 
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    window.open(`/api/profiles/portfolio/visit/${profile.userId._id}?token=${token}`, "_blank");
                  }}
                  className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  🔗 View Portfolio
                </button>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-[#0077b5] px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Specialized Software Expertise */}
        {profile.specializations && profile.specializations.length > 0 && (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl">🏆</div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">PHP Product Expertise</h2>
                <p className="text-xs text-slate-500 font-medium italic">Advanced specialization in niche PHP ecosystems</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 relative z-10">
              {profile.specializations.map((spec, i) => (
                <span key={i} className="bg-orange-500 text-white text-xs font-black uppercase px-4 py-2 rounded-xl shadow-lg shadow-orange-100/50">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-violet-600">⚡</span> Skills & Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <span key={i} className="bg-violet-50 border border-violet-200 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                {skill}
              </span>
            ))}
            {profile.skills.length === 0 && <p className="text-slate-400 text-sm">No skills listed yet.</p>}
          </div>
        </div>

        {/* Work Experience */}
        {profile.workExperience && profile.workExperience.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-violet-600">💼</span> Work Experience
            </h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-100 before:h-full pb-2">
              {profile.workExperience.map((exp, i) => (
                <div key={i} className="relative pl-12">
                  <div className="absolute left-3 top-1.5 w-4 h-4 rounded-full bg-violet-600 border-4 border-white shadow-sm z-10" />
                  <div>
                    <h3 className="font-bold text-slate-900">{exp.jobTitle}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 text-sm font-semibold text-slate-600 mt-0.5">
                      <span>{exp.company}</span>
                      <span className="text-slate-300">•</span>
                      <span>{exp.location}</span>
                    </div>
                    <div className="text-xs font-bold text-violet-500 uppercase tracking-wider mt-1">
                      {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} — {exp.isCurrent ? <span className="text-emerald-500">Present</span> : (exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A")}
                    </div>
                    {exp.description && (
                      <p className="text-slate-500 text-sm mt-3 leading-relaxed whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-violet-600">🎓</span> Education
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {profile.education.map((edu, i) => (
                <div key={i} className="flex gap-4 p-4 border border-slate-50 rounded-2xl hover:border-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-xl flex-shrink-0">🎓</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{edu.degree}</h3>
                    <p className="text-sm text-slate-500 font-medium">{edu.institution}</p>
                    <p className="text-xs text-slate-400 mt-1 font-bold italic">{edu.fieldOfStudy} • Class of {edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {profile.projects && profile.projects.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-violet-600">🚀</span> Featured Projects
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {profile.projects.map((proj, i) => (
                <div key={i} className="p-5 border border-slate-100 rounded-2xl hover:border-violet-200 transition-all group bg-slate-50/50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-extrabold text-slate-900 group-hover:text-violet-600 transition-colors">{proj.title}</h3>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-700 text-xs font-black uppercase tracking-widest">Link ↗</a>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.techStack?.map((s, si) => (
                      <span key={si} className="text-[10px] font-black uppercase tracking-tighter bg-white px-2 py-0.5 rounded border border-slate-100 text-slate-400">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications & Hobbies Row */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Certifications */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="text-violet-600">📜</span> Certifications
            </h2>
            <div className="space-y-4">
              {profile.certifications && profile.certifications.length > 0 ? (
                profile.certifications.map((cert, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 text-violet-500">★</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight">{cert.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{cert.issuer} • {cert.year}</p>
                      {cert.link && <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-violet-400 hover:underline font-bold mt-1 block">Verify Credential</a>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic">No certifications listed.</p>
              )}
            </div>
          </div>

          {/* Hobbies & Languages */}
          <div className="space-y-5">
            {/* Languages */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Speaking</h2>
              <div className="flex flex-wrap gap-2">
                {profile.languages?.map((lang, i) => (
                  <span key={i} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            {/* Hobbies */}
            {profile.hobbies && profile.hobbies.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies.map((hob, i) => (
                    <span key={i} className="bg-pink-50 text-pink-600 text-xs font-bold px-3 py-1 rounded-lg">
                      {hob}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-violet-600">✉</span> Contact {name}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Direct Email</p>
              <p className="text-slate-800 font-medium truncate">{email}</p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Searchable Location</p>
              <p className="text-slate-800 font-medium">{profile.location}</p>
            </div>
          </div>
          <button onClick={handleHireClick} className="mt-4 w-full block text-center bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-violet-200 active:scale-[0.98]">
            ✉ Send Hire Inquiry to {name}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
