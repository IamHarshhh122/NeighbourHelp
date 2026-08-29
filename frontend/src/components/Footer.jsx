import React from "react";
import { HiOutlineLocationMarker, HiOutlineArrowUp } from "react-icons/hi";
import { FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa";

const Footers = () => {
  return (
    <footer className="bg-[#020617] border-t border-white/10 text-slate-400">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10">

        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-7 md:gap-10">

          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
                <HiOutlineLocationMarker className="text-xl text-white" />
              </div>

              <div>
                <h2 className="text-lg font-black text-white">
                  Neighbour<span className="text-blue-400">Help</span>
                </h2>
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Your neighbourhood network
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-xs sm:text-sm leading-5 text-slate-500">
              Ask for help. Offer a hand. Build a neighbourhood where
              everyone is a little closer.
            </p>

            <div className="flex items-center gap-2 mt-5">
              <a
                href="https://www.instagram.com/bhatta_harsh"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center hover:text-pink-400 hover:border-pink-400/30 transition"
              >
                <FaInstagram className="text-xs" />
              </a>

              <a
                href="https://www.linkedin.com/in/harsh-bhatta-915ab5349/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center hover:text-blue-400 hover:border-blue-400/30 transition"
              >
                <FaLinkedinIn className="text-xs" />
              </a>

              <a
                href="https://github.com/IamHarshhh122"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center hover:text-white transition"
              >
                <FaGithub className="text-xs" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-4">
              NeighbourHelp
            </p>

            <div className="flex flex-col gap-2.5 text-xs">
              <a href="/about" className="hover:text-white transition">
                About us
              </a>
              <a href="/requests" className="hover:text-white transition">
                Find help
              </a>
              <a href="/signup" className="hover:text-white transition">
                Join the community
              </a>
              <a href="/contact" className="hover:text-white transition">
                Contact
              </a>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-4">
              Good to know
            </p>

            <div className="flex flex-col gap-2.5 text-xs">
              <a href="/privacy" className="hover:text-white transition">
                Privacy
              </a>
              <a href="/terms" className="hover:text-white transition">
                Terms
              </a>
              <a href="/help" className="hover:text-white transition">
                Help & Support
              </a>
            </div>
          </div>
        </div>

        <div className="mt-7 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-slate-600 text-center sm:text-left">
            © 2026 NeighbourHelp. Made for neighbours, by neighbours.
          </p>

          <button
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="group flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white transition"
          >
            Back to top
            <span className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center group-hover:border-white/20">
              <HiOutlineArrowUp />
            </span>
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footers;