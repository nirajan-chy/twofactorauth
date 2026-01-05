"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react"; // Added Loader2 for animation
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // Import Toast

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_NEXT_BASE_URL || "http://localhost:4000";

export default function RegistrationSystem() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [formData, setFormData] = useState({
    username: "", // Changed 'name' to 'username' to match backend common standards
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Client-side validation
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true); // Start loading animation

    try {
      const response = await axios.post(`${BASE_URL}/user/register`, formData);

      const { success, message } = response.data;

      if (success || response.status === 201 || response.status === 200) {
        toast.success(message || "Account created successfully!");
        
        // Wait 1.5 seconds so user sees the success message before redirecting
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast.error(message || "Registration failed");
        setIsLoading(false);
      }

    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePassword = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  };

  const handleSocialLogin = (provider) => {
    toast(`Connecting to ${provider}...`, {
      icon: '🔄',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      {/* Toast Container */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/image.png" 
              alt="Logo" 
              className="h-32 w-auto object-contain drop-shadow-sm" 
            />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm">Join us and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Username
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                placeholder="johndoe"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 cursor-pointer z-10"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-3.5 rounded-xl font-bold text-white transition-all duration-200 shadow-lg hover:shadow-indigo-500/30
              ${isLoading 
                ? "bg-indigo-400 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-gray-400 text-sm font-medium">OR CONTINUE WITH</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleSocialLogin("Google")}
            className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("Facebook")}
            className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition duration-200"
          >
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-indigo-600 font-bold hover:text-indigo-700 transition hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}