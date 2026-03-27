import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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

const AVATAR_COLORS = ["bg-violet-600", "bg-blue-600", "bg-indigo-600", "bg-purple-600", "bg-sky-600"];

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/profiles/${userId}`);
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

  const hireMailto = `mailto:${email}?subject=PHP Developer Opportunity — PHPTalentHub&body=Hi ${name},%0D%0A%0D%0AI found your profile on PHPTalentHub and would love to discuss a PHP opportunity with you.%0D%0A%0D%0ABest regards`;

  const handleHireClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (token && user?.role === "business") {
      try {
        await axios.post(`/api/profiles/${userId}/hire-notify`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to notify dev automatically", err);
      }
    }
    window.location.href = hireMailto;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-5">

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-violet-600 to-indigo-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className={`w-20 h-20 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-lg`}>
                {initials}
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
              <button onClick={handleHireClick} className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-200">
                ✉ Hire via Email
              </button>
              {profile.portfolio && (
                <a href={profile.portfolio} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                  🔗 View Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Skills & Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <span key={i} className="bg-violet-50 border border-violet-200 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                {skill}
              </span>
            ))}
            {profile.skills.length === 0 && <p className="text-slate-400 text-sm">No skills listed yet.</p>}
          </div>
        </div>

        {/* Languages */}
        {profile.languages?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Spoken Languages</h2>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((lang, i) => (
                <span key={i} className="bg-slate-100 text-slate-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Contact</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-slate-800 font-medium">{email}</p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Location</p>
              <p className="text-slate-800 font-medium">{profile.location}</p>
            </div>
          </div>
          <button onClick={handleHireClick} className="mt-4 w-full block text-center bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold text-sm transition-colors">
            ✉ Send Hire Request
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
