import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineLocationMarker, HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineArrowRight } from 'react-icons/hi';
import Navbar from './Navbar';
import Footers from './Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <main className="w-full max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center relative z-10 my-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold mb-6">
          <HiOutlineSparkles /> Hyperlocal Community Network
        </span>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
          Need a hand? <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Your neighbourhood has your back.
          </span>
        </h2>

        <p className="mt-5 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          Stuck at work while your parcel arrives? Need a tool urgently? Connect instantly with trusted people living right next door.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl shadow-blue-600/25 text-white"
          >
            Get Started <HiOutlineArrowRight className="text-sm" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 h-12 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] font-bold text-xs uppercase tracking-wider flex items-center justify-center transition text-white"
          >
            Sign In to Account
          </Link>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 text-left">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
            <HiOutlineShieldCheck className="text-2xl text-blue-400 mb-2" />
            <h3 className="font-bold text-sm sm:text-base mb-1 text-white">Trusted & Secure</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Verified community members with secure email and Google authentication protocols.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
            <HiOutlineLocationMarker className="text-2xl text-cyan-400 mb-2" />
            <h3 className="font-bold text-sm sm:text-base mb-1 text-white">Nearby Micro-Tasks</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Post requests or offer help within your immediate locality seamlessly.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}

       <Footers/>

    </div>
  );
}