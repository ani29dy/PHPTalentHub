import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FLOATING_TAGS = [
  "Laravel", "Symfony", "WordPress", "MySQL", "CodeIgniter",
  "PHP 8.x", "REST API", "Docker", "WooCommerce", "PHPUnit",
];

const FEATURES = [
  {
    icon: "🛡️",
    title: "Verified Talent Only",
    desc: "Every developer on the platform is manually reviewed and verified by our admin team — no fakes, no noise.",
  },
  {
    icon: "⚡",
    title: "PHP-Specific Filters",
    desc: "Filter by framework (Laravel, Symfony), CMS (WordPress, Magento), stack, and spoken language. Built for PHP, not for everyone.",
  },
  {
    icon: "🎯",
    title: "No Noisy Marketplaces",
    desc: "Unlike Upwork or Fiverr, every applicant is a real PHP specialist. Reduce hiring time from weeks to days.",
  },
  {
    icon: "🏢",
    title: "Agencies & Freelancers",
    desc: "Find individual PHP engineers or vetted agencies who live and breathe PHP ecosystems every day.",
  },
  {
    icon: "🌍",
    title: "Global Reach",
    desc: "Search by location, timezone, or go fully remote. Filter by spoken language to match your team's culture.",
  },
  {
    icon: "🔒",
    title: "Secure Platform",
    desc: "Bank-grade security for profiles, applications, and communications. Your data is never sold or shared.",
  },
];

const FRAMEWORKS = [
  { name: "Laravel", color: "bg-red-100 text-red-700 border-red-200" },
  { name: "Symfony", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { name: "WordPress", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "CodeIgniter", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { name: "Magento", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { name: "Drupal", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { name: "Yii", color: "bg-green-100 text-green-700 border-green-200" },
  { name: "WooCommerce", color: "bg-purple-100 text-purple-700 border-purple-200" },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">

      {/* ===== HERO ===== */}
      <section className="relative bg-slate-900 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            The #1 PHP Talent Marketplace
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            Find Verified{" "}
            <span className="gradient-text">PHP Experts</span>
            <br />in Minutes
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            75% of the web runs on PHP — but finding real experts is hard. PHPTalentHub connects
            businesses with verified Laravel, Symfony &amp; WordPress developers, filtered to your exact needs.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            {!user && (
              <>
                <Link to="/register" className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-violet-900/40 transition-all hover:scale-105">
                  Post a Job — It's Free
                </Link>
                <Link to="/search" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-sm">
                  Browse Developers →
                </Link>
              </>
            )}
            {user?.role === "business" && (
              <Link to="/search" className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
                Find PHP Developers →
              </Link>
            )}
            {user?.role === "developer" && (
              <>
                <Link to="/developer-dashboard" className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
                  My Dashboard
                </Link>
                <Link to="/jobs" className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
                  Browse Jobs →
                </Link>
              </>
            )}
          </div>

          {/* Floating PHP tags */}
          <div className="flex flex-wrap justify-center gap-3">
            {FLOATING_TAGS.map((tag, i) => (
              <span
                key={tag}
                className="bg-white/5 border border-white/10 text-slate-300 text-sm font-medium px-4 py-1.5 rounded-full animate-float"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-violet-600 py-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center text-white">
            <div>
              <div className="text-3xl font-black">500+</div>
              <div className="text-violet-200 text-sm font-medium mt-0.5">Verified Developers</div>
            </div>
            <div>
              <div className="text-3xl font-black">200+</div>
              <div className="text-violet-200 text-sm font-medium mt-0.5">Active Job Listings</div>
            </div>
            <div>
              <div className="text-3xl font-black">150+</div>
              <div className="text-violet-200 text-sm font-medium mt-0.5">Businesses Hiring</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FRAMEWORKS ===== */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">PHP Ecosystems Covered</p>
          <div className="flex flex-wrap justify-center gap-3">
            {FRAMEWORKS.map((fw) => (
              <span key={fw.name} className={`border text-sm font-semibold px-5 py-2 rounded-full ${fw.color}`}>
                {fw.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Why PHPTalentHub?
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Built specifically for the PHP ecosystem — not a generic job board bolted on.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Your Profile", desc: "Developers: list your PHP skills, frameworks, and portfolio. Businesses: describe your company and projects." },
              { step: "02", title: "Get Verified", desc: "Our admin team reviews and verifies profiles to ensure quality. Verified badge builds instant trust." },
              { step: "03", title: "Connect & Hire", desc: "Businesses post jobs or search profiles. Developers apply with a cover letter. Start building together." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-5xl font-black gradient-text mb-4">{s.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to find your PHP expert?</h2>
          <p className="text-slate-400 text-lg mb-8">Join hundreds of businesses and developers already using PHPTalentHub.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <>
                <Link to="/register" className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl">
                  Create Free Account
                </Link>
                <Link to="/jobs" className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
                  Browse Jobs
                </Link>
              </>
            )}
            {user && (
              <Link to={user.role === "developer" ? "/jobs" : "/search"} className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
                {user.role === "developer" ? "Browse Jobs →" : "Find Developers →"}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
