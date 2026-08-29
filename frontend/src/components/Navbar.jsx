import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineLocationMarker, HiOutlineMenu, HiOutlineX, HiStar, HiLogout } from 'react-icons/hi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // User data load karne ka function
  const loadUser = () => {
    const storedUser = localStorage.getItem("Users");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  useEffect(() => {
    loadUser();

    // Custom event sunne ke liye taaki profile update hote hi navbar refresh ho jaye
    window.addEventListener('storage', loadUser);
    window.addEventListener('profileUpdated', loadUser);

    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('profileUpdated', loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Users");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <header className="w-full bg-slate-900/80 border-b border-white/10 text-white backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        
        {/* BRAND LOGO */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
            <HiOutlineLocationMarker className="text-xl text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Neighbour<span className="text-blue-400">Help</span>
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-slate-300">
          <Link to="/" className="hover:text-blue-400 transition">Home</Link>
          <Link to="/micro-tasks">Micro-Tasks</Link>
          <Link to="/community" className="hover:text-blue-400 transition">Community</Link>
          <Link to="/about" className="hover:text-blue-400 transition">About</Link>
        </nav>

        {/* AUTH / PROFILE SECTION (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Points Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <HiStar className="text-amber-400 text-sm" />
                <span>{user.points ?? 20} pts</span>
              </div>

              {/* Profile Avatar linked to /profile */}
              <Link to="/profile" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md border border-white/20 overflow-hidden">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.fullname} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(user.fullname || user.email)}</span>
                  )}
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition"
                title="Logout"
              >
                <HiLogout className="text-lg" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-2xl text-slate-300 hover:text-white focus:outline-none"
        >
          {isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>

      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-white/10 px-4 py-5 flex flex-col gap-4 backdrop-blur-xl">
          {user && (
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md overflow-hidden">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.fullname} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(user.fullname || user.email)}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{user.fullname || "Neighbour"}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
              </Link>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <HiStar className="text-amber-400" />
                <span>{user.points ?? 20}</span>
              </div>
            </div>
          )}

          <Link to="/" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-blue-400">Home</Link>
          <Link to="/tasks" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-blue-400">Micro-Tasks</Link>
          <Link to="/community" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-blue-400">Community</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-blue-400">About</Link>
          {user && <Link to="/profile" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-blue-400">My Profile & Skills</Link>}

          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
            {user ? (
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold border border-white/10 bg-white/[0.03] text-slate-300">Login</Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-blue-400">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}