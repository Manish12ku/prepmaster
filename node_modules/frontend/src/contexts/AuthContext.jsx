import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, updatePassword } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, loginWithPhone, setupRecaptcha, signUpWithEmail, loginWithEmail, updateFirebaseUserProfile } from '../config/firebase';
import { syncUser, updateUserProfile, getUserProfile } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const loadUserFromBackend = async () => {
    const response = await getUserProfile();
    const backendUser = response.user;
    const normalizedUser = {
      ...backendUser,
      id: backendUser.id || backendUser._id
    };
    setDbUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  };

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            const authName = firebaseUser.displayName || firebaseUser.phoneNumber || undefined;
            await syncUser({
              uid: firebaseUser.uid,
              name: authName,
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL,
              phone: firebaseUser.phoneNumber
            });
            await loadUserFromBackend();
          } catch (err) {
            console.error('Error syncing user:', err);
            setError(err);
          }
        } else {
          setUser(null);
          setDbUser(null);
          localStorage.removeItem('user');
        }
        setLoading(false);
      }, (err) => {
        console.error('Auth state error:', err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Auth setup error:', err);
      setError(err);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await loginWithGoogle();
      return result;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const sendPhoneOTP = async (phoneNumber) => {
    // Check if running in development/demo mode
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      // Mock OTP for development - any 6-digit code works
      console.log('Development mode: Mock OTP sent to', phoneNumber);
      console.log('Use OTP: 123456 to login');
      
      // Create a mock confirmation result
      const mockConfirmationResult = {
        confirm: async (otp) => {
          if (otp === '123456') {
            // Create a mock Firebase user
            const mockUser = {
              uid: 'phone-' + phoneNumber.replace(/\D/g, ''),
              displayName: null,
              email: null,
              phoneNumber: phoneNumber,
              photoURL: null
            };
            return { user: mockUser };
          } else {
            throw new Error('Invalid OTP. Use 123456 for development.');
          }
        }
      };
      setConfirmationResult(mockConfirmationResult);
      return Promise.resolve(mockConfirmationResult);
    }
    
    try {
      // Clear any existing recaptcha
      const existingContainer = document.getElementById('recaptcha-container');
      if (existingContainer) {
        existingContainer.innerHTML = '';
      }
      
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const result = await loginWithPhone(phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      return result;
    } catch (error) {
      console.error('Phone OTP error:', error);
      // Clear recaptcha on error
      const existingContainer = document.getElementById('recaptcha-container');
      if (existingContainer) {
        existingContainer.innerHTML = '';
      }
      throw error;
    }
  };

  const verifyPhoneOTP = async (otp) => {
    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result available. Please request OTP again.');
      }
      console.log('Verifying OTP:', otp);
      const result = await confirmationResult.confirm(otp);
      console.log('OTP verification result:', result);
      
      // For mock mode, we need to manually trigger the auth state change
      if (result && result.user) {
        setUser(result.user);
        try {
          await syncUser({
            uid: result.user.uid,
            name: result.user.displayName || result.user.phoneNumber || 'Phone User',
            email: result.user.email || '',
            photoURL: result.user.photoURL,
            phone: result.user.phoneNumber
          });
          await loadUserFromBackend();
        } catch (err) {
          console.error('Error syncing phone user:', err);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setDbUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signUpWithEmailPassword = async (name, email, password) => {
    try {
      const result = await signUpWithEmail(email, password);
      if (result.user) {
        try {
          await updateFirebaseUserProfile(result.user, { displayName: name });
        } catch (profileError) {
          console.warn('Failed to update Firebase profile displayName:', profileError);
        }
        await syncUser({
          uid: result.user.uid,
          name: name,
          email: result.user.email || email,
          photoURL: result.user.photoURL,
          phone: result.user.phoneNumber
        });
        await loadUserFromBackend();
      }
      return result;
    } catch (error) {
      console.error('Email sign up error:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    const response = await updateUserProfile(profileData);
    const backendUser = response.user;
    const normalizedUser = {
      ...backendUser,
      id: backendUser.id || backendUser._id
    };
    setDbUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  };

  const changePassword = async (newPassword) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    return updatePassword(auth.currentUser, newPassword);
  };

  const loginWithEmailPassword = async (email, password) => {
    try {
      const result = await loginWithEmail(email, password);
      if (result.user) {
        const firebaseUser = result.user;
        await syncUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.phoneNumber || 'User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL,
          phone: firebaseUser.phoneNumber
        });
        await loadUserFromBackend();
      }
      return result;
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  };

  const value = {
    user,
    dbUser,
    loading,
    error,
    isAuthenticated: !!user,
    isStudent: dbUser?.role === 'student',
    isAdmin: dbUser?.role === 'admin' || dbUser?.role === 'super_admin',
    isSuperAdmin: dbUser?.role === 'super_admin',
    signInWithGoogle,
    signUpWithEmailPassword,
    loginWithEmailPassword,
    sendPhoneOTP,
    verifyPhoneOTP,
    updateProfile,
    changePassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="recaptcha-container"></div>
    </AuthContext.Provider>
  );
};
