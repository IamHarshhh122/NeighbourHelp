import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const googleLogin = () => {
    window.location.href = "http://localhost:5000/api/google";
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/login",
        {
          email: email.trim().toLowerCase(),
          password,
        },
        { withCredentials: true, timeout: 10000 }
      );

      if (res.data.success) {
        toast.success("Welcome back, neighbour! 👋🏠");
        localStorage.setItem("Users", JSON.stringify(res.data.user));
        navigate("/"); // Yahan dashboard se badal kar "/" kar diya hai
      } else {
        toast.error(res.data.message || "Login failed!");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Unable to login!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!email) {
      toast.error("Enter your email first!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/send-otp",
        { email: email.trim().toLowerCase() }
      );

      if (res.data.success) {
        toast.success("Your verification code is on its way! 📩");
        setOtpSent(true);
      } else {
        toast.error(res.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send OTP."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Enter the OTP!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/verify-otp",
        {
          email: email.trim().toLowerCase(),
          otp,
        }
      );

      if (res.data.success) {
        toast.success("Welcome back, neighbour! 👋🏠");
        localStorage.setItem("Users", JSON.stringify(res.data.user));
        navigate("/"); // Yahan bhi dashboard se badal kar "/" kar diya hai
      } else {
        toast.error(res.data.message || "Verification failed!");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid or expired OTP!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white flex items-center justify-center px-3 py-6 sm:px-6 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 sm:w-96 sm:h-96 bg-blue-600/10 rounded-full blur-[90px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-cyan-500/10 rounded-full blur-[90px]" />
      </div>

      <div className="w-full max-w-4xl lg:min-h-[600px] grid grid-cols-1 lg:grid-cols-12 rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl overflow-hidden relative z-10">
        <section className="hidden lg:flex lg:col-span-5 p-8 xl:p-10 flex-col justify-between relative overflow-hidden border-r border-white/10">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800&auto=format&fit=crop"
              alt="Community"
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/75 to-[#020617]/30" />
          </div>

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <HiOutlineLocationMarker className="text-xl" />
              </div>
              <h1 className="text-xl font-black">
                Neighbour<span className="text-blue-400">Help</span>
              </h1>
            </Link>
          </div>

          <div className="relative z-10 my-auto py-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[11px] font-bold mb-5">
              <HiOutlineSparkles />
              Welcome Back
            </span>

            <h2 className="text-3xl xl:text-4xl font-black leading-tight">
              Glad to see you
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                back in your community.
              </span>
            </h2>

            <p className="mt-4 text-slate-300 text-sm leading-relaxed max-w-sm">
              Connect with your neighbors, check active requests,
              and keep your neighborhood connected.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-7">
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                <HiOutlineShieldCheck className="text-xl text-blue-400 mb-1" />
                <p className="text-xs font-bold">Secure Access</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                <HiOutlineLocationMarker className="text-xl text-cyan-400 mb-1" />
                <p className="text-xs font-bold">Local Updates</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-slate-500">
            © 2026 NeighbourHelp
          </div>
        </section>

        <section className="lg:col-span-7 px-4 py-7 sm:px-8 sm:py-10 lg:p-10 relative flex flex-col justify-center bg-slate-950/60">
          <Link
            to="/"
            className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white"
          >
            ✕
          </Link>

          <div className="mb-6 sm:mb-7 pr-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isOtpLogin
                ? "Enter the verification code sent to your email"
                : "Sign in to continue to NeighbourHelp"}
            </p>
          </div>

          {!isOtpLogin && (
            <>
              <button
                onClick={googleLogin}
                type="button"
                className="w-full min-h-11 sm:min-h-12 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition"
              >
                <FcGoogle className="text-lg" />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">
                  or email
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            </>
          )}

          {!isOtpLogin ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 sm:h-12 pl-10 pr-3 rounded-xl bg-slate-900/80 border border-white/10 outline-none focus:border-blue-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center ml-1 mb-1.5 gap-2">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpLogin(true);
                      if (email) sendOtp();
                    }}
                    className="text-[9px] sm:text-[10px] text-blue-400 hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 sm:h-12 pl-10 pr-16 rounded-xl bg-slate-900/80 border border-white/10 outline-none focus:border-blue-500 text-sm"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-blue-400"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                <HiOutlineArrowRight />
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Email Address
                </label>

                <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                  <div className="relative flex-1">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-11 sm:h-12 pl-10 pr-3 rounded-xl bg-slate-900/80 border border-white/10 outline-none focus:border-blue-500 text-sm"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-5 h-11 sm:h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-[11px] font-black uppercase tracking-wider"
                  >
                    {otpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-[10px] sm:text-xs font-bold text-emerald-300 mb-2">
                    Enter 6-digit verification code
                  </p>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    maxLength={6}
                    placeholder="000000"
                    className="w-full h-12 rounded-lg bg-slate-950 border border-emerald-500/30 text-center text-lg font-black tracking-[7px] outline-none focus:border-emerald-400"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-black text-xs sm:text-sm uppercase tracking-wider"
              >
                {isLoading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOtpLogin(false);
                  setOtpSent(false);
                  setOtp("");
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white py-2"
              >
                ← Back to Password Login
              </button>
            </form>
          )}

          <p className="text-center text-xs sm:text-sm text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-300 font-black"
            >
              Sign up
            </Link>
          </p>
        </section>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="text-center">
            <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 font-bold text-xs">Authenticating...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;