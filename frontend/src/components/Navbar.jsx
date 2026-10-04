import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSparkles,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

/* ───────────── BRAND LOGO ───────────── */
const BrandLogo = () => {
  return (
    <Link to="/" className="group flex items-center gap-3 select-none">
      {/* ICON */}
      <div className="relative w-10 h-10 shrink-0">
        {/* Rotating conic ring — slow */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-[2px] rounded-2xl opacity-50 group-hover:opacity-90 transition-opacity duration-500"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, #60a5fa 60deg, #3b82f6 140deg, transparent 220deg, #60a5fa 320deg, transparent 360deg)",
          }}
        />

        {/* Icon base */}
        <div className="relative w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Continuous 360° rotation — counter-clockwise */}
          <motion.img
            src="/neighbour.png"
            alt="NeighbourHelp"
            draggable={false}
            className="relative z-10 w-[72%] h-[72%] object-contain"
            animate={{ rotate: -360 }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>

      {/* WORDMARK */}
      <div className="relative flex flex-col leading-none">
        <span className="text-[19px] sm:text-xl font-black tracking-tight text-white flex items-center">
          Neighbour
          <span className="ml-[2px] bg-gradient-to-r from-cyan-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">
            Help
          </span>
        </span>

        <span className="hidden sm:block text-[8.5px] font-bold uppercase tracking-[0.28em] text-slate-500 mt-1 group-hover:text-slate-400 transition-colors">
          Neighbours helping
        </span>
      </div>
    </Link>
  );
};

/* ───────────── NAVBAR ───────────── */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const loadUser = () => {
    const storedUser = localStorage.getItem("Users");
    if (storedUser) setUser(JSON.parse(storedUser));
    else setUser(null);
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("storage", loadUser);
    window.addEventListener("profileUpdated", loadUser);

    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("profileUpdated", loadUser);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("Users");
    setUser(null);
    navigate("/login");
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/micro-tasks", label: "Micro-Tasks" },
    { to: "/about", label: "About" },
  ];

  const desktopLinkStyle = ({ isActive }) =>
    `relative px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30"
        : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
    }`;

  return (
    <>
      {/* ───────────── TOP NAVBAR ───────────── */}
      <header
        className={`sticky top-0 z-50 w-full transition-[background-color,box-shadow,border-color] duration-300 ${
          scrolled
            ? "border-b border-blue-500 shadow-[0_8px_48px_-12px_rgba(59,130,246,0.5)]"
            : "border-b border-blue-500"
        }`}
        style={{
          background: scrolled
            ? "linear-gradient(180deg, rgba(2, 6, 23, 0.96) 0%, rgba(15, 23, 42, 0.94) 45%, rgba(23, 37, 84, 0.92) 100%)"
            : "linear-gradient(180deg, rgba(2, 6, 23, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(30, 58, 138, 0.55) 100%)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
        }}
      >
        {/* Top accent line — glowing blue */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-90" />

        {/* Bottom glow line — soft blue */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        {/* Radial blue glow inside */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)",
          }}
        />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3 flex justify-between items-center relative">
          {/* BRAND */}
          <BrandLogo />

          {/* DESKTOP NAV PILL */}
          <nav className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-inner shadow-black/40">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={desktopLinkStyle}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT ACTIONS (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Credits pill */}
                <div className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/[0.08] border border-amber-500/30">
                  <HiOutlineSparkles className="text-amber-400 text-sm" />
                  <span className="text-xs font-black text-amber-300 tracking-wide">
                    {user.points ?? 20}
                  </span>
                  <span className="text-[10px] font-bold text-amber-400/70 uppercase">
                    credits
                  </span>
                </div>

                {/* Profile pill */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white overflow-hidden ring-2 ring-slate-950">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.fullname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{getInitials(user.fullname || user.email)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white max-w-[90px] truncate">
                    {user.fullname?.split(" ")[0] || "User"}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="relative px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 group"
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:opacity-95" />
                  <span className="relative">Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* MOBILE: Points + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/[0.08] border border-amber-500/30">
                <HiOutlineSparkles className="text-amber-400 text-xs" />
                <span className="text-[11px] font-black text-amber-300">
                  {user.points ?? 20}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 text-2xl active:scale-90 transition"
              aria-label="Menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* ───────────── MOBILE DRAWER ───────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm md:hidden bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 flex flex-col"
            >
              <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-cyan-400 to-transparent" />

              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-sm font-black text-white tracking-wide uppercase">
                  Menu
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 bg-white/5 border border-white/10 active:scale-90 transition"
                >
                  <HiOutlineX className="text-xl" />
                </button>
              </div>

              {user && (
                <div className="p-4">
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="relative block rounded-2xl p-[1px] bg-gradient-to-r from-blue-600/60 via-cyan-500/40 to-transparent"
                  >
                    <div className="rounded-2xl bg-slate-900/90 p-3.5 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white overflow-hidden ring-2 ring-slate-950">
                          {user.profilePic ? (
                            <img
                              src={user.profilePic}
                              alt={user.fullname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {getInitials(user.fullname || user.email)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-white truncate">
                          {user.fullname || "Neighbour"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/40">
                        <HiOutlineSparkles className="text-amber-400 text-xs" />
                        <span className="text-[11px] font-black text-amber-300">
                          {user.points ?? 20}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              <nav className="flex-1 px-3 pt-2 overflow-y-auto">
                <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase">
                  Navigate
                </p>
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                    >
                      <NavLink
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600/25 to-cyan-500/10 text-white border border-blue-500/30"
                              : "text-slate-300 hover:bg-white/5 border border-transparent"
                          }`
                        }
                      >
                        {link.label}
                        <span className="text-slate-600 text-xs">›</span>
                      </NavLink>
                    </motion.div>
                  ))}

                  {user && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <NavLink
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600/25 to-cyan-500/10 text-white border border-blue-500/30"
                              : "text-slate-300 hover:bg-white/5 border border-transparent"
                          }`
                        }
                      >
                        My Profile & Skills
                        <span className="text-slate-600 text-xs">›</span>
                      </NavLink>
                    </motion.div>
                  )}
                </div>
              </nav>

              <div className="p-4 border-t border-white/10">
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest active:scale-[0.98] transition"
                  >
                    Sign Out
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 text-center py-3 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-slate-300"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 text-center py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}