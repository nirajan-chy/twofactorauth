"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Smartphone,
  Key,
  Activity,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Lock,
  Mail,
  Bell,
  Download,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

export default function DashboardPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_NEXT_BASE_URL;
  console.log(BASE_URL);

  const router = useRouter();

  // --- 1. User Identification (FIXED) ---
  // In a real app, grab this from your Auth Context or useSession hook
  const userId = "user_12345_placeholder";

  // --- State Management ---
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [recoveryCodesShown, setRecoveryCodesShown] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // 2FA Specific State
  const [qrCode, setQrCode] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Session Data State
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, USA",
      ip: "192.168.1.1",
      lastActive: "2 mins ago",
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone 14",
      location: "New York, USA",
      ip: "192.168.1.2",
      lastActive: "1 hour ago",
      current: false,
    },
  ]);

  // Activity Log State
  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      action: "Login successful",
      device: "Chrome on Windows",
      time: "2 mins ago",
      status: "success",
    },
    {
      id: 2,
      action: "Password changed",
      device: "Chrome on Windows",
      time: "3 days ago",
      status: "success",
    },
  ]);

  const recoveryCodes = [
    "ABCD-1234-EFGH",
    "IJKL-5678-MNOP",
    "QRST-9012-UVWX",
    "YZAB-3456-CDEF",
    "GHIJ-7890-KLMN",
    "OPQR-1234-STUV",
  ];

  // --- Actions ---

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  // --- 2FA Logic (Hybrid: Works with or without Backend) ---
  const enable2FA = async () => {
    setIsLoading(true);
    try {
      // CHECK: Do we have an API URL configured?
      if (BASE_URL) {
        // --- REAL BACKEND LOGIC ---
        const res = await axios.post(`${BASE_URL}/2fa/setup/${userId}`);
        console.log(res);
        const data = await res.json();
        console.log(data);
        if (!data.success) throw new Error(data.message);

        setQrCode(data.qrCode);
        setManualCode(data.manualCode);
      } else {
        // --- DEMO SIMULATION LOGIC (So UI works for you now) ---
        console.log("Simulating API Call...");
        await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay

        // Placeholder QR (Google Charts API for demo)
        setQrCode(
          `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/SecureVault:User?secret=JBSWY3DPEHPK3PXP&issuer=SecureVault`
        );
        setManualCode("JBSW Y3DP EHPK 3PXP");
      }

      setShowQRModal(true);
      setVerificationCode("");
    } catch (err) {
      alert("Error starting 2FA: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirm2FA = async () => {
    if (verificationCode.length !== 6) return;
    setIsLoading(true);

    try {
      if (process.env.NEXT_PUBLIC_API_URL) {
        // --- REAL BACKEND LOGIC ---
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/2fa/verify/${userId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: verificationCode }),
          }
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      } else {
        // --- DEMO SIMULATION LOGIC ---
        await new Promise(resolve => setTimeout(resolve, 800));
        // In demo mode, we accept any 6 digit code
      }

      // Success Actions
      setIs2FAEnabled(true);
      setShowQRModal(false);
      setRecoveryCodesShown(true);
      setVerificationCode("");

      // Update Activity Log
      const newLog = {
        id: Date.now(),
        action: "2FA Enabled",
        device: "Current Device",
        time: "Just now",
        status: "success",
      };
      setActivityLog(prev => [newLog, ...prev]);

      alert("2FA Enabled Successfully 🎉");
    } catch (err) {
      alert("Invalid Code: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = () => {
    if (
      confirm(
        "Are you sure you want to disable 2FA? This will make your account less secure."
      )
    ) {
      setIs2FAEnabled(false);
      setRecoveryCodesShown(false);

      const newLog = {
        id: Date.now(),
        action: "2FA Disabled",
        device: "Current Device",
        time: "Just now",
        status: "warning",
      };
      setActivityLog(prev => [newLog, ...prev]);
    }
  };

  const revokeSession = sessionId => {
    if (confirm("Are you sure you want to revoke this session?")) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const revokeAllSessions = () => {
    if (confirm("Revoke all other sessions?")) {
      setSessions(prev => prev.filter(s => s.current === true));
    }
  };

  // --- JSX Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
      {/* Modern Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SecureVault
                </span>
                <p className="text-xs text-gray-500">Security Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium cursor-pointer">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      once if you lose access to your authenticator.
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, User!
          </h1>
          <p className="text-gray-600">
            Manage your security settings and monitor account activity
          </p>
        </div>

        {/* Security Score */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 mb-2">Security Score</p>
              <h2 className="text-5xl font-bold mb-2">
                {is2FAEnabled ? "85" : "45"}/100
              </h2>
              <p className="text-indigo-100">
                {is2FAEnabled
                  ? "Good! Your account is well protected."
                  : "Enable 2FA to improve your security"}
              </p>
            </div>
            <div className="w-32 h-32 rounded-full border-8 border-white/30 flex items-center justify-center">
              <Shield className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {sessions.length}
            </p>
            <p className="text-sm text-gray-600">Active Sessions</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {activityLog.length}
            </p>
            <p className="text-sm text-gray-600">Recent Activities</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-12 h-12 ${is2FAEnabled ? "bg-green-100" : "bg-red-100"} rounded-lg flex items-center justify-center`}
              >
                <Lock
                  className={`w-6 h-6 ${is2FAEnabled ? "text-green-600" : "text-red-600"}`}
                />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {is2FAEnabled ? "ON" : "OFF"}
            </p>
            <p className="text-sm text-gray-600">2FA Protection</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">Verified</p>
            <p className="text-sm text-gray-600">Email Status</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex gap-1 p-2 min-w-max">
              {["overview", "sessions", "activity", "settings"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-medium capitalize transition-all ${
                    activeTab === tab
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Account Info Card */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Account Information
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Email Address
                      </p>
                      <p className="font-semibold text-gray-900">
                        user@example.com
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Account Status
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="font-semibold text-green-600">
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Email Verification
                      </p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-green-600">
                          Verified
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Member Since</p>
                      <p className="font-semibold text-gray-900">
                        January 2024
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2FA Settings Card */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        Two-Factor Authentication
                      </h2>
                      <p className="text-sm text-gray-600">
                        Secure your account with an additional verification step
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-gray-900 text-lg mb-1">
                          Current Status
                        </p>
                        <p
                          className={`text-sm font-semibold ${is2FAEnabled ? "text-green-600" : "text-orange-600"}`}
                        >
                          {is2FAEnabled
                            ? "✓ Enabled and Active"
                            : "⚠ Currently Disabled"}
                        </p>
                      </div>
                      <div
                        className={`w-16 h-16 rounded-full ${is2FAEnabled ? "bg-green-100" : "bg-orange-100"} flex items-center justify-center`}
                      >
                        {is2FAEnabled ? (
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-8 h-8 text-orange-600" />
                        )}
                      </div>
                    </div>

                    {!is2FAEnabled && (
                      <div className="mb-4 p-4 bg-orange-100 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                          <strong>Security Notice:</strong> Your account is
                          vulnerable without 2FA. Enable it now to protect
                          against unauthorized access.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={is2FAEnabled ? disable2FA : enable2FA}
                      disabled={isLoading}
                      className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 ${
                        is2FAEnabled
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                      }`}
                    >
                      {isLoading
                        ? "Processing..."
                        : is2FAEnabled
                          ? "Disable 2FA"
                          : "Enable 2FA Now"}
                    </button>
                  </div>

                  {is2FAEnabled && recoveryCodesShown && (
                    <div className="mt-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Key className="w-5 h-5 text-yellow-700" />
                        <h3 className="font-bold text-yellow-900">
                          Recovery Codes
                        </h3>
                      </div>
                      <p className="text-sm text-yellow-800 mb-4">
                        Save these codes in a secure location. Each can be used
                        once if you lose access to your authenticator.
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {recoveryCodes.map((code, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white border border-yellow-300 rounded-lg font-mono text-sm text-center select-all"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                        <Download className="w-4 h-4" />
                        Download Codes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Active Sessions
                    </h2>
                    <p className="text-gray-600">
                      Manage devices that are currently logged into your account
                    </p>
                  </div>
                  <button
                    onClick={revokeAllSessions}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Revoke All
                  </button>
                </div>

                <div className="space-y-4">
                  {sessions.length === 0 && (
                    <div className="text-center p-8 text-gray-500">
                      No active sessions found.
                    </div>
                  )}
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center ${session.current ? "bg-green-100" : "bg-gray-100"}`}
                          >
                            <Smartphone
                              className={`w-7 h-7 ${session.current ? "text-green-600" : "text-gray-600"}`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900">
                                {session.device}
                              </h3>
                              {session.current && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span>{session.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                <span>IP: {session.ip}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Last active: {session.lastActive}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {!session.current && (
                          <button
                            onClick={() => revokeSession(session.id)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Security Activity
                    </h2>
                    <p className="text-gray-600">
                      Recent security events and account changes
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                <div className="space-y-3">
                  {activityLog.map(log => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          log.status === "success"
                            ? "bg-green-100"
                            : log.status === "warning"
                              ? "bg-red-100"
                              : "bg-blue-100"
                        }`}
                      >
                        {log.status === "success" ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : log.status === "warning" ? (
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        ) : (
                          <Activity className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {log.action}
                        </p>
                        <p className="text-sm text-gray-600">{log.device}</p>
                      </div>
                      <p className="text-sm text-gray-500">{log.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Security Settings
                </h2>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive alerts for suspicious activity
                        </p>
                      </div>
                      <button className="w-14 h-7 bg-indigo-600 rounded-full relative">
                        <span className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md"></span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Login Alerts
                        </h3>
                        <p className="text-sm text-gray-600">
                          Get notified of new device logins
                        </p>
                      </div>
                      <button className="w-14 h-7 bg-indigo-600 rounded-full relative">
                        <span className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md"></span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Password Change
                        </h3>
                        <p className="text-sm text-gray-600">
                          Update your account password
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Change Password
                      </button>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-red-900 mb-1">
                          Delete Account
                        </h3>
                        <p className="text-sm text-red-700">
                          Permanently delete your account and data
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 2FA Setup Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-900">
              Enable Two-Factor Authentication
            </h3>

            {/* QR CODE */}
            <div className="flex justify-center mb-6">
              {qrCode ? (
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48 border rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-lg animate-pulse" />
              )}
            </div>

            {/* MANUAL CODE */}
            <p className="text-sm text-gray-600 mb-2 text-center">
              Or enter this code manually
            </p>
            <div className="p-3 bg-gray-100 rounded text-center font-mono mb-6 text-gray-800 tracking-wider">
              {manualCode}
            </div>

            {/* OTP INPUT */}
            <input
              type="text"
              value={verificationCode}
              onChange={e =>
                setVerificationCode(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full text-center text-lg text-gray-900 border border-gray-300 rounded-lg py-3 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={confirm2FA}
                disabled={verificationCode.length !== 6 || isLoading}
                className={`flex-1 text-white rounded-lg py-2 transition-all ${
                  verificationCode.length === 6 && !isLoading
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}