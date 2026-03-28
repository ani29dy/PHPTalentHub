import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PremiumUpgrade = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const benefits = [
    {
      title: "Verified Pro Badge",
      description: "Get a blue checkmark on your profile to build trust with recruiters.",
      icon: "💎",
    },
    {
      title: "Priority in Search",
      description: "Appear at the very top of search results when businesses look for developers.",
      icon: "🚀",
    },
    {
      title: "Direct Inquiries",
      description: "Enable dedicated 'Hire' buttons that send instant email notifications to you.",
      icon: "✉️",
    },
    {
      title: "Advanced Analytics",
      description: "See exactly who is viewing your profile and downloading your CV.",
      icon: "📊",
    },
  ];

  const handlePayment = async (plan: "monthly" | "yearly") => {
    setLoading(plan);
    setError("");

    try {
      // 1. Create order on backend
      const { data } = await axios.post("/api/payments/create-order", { plan });
      const { order, key_id } = data;

      // 2. Configure Razorpay options
      const options = {
        key: key_id,
        amount: order.amount,
        currency: "INR",
        name: "PHP Talent Hub",
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Premium Subscription`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 3. Verify payment on backend
            const verifyRes = await axios.post("/api/payments/verify", {
              ...response,
              plan,
            });
            
            if (verifyRes.data.profile) {
              navigate("/developer-dashboard", { 
                state: { message: "🎉 Congratulations! Your account has been upgraded to Premium." } 
              });
            }
          } catch (err: any) {
            setError(err.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Link to="/developer-dashboard" className="text-violet-600 font-bold text-sm mb-4 inline-block hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Developer Career</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Join the elite circle of top PHP developers and get noticed by the world's best companies.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="text-3xl bg-slate-50 w-14 h-14 rounded-xl flex items-center justify-center border border-slate-100">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium text-center animate-shake">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Monthly Plan */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 relative overflow-hidden group hover:border-violet-200 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 mb-2">Monthly</h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">Perfect for a quick boost</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-slate-900">₹100</span>
                <span className="text-slate-500 font-bold">/30 days</span>
              </div>
              <button
                onClick={() => handlePayment("monthly")}
                disabled={!!loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50"
              >
                {loading === "monthly" ? "Initializing..." : "Get Started"}
              </button>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white rounded-3xl border-2 border-violet-600 p-8 relative overflow-hidden group shadow-xl shadow-violet-100 transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl z-20">
              Best Value
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 mb-2">Yearly Pass</h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">Save big with an annual membership</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-slate-900">₹1000</span>
                <span className="text-slate-500 font-bold">/year</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-4">You save ₹200 every year</p>
              <button
                onClick={() => handlePayment("yearly")}
                disabled={!!loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-violet-200 disabled:opacity-50"
              >
                {loading === "yearly" ? "Initializing..." : "Go Premium Now"}
              </button>
            </div>
          </div>

        </div>

        <p className="text-center text-slate-400 text-xs mt-16 font-medium uppercase tracking-[0.2em]">
          Secure Payment via Razorpay • 256-bit Encryption
        </p>

      </div>
    </div>
  );
};

export default PremiumUpgrade;
