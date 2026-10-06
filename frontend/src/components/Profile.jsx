import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlineArrowLeft,
  HiPlus,
  HiTrash,
  HiCheck,
  HiOutlineLocationMarker,
  HiOutlineLightningBolt,
  HiOutlineCamera,
  HiOutlineShieldCheck,
  HiOutlineStar,
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';


const BACKEND_URL =
  import.meta.env.VITE_API_URL || "https://neighbourhelp-backend.onrender.com";
const API = `${BACKEND_URL}/api`;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['Parcel Receiving', 'Bank Errands', 'General Help']);
  const [profilePic, setProfilePic] = useState('');
  const navigate = useNavigate();

  const [homeAddressInput, setHomeAddressInput] = useState('');
  const [homeCoords, setHomeCoords] = useState(null);
  const [geocodingHome, setGeocodingHome] = useState(false);
  const [savingHome, setSavingHome] = useState(false);

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  useEffect(() => {
    const storedUser = localStorage.getItem("Users");
    if (!storedUser) { navigate("/login"); return; }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.points === undefined) parsedUser.points = 20;
    setUser(parsedUser);
    if (parsedUser.profilePic) setProfilePic(parsedUser.profilePic);
    if (parsedUser.skills) setSkills(parsedUser.skills);
    if (parsedUser.homeAddress) setHomeAddressInput(parsedUser.homeAddress);
    if (parsedUser.homeLat != null && parsedUser.homeLng != null) {
      setHomeCoords({ lat: Number(parsedUser.homeLat), lng: Number(parsedUser.homeLng) });
    }
  }, [navigate]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const updatedSkills = [...skills, skillInput.trim()];
    setSkills(updatedSkills);
    setSkillInput('');
    const updatedUser = { ...user, skills: updatedSkills };
    setUser(updatedUser);
    localStorage.setItem("Users", JSON.stringify(updatedUser));
    toast.success("Skill added");
  };

  const handleRemoveSkill = (i) => {
    const updatedSkills = skills.filter((_, idx) => idx !== i);
    setSkills(updatedSkills);
    const updatedUser = { ...user, skills: updatedSkills };
    setUser(updatedUser);
    localStorage.setItem("Users", JSON.stringify(updatedUser));
    toast.success("Skill removed");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePic(base64String);
        const updatedUser = { ...user, profilePic: base64String };
        setUser(updatedUser);
        localStorage.setItem("Users", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('profileUpdated'));
        toast.success("Photo updated");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    toast((t) => (
      <div className="flex flex-col gap-2.5 p-1 text-white">
        <p className="text-xs font-bold">Delete profile picture?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              setProfilePic('');
              const updatedUser = { ...user, profilePic: '' };
              setUser(updatedUser);
              localStorage.setItem("Users", JSON.stringify(updatedUser));
              window.dispatchEvent(new Event('profileUpdated'));
              toast.success("Photo removed");
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-xs font-bold hover:bg-red-500 transition"
          >
            Remove
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
      style: {
        background: '#0b1220',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '12px 16px',
      },
    });
  };

  const handleGeocodeHome = async () => {
    if (!homeAddressInput.trim()) { toast.error("Pehle address likho!"); return; }
    const plusCodePattern = /\b[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}\b\s*,?\s*/gi;
    const cleanedAddress = homeAddressInput.trim().replace(plusCodePattern, "").trim();
    const tryGeocode = async (query) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`
      );
      return res.json();
    };
    try {
      setGeocodingHome(true);
      let data = await tryGeocode(cleanedAddress || homeAddressInput.trim());
      if ((!data || data.length === 0) && cleanedAddress !== homeAddressInput.trim()) {
        data = await tryGeocode(homeAddressInput.trim());
      }
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setHomeCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
        if (cleanedAddress && cleanedAddress !== homeAddressInput.trim()) {
          setHomeAddressInput(cleanedAddress);
        }
        toast.success("Location pinpointed");
      } else {
        toast.error("Address nahi mila");
      }
    } catch (err) {
      console.error(err);
      toast.error("Location error");
    } finally {
      setGeocodingHome(false);
    }
  };

  const handleSaveHomeLocation = async () => {
    if (!homeAddressInput.trim()) { toast.error("Address required!"); return; }
    let coords = homeCoords;
    if (!coords) { await handleGeocodeHome(); return; }
    try {
      setSavingHome(true);
      const response = await fetch(`${API}/users/home-location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          homeAddress: homeAddressInput.trim(),
          homeLat: coords.lat,
          homeLng: coords.lng,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Save failed");
      const updatedUser = {
        ...user,
        homeAddress: data.user.homeAddress,
        homeLat: data.user.homeLat,
        homeLng: data.user.homeLng,
      };
      setUser(updatedUser);
      localStorage.setItem("Users", JSON.stringify(updatedUser));
      toast.success("Address saved");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Server error");
    } finally {
      setSavingHome(false);
    }
  };

  if (!user) return null;
  const hasSavedHome = user.homeLat != null && user.homeLng != null;

  return (
    <div className="min-h-screen bg-[#050a14] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Ambient aurora — subtle, no harsh glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-700/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-700/10 rounded-full blur-[140px]" />
      </div>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 flex-1">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-200 mb-6 transition"
        >
          <HiOutlineArrowLeft />
          Back to Home
        </Link>

        {/* ─── MAIN PANEL ─── */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">

          {/* HERO STRIP with avatar */}
          <div className="relative px-6 sm:px-10 pt-10 pb-8 border-b border-white/[0.06]">
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gray-500 via-gray-500 to-gray-500" />

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

              {/* AVATAR — bigger, deeper */}
              <div className="relative group shrink-0">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-red-600 to-orange-600/20 blur-xl" />
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-slate-800 ring-4 ring-[#0a1120]">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-gray-900 to-gray-600">
                      {getInitials(user.fullname || user.email)}
                    </div>
                  )}
                </div>

                {/* Upload overlay */}
                <label className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 active:opacity-100 transition cursor-pointer">
                  <HiOutlineCamera className="text-xl text-white" />
                  <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Change</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {profilePic && (
                  <button
                    onClick={handleRemovePhoto}
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#0a1120] border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/40 flex items-center justify-center transition shadow-lg"
                  >
                    <HiTrash className="text-sm" />
                  </button>
                )}
              </div>

              {/* NAME + EMAIL + TRUST */}
              <div className="flex-1 min-w-0 text-center sm:text-left pb-1">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white truncate">
                  {user.fullname || "Neighbour User"}
                </h1>
                <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <HiOutlineMail className="text-base text-slate-500" />
                  <span className="truncate">{user.email}</span>
                </p>
                <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <HiOutlineShieldCheck className="text-emerald-400 text-xs" />
                  <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                    Verified neighbour
                  </span>
                </div>
              </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
              {/* Credits */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineStar className="text-amber-400 text-base" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Credits
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{user.points ?? 20}</p>
              </div>

              {/* Skills count */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineLightningBolt className="text-blue-400 text-base" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Skills
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{skills.length}</p>
              </div>

              {/* Home status */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineLocationMarker className="text-indigo-400 text-base" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Home
                  </span>
                </div>
                <p className={`text-sm font-semibold ${hasSavedHome ? "text-emerald-400" : "text-amber-400"}`}>
                  {hasSavedHome ? "Set" : "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* ─── BODY: 2-column on desktop ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* HOME ADDRESS */}
            <section className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <HiOutlineLocationMarker className="text-blue-400 text-lg" />
                </div>
                <h2 className="text-lg font-bold text-white">Home Address</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Permanent <span>Address</span>
              </p>

              {/* Status */}
              <div className="mb-4">
                {homeCoords ? (
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">
                      Pinpointed
                    </span>
                  </div>
                ) : hasSavedHome ? (
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    <HiCheck className="text-emerald-400 text-xs" />
                    <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                      Saved
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                      Setup pending
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                <input
                  type="text"
                  value={homeAddressInput}
                  onChange={(e) => {
                    setHomeAddressInput(e.target.value);
                    setHomeCoords(null);
                  }}
                  placeholder="House no, area, city"
                  className="w-full h-11 px-4 rounded-xl bg-black/30 border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGeocodeHome}
                    disabled={geocodingHome}
                    className="flex-1 h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-200 transition disabled:opacity-50"
                  >
                    {geocodingHome ? "Locating..." : "Pinpoint"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveHomeLocation}
                    disabled={savingHome || geocodingHome}
                    className="flex-1 h-11 rounded-xl bg-gray-400 hover:bg-gray-800 text-xs font-bold uppercase tracking-wider text-black transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
                  >
                    {savingHome ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              {homeCoords && (
                <p className="text-[10px] text-slate-500 mt-3 font-mono">
                  {homeCoords.lat.toFixed(5)}, {homeCoords.lng.toFixed(5)}
                </p>
              )}
              {hasSavedHome && !homeCoords && user.homeAddress && (
                <p className="text-[11px] text-slate-400 mt-3 truncate">
                  📍 {user.homeAddress}
                </p>
              )}
            </section>

            {/* SKILLS */}
            <section className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <HiOutlineLightningBolt className="text-indigo-400 text-lg" />
                </div>
                <h2 className="text-lg font-bold text-white">Skills</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Errands you can help neighbours with (1–2 km range).
              </p>

              <form onSubmit={handleAddSkill} className="flex gap-2 mb-5">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Grocery pickup, Quick fix..."
                  className="flex-1 h-11 px-4 rounded-xl bg-black/30 border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition"
                />
                <button
                  type="submit"
                  className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                >
                  <HiPlus className="text-sm" />
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill + index}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="group flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] text-xs transition"
                    >
                      <span className="text-slate-200 font-medium">{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <HiTrash className="text-[11px]" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {skills.length === 0 && (
                  <p className="text-xs text-slate-600 italic py-2">
                    Koi skill add nahi ki abhi.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}