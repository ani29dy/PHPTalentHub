import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Profile {
  _id: string;
  userId: { _id: string; name: string; email: string };
  skills: string[];
  languages: string[];
  experience: string;
  location: string;
  portfolio?: string;
  verified: boolean;
  bio?: string;
}

const EXP_LEVELS = ["0-1 years", "1-3 years", "3-5 years", "5+ years"];

const SearchDevelopers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skills: "", location: "", experience: "", languages: "" });

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
      const res = await axios.get(`/api/profiles?${params}`);
      setProfiles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => setFilters({ skills: "", location: "", experience: "", languages: "" });
  const hasFilters = Object.values(filters).some(Boolean);

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const AVATAR_COLORS = [
    "bg-violet-600", "bg-blue-600", "bg-indigo-600",
    "bg-purple-600", "bg-sky-600", "bg-cyan-600",
  ];
  const getColor = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

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
                      <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                        {initials}
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
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
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
                      <Link
                        to={`/profile/${profile.userId?._id}`}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-center py-2 rounded-xl text-sm font-semibold transition-colors"
                      >
                        View Profile
                      </Link>
                      <a
                        href={`mailto:${profile.userId?.email}?subject=PHP Developer Opportunity — PHPTalentHub&body=Hi ${name},%0D%0A%0D%0AI found your profile on PHPTalentHub and would like to discuss a PHP opportunity with you.%0D%0A%0D%0ABest regards`}
                        className="flex-1 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-center py-2 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Hire
                      </a>
                      {profile.portfolio && (
                        <a
                          href={profile.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-slate-200 hover:bg-slate-50 text-slate-500 px-3 py-2 rounded-xl text-sm transition-colors"
                          title="View Portfolio"
                        >
                          🔗
                        </a>
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
