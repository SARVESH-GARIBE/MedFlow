import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { apiClient } from '../../api/client';

const Register = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  
  // Fix Navigation Loop
  useEffect(() => {
    if (user) navigate(`/${user.role === 'doctor' ? 'doctor' : 'patient'}`);
  }, [user, navigate]);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple clicks
    setError('');
    setLoading(true);

    try {
      const data = await apiClient.post('/auth/register', { name, email, password });
      
      if (data.success) {
        login(data.user, data.token);
        navigate('/patient');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-full max-w-md p-8 rounded-2xl border border-slate-800 bg-slate-800/40">
          <h2 className="text-2xl font-semibold mb-6 text-center">Create Patient Account</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/50 text-white outline-none focus:border-emerald-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/50 text-white outline-none focus:border-emerald-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/50 text-white outline-none focus:border-emerald-500"
                placeholder="Choose a strong password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-semibold hover:from-emerald-300 hover:to-cyan-300 transition-colors disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login?role=patient" className="text-emerald-400 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
