import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Menu, X, ChevronDown, Activity, HeartPulse, Brain, Eye, Sparkles, Smile, ArrowRight, Sun, Moon } from "lucide-react";
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [browseTab, setBrowseTab] = useState("specialties");
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { mode, toggleMode } = useTheme();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardRoute = user?.role === 'doctor' ? '/doctor' : '/patient';

  const SPECIALTIES_LIST = [
    { name: "General Physician", icon: Activity },
    { name: "Dentist", icon: Smile },
    { name: "Dermatologist", icon: Sparkles },
    { name: "Cardiologist", icon: HeartPulse },
    { name: "Neurologist", icon: Brain },
    { name: "Eye Doctor", icon: Eye },
  ];

  const PROCEDURES_LIST = [
    { name: "Teeth Cleaning", icon: Smile },
    { name: "Skin Treatment", icon: Sparkles },
    { name: "Heart Checkup", icon: HeartPulse },
    { name: "Eye Exam", icon: Eye },
    { name: "Mental Therapy", icon: Activity },
  ];

  const handleBrowseClick = (item) => {
    setIsBrowseOpen(false);
    navigate(`/find-doctors?specialization=${encodeURIComponent(item.name)}`);
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 border-b ${isScrolled ? "bg-slate-900/95 border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.35)]" : "bg-slate-900/80 border-slate-800/50"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setIsOpen(false)}>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                <img src={logo} alt="MedFlow Logo" className="h-7 w-7 object-contain" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold text-white tracking-tight">MedFlow</div>
              </div>
            </Link>

            {/* CENTER NAV */}
            <div className="hidden lg:flex items-center gap-2 lg:gap-8 ml-12">
              <button 
                onClick={() => setIsBrowseOpen(true)}
                className={`px-4 py-2 rounded-lg text-[15px] font-semibold transition-all flex items-center gap-2 focus:outline-none ${isBrowseOpen ? "text-emerald-400 bg-emerald-500/10" : "text-slate-200 hover:text-emerald-400 hover:bg-slate-800/30"}`}
              >
                Browse <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isBrowseOpen ? "rotate-180" : ""}`} />
              </button>
              
              <NavLink to="/find-doctors" className={({ isActive }) => `px-4 py-2 rounded-lg text-[15px] font-semibold transition-all ${isActive ? "text-emerald-400 bg-emerald-500/10" : "text-slate-200 hover:text-emerald-400 hover:bg-slate-800/30"}`} onClick={() => setIsOpen(false)}>
                Find Doctors
              </NavLink>

              <NavLink to="/lab-tests" className={({ isActive }) => `px-4 py-2 rounded-lg text-[15px] font-semibold transition-all ${isActive ? "text-emerald-400 bg-emerald-500/10" : "text-slate-200 hover:text-emerald-400 hover:bg-slate-800/30"}`} onClick={() => setIsOpen(false)}>
                Lab Tests
              </NavLink>

              <NavLink to="/book" className={({ isActive }) => `px-4 py-2 rounded-lg text-[15px] font-semibold transition-all ${isActive ? "text-emerald-400 bg-emerald-500/10" : "text-slate-200 hover:text-emerald-400 hover:bg-slate-800/30"}`} onClick={() => setIsOpen(false)}>
                Book Appointment
              </NavLink>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3 ml-auto">
              <button onClick={toggleMode} type="button" className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-700 transition-all duration-300">
                {mode === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              {token ? (
                <div className="hidden sm:flex items-center gap-2">
                  <NotificationDropdown />
                  <motion.button type="button" onClick={() => navigate(dashboardRoute)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-300">
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  </motion.button>
                  <motion.button type="button" onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-transparent hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 px-3 py-2 text-sm font-semibold transition-all duration-300">
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <motion.button type="button" onClick={() => navigate("/login")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/10 text-white px-4 py-2 text-sm font-semibold transition-all duration-300">
                    Log In
                  </motion.button>
                  <motion.button type="button" onClick={() => navigate("/login")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-2 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300">
                    Sign Up
                  </motion.button>
                </div>
              )}

              <button type="button" onClick={() => setIsOpen((v) => !v)} className="inline-flex items-center justify-center rounded-lg p-2 text-slate-200 hover:bg-slate-800 transition-colors lg:hidden" aria-label="Toggle navigation">
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE NAV DROP DOWN */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="lg:hidden border-t border-slate-800 bg-slate-900 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                <button 
                  onClick={() => { setIsOpen(false); setIsBrowseOpen(true); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-base font-semibold text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-between"
                >
                  Browse <ChevronDown className="w-4 h-4" />
                </button>
                <NavLink to="/find-doctors" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-lg text-base font-semibold transition-colors ${isActive ? "bg-emerald-500/10 text-emerald-400" : "text-slate-200 hover:bg-slate-800"}`}>
                  Find Doctors
                </NavLink>
                <NavLink to="/lab-tests" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-lg text-base font-semibold transition-colors ${isActive ? "bg-emerald-500/10 text-emerald-400" : "text-slate-200 hover:bg-slate-800"}`}>
                  Lab Tests
                </NavLink>
                <NavLink to="/book" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-lg text-base font-semibold transition-colors ${isActive ? "bg-emerald-500/10 text-emerald-400" : "text-slate-200 hover:bg-slate-800"}`}>
                  Book Appointment
                </NavLink>
              </div>
              <div className="p-4 border-t border-slate-800 grid gap-3">
                {token ? (
                  <>
                    <button type="button" onClick={() => { navigate(dashboardRoute); setIsOpen(false); }} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 text-white px-4 py-3 text-sm font-bold">
                      <LayoutDashboard className="w-4 h-4 text-emerald-400" /> Dashboard
                    </button>
                    <button type="button" onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 text-rose-400 px-4 py-3 text-sm font-bold">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { navigate("/login"); setIsOpen(false); }} className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-500 text-slate-900 px-4 py-3 text-base font-bold">
                      Log In
                    </button>
                    <button type="button" onClick={() => { navigate("/login"); setIsOpen(false); }} className="w-full inline-flex items-center justify-center rounded-lg border border-slate-700 text-white px-4 py-3 text-base font-bold">
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* BROWSE MODAL */}
      <AnimatePresence>
        {isBrowseOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]" 
              onClick={() => setIsBrowseOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -30 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-[95vw] max-w-5xl bg-slate-900 border border-slate-700/60 rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] z-[101] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-slate-800/60 bg-slate-900/70 backdrop-blur">
                <div className="flex gap-12">
                  <button 
                    onClick={() => setBrowseTab("specialties")}
                    className={`font-bold text-lg transition-all relative pb-3 ${browseTab === "specialties" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    Specialties
                    {browseTab === "specialties" && (
                      <motion.div layoutId="browseTab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
                    )}
                  </button>
                  <button 
                    onClick={() => setBrowseTab("procedures")}
                    className={`font-bold text-lg transition-all relative pb-3 ${browseTab === "procedures" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    Procedures
                    {browseTab === "procedures" && (
                      <motion.div layoutId="browseTab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
                    )}
                  </button>
                </div>
                <button 
                  onClick={() => setIsBrowseOpen(false)} 
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content Grid */}
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto">
                {(browseTab === "specialties" ? SPECIALTIES_LIST : PROCEDURES_LIST).map((item, idx) => (
                  <motion.button 
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleBrowseClick(item)}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-slate-800/20 border border-slate-800/40 hover:bg-slate-800/50 hover:border-emerald-500/40 transition-all group shadow-sm hover:shadow-[0_8px_24px_rgba(16,185,129,0.1)]"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-7 h-7 text-slate-400 group-hover:text-emerald-400 transition-colors" strokeWidth={1.5} />
                    </div>
                    <span className="font-semibold text-slate-200 group-hover:text-white leading-tight text-left">{item.name}</span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 ml-auto transition-colors opacity-0 group-hover:opacity-100" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;