import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import colonyImg from "../assets/neighbourhood-colony.png";
import {
  HiOutlineLocationMarker,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineLightningBolt,
  HiOutlineUserGroup,
} from "react-icons/hi";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const words = [
  "Need a hand?",
  "Parcel arriving?",
  "Need a tool?",
  "Need some help?",
];

export default function Home() {
  const position = [28.6692, 77.4538];

  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Google OAuth Login Data Handler
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const googleUserData = searchParams.get("googleUser");

    if (googleUserData) {
      try {
        const user = JSON.parse(decodeURIComponent(googleUserData));
        localStorage.setItem("Users", JSON.stringify(user));
        toast.success("Welcome back, neighbour! 👋🏠");
        navigate("/", { replace: true });
        window.location.reload();
      } catch (err) {
        console.error("Google user parse error:", err);
        toast.error("Google login failed!");
      }
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const current = words[wordIndex];

    const timer = setTimeout(
      () => {
        if (!deleting) {
          setText(current.substring(0, text.length + 1));

          if (text.length === current.length - 1) {
            setTimeout(() => setDeleting(true), 1200);
          }
        } else {
          setText(current.substring(0, text.length - 1));

          if (text.length === 1) {
            setDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      deleting ? 45 : 90
    );

    return () => clearTimeout(timer);
  }, [text, deleting, wordIndex]);

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-x-hidden">

      {/* ================= BACKGROUND GLOW & ROTATING ENGINE ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        
        {/* Ambient Glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-blue-600/20 blur-[150px]" />
        <div className="absolute top-[28%] -left-36 w-[420px] h-[420px] rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="absolute top-[32%] -right-36 w-[420px] h-[420px] rounded-full bg-purple-600/15 blur-[130px]" />

        {/* Center Rotating Blueprint */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[650px] h-[650px] lg:w-[800px] lg:h-[800px] flex items-center justify-center opacity-30">
          <div className="absolute w-[620px] h-[620px] lg:w-[760px] lg:h-[760px] rounded-full border border-dashed border-cyan-400/30 animate-spin-slow" />
          <img
            src={colonyImg}
            alt="Neighbourhood Grid"
            className="w-[420px] h-[420px] lg:w-[540px] lg:h-[540px] object-contain drop-shadow-[0_0_25px_rgba(6,182,212,0.25)] animate-spin-slow"
          />
        </div>
      </div>

      {/* ================= HERO CONTENT WITH FLOATING BADGES ================= */}
      <main className="relative z-10">
        <section className="relative max-w-[1400px] mx-auto min-h-[580px] flex flex-col items-center justify-center px-4 pt-16 pb-8 text-center">

          {/* ================= 4 CORNER FLOATING NEIGHBOUR SIGNALS ================= */}

          {/* TOP LEFT: Heavy Lifting / Errand */}
          <div className="hidden xl:flex absolute top-12 left-8 items-center gap-3 animate-float-y">
            <div className="relative w-12 h-12 rounded-2xl bg-slate-900/80 border border-amber-400/40 backdrop-blur-md flex items-center justify-center shadow-lg">
              <span className="text-xl">📦</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-slate-900"></span>
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-md shadow-xl text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Urgent Errand</span>
              <p className="text-xs font-bold text-white mt-0.5">Need help lifting parcel</p>
              <p className="text-[10px] text-slate-400">Sharma • Flat 204 (150m)</p>
            </div>
          </div>

          {/* TOP RIGHT: Document / Verification Assistance */}
          <div className="hidden xl:flex absolute top-12 right-8 items-center gap-3 animate-float-y" style={{ animationDelay: "1s" }}>
            <div className="px-4 py-2.5 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-md shadow-xl text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">Community Support</span>
              <p className="text-xs font-bold text-white mt-0.5">Form & bank verification</p>
              <p className="text-[10px] text-slate-400">Uncle Verma • 300m away</p>
            </div>
            <div className="relative w-12 h-12 rounded-2xl bg-slate-900/80 border border-blue-400/40 backdrop-blur-md flex items-center justify-center shadow-lg">
              <span className="text-xl">🏦</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-slate-900"></span>
              </span>
            </div>
          </div>

          {/* BOTTOM LEFT: Pharmacy Run */}
          <div className="hidden xl:flex absolute bottom-10 left-12 items-center gap-3 animate-float-y" style={{ animationDelay: "2s" }}>
            <div className="relative w-12 h-12 rounded-2xl bg-slate-900/80 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center shadow-lg">
              <span className="text-xl">💊</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-slate-900"></span>
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-md shadow-xl text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Pharmacy Run</span>
              <p className="text-xs font-bold text-white mt-0.5">Quick pharmacy pick-up</p>
              <p className="text-[10px] text-slate-400">Rohan • Sector 3 (400m)</p>
            </div>
          </div>

          {/* BOTTOM RIGHT: Package Delivery */}
          <div className="hidden xl:flex absolute bottom-10 right-12 items-center gap-3 animate-float-y" style={{ animationDelay: "1.5s" }}>
            <div className="px-4 py-2.5 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-md shadow-xl text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">Gate Delivery</span>
              <p className="text-xs font-bold text-white mt-0.5">Collect package from gate</p>
              <p className="text-[10px] text-slate-400">Pooja • Wing A (80m)</p>
            </div>
            <div className="relative w-12 h-12 rounded-2xl bg-slate-900/80 border border-cyan-400/40 backdrop-blur-md flex items-center justify-center shadow-lg">
              <span className="text-xl">🏡</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-slate-900"></span>
              </span>
            </div>
          </div>

          {/* TAG BADGE */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-400/40 bg-cyan-400/5 text-cyan-300 text-xs font-bold shadow-sm">
            <HiOutlineSparkles />
            Hyperlocal Community Network
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="mt-8 font-black tracking-tight w-full max-w-4xl flex flex-col items-center">
            <span className="block text-3xl sm:text-5xl lg:text-6xl min-h-[1.3em] text-white font-extrabold">
              {text}
              <span className="text-cyan-400 animate-pulse ml-1">|</span>
            </span>

            <span className="inline-block mt-3 px-3 py-2 text-4xl sm:text-6xl lg:text-7xl leading-snug text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
              Your neighbourhood
            </span>

            <span className="block mt-2 text-4xl sm:text-6xl lg:text-7xl leading-snug text-white">
              has your back.
            </span>
          </h1>

          <p className="mt-6 text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto px-4">
            Connect with trusted people nearby for parcels, errands, tutoring, tools and everyday help.
            <span className="text-cyan-300 font-bold"> Help. Earn. Belong.</span>
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="group h-12 px-8 rounded-full bg-white text-black flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5"
            >
              Get Started
              <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="h-12 px-8 rounded-full border-2 border-white/15 text-white flex items-center justify-center font-semibold text-sm transition-all duration-300 hover:border-white/30 hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-5 flex justify-center items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            People nearby are helping right now
          </div>

        </section>

        <section className="relative z-20 max-w-[1100px] mx-auto px-4 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

            {/* LEFT: MAP */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
                <HiOutlineLocationMarker className="text-cyan-400 text-base" />
                Live Neighbourhood Coverage
                <span className="ml-auto flex items-center gap-1 text-[10px] text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="h-64 sm:h-[320px] rounded-2xl overflow-hidden border border-cyan-400/30 shadow-xl shadow-blue-950/50">
                <MapContainer
                  center={position}
                  zoom={14}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Circle
                    center={position}
                    radius={1800}
                    pathOptions={{
                      color: "#0ea5e9",
                      fillColor: "#0ea5e9",
                      fillOpacity: 0.12,
                    }}
                  />
                  <Marker position={position}>
                    <Popup>
                      <b>NeighbourHelp</b>
                      <br />
                      Ghaziabad Community Hub
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* RIGHT: VIDEO */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Community Showcase
              </div>

              <div className="relative h-64 sm:h-[320px] rounded-2xl overflow-hidden border border-cyan-400/30 shadow-xl bg-slate-900 flex items-center justify-center">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                >
                  <source src="/YOU NEED HELP.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 mt-14 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Feature icon={<HiOutlineShieldCheck />} title="Trusted & Secure" text="Verified community members and secure authentication." />
            <Feature icon={<HiOutlineLocationMarker />} title="Nearby Micro-Tasks" text="Post requests or offer help within your locality." />
            <Feature icon={<HiOutlineLightningBolt />} title="Fast & Easy" text="Quick chat, simple requests, no unnecessary steps." />
            <Feature icon={<HiOutlineUserGroup />} title="Stronger Communities" text="Help others, get help and build a better neighbourhood." />
          </div>
        </section>
      </main>

    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="group rounded-2xl border border-blue-400/20 bg-[#07132d]/75 backdrop-blur-xl p-5 shadow-lg hover:-translate-y-1 hover:border-cyan-400/40 transition duration-300">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-400/20 border border-blue-400/20 flex items-center justify-center text-xl text-cyan-300 group-hover:scale-110 transition">
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-sm text-white">{title}</h3>
      <p className="mt-2 text-xs text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}