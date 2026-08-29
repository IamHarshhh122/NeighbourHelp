import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
} from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const sendOtp = async () => {
    const email = getValues("email");
    const fullname = getValues("fullname");
    const password = getValues("password");

    if (!email || !fullname || !password) {
      toast.error("Please fill in Name, Email and Password first!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fullname, password }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Your verification code is on its way! 📩");
        setOtpSent(true);
      } else {
        toast.error(data.message || "Unable to send verification code");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network Error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const otp = document.getElementById("otp")?.value;

    if (!otpSent || !otp) {
      toast.error("Please verify your email first!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, otp }),
        }
      );

      const result = await res.json();

      if (result.success) {
        toast.success("Welcome to the neighbourhood! 🏡✨");
        localStorage.setItem("Users", JSON.stringify(result.user));

        setTimeout(() => {
          navigate("/"); // Yahan bhi dashboard se badal kar "/" kar diya hai
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.message || "Verification failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = "http://localhost:5000/api/google";
  };

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white flex items-center justify-center px-3 py-6 sm:px-6 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 sm:w-96 sm:h-96 bg-blue-600/10 rounded-full blur-[90px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-cyan-500/10 rounded-full blur-[90px]" />
      </div>

      <div className="w-full max-w-4xl lg:min-h-[650px] grid grid-cols-1 lg:grid-cols-12 rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl overflow-hidden relative z-10">
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
              Hyperlocal Support
            </span>

            <h2 className="text-3xl xl:text-4xl font-black leading-tight">
              Need a hand?
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Your neighbourhood has your back.
              </span>
            </h2>

            <p className="mt-4 text-slate-300 text-sm leading-relaxed max-w-sm">
              Stuck at work while your parcel arrives?
              A trusted neighbour is nearby to help.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-7">
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                <HiOutlineShieldCheck className="text-xl text-blue-400 mb-1" />
                <p className="text-xs font-bold">Trusted & Secure</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                <HiOutlineLocationMarker className="text-xl text-cyan-400 mb-1" />
                <p className="text-xs font-bold">Nearby Help</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-slate-500">
            © 2026 NeighbourHelp
          </div>
        </section>

        <section className="lg:col-span-7 px-4 py-7 sm:px-8 sm:py-9 lg:p-10 relative flex flex-col justify-center bg-slate-950/60">
          <Link
            to="/"
            className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white"
          >
            ✕
          </Link>

          <div className="mb-6 sm:mb-7 pr-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Create Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join your local community network.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Full Name
              </label>

              <div className="relative mt-1.5">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full h-11 sm:h-12 pl-10 pr-3 rounded-xl bg-slate-900/80 border border-white/10 outline-none focus:border-blue-500 text-sm"
                  {...register("fullname", {
                    required: "Name required",
                  })}
                />
              </div>

              {errors.fullname && (
                <p className="text-[10px] text-red-400 mt-1 ml-1">
                  {errors.fullname.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Email Address
              </label>

              <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                <div className="relative flex-1">
                  <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full h-11 sm:h-12 pl-10 pr-3 rounded-xl bg-slate-900/80 border border-white/10 outline-none focus:border-blue-500 text-sm"
                    {...register("email", {
                      required: "Email required",
                    })}
                  />
                </div>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 h-11 sm:h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-[11px] font-black uppercase tracking-wider"
                >
                  {otpSent ? "Resend OTP" : "Send OTP"}
                </button>
              </div>

              {errors.email && (
                <p className="text-[10px] text-red-400 mt-1 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {otpSent && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-[10px] sm:text-xs font-bold text-emerald-300 mb-2">
                  Enter 6-digit verification code
                </p>

                <input
                  type="text"
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  onInput={(e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);
                  }}
                  className="w-full h-12 rounded-lg bg-slate-950 border border-emerald-500/30 text-center text-lg font-black tracking-[7px] outline-none focus:border-emerald-400"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Password
              </label>

              <div className="relative mt-1.5">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  className="w-full h-11 sm:h-12 pl-10 pr-16 rounded-xl bg-slate-900/80 border border-white/10 outline-none focus:border-blue-500 text-sm"
                  {...register("password", {
                    required: "Password required",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 characters",
                    },
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-blue-400"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p className="text-[10px] text-red-400 mt-1 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              {loading ? "Processing..." : "Create Account"}
              <HiOutlineArrowRight />
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">
              or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={googleLogin}
            type="button"
            className="w-full min-h-11 sm:min-h-12 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition"
          >
            <FcGoogle className="text-lg" />
            Continue with Google
          </button>

          <p className="text-center text-xs sm:text-sm text-slate-400 mt-5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-black"
            >
              Login
            </Link>
          </p>
        </section>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="text-center">
            <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 font-bold text-xs">
              Connecting neighbors...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;