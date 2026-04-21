import React from "react";

const Footer = () => (
  <footer className="mt-16 border-t border-slate-200/40 dark:border-slate-700/60 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">MedFlow</h3>
          <p className="text-sm mt-1 leading-relaxed">Premium healthcare marketplace for clinics, labs & doctors.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <a href="/" className="hover:text-slate-900 dark:hover:text-white">Home</a>
          <a href="/find-doctors" className="hover:text-slate-900 dark:hover:text-white">Find Doctors</a>
          <a href="/lab-tests" className="hover:text-slate-900 dark:hover:text-white">Lab Tests</a>
          <a href="/login" className="hover:text-slate-900 dark:hover:text-white">Login</a>
        </div>
      </div>
      <div className="mt-6 border-t border-slate-200/40 dark:border-slate-700/60 pt-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:justify-between gap-2">
        <span>© {new Date().getFullYear()} MedFlow. All rights reserved.</span>
        <span>Designed with love for healthcare services.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
