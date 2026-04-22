import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Phone, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '../config/firebase';

const Login = () => {
  const [authMode, setAuthMode] = useState('login'); // login, signup, phone
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isAuthenticated, dbUser, signInWithGoogle, signUpWithEmailPassword, loginWithEmailPassword, sendPhoneOTP, verifyPhoneOTP } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const showDevOtpHelp = import.meta.env.DEV;

  useEffect(() => {
    // Check for redirect result (mobile Google sign-in)
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Google sign-in successful via redirect');
        }
      } catch (error) {
        console.error('Google redirect sign-in error:', error);
        setError('Failed to sign in with Google. Please try again.');
      }
    };
    
    checkRedirectResult();
  }, []);

  useEffect(() => {
    if (isAuthenticated && dbUser) {
      if (dbUser.role === 'super_admin') {
        navigate('/superadmin/dashboard');
      } else if (dbUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  }, [isAuthenticated, dbUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (authMode === 'signup' && !name) {
      setError('Please enter your name');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (authMode === 'signup') {
        await signUpWithEmailPassword(name, email, password);
      } else {
        await loginWithEmailPassword(email, password);
      }
    } catch (err) {
      console.error('Email auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Failed to authenticate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number with country code (e.g., +91xxxxxxxxxx)');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      console.log('Sending OTP to:', formattedPhone);
      await sendPhoneOTP(formattedPhone);
      setShowOTP(true);
      setError('');
    } catch (err) {
      console.error('OTP Error:', err);
      setError(err.message || 'Failed to send OTP. Please check your phone number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await verifyPhoneOTP(otp);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-2 shadow-inner">
            <Globe size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            PrepMaster
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            AI-Powered Exam Preparation
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm font-medium text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-800/50 flex items-center gap-3 animate-shake">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* Auth Mode Tabs */}
        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
          <button
            onClick={() => { setAuthMode('login'); setShowOTP(false); setError(''); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
              authMode === 'login'
                ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-md transform scale-[1.02]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setAuthMode('signup'); setShowOTP(false); setError(''); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
              authMode === 'signup'
                ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-md transform scale-[1.02]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setAuthMode('phone'); setShowOTP(false); setError(''); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
              authMode === 'phone'
                ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-md transform scale-[1.02]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Phone
          </button>
        </div>

        <div className="space-y-6">
          {/* Google Login Button - More Prominent on Mobile */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-[0.98] shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-400">
                Or
              </span>
            </div>
          </div>

          {/* Email/Login/Signup Form */}
          {(authMode === 'login' || authMode === 'signup') && (
            <form onSubmit={handleEmailAuth} className="space-y-5">
              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all dark:text-white font-medium"
                      placeholder="Enter your name"
                      required={authMode === 'signup'}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all dark:text-white font-medium"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors rotate-90" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all dark:text-white font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary-500/30 mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Phone Auth Form */}
          {authMode === 'phone' && (
            <div className="space-y-5">
              {!showOTP ? (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all dark:text-white font-medium"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                  <div id="recaptcha-container" className="flex justify-center my-4"></div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary-500/30"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 text-center">
                      Enter 6-digit code sent to {phoneNumber}
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all dark:text-white font-bold text-2xl tracking-[1em] text-center"
                      placeholder="000000"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary-500/30"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        'Verify & Continue'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOTP(false)}
                      className="w-full py-2 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </form>
              )}

              {showDevOtpHelp && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider mb-1">
                    Development Mode
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Use <span className="font-bold underline">123456</span> as the OTP for any phone number.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
