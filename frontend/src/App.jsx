import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Doctor from "./pages/Doctor";
import Patient from "./pages/Patient.jsx";
import Appointments from "./pages/Appointments.jsx";
import FindDoctors from "./pages/FindDoctors.jsx";
import BookAppointment from "./pages/BookAppointment.jsx";
import DoctorProfile from "./pages/DoctorProfile.jsx";
import LabTests from "./pages/LabTests.jsx";
import AIResults from "./pages/AIResults.jsx";

import RoleSelect from "./pages/auth/RoleSelect.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import DoctorOnboarding from "./pages/auth/DoctorOnboarding.jsx";
import Footer from "./components/Footer.jsx";
import {
  PatientRoute,
  DoctorRoute,
} from "./components/auth/ProtectedRoutes.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminRoute from "./components/admin/AdminRoute.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import ManageDoctors from "./pages/admin/ManageDoctors.jsx";
import ManagePatients from "./pages/admin/ManagePatients.jsx";
import ManageDepartments from "./pages/admin/ManageDepartments.jsx";
import AppointmentsOverview from "./pages/admin/AppointmentsOverview.jsx";
import PaymentsDashboard from "./pages/admin/PaymentsDashboard.jsx";

const App = () => {
  return (
    <div className="app-container">
      <Routes>
        {/* Home */}
      <Route path="/" element={<Home />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/find-doctors" element={<FindDoctors />} />
      <Route path="/lab-tests" element={<LabTests />} />
      <Route path="/ai-results" element={<AIResults />} />
      <Route path="/doctor/:id" element={<DoctorProfile />} />

      {/* Auth */}
      <Route path="/select-role" element={<RoleSelect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/doctor-onboarding" element={<DoctorOnboarding />} />

      {/* Doctor Protected Route */}
      <Route element={<DoctorRoute />}>
        <Route path="/doctor" element={<Doctor />} />
      </Route>

      {/* Patient Protected Route */}
      <Route element={<PatientRoute />}>
        <Route path="/patient" element={<Patient />} />
        <Route path="/book" element={<BookAppointment />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<ManageDoctors />} />
          <Route path="/admin/patients" element={<ManagePatients />} />
          <Route path="/admin/departments" element={<ManageDepartments />} />
          <Route
            path="/admin/appointments"
            element={<AppointmentsOverview />}
          />
          <Route path="/admin/payments" element={<PaymentsDashboard />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<h2>404 - Page Not Found</h2>} />
    </Routes>
    <Footer />
  </div>
  );
};

export default App;
