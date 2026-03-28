import { useState } from "react";
import { Link } from "react-router-dom";
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
  socialLinks: {
    linkedin: string;
    twitter: string;
    github: string;
  };
}

const Register = () => {
  const [userType, setUserType] = useState<"developer" | "business">(
    "developer",
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [businessData, setBusinessData] = useState<BusinessProfileData>({
    companyName: "",
    companySize: "",
    industry: "",
    location: "",
    website: "",
    description: "",
    benefits: [],
    culture: "",
    foundedYear: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      github: "",
    },
  });
  const [benefitInput, setBenefitInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const { register } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBusinessChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const socialPlatform = name.split(".")[1];
      setBusinessData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialPlatform]: value,
        },
      }));
    } else {
      setBusinessData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addBenefit = () => {
    if (
      benefitInput.trim() &&
      !businessData.benefits.includes(benefitInput.trim())
    ) {
      setBusinessData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, benefitInput.trim()],
      }));
      setBenefitInput("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setBusinessData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b) => b !== benefit),
    }));
  };

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      await axios.post("/api/auth/resend-verification", { email: formData.email });
      setResendMessage("Verification email resent! Please check your inbox again.");
    } catch (err: any) {
      setResendMessage(err.response?.data?.message || "Failed to resend email. Please try again later.");
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

    // Validate business data if registering as business
    if (userType === "business") {
      if (
        !businessData.companyName ||
        !businessData.industry ||
        !businessData.location ||
        !businessData.description
      ) {
        setError("Please fill in all required business information");
        return;
      }
    }

    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        userType,
        userType === "business" ? businessData : undefined,
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
      <div className="max-w-4xl w-full">
        {isRegistered ? (
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-10 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
               <span className="text-4xl">📧</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Check your email</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              We've sent a secure verification link to <br/>
              <strong className="text-slate-900 font-bold">{formData.email}</strong>.<br/>
              Please click the link to activate your account.
            </p>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-left">
              <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-5 h-5 bg-violet-600 rounded-md flex items-center justify-center text-[10px] text-white">?</span>
                Didn't get the email?
              </h4>
              <ul className="text-xs text-slate-500 space-y-2 list-none p-0">
                <li className="flex gap-2"><span>•</span> Check your spam or promotions folder</li>
                <li className="flex gap-2"><span>•</span> Verify that your email address is correct</li>
                <li className="flex gap-2 font-medium text-slate-700">
                  <span>•</span> 
                  <button 
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-violet-600 hover:text-violet-700 font-bold transition-colors underline decoration-2 underline-offset-4 disabled:opacity-50"
                  >
                    {resendLoading ? "Resending..." : "Click here to resend the link"}
                  </button>
                </li>
              </ul>
              {resendMessage && (
                <p className="mt-4 text-xs font-bold text-violet-600 bg-violet-50 p-3 rounded-lg border border-violet-100 animate-pulse">
                  {resendMessage}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Link 
                to="/login" 
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-violet-200"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* User Type Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 flex">
            <button
              type="button"
              onClick={() => setUserType("developer")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                userType === "developer"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              I'm a Developer
            </button>
            <button
              type="button"
              onClick={() => setUserType("business")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                userType === "business"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              I'm a Recruiter
            </button>
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          {/* Developer Card */}
          {userType === "developer" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Developer
                </h3>
                <p className="text-gray-600 mt-2">
                  Find your dream PHP job and connect with amazing companies
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                    {error}
                  </div>
                )}

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
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-4 focus:ring-violet-600/10 outline-none transition-all ${
                      formData.name && (/\d/.test(formData.name) || formData.name.length < 2) 
                        ? "border-red-300 focus:border-red-500" 
                        : "border-slate-200 focus:border-violet-600"
                    }`}
                    placeholder="Enter your professional name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-black tracking-widest">Only letters allowed • Min 2 chars</p>
                </div>

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
                      formData.password && (formData.password.length < 8 || !/\d/.test(formData.password) || !/[!@#$%^&*()]/.test(formData.password))
                        ? "border-orange-200 focus:border-orange-500"
                        : "border-slate-200 focus:border-violet-600"
                    }`}
                    placeholder="Min 8 chars + number + symbol"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="flex gap-2 mt-2">
                    <div className={`h-1 flex-1 rounded-full ${formData.password.length >= 8 ? "bg-green-500" : "bg-slate-200"}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${/\d/.test(formData.password) ? "bg-green-500" : "bg-slate-200"}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "bg-green-500" : "bg-slate-200"}`}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-black tracking-widest">Requires Number & Special Character</p>
                </div>

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
                      formData.confirmPassword && formData.confirmPassword !== formData.password
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
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Developer Account"}
                </button>
              </form>
            </div>
          )}

          {/* Business Card */}
          {userType === "business" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Business
                </h3>
                <p className="text-gray-600 mt-2">
                  Find talented PHP developers for your company
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">
                    Account Information
                  </h4>

                  <div>
                    <label
                      htmlFor="business-name"
                      className="block text-sm font-bold text-slate-700 mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      id="business-name"
                      name="name"
                      type="text"
                      required
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-4 focus:ring-violet-600/10 outline-none transition-all ${
                        formData.name && (/\d/.test(formData.name) || formData.name.length < 2) 
                          ? "border-red-300 focus:border-red-500" 
                          : "border-slate-200 focus:border-violet-600"
                      }`}
                      placeholder="Enter your professional name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-black tracking-widest">Only letters allowed • Min 2 chars</p>
                  </div>

                  <div>
                    <label
                      htmlFor="business-email"
                      className="block text-sm font-bold text-slate-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="business-email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 outline-none transition-all"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="business-password"
                      className="block text-sm font-bold text-slate-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      id="business-password"
                      name="password"
                      type="password"
                      required
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-4 focus:ring-violet-600/10 outline-none transition-all ${
                        formData.password && (formData.password.length < 8 || !/\d/.test(formData.password) || !/[!@#$%^&*()]/.test(formData.password))
                          ? "border-orange-200 focus:border-orange-500"
                          : "border-slate-200 focus:border-violet-600"
                      }`}
                      placeholder="Min 8 chars + number + symbol"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <div className="flex gap-2 mt-2">
                        <div className={`h-1 flex-1 rounded-full ${formData.password.length >= 8 ? "bg-green-500" : "bg-slate-200"}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${/\d/.test(formData.password) ? "bg-green-500" : "bg-slate-200"}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "bg-green-500" : "bg-slate-200"}`}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-black tracking-widest">Requires Number & Special Character</p>
                  </div>

                  <div>
                    <label
                      htmlFor="business-confirmPassword"
                      className="block text-sm font-bold text-slate-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="business-confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-4 focus:ring-violet-600/10 outline-none transition-all ${
                        formData.confirmPassword && formData.confirmPassword !== formData.password
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-violet-600"
                      }`}
                      placeholder="Repeat your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Business Information Section */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">
                    Business Information
                  </h4>

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
                      className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 outline-none transition-all`}
                      placeholder="Legal company name"
                      value={businessData.companyName}
                      onChange={handleBusinessChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Company Size</label>
                      <select
                        name="companySize"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                        value={businessData.companySize}
                        onChange={handleBusinessChange}
                      >
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-1000">201-1000</option>
                        <option value="1000+">1000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                      <input
                        name="industry"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                        placeholder="e.g. Technology"
                        value={businessData.industry}
                        onChange={handleBusinessChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                    <input
                      name="location"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                      placeholder="City, Country"
                      value={businessData.location}
                      onChange={handleBusinessChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Website (Optional)</label>
                    <input
                      name="website"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                      placeholder="https://company.com"
                      value={businessData.website}
                      onChange={handleBusinessChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Company Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all"
                      placeholder="Tell us about your company..."
                      value={businessData.description}
                      onChange={(e) => handleBusinessChange(e as any)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Benefits & Perks</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={benefitInput}
                        onChange={(e) => setBenefitInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                        placeholder="e.g. Health insurance, Remote"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {businessData.benefits.map((benefit, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100"
                        >
                          {benefit}
                          <button
                            type="button"
                            onClick={() => removeBenefit(benefit)}
                            className="ml-2 hover:text-violet-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Company Culture</label>
                    <textarea
                      name="culture"
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all"
                      placeholder="Describe your work environment..."
                      value={businessData.culture}
                      onChange={(e) => handleBusinessChange(e as any)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 text-white py-4 px-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-violet-700 shadow-lg shadow-violet-200 focus:outline-none focus:ring-4 focus:ring-violet-600/20 disabled:opacity-50 transition-all"
                >
                  {loading ? "Creating Account..." : "Create Business Account"}
                </button>
              </form>
            </div>
          )}
        </div>

          </>
        )}

        {!isRegistered && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
