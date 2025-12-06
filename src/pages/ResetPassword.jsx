import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    otp: '',
    password: '',
    confirmPassword: ''
  });
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If email was passed from the forgot password page
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      otp: '',
      password: '',
      confirmPassword: ''
    };

    // OTP validation
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      errors.otp = 'OTP must be 6 digits';
      isValid = false;
    }

    // Password validation
    if (newPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    // Confirm password validation
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await resetPassword(email, otp, newPassword);
      toast.success('Password has been reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center mb-6">
            <KeyRound className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Reset Password
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOtp(value);
                  if (formErrors.otp) {
                    setFormErrors(prev => ({ ...prev, otp: '' }));
                  }
                }}
                maxLength={6}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                  formErrors.otp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 6-digit OTP"
                required
              />
              {formErrors.otp && (
                <p className="mt-1 text-sm text-red-600">{formErrors.otp}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (formErrors.password) {
                      setFormErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) {
                    setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Processing...' : 'Reset Password'}
            </button>
            
            <div className="text-center">
              <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                Return to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}