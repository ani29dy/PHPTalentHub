import React, { useState, useEffect } from "react";
import axios from "axios";

interface BusinessProfile {
  _id?: string;
  companyName: string;
  companySize: string;
  industry: string;
  location: string;
  website: string;
  description: string;
  benefits: string[];
  culture: string;
  logo?: string;
  foundedYear: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  verified: boolean;
  verificationRequested: boolean;
}

const BusinessProfileForm: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile>({
    companyName: "",
    companySize: "",
    industry: "",
    location: "",
    website: "",
    description: "",
    benefits: [],
    culture: "",
    foundedYear: "",
    socialLinks: {},
    verified: false,
    verificationRequested: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/profiles/business/me/profile");
      setProfile(response.data);
    } catch (error) {
      console.log("No existing profile found");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");

      if (profile._id) {
        // Update existing profile
        await axios.put("/api/profiles/business", profile);
        setMessage("Profile updated successfully!");
      } else {
        // Create new profile
        await axios.post("/api/profiles/business", profile);
        setMessage("Profile created successfully!");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof BusinessProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const addBenefit = () => {
    if (
      benefitInput.trim() &&
      !profile.benefits.includes(benefitInput.trim())
    ) {
      setProfile((prev) => ({
        ...prev,
        benefits: [...prev.benefits, benefitInput.trim()],
      }));
      setBenefitInput("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setProfile((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b) => b !== benefit),
    }));
  };

  const requestVerification = async () => {
    try {
      setSaving(true);
      await axios.post("/api/profiles/business/request-verification");
      setProfile((prev) => ({ ...prev, verificationRequested: true }));
      setMessage("Verification request submitted!");
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Error requesting verification",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">
          {profile._id ? "Edit Business Profile" : "Create Business Profile"}
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={profile.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size *
              </label>
              <select
                required
                value={profile.companySize}
                onChange={(e) =>
                  handleInputChange("companySize", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-1000">201-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <input
                type="text"
                required
                value={profile.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
                placeholder="e.g., Technology, Finance, Healthcare"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={profile.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, State/Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://www.company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Founded Year
              </label>
              <input
                type="number"
                value={profile.foundedYear}
                onChange={(e) =>
                  handleInputChange("foundedYear", e.target.value)
                }
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Description *
            </label>
            <textarea
              required
              value={profile.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              placeholder="Tell developers about your company, mission, and what makes you unique..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefits & Perks
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addBenefit())
                }
                placeholder="e.g., Health insurance, Remote work, Flexible hours"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {benefit}
                  <button
                    type="button"
                    onClick={() => removeBenefit(benefit)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Culture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Culture
            </label>
            <textarea
              value={profile.culture}
              onChange={(e) => handleInputChange("culture", e.target.value)}
              rows={3}
              placeholder="Describe your company culture, values, and work environment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Links
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="url"
                value={profile.socialLinks.linkedin || ""}
                onChange={(e) =>
                  handleSocialLinkChange("linkedin", e.target.value)
                }
                placeholder="LinkedIn URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                value={profile.socialLinks.twitter || ""}
                onChange={(e) =>
                  handleSocialLinkChange("twitter", e.target.value)
                }
                placeholder="Twitter URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                value={profile.socialLinks.github || ""}
                onChange={(e) =>
                  handleSocialLinkChange("github", e.target.value)
                }
                placeholder="GitHub URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Verification Status */}
          {profile._id && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Verification Status</h3>
                  <p className="text-sm text-gray-600">
                    {profile.verified
                      ? "Your profile is verified ✓"
                      : profile.verificationRequested
                        ? "Verification request pending..."
                        : "Get verified to build trust with developers"}
                  </p>
                </div>
                {!profile.verified && !profile.verificationRequested && (
                  <button
                    type="button"
                    onClick={requestVerification}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {saving ? "Requesting..." : "Request Verification"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : profile._id
                  ? "Update Profile"
                  : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessProfileForm;
