import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { apiClient } from '../../api/client';

const DoctorOnboarding = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Fix Navigation Loop
  useEffect(() => {
    if (user) navigate(`/${user.role === 'doctor' ? 'doctor' : 'patient'}`);
  }, [user, navigate]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    fee: '',
    availability: 'Available',
    aadhaarNumber: '',
    panNumber: '',
    medicalRegistrationNumber: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = { ...formData, fee: Number(formData.fee) };

      if (!payload.fee || payload.fee <= 0) {
        setError("Fee must be a valid positive number");
        setLoading(false);
        return;
      }

      const data = await apiClient.post('/doctors/register', payload);

      if (data.success) {
        setSuccessMsg("Your profile is under verification");
      }
    } catch (err) {
      setError(err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/50 text-white outline-none focus:border-cyan-500";

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-full max-w-xl p-8 rounded-2xl border border-slate-800 bg-slate-800/40">
          <h2 className="text-2xl font-semibold mb-2 text-center">Doctor Onboarding</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Create your profile to start accepting appointments.</p>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              {successMsg}
              <div className="mt-3">
                <Link to="/" className="underline font-medium hover:text-emerald-300">Return to Home</Link>
              </div>
            </div>
          )}

          {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Dr. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="doctor@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Secure password"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g. Cardiology"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g. 10"
                />
              </div>
               <div>
                <label className="block text-sm text-slate-400 mb-1">Consultation Fee (₹)</label>
                <input
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="12-digit format"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">PAN Card Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="10-character code"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Medical Registration Number</label>
                <input
                  type="text"
                  name="medicalRegistrationNumber"
                  value={formData.medicalRegistrationNumber}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g. MCI-12345"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold hover:from-cyan-300 hover:to-blue-400 transition-colors disabled:opacity-70"
            >
              {loading ? 'Creating profile...' : 'Complete Onboarding'}
            </button>
          </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            Already registered?{' '}
            <Link to="/login?role=doctor" className="text-cyan-400 hover:underline">
              Log in as Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorOnboarding;
