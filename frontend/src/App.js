import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import UserSecurity from "./pages/UserSecurity";
import TwoFactor from "./pages/TwoFactor";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      Loading...
    </div>
  );
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { token, user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      Loading...
    </div>
  );
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" />;
  return children;
};

const AppRoutes = () => {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/security" element={<AdminRoute><SecurityDashboard /></AdminRoute>} />
      <Route path="/my-security" element={<ProtectedRoute><UserSecurity /></ProtectedRoute>} />
      <Route path="/2fa" element={<ProtectedRoute><TwoFactor /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900">
          <AppRoutes />
          <ToastContainer theme="dark" position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;