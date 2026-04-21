import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaRobot, FaMapMarkerAlt, FaCalendarAlt, FaRupeeSign, FaStar, FaUserMd, FaCheckCircle } from 'react-icons/fa';
import RatingStars from '../components/RatingStars';
import { CityContext } from '../context/CityContext';

const AIResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCity } = useContext(CityContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { symptoms, city } = location.state || {};

  useEffect(() => {
    if (!symptoms || !city) {
      navigate('/');
      return;
    }
    fetchRecommendations();
  }, [symptoms, city]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/v1/ai/recommend-doctors', {
        symptoms,
        city
      });

      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch doctor recommendations. Please try again.');
      console.error('AI Recommendation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctorId) => {
    navigate('/book-appointment', { state: { doctorId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-xl">AI is finding the best doctors for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <FaRobot className="text-6xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <FaRobot className="text-teal-400" />
              <span className="text-sm font-medium">AI Recommended</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Top doctors for your symptoms</h1>
            <p className="text-gray-300 text-lg">
              Based on your symptoms: <span className="text-teal-400 font-medium">{symptoms.join(', ')}</span>
            </p>
            <p className="text-gray-400 flex items-center justify-center gap-2 mt-2">
              <FaMapMarkerAlt />
              in {city}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {doctors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white py-16"
          >
            <FaUserMd className="text-6xl text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No exact matches found</h3>
            <p className="text-gray-400 mb-6">Try different symptoms or check other cities</p>
            <button
              onClick={() => navigate('/')}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Search Again
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 ${
                  index === 0 ? 'ring-2 ring-teal-400 shadow-2xl shadow-teal-400/20' : ''
                }`}
              >
                {index === 0 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      Top Match
                    </div>
                  </div>
                )}

                {/* Doctor Image */}
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <FaUserMd className="text-white text-2xl" />
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="text-center text-white mb-4">
                  <h3 className="text-xl font-bold mb-1">{doctor.name}</h3>
                  <p className="text-teal-400 font-medium mb-2">{doctor.specialization}</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <RatingStars rating={doctor.rating} size="text-base" />
                    <span className="text-gray-300">({doctor.rating})</span>
                  </div>
                  <p className="text-gray-300 text-sm">{doctor.experience} years experience</p>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-gray-300 text-sm">
                    <span>Consultation Fee</span>
                    <span className="flex items-center text-green-400 font-semibold">
                      <FaRupeeSign className="text-xs" />
                      {doctor.consultationFee}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300 text-sm">
                    <span>Availability</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <FaCheckCircle className="text-xs" />
                      Available Today
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBookAppointment(doctor._id)}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaCalendarAlt className="text-sm" />
                    Book Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center"
                  >
                    Chat
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIResults;