import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token found in the URL.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/auth/verify/${token}`);
        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
        } else {
          setStatus("error");
          setMessage(response.data.message || "Verification failed.");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage(
          err.response?.data?.message || 
          "The verification link is invalid, expired, or the server is unreachable."
        );
      }
    };

    const timer = setTimeout(() => {
        verifyToken();
    }, 1500); // Add a small delay for a better UX (the "verifying" state feels real)

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-10 text-center animate-fade-in-up">
        
        {status === "verifying" && (
          <div className="space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-violet-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Verifying Account</h2>
            <p className="text-slate-500">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-4xl mx-auto shadow-inner">
              ✓
            </div>
            <h2 className="text-2xl font-black text-slate-900">Email Verified!</h2>
            <p className="text-slate-500">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-violet-200"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-4xl mx-auto shadow-inner">
              ✕
            </div>
            <h2 className="text-2xl font-black text-slate-900">Verification Failed</h2>
            <p className="text-slate-500">{message}</p>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/register"
                className="inline-block w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-xl transition-all"
              >
                Back to Signup
              </Link>
              <Link
                to="/login"
                className="inline-block w-full text-violet-600 font-bold py-2 hover:underline"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
