import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

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
  profileImage?: string;
  specializations: string[];
  updatedAt: string;
}

const EXP_LEVELS = ["0-1 years", "1-3 years", "3-5 years", "5+ years"];

const SearchDevelopers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skills: "", location: "", experience: "", languages: "", specializations: "" });

  useEffect(() => {
    fetchProfiles();
  }, [filters]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.skills)     params.append("skills",     filters.skills);
      if (filters.location)   params.append("location",   filters.location);
      if (filters.experience) params.append("experience", filters.experience);
      if (filters.languages)  params.append("languages",  filters.languages);
      if (filters.specializations) params.append("specializations", filters.specializations);
      
      const token = localStorage.getItem("token");
      const headers = token ? { "x-auth-token": token } : {};
      
      const res = await axios.get(`/api/profiles?${params}`, { headers });
      setProfiles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => setFilters({ skills: "", location: "", experience: "", languages: "", specializations: "" });
  const hasFilters = Object.values(filters).some(Boolean);

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const AVATAR_COLORS = [
    "bg-violet-600", "bg-blue-600", "bg-indigo-600",
    "bg-purple-600", "bg-sky-600", "bg-cyan-600",
  ];
  const getColor = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleProtectedAction = (e: React.MouseEvent, actionCallback: () => void) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    actionCallback();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Find PHP Developers</h1>
        <p className="text-slate-500 mt-1">Browse verified PHP talent — filter by framework, location or language</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ===== SIDEBAR ===== */}
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
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">PHP Skill</label>
                <input
                  type="text"
                  placeholder="e.g. Laravel, MySQL"
                  value={filters.skills}
                  onChange={e => setFilters(f => ({ ...f, skills: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Remote, India"
                  value={filters.location}
                  onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Specialized Software</label>
                <select
                  value={filters.specializations}
                  onChange={e => setFilters(f => ({ ...f, specializations: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-orange-400"
                >
                  <option value="">All Products</option>
                  <optgroup label="CRMs">
                    <option value="SuiteCRM">SuiteCRM</option>
                    <option value="Vtiger">Vtiger</option>
                    <option value="Dolibarr">Dolibarr</option>
                  </optgroup>
                  <optgroup label="E-commerce">
                    <option value="Magento">Magento</option>
                    <option value="WooCommerce">WooCommerce</option>
                    <option value="PrestaShop">PrestaShop</option>
                  </optgroup>
                  <optgroup label="CMS">
                    <option value="WordPress">WordPress</option>
                    <option value="Drupal">Drupal</option>
                  </optgroup>
                  <optgroup label="Frameworks">
                    <option value="Laravel">Laravel</option>
                    <option value="Symfony">Symfony</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Language</label>
                <input
                  type="text"
                  placeholder="e.g. English, Hindi"
                  value={filters.languages}
                  onChange={e => setFilters(f => ({ ...f, languages: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Experience</label>
                <div className="space-y-1.5">
                  {EXP_LEVELS.map(level => (
                    <label key={level} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="exp"
                        value={level}
                        checked={filters.experience === level}
                        onChange={() => setFilters(f => ({ ...f, experience: f.experience === level ? "" : level }))}
                        className="w-4 h-4 text-violet-600"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== RESULTS ===== */}
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-4">
            {loading ? "Searching..." : `${profiles.length} verified developer${profiles.length !== 1 ? "s" : ""} found`}
          </p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="flex gap-4">
                    <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-1/2" />
                      <div className="skeleton h-3 w-1/3" />
                      <div className="skeleton h-3 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <div className="text-5xl mb-4">👨‍💻</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No developers found</h3>
              <p className="text-slate-500 mb-4">Try adjusting your filters</p>
              <button onClick={clearFilters} className="bg-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-violet-700 transition-colors text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((profile) => {
                const name = profile.userId?.name || "Developer";
                const initials = getInitials(name);
                const avatarColor = getColor(name);

                return (
                  <div key={profile._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 card-hover flex flex-col">

                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full ${profile.profileImage ? '' : avatarColor} flex items-center justify-center overflow-hidden text-white font-black text-sm flex-shrink-0 shadow-sm border border-slate-100`}>
                        {profile.profileImage ? (
                          <img src={profile.profileImage} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 truncate">{name}</h3>
                          {profile.verified && (
                            <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                          <span>📍 {profile.location}</span>
                          <span>• {profile.experience}</span>
                          <span className="text-emerald-600 font-bold">• Active {timeAgo(profile.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {profile.specializations?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {profile.specializations.map((spec, i) => (
                          <span key={i} className="bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {profile.bio && (
                      <p className="text-slate-500 text-sm line-clamp-2 mb-3 leading-relaxed">{profile.bio}</p>
                    )}

                    {/* Skills */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.slice(0, 4).map((skill, i) => (
                          <span key={i} className="bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {profile.skills.length > 4 && (
                          <span className="text-xs text-slate-400 px-1 py-1">+{profile.skills.length - 4}</span>
                        )}
                      </div>
                    </div>

                    {/* Languages */}
                    {profile.languages?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {profile.languages.map((lang, i) => (
                          <span key={i} className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={(e) => handleProtectedAction(e, () => navigate(`/profile/${profile.userId?._id}`))}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-center py-2 rounded-xl text-sm font-semibold transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={(e) => handleProtectedAction(e, async () => {
                          // Track hire inquiry
                          try {
                            const config = { headers: { "x-auth-token": localStorage.getItem("token") } };
                            await axios.post(`/api/profiles/${profile.userId?._id}/hire-notify`, {}, config);
                          } catch (err) { console.error(err); }
                          
                          window.location.href = `mailto:${profile.userId?.email}?subject=PHP Developer Opportunity — PHPTalentHub&body=Hi ${name},%0D%0A%0D%0AI found your profile on PHPTalentHub and would like to discuss a PHP opportunity with you.%0D%0A%0D%0ABest regards`;
                        })}
                        className="flex-1 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-center py-2 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Hire
                      </button>
                      {profile.portfolio && (
                        <button
                          onClick={(e) => handleProtectedAction(e, () => {
                            const token = localStorage.getItem('token');
                            window.open(`/api/profiles/portfolio/visit/${profile.userId?._id}?token=${token}`, "_blank");
                          })}
                          className="border border-slate-200 hover:bg-slate-100 text-[#6366f1] px-3 py-2 rounded-xl text-sm transition-colors"
                          title="View Portfolio"
                        >
                          🔗
                        </button>
                      )}
                      {profile.linkedin && (
                        <button
                          onClick={(e) => handleProtectedAction(e, () => window.open(profile.linkedin, "_blank"))}
                          className="border border-slate-200 hover:bg-slate-100 text-[#0077b5] px-3 py-2 rounded-xl text-sm transition-colors"
                          title="LinkedIn Profile"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </button>
                      )}
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

export default SearchDevelopers;
