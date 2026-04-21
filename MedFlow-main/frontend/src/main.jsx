import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { CityProvider } from "./context/CityContext.jsx";

// Global error handler for mgt.clearMarks error
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('mgt.clearMarks is not a function')) {
    console.warn('Browser extension error suppressed: mgt.clearMarks is not a function');
    event.preventDefault();
    return false;
  }
});

// Override console.error to suppress the specific error
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('mgt.clearMarks is not a function')) {
    console.warn('Browser extension error suppressed: mgt.clearMarks is not a function');
    return;
  }
  originalConsoleError.apply(console, args);
};

import { ThemeProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <AdminAuthProvider>
        <NotificationProvider>
          <CityProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </CityProvider>
        </NotificationProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </ThemeProvider>
);