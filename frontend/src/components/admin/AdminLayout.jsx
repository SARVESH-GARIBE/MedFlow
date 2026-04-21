import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminTopbar from "./AdminTopbar.jsx";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto px-6 py-4 lg:px-8 lg:py-6 bg-slate-900/60 border-l border-slate-800">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

