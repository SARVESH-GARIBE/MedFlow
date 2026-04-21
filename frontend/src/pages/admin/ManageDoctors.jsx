import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import Navbar from "../../components/Navbar";

// Get base URL logic similar to apiClient to keep it working
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctors = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("medflow_admin_token");
      // Use correct endpoint for extracting doctors: /admin/users?role=doctor
      const res = await axios.get(`${API_BASE_URL}/admin/users?role=doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load doctors");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDoctors(true);
    
    // Polling every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDoctors(false); // fetch without showing loading spinner
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (id) => {
    try {
      const token = localStorage.getItem("medflow_admin_token");
      await axios.put(
        `${API_BASE_URL}/admin/users/${id}/verify`,
        { isVerified: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update state immediately for better UX
      setDoctors((prev) =>
        prev.map((doc) => (doc._id === id ? { ...doc, status: "verified" } : doc))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to verify doctor");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("medflow_admin_token");
      await axios.put(
        `${API_BASE_URL}/admin/users/${id}/reject`,
        { rejectionReason: "Admin rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoctors((prev) =>
        prev.map((doc) => (doc._id === id ? { ...doc, status: "rejected" } : doc))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject doctor");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Verified
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-cyan-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-5 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Doctor Verification Dashboard</h1>
            <p className="text-slate-400">Manage and verify new doctor registrations</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-300 text-sm border-b border-slate-700">
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Specialization</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No doctors found in the system.
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doctor) => (
                      <tr 
                        key={doctor._id} 
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-white">{doctor.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                          {doctor.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                          {doctor.specialization || "General"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(doctor.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            {doctor.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleVerify(doctor._id)}
                                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/20 hover:border-transparent transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(doctor._id)}
                                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-transparent transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {doctor.status === "verified" && (
                              <button
                                onClick={() => handleReject(doctor._id)}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-red-500 hover:text-white transition-all"
                              >
                                Revoke
                              </button>
                            )}
                            {doctor.status === "rejected" && (
                              <button
                                onClick={() => handleVerify(doctor._id)}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-green-500 hover:text-white transition-all"
                              >
                                Re-Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageDoctors;
