import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineLocationMarker, HiOutlineArrowUp } from "react-icons/hi";
import { FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

const Footers = () => {
  const socials = [
    {
      href: "https://www.instagram.com/bhatta_harsh",
      icon: <FaInstagram />,
      hover: "hover:text-pink-400 hover:border-pink-400/40 hover:shadow-pink-500/20",
    },
    {
      href: "https://www.linkedin.com/in/harsh-bhatta-915ab5349/",
      icon: <FaLinkedinIn />,
      hover: "hover:text-blue-400 hover:border-blue-400/40 hover:shadow-blue-500/20",
    },
    {
      href: "https://github.com/IamHarshhh122",
      icon: <FaGithub />,
      hover: "hover:text-white hover:border-white/30 hover:shadow-white/10",
    },
  ];

  const columns = [
    {
      title: "NeighbourHelp",
      links: [
        { label: "About us", href: "/about" },
        { label: "Microtasks", href: "/microtask" },
        { label: "Contact" , href: "/about"},
      ],
    },
    {
      title: "Good to know",
      links: [
        { label: "Privacy" },
        { label: "Terms" },
        { label: "Help & Support" },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#020617] border-t border-white/10 text-slate-400">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-[100px]" />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr] gap-9 md:gap-12">
          
          {/* BRAND BLOCK */}
          <div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-blue-500/50 blur-lg" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <HiOutlineLocationMarker className="text-xl text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">
                  Neighbour
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    Help
                  </span>
                </h2>
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                  Your neighbourhood network
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-xs sm:text-sm leading-relaxed text-slate-500">
              Ask for help. Offer a hand. Build a neighbourhood where everyone is a little closer.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2.5 mt-6">
              {socials.map((s, i) => (
                <motion.a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 shadow-lg shadow-transparent transition-all duration-300 ${s.hover}`}
                >
                  <span className="text-sm">{s.icon}</span>
                </motion.a>
              ))}
            </div>

            {/* Trust badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-300 tracking-wide uppercase">
                Community growing daily
              </span>
            </div>
          </div>

          {/* LINK COLUMNS */}
          {columns.map((col, idx) => (
            <div key={idx}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                <span className="w-4 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
                {col.title}
              </p>

              <div className="flex flex-col gap-1">
                {col.links.map((link, i) =>
                  link.href ? (
                    <Link
                      key={i}
                      to={link.href}
                      className="group relative flex items-center gap-2 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                    >
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-[1px] bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-3 transition-all duration-300" />
                      <span className="group-hover:translate-x-4 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  ) : (
                    <span
                      key={i}
                      className="py-2 text-xs font-medium text-slate-600 select-none cursor-default"
                    >
                      {link.label}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-10 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-600 text-center sm:text-left font-medium tracking-wide">
            © 2026 <span className="text-slate-400">NeighbourHelp</span>. Made for neighbours, by neighbours.
          </p>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-blue-400/40 hover:bg-blue-500/10 transition-all duration-300"
          >
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase tracking-widest transition">
              Back to top
            </span>
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs shadow-md shadow-blue-500/30 group-hover:-translate-y-0.5 transition-transform">
              <HiOutlineArrowUp />
            </span>
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footers;