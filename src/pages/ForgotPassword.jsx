import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { KeyRound, ArrowRight, ExternalLink } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await forgotPassword(email);
      setOtpSent(true);
      toast.success('Password reset OTP has been sent to your email');
      
      // For demo purposes only - in production, the OTP would be sent via email
      if (response.otp) {
        setOtp(response.otp);
      }
      
      // Store the email preview URL
      if (response.previewUrl) {
        setPreviewUrl(response.previewUrl);
      }
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
            Forgot Password
          </h2>
          
          {otpSent ? (
            <div className="space-y-6">
              <div className="bg-indigo-50 p-4 rounded-md">
                <p className="text-indigo-600">
                  An OTP has been sent to your email address. Please check your inbox and use the OTP to reset your password.
                </p>
                
                {/* Development-only OTP display */}
                {otp && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-center">
                    <p className="text-sm text-gray-500">Demo OTP (for testing only):</p>
                    <p className="font-mono font-bold text-lg">{otp}</p>
                  </div>
                )}
                
                {/* Email preview link for development */}
                {previewUrl && (
                  <div className="mt-4">
                    <a 
                      href={previewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span>View Email Preview</span>
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      (This is a development feature to preview the email that would be sent in production)
                    </p>
                  </div>
                )}
              </div>
              
              <Link 
                to="/reset-password" 
                state={{ email }}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span>Continue to Reset Password</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Enter the email address associated with your account
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Processing...' : 'Send Reset Instructions'}
              </button>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Return to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}