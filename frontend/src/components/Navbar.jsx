import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiLock, FiLogOut, FiUser, FiShield, FiFolder, FiKey } from "react-icons/fi";

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FiLock className="text-white text-xl" />
          </div>
          <h1 className="text-xl font-bold text-white">SecureVault</h1>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition duration-200">
            <FiFolder className="text-sm" />
            <span className="text-sm">My Files</span>
          </Link>

          {/* Admin only — Full Security Dashboard */}
          {user?.role === "admin" && (
            <Link to="/security" className="flex items-center gap-2 text-gray-400 hover:text-white transition duration-200">
              <FiShield className="text-sm" />
              <span className="text-sm">Security</span>
            </Link>
          )}

          {/* All users — Personal Security */}
          <Link to="/my-security" className="flex items-center gap-2 text-gray-400 hover:text-white transition duration-200">
            <FiShield className="text-sm" />
            <span className="text-sm">{user?.role === "admin" ? "My Activity" : "Security"}</span>
          </Link>

          <Link to="/2fa" className="flex items-center gap-2 text-gray-400 hover:text-white transition duration-200">
            <FiKey className="text-sm" />
            <span className="text-sm">2FA</span>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <FiUser />
          <span className="text-white font-medium">{user?.name}</span>
          {user?.role === "admin" && (
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Admin</span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;