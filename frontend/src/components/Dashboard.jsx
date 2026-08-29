import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // 1. URL query params se user data catch karne ke liye (agar Google login se aaya hai)
    const params = new URLSearchParams(location.search);
    const userParam = params.get("user");

    if (userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem("Users", JSON.stringify(parsedUser));
        setUserData(parsedUser);
        // URL se query params clean karne ke liye
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    } else {
      // LocalStorage se user uthao
      const localUser = localStorage.getItem("Users");
      if (localUser) {
        setUserData(JSON.parse(localUser));
      } else {
        // Agar login nahi hai toh login/signup par bhej do
        navigate("/login");
      }
    }
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("Users");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-black">
            Neighbour<span className="text-blue-400">Help</span> Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl mb-6">
          <h2 className="text-xl font-bold mb-2">
            Welcome, {userData?.name || userData?.fullname || "Neighbor"}! 🎉
          </h2>
          <p className="text-slate-400 text-xs">
            Email: {userData?.email}
          </p>
        </div>

        {/* Lorem Ipsum Content / Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
            <h3 className="font-bold text-blue-400 mb-2">Active Local Requests</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
            <h3 className="font-bold text-cyan-400 mb-2">Community Updates</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;