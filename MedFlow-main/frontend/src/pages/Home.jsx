import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AISearchBox from "../components/AISearchBox";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, HeartPulse, Brain, Activity, UserRound, ArrowRight, MapPin, Sparkles, Smile, ShieldCheck, Heart, Star, CalendarCheck, Shield, CheckCircle2, Clock, Award, ChevronDown, Stethoscope, TestTube, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCity } from "../context/CityContext";
import { API_BASE_URL } from "../api/client.js";

const Home = () => {
  const navigate = useNavigate();
  const { selectedCity, updateCity } = useCity();

  const [searchSpec, setSearchSpec] = useState("");
  const [searchLoc, setSearchLoc] = useState("");
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [topDoctors, setTopDoctors] = useState([]);
  const [popularTests, setPopularTests] = useState([]);
  const [popularPackages, setPopularPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const CITIES = [
    "Bangalore", "Delhi", "Mumbai", "Chennai", "Hyderabad",
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, doctorsRes, testsRes, packagesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/public/stats`).then(r => r.json()),
          fetch(`${API_BASE_URL}/doctors`).then(r => r.json()),
          fetch(`${API_BASE_URL}/lab-tests?popular=true&limit=6`).then(r => r.json()),
          fetch(`${API_BASE_URL}/packages/popular?limit=3`).then(r => r.json())
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (doctorsRes.success) setTopDoctors(doctorsRes.data.slice(0, 3));
        if (testsRes.success) setPopularTests(testsRes.data);
        if (packagesRes.success) setPopularPackages(packagesRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchSpec) params.append("specialization", searchSpec);
    if (selectedCity) params.append("city", selectedCity);
    navigate(`/find-doctors?${params.toString()}`);
  };

  const SPECIALTIES = [
    { name: "General Physician", icon: UserRound, color: "from-blue-500 to-blue-600" },
    { name: "Dentist", icon: Smile, color: "from-emerald-500 to-emerald-600" },
    { name: "Dermatologist", icon: Sparkles, color: "from-fuchsia-500 to-fuchsia-600" },
    { name: "Cardiologist", icon: HeartPulse, color: "from-rose-500 to-rose-600" },
    { name: "Neurologist", icon: Brain, color: "from-purple-500 to-purple-600" },
    { name: "Psychiatrist", icon: Activity, color: "from-amber-500 to-amber-600" },
  ];

  const TRUST_FEATURES = [
    {
      icon: Shield,
      title: "Insurance Coverage",
      desc: "Find doctors who accept your insurance plan",
      action: "Browse Doctors"
    },
    {
      icon: Star,
      title: "Verified Reviews",
      desc: "Authentic patient feedback and ratings",
      action: "Read Reviews"
    },
    {
      icon: CalendarCheck,
      title: "Book Instantly",
      desc: "Schedule appointments in real-time",
      action: "Book Now"
    }
  ];

  const handleTrustAction = () => {
    navigate("/find-doctors");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-40 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
          {/* Background Graphics */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animation-float"></div>
            <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animation-float" style={{ animationDelay: "1s" }}></div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/3 left-1/2 w-72 h-72 border border-emerald-500/5 rounded-full"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
             className="mb-8"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.2]">
                Find and book the <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">best doctors</span> near you
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
                Read verified reviews, compare qualifications, and book appointments instantly
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              onSubmit={handleHeroSearch}
              className="max-w-4xl mx-auto bg-white p-2 md:p-3 rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                {/* Specialization Input */}
                <div className="flex-1 flex items-center px-6 py-4 md:py-3">
                  <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={searchSpec}
                    onChange={(e) => setSearchSpec(e.target.value)}
                    placeholder="Doctor name or specialty..."
                    className="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 focus:outline-none font-medium text-base"
                  />
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px bg-slate-200"></div>

                {/* City Selector */}
                <div className="flex-1 flex items-center px-6 py-4 md:py-3 relative">
                  <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => updateCity(e.target.value)}
                    className="w-full bg-transparent border-none text-slate-900 focus:outline-none font-medium text-base appearance-none"
                  >
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 ml-2 shrink-0 pointer-events-none" />
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 md:py-3 font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 duration-200 m-1 rounded-xl"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>
            </motion.form>
          </div>
        </section>

        {/* AI SEARCH SECTION */}
        <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <AISearchBox />
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="py-24 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-center mb-4 text-slate-900"
            >
              Why choose MedFlow?
            </motion.h2>
            <p className="text-center text-slate-600 text-lg font-medium mb-16 max-w-2xl mx-auto">
              Everything you need to find, compare, and book the right healthcare provider
            </p>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
              {TRUST_FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 hover:border-emerald-200 transition-all hover:shadow-xl"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mb-8 group-hover:scale-110 transform transition-transform duration-300 shadow-lg">
                      <Icon className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">{feature.title}</h3>
                    <p className="text-slate-600 font-medium mb-6 leading-relaxed">{feature.desc}</p>
                    <button
                      onClick={handleTrustAction}
                      className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 group/btn"
                    >
                      {feature.action}
                      <ArrowRight className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TOP SPECIALTIES */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Most Searched Specialties</h2>
              <p className="text-lg text-slate-600 font-medium">Access healthcare providers across all major specializations</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
              {SPECIALTIES.map((spec, idx) => (
                <motion.button
                  key={spec.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  onClick={() => navigate(`/find-doctors?specialization=${encodeURIComponent(spec.name)}`)}
                  className="group flex flex-col items-center p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-400 transition-all transform hover:-translate-y-2 duration-300"
                >
                  <div className={`p-4 rounded-2xl mb-4 bg-gradient-to-br ${spec.color} text-white group-hover:scale-110 transform transition-transform duration-300 shadow-lg`}>
                    <spec.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-center leading-tight group-hover:text-emerald-600 transition-colors">{spec.name}</h3>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* TOP DOCTORS */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Top Rated Providers</h2>
              <p className="text-lg text-slate-600 font-medium">Trusted by thousands of patients</p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="inline-flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
                  <span className="text-slate-600 font-medium">Loading providers...</span>
                </div>
              </div>
            ) : topDoctors.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
                {topDoctors.map((doc, idx) => (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all transform hover:-translate-y-2 duration-300"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{doc.name}</h3>
                        <p className="text-emerald-600 font-bold text-lg mt-2">{doc.specialization}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-sm">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-sm text-slate-900">4.8</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8 bg-white rounded-2xl p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600" />
                          Experience
                        </span>
                        <span className="text-slate-900 font-bold">{doc.experience || "5+ yrs"}</span>
                      </div>
                      <div className="h-px bg-slate-200"></div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Consultation
                        </span>
                        <span className="text-emerald-600 font-black">₹{doc.fee}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/doctor/${doc._id}`)}
                      className="w-full py-3.5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold transition-all shadow-sm flex items-center justify-center gap-2 group/btn"
                    >
                      View Profile
                      <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium text-lg">No providers available</p>
              </div>
            )}
          </div>
        </section>

        {/* LAB TESTS SECTION */}
        <section className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Book Lab Tests Online</h2>
              <p className="text-lg text-slate-600 font-medium">Get accurate results with home sample collection at affordable prices</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {popularTests.slice(0, 6).map((test, idx) => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">{test.name}</h3>
                      <p className="text-slate-600 text-sm mb-3">{test.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-blue-600">₹{test.price}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {test.reportTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <TestTube className="w-4 h-4" />
                      {test.sampleType}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/lab-tests')}
                    className="w-full py-3 rounded-xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-bold transition-all"
                  >
                    Book Test
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/lab-tests')}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                View All Tests
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </section>

        {/* HEALTH PACKAGES SECTION */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Health Checkup Packages</h2>
              <p className="text-lg text-slate-600 font-medium">Comprehensive health packages at discounted prices</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {popularPackages.map((pkg, idx) => (
                <motion.div
                  key={pkg._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-green-300 transition-all transform hover:-translate-y-2"
                >
                  {pkg.discountPercentage > 0 && (
                    <div className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg text-center mb-4 w-fit">
                      {pkg.discountPercentage}% OFF
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{pkg.name}</h3>
                  <p className="text-slate-600 font-medium mb-6 leading-relaxed">{pkg.description}</p>

                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-black text-slate-900">₹{pkg.discountedPrice}</span>
                      {pkg.originalPrice > pkg.discountedPrice && (
                        <span className="text-xl text-slate-500 line-through">₹{pkg.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{pkg.testsIncluded?.length || 0} tests included</p>
                  </div>

                  <div className="space-y-3 mb-8 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Home sample collection
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Reports in {pkg.reportTime}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/lab-tests')}
                    className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Book Package
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-t border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
              {[
                { label: "Active Providers", value: stats.doctors, icon: CheckCircle2, color: "from-emerald-500 to-emerald-600" },
                { label: "Happy Patients", value: stats.patients, icon: Heart, color: "from-rose-500 to-rose-600" },
                { label: "Appointments Booked", value: stats.appointments, icon: CalendarCheck, color: "from-blue-500 to-blue-600" },
                { label: "Lab Tests Available", value: "1000+", icon: TestTube, color: "from-purple-500 to-purple-600" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-10 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 backdrop-blur-xl text-center group hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transform transition-transform duration-300 shadow-lg`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
                    {stat.label}
                  </p>
                  <h4 className="text-5xl md:text-6xl font-black text-white">{stat.value}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Ready to book an appointment?</h2>
              <p className="text-lg text-slate-600 font-medium mb-10">Start your search now and connect with trusted healthcare providers</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/find-doctors")}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                Find Doctors Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        .animation-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
