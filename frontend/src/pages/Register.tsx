import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [userType, setUserType] = useState<"developer" | "business">(
    "developer",
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      await axios.post("/api/auth/resend-verification", {
        email: formData.email,
      });
      setResendMessage(
        "Verification email resent! Please check your inbox again.",
      );
    } catch (err: any) {
      setResendMessage(
        err.response?.data?.message ||
          "Failed to resend email. Please try again later.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (userType === "business" && !formData.companyName.trim()) {
      setError("Company name is required");
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        userType,
        userType === "business"
          ? { companyName: formData.companyName.trim() }
          : undefined,
      );
      setIsRegistered(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {isRegistered ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <span className="text-4xl">📧</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Check your email
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              We've sent a secure verification link to <br />
              <strong className="text-slate-900 font-bold">
                {formData.email}
              </strong>
              .<br />
              Please click the link to activate your account.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-left">
              <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-5 h-5 bg-violet-600 rounded-md flex items-center justify-center text-[10px] text-white">
                  ?
                </span>
                Didn't get the email?
              </h4>
              <ul className="text-xs text-slate-500 space-y-2 list-none p-0">
                <li className="flex gap-2">
                  <span>•</span>Check your spam or promotions folder
                </li>
                <li className="flex gap-2">
                  <span>•</span>Verify that your email address is correct
                </li>
                <li className="flex gap-2 font-medium text-slate-700">
                  <span>•</span>
                  <button
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-violet-600 hover:text-violet-700 font-bold transition-colors underline decoration-2 underline-offset-4 disabled:opacity-50"
                  >
                    {resendLoading
                      ? "Resending..."
                      : "Click here to resend the link"}
                  </button>
                </li>
              </ul>
              {resendMessage && (
                <p className="mt-4 text-xs font-bold text-violet-600 bg-violet-50 p-3 rounded-lg border border-violet-100 animate-pulse">
                  {resendMessage}
                </p>
              )}
            </div>

            <Link
              to="/login"
              className="block w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-violet-200 text-center"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* User Type Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-xl shadow-md p-1 flex gap-1 border border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserType("developer")}
                  className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                    userType === "developer"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  👨‍💻 Developer
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("business")}
                  className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                    userType === "business"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  🏢 Business
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
              <div className="text-center mb-8">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    userType === "developer" ? "bg-blue-50" : "bg-violet-50"
                  }`}
                >
                  <span className="text-3xl">
                    {userType === "developer" ? "👨‍💻" : "🏢"}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900">
                  {userType === "developer"
                    ? "Create Developer Account"
                    : "Create Business Account"}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {userType === "developer"
                    ? "Find your dream PHP job"
                    : "Hire top PHP talent for your company"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-bold text-slate-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 outline-none transition-all"
                    placeholder="Your professional name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-slate-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 outline-none transition-all"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Company Name — business only */}
                {userType === "business" && (
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-bold text-slate-700 mb-2"
                    >
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 outline-none transition-all"
                      placeholder="Your company's legal name"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      You can fill in industry, location &amp; other details
                      later in your profile settings.
                    </p>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-slate-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-4 focus:ring-violet-600/10 outline-none transition-all ${
                      formData.password &&
                      (formData.password.length < 8 ||
                        !/\d/.test(formData.password) ||
                        !/[!@#$%^&*()]/.test(formData.password))
                        ? "border-orange-300 focus:border-orange-400"
                        : "border-slate-200 focus:border-violet-600"
                    }`}
                    placeholder="Min 8 chars + number + symbol"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="flex gap-2 mt-2">
                    <div
                      className={`h-1 flex-1 rounded-full ${formData.password.length >= 8 ? "bg-green-500" : "bg-slate-200"}`}
                    />
                    <div
                      className={`h-1 flex-1 rounded-full ${/\d/.test(formData.password) ? "bg-green-500" : "bg-slate-200"}`}
                    />
                    <div
                      className={`h-1 flex-1 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "bg-green-500" : "bg-slate-200"}`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-bold tracking-widest">
                    Requires Number &amp; Special Character
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-bold text-slate-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-4 focus:ring-violet-600/10 outline-none transition-all ${
                      formData.confirmPassword &&
                      formData.confirmPassword !== formData.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-violet-600"
                    }`}
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-violet-700 shadow-lg shadow-violet-200 focus:outline-none focus:ring-4 focus:ring-violet-600/20 disabled:opacity-50 transition-all mt-2"
                >
                  {loading
                    ? "Creating Account..."
                    : userType === "developer"
                      ? "Create Developer Account"
                      : "Create Business Account"}
                </button>
              </form>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-violet-600 hover:text-violet-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
