"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const VerifyEmailPage = () => {
  const [message, setMessage] = useState("Verifying your email...");
  const [status, setStatus] = useState("loading");
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link.");
      setStatus("error");
      return;
    }

    axios
      .get(`http://localhost:5000/user/verify/${encodeURIComponent(token)}`)
      .then(() => {
        setMessage("Email verified successfully!");
        setStatus("success");
        setTimeout(() => router.push("/login"), 2000);
      })
      .catch(err => {
        console.error(err);
        setMessage(err.response?.data?.message || "Verification failed.");
        setStatus("error");
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
        {status === "loading" && <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />}
        {status === "success" && <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />}
        {status === "error" && <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />}
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
        
        {status === "loading" && <p className="text-gray-600">Please wait...</p>}
        {status === "success" && <p className="text-gray-600">Redirecting to login...</p>}
        {status === "error" && (
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;