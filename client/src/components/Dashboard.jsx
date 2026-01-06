"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, User, Clock, CheckCircle, LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return router.push("/login");

    // Fetch user info
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load user data");
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const toggle2FA = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/toggle-2fa`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setUser({ ...user, twoFactorEnabled: !user.twoFactorEnabled });
      }
    } catch {
      setError("Failed to update 2FA settings");
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold">SecureApp</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4 mb-4">
            <User className="w-8 h-8 text-indigo-600" />
            <h2 className="text-xl font-bold">Account Info</h2>
          </div>
          <p>Email: {user.email}</p>
          <p>
            Status:{" "}
            <span className="text-green-600 font-semibold">Active</span>
          </p>
          <p>
            Email Verified: <CheckCircle className="inline w-5 h-5 text-green-500" />
          </p>
        </div>

        {/* 2FA Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
          </div>
          <p className="mb-4">
            Add an extra layer of security to your account by enabling 2FA.
          </p>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">2FA Status</p>
              <p>{user.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
            </div>
            <button
              onClick={toggle2FA}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                user.twoFactorEnabled
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {user.twoFactorEnabled ? "Disable" : "Enable"}
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold">Active Sessions</h2>
          </div>
          {sessions.length === 0 ? (
            <p>No active sessions</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="flex justify-between p-4 border rounded-lg mb-2 hover:bg-gray-50"
              >
                <div>
                  <p>{s.device}</p>
                  <p className="text-sm text-gray-600">{s.location}</p>
                </div>
                {s.active && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Active
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
