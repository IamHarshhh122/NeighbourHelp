import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiStar, HiCheckCircle, HiOutlineArrowLeft, HiPlus, HiTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['Parcel Receiving', 'Bank Errands', 'General Help']);
  const [profilePic, setProfilePic] = useState('');
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("Users");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.points === undefined) {
      parsedUser.points = 20;
    }
    setUser(parsedUser);
    if (parsedUser.profilePic) setProfilePic(parsedUser.profilePic);
    if (parsedUser.skills) setSkills(parsedUser.skills);
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
    toast.success("Skill added successfully! ✨");
  };

  const handleRemoveSkill = (indexToRemove) => {
    const updatedSkills = skills.filter((_, index) => index !== indexToRemove);
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
        toast.success("Profile picture updated! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    toast((t) => (
      <div className="flex flex-col gap-2.5 p-1 text-white">
        <p className="text-xs font-bold">Are you confirm to delete your profile pic?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
            }}
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
              toast.success("Profile photo removed! 🗑️");
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-xs font-bold hover:bg-red-500 transition text-white shadow-md"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, // Jab tak user click na kare tab tak rahega
      position: 'top-center',
      style: {
        background: '#090d16',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        padding: '12px 16px',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
      },
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="w-full max-w-4xl mx-auto px-4 py-10 relative z-10 my-auto">
        
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-6 transition">
          <HiOutlineArrowLeft /> Back to Home
        </Link>

        <div className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
          
          {/* PROFILE HEADER */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/10 text-center sm:text-left">
            
            {/* AVATAR & REMOVE BUTTON CONTAINER */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-3xl font-black text-white shadow-xl overflow-hidden border-2 border-white/25">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(user.fullname || user.email)}</span>
                )}
              </div>
              
              {/* Upload Overlay on hover */}
              <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[10px] font-bold text-white p-2 text-center">
                <span>Upload Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              {/* Trash icon button gol circle ke bottom-right corner mein */}
              {profilePic && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition border border-white/30 z-20"
                  title="Remove Photo"
                >
                  <HiTrash className="text-xs" />
                </button>
              )}
            </div>

            {/* USER INFO & POINTS */}
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black">{user.fullname || "Neighbour User"}</h1>
                  <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <HiOutlineMail className="text-sm" /> {user.email}
                  </p>
                </div>

                {/* 20 POINTS BADGE */}
                <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-lg">
                  <HiStar className="text-amber-400 text-xl animate-pulse" />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-amber-400/80">Karma Points</p>
                    <p className="text-lg font-black">{user.points ?? 20} pts</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SKILLS SECTION */}
          <div className="mt-8">
            <h2 className="text-lg font-black mb-2 flex items-center gap-2">
              <HiCheckCircle className="text-blue-400" /> What I Can Help With (My Skills)
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Add tasks or errands you can help your nearby neighbours with within a 1-2 km range.
            </p>

            <form onSubmit={handleAddSkill} className="flex gap-2 mb-6">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g., Grocery pickup, Quick fix, Document drop..."
                className="flex-1 h-11 px-4 rounded-xl bg-slate-950 border border-white/10 text-sm outline-none focus:border-blue-500 text-white"
              />
              <button
                type="submit"
                className="px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-blue-600/20 text-white"
              >
                <HiPlus className="text-base" /> Add Skill
              </button>
            </form>

            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs font-bold text-slate-200">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="text-slate-400 hover:text-red-400 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}