import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (user?.role === "developer") return "/developer-dashboard";
    if (user?.role === "business") return "/business-dashboard";
    if (user?.role === "admin") return "/admin-dashboard";
    return "/";
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Find Developers" },
    ...(user?.role !== "business" ? [{ to: "/jobs", label: "Browse Jobs" }] : []),
    ...(user ? [{ to: getDashboardPath(), label: user.role === "admin" ? "Admin Panel" : "Dashboard" }] : []),
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg php-badge-glow group-hover:bg-violet-500 transition-colors">
              <span className="text-white font-black text-xs tracking-tight">&lt;/&gt;</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none">PHPTalentHub</span>
              <div className="text-violet-400 text-[10px] font-medium leading-none mt-0.5 hidden sm:block">Verified PHP Experts</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-slate-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <Link to={user.role === "business" ? "/business/profile/edit" : "/developer/profile/edit"} className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-violet-500 rounded-full pl-1 pr-3 py-1 transition-all cursor-pointer group">
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm group-hover:bg-violet-500 transition-colors">
                    {user.name?.charAt(0)}
                  </div>
                  <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{user.name}</span>
                  <span className="text-xs text-violet-400 font-semibold capitalize bg-violet-500/10 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white px-4 py-2 text-sm font-semibold transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg">
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 py-4 space-y-1 animate-fade-in-up">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-lg text-sm font-medium transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-800 mt-3 pt-3">
              {user ? (
                <div className="space-y-2 px-1">
                  <div className="flex justify-between items-center px-3 mb-1">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Alerts</span>
                    <NotificationBell />
                  </div>
                  <Link to={user.role === "business" ? "/business/profile/edit" : "/developer/profile/edit"} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 border-t border-slate-800 hover:bg-slate-800 transition-colors -mx-2 rounded-lg cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold uppercase">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{user.name}</p>
                      <p className="text-violet-400 text-xs capitalize">Edit Profile ({user.role})</p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-400 hover:text-white hover:bg-red-500 px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-1">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-center text-slate-300 border border-slate-700 hover:bg-slate-800 px-4 py-3 rounded-lg text-sm font-semibold transition-all">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="text-center bg-violet-600 hover:bg-violet-500 text-white px-4 py-3 rounded-lg text-sm font-semibold transition-all">
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
