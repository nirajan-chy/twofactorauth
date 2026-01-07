"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_NEXT_BASE_URL;

export default function OtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState(null); // email state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  // 🔐 Get email from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("otp_email");
    console.log(storedEmail);
    if (!storedEmail) {
      router.replace("/login");
    } else {
      setEmail(storedEmail); // ✅ FIX: set email state
    }
  }, [router]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleVerifyOtp = async () => {
    if (!email) {
      setError("Email missing. Please login again.");
      return;
    }
    if (otp.some(d => !d)) {
      setError("Please enter complete OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${BASE_URL}/user/verify-otp`, {
        email,
        otp: otp.join(""),
      });

      // Save tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${BASE_URL}/user/resend-otp`, {
        email,
      });
      alert(data.message || "OTP sent successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null; // prevent flash

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
          Verify OTP
        </h2>

        <p className="text-center text-gray-600 mb-6 text-sm">
          Enter the 6-digit code sent to <br />
          <span className="font-semibold text-gray-800">{email}</span>
        </p>

        <div className="flex justify-center gap-3 mb-5">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(index, e.target.value)}
              onKeyDown={e => {
                if (e.key === "Backspace" && !otp[index] && index > 0) {
                  inputRefs.current[index - 1]?.focus();
                }
                if (e.key === "Enter" && otp.every(d => d)) handleVerifyOtp();
              }}
              className="w-14 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 hover:border-indigo-400 focus:border-indigo-600 text-gray-800"
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm text-center py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleVerifyOtp}
          disabled={loading || otp.some(d => !d)}
          className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 ${
            loading || otp.some(d => !d)
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"
          }`}
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center mt-5">
          <button
            onClick={handleResendOtp}
            disabled={loading}
            className="text-indigo-600 font-medium hover:underline disabled:opacity-50"
          >
            Resend OTP
          </button>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="w-full text-gray-500 hover:text-gray-800 mt-6 text-sm font-medium"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
