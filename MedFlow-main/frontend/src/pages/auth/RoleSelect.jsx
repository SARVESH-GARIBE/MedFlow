import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope } from 'lucide-react';
import Navbar from '../../components/Navbar';

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-3xl font-semibold mb-2">Welcome to MedFlow</h1>
        <p className="text-slate-400 mb-10 text-center max-w-md">
          Please select your role to continue. Patients can book appointments, while doctors can manage their schedules.
        </p>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Patient Card */}
          <button
            onClick={() => navigate('/login?role=patient')}
            className="flex flex-col items-center p-8 rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all group"
          >
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Continue as Patient</h2>
            <p className="text-sm text-slate-400 text-center">
              Book appointments, track history, and manage your health journey.
            </p>
          </button>

          {/* Doctor Card */}
          <button
            onClick={() => navigate('/login?role=doctor')}
            className="flex flex-col items-center p-8 rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/60 hover:cyan-500/50 transition-all group"
          >
            <div className="h-16 w-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Stethoscope className="h-8 w-8 text-cyan-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Continue as Doctor</h2>
            <p className="text-sm text-slate-400 text-center">
              Manage your schedule, view patient records, and track earnings.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
