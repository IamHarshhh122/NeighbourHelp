import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = searchParams.get("user");

    if (!userData) {
      toast.error("Google authentication failed");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userData);

      localStorage.setItem("Users", JSON.stringify(user));

      toast.success("Welcome back, neighbour! 👋🏠");

      window.location.replace("/");
    } catch (error) {
      console.error("OAuth Success Error:", error);
      toast.error("Failed to process Google login");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />

        <p className="mt-3 font-bold text-xs">
          Finalizing login...
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccess;