import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { apiClient } from '../../api/client';
import { cn } from '../../utils/helpers';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'patient';
  
  const [role, setRole] = useState(initialRole);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) navigate(`/${user.role === 'doctor' ? 'doctor' : 'patient'}`);
  }, [user, navigate]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
    setPassword('');
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const data = await apiClient.post('/auth/login', { email, password });
      
      if (data.success) {
        if(role === 'doctor' && data.user.role !== 'doctor') {
          throw new Error("Invalid doctor credentials");
        }
        if(role === 'patient' && data.user.role !== 'patient') {
          throw new Error("Invalid patient credentials");
        }

        login(data.user, data.token);
        if (data.user.role === 'doctor') {
          navigate('/doctor');
        } else {
          navigate('/patient');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <Navbar />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 shadow-2xl backdrop-blur-xl overflow-hidden ring-1 ring-slate-600/10">
            
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-700/40 bg-gradient-to-b from-slate-800/50 to-transparent">
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                  Welcome back
                </h2>
                <p className="text-sm font-medium text-slate-400">
                  Sign in to your account to continue
                </p>
              </div>
            </div>

            {/* Role Selector */}
            <div className="px-8 pt-8 pb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Choose Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole('patient')}
                  className={cn(
                    "py-3.5 px-4 rounded-2xl font-bold transition-all duration-300 border-2 flex flex-col items-center gap-2",
                    role === 'patient'
                      ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : "bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-300"
                  )}
                >
                  <span className="text-xl">👤</span>
                  <span className="text-xs">Patient</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole('doctor')}
                  className={cn(
                    "py-3.5 px-4 rounded-2xl font-bold transition-all duration-300 border-2 flex flex-col items-center gap-2",
                    role === 'doctor'
                      ? "bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border-cyan-500/60 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                      : "bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300"
                  )}
                >
                  <span className="text-xl">👨‍⚕️</span>
                  <span className="text-xs">Doctor</span>
                </motion.button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-8 mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-rose-200">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
              
              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Email Address</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-900/50 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Password</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-900/50 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-4 mt-2 rounded-2xl font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-2 text-lg",
                  role === 'patient'
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                )}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-700/40 bg-gradient-to-t from-slate-800/30 to-transparent">
              <p className="text-sm font-medium text-slate-400 text-center">
                {role === 'patient' ? "Don't have an account?" : "Want to join as a provider?"}
                {' '}
                {role === 'patient' ? (
                  <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                    Create Account
                  </Link>
                ) : (
                  <Link to="/doctor-onboarding" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                    Apply Now
                  </Link>
                )}
              </p>
            </div>
          </div>

          {/* Demo Credentials Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur"
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Demo Credentials
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p><span className="text-slate-400 font-medium">Patient:</span> patient@example.com / password</p>
              <p><span className="text-slate-400 font-medium">Doctor:</span> doctor@example.com / password</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
