import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Filter, Clock, Droplet, Heart, Activity, Star, ChevronDown, Plus, CheckCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCity } from "../context/CityContext";
import { API_BASE_URL } from "../api/client.js";

const LabTests = () => {
  const { selectedCity, updateCity } = useCity();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [labTests, setLabTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  const CITIES = [
    "Bangalore", "Delhi", "Mumbai", "Chennai", "Hyderabad",
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"
  ];

  const CATEGORIES = [
    { id: "all", name: "All Tests", icon: Activity },
    { id: "blood", name: "Blood Tests", icon: Droplet },
    { id: "thyroid", name: "Thyroid", icon: Heart },
    { id: "diabetes", name: "Diabetes", icon: Activity },
    { id: "liver", name: "Liver", icon: Heart },
    { id: "kidney", name: "Kidney", icon: Activity },
    { id: "infection", name: "Infection", icon: Activity },
  ];

  const HEALTH_CONCERNS = [
    { name: "Fever", icon: Activity, color: "from-red-500 to-red-600" },
    { name: "Diabetes", icon: Heart, color: "from-blue-500 to-blue-600" },
    { name: "Skin", icon: Heart, color: "from-green-500 to-green-600" },
    { name: "Kidney", icon: Activity, color: "from-purple-500 to-purple-600" },
    { name: "Digestion", icon: Heart, color: "from-orange-500 to-orange-600" },
    { name: "Cancer", icon: Activity, color: "from-pink-500 to-pink-600" },
  ];

  useEffect(() => {
    fetchLabTests();
    fetchPackages();
  }, [selectedCategory]);

  const fetchLabTests = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);

      const response = await fetch(`${API_BASE_URL}/lab-tests?${params}`);
      const data = await response.json();

      if (data.success) {
        setLabTests(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch lab tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages?popular=true&limit=6`);
      const data = await response.json();

      if (data.success) {
        setPackages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchLabTests();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/lab-tests/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success) {
        setLabTests(data.data);
      }
    } catch (error) {
      console.error("Failed to search lab tests:", error);
    }
  };

  const addToCart = (test) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === test._id);
      if (existing) {
        return prev.map(item =>
          item._id === test._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...test, quantity: 1 }];
    });
  };

  const filteredTests = labTests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Book Lab Tests Online
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get accurate results with home sample collection at affordable prices
            </p>
          </motion.div>

          {/* SEARCH BAR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-xl border border-gray-200"
          >
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for tests, packages & profiles"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>

              {/* City Selector */}
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => updateCity(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg appearance-none bg-white"
                >
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Search Tests
            </button>
          </motion.div>
        </div>
      </section>

      {/* HEALTH CONCERNS */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Find Tests by Health Concern
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {HEALTH_CONCERNS.map((concern, idx) => (
              <motion.button
                key={concern.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${concern.color} text-white rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <concern.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-center">{concern.name}</h3>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* RECOMMENDED TESTS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-4">Recommended Tests</h2>
            <p className="text-gray-600 text-lg">Most popular diagnostic tests</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.slice(0, 6).map((test, idx) => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{test.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{test.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-blue-600">₹{test.price}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {test.reportTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplet className="w-4 h-4" />
                      {test.sampleType}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(test)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Cart
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HEALTH PACKAGES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-4">Health Checkup Packages</h2>
            <p className="text-gray-600 text-lg">Comprehensive health packages at discounted prices</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
              >
                {pkg.discountPercentage > 0 && (
                  <div className="bg-red-500 text-white text-sm font-bold px-4 py-2 text-center">
                    {pkg.discountPercentage}% OFF
                  </div>
                )}

                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-black text-gray-900">₹{pkg.discountedPrice}</span>
                      {pkg.originalPrice > pkg.discountedPrice && (
                        <span className="text-lg text-gray-500 line-through">₹{pkg.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{pkg.testsIncluded?.length || 0} tests included</p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Home sample collection
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Reports in {pkg.reportTime}
                    </div>
                  </div>

                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors">
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-4">Why Book With Us?</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: "Free Home Sample Collection",
                desc: "Certified phlebotomists collect samples from your doorstep"
              },
              {
                icon: Clock,
                title: "Reports in 24 Hours",
                desc: "Get your test results delivered digitally within 24 hours"
              },
              {
                icon: Star,
                title: "Affordable Pricing",
                desc: "Up to 70% off on diagnostic tests and health packages"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "15M+", label: "Users Served" },
              { value: "2,00,000", label: "Doctors" },
              { value: "9", label: "Cities" },
              { value: "1000+", label: "Tests Available" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-black text-blue-400 mb-2">{stat.value}</div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-4">What Our Users Say</h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-4 italic">
                "Excellent service! The home sample collection was very convenient and I got my reports within 24 hours. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  R
                </div>
                <div>
                  <div className="font-bold text-gray-900">Rajesh Kumar</div>
                  <div className="text-gray-500 text-sm">Mumbai</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LabTests;