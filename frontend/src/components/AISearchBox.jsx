import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaRobot, FaMapMarkerAlt } from 'react-icons/fa';
import { CityContext } from '../context/CityContext';

const AISearchBox = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedCity } = useContext(CityContext);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);
    try {
      const symptomArray = symptoms.split(',').map(s => s.trim()).filter(s => s);
      navigate('/ai-results', {
        state: {
          symptoms: symptomArray,
          city: selectedCity
        }
      });
    } catch (error) {
      console.error('AI Search Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const commonSearches = [
    'fever, headache', 'skin rash, itching', 'chest pain, shortness of breath',
    'tooth pain, swelling', 'anxiety, stress', 'eye pain, blurred vision'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
          >
            <FaRobot className="text-yellow-300" />
            <span className="text-sm font-medium">AI-Powered</span>
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">Find the right doctor instantly with AI</h2>
          <p className="text-white/90 text-lg">
            Tell us your symptoms and we'll match you with the best specialists
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Symptoms Input */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. fever, headache, chest pain"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
            />
          </div>

          {/* City Display */}
          <div className="flex items-center justify-center gap-2 text-white/90">
            <FaMapMarkerAlt />
            <span className="text-sm">Searching in: <strong>{selectedCity}</strong></span>
          </div>

          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={loading || !symptoms.trim()}
            className="w-full bg-white text-teal-600 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                Finding Best Doctors...
              </>
            ) : (
              <>
                <FaRobot />
                Find Best Doctor
              </>
            )}
          </motion.button>

          {/* Common Searches */}
          <div className="text-center">
            <p className="text-white/80 text-sm mb-2">Common searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {commonSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSymptoms(search)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full px-3 py-1 text-xs transition-colors duration-200"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AISearchBox;