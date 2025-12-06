import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, LogIn, LogOut, UserPlus, FileText } from 'lucide-react';

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Personal Info API</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/about" className="text-gray-700 hover:text-indigo-600">
              About
            </Link>
            {token ? (
              <>
                <Link to="/contacts" className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600">
                  <FileText className="h-5 w-5" />
                  <span>My Records</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}