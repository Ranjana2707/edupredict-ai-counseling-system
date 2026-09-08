import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LOCAL_STORAGE_KEYS, ROLES } from '../constants';
import { AuthState, User, UserRole } from '../types';
import { toast } from 'sonner';
import { api } from '../services/api';
import { auth, db as fdb, googleProvider } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signInAnonymously, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType extends AuthState {
  login: (email: string, password?: string, mockRole?: UserRole) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  registerUser: (name: string, email: string, phone: string, role: UserRole, department: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ otp?: string; firebaseSent?: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (email: string, password: string) => Promise<void>;
  refreshToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setState({
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (e) {
        // Clear corrupt data
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (!fbUser) {
          signInAnonymously(auth).catch((err) => {
            console.warn('Anonymous sign-in to Firebase is not active. Using local storage fallback for mock session logs.', err.message);
          });
        }
      });
      return () => unsubscribe();
    }
  }, [state.isAuthenticated]);

  const login = async (email: string, password?: string, mockRole?: UserRole): Promise<User> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
        mockRole,
      });

      const { user, token, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      if (newRefreshToken) {
        localStorage.setItem('edupredict_refresh_token', newRefreshToken);
      }

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Sign In Successful', {
        description: `Welcome back, ${user.name}!`,
      });

      return user;
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      const errorMsg = error.response?.data?.message || 'Invalid email or password';
      toast.error('Authentication Failed', {
        description: errorMsg,
      });
      throw new Error(errorMsg);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser.email) {
        throw new Error('Google Sign-In did not return an email address.');
      }

      // Check Firestore first
      const userDocRef = doc(fdb, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let role: UserRole = 'student';
      let department = 'Computer Science';
      let semester = '1st Semester';
      let cgpa = 3.5;
      let overallAttendance = 90;
      let riskScore = 10;
      let dropoutProbability = 10;

      const emailLower = firebaseUser.email.toLowerCase();
      if (emailLower.includes('admin')) {
        role = 'admin';
      } else if (emailLower.includes('faculty')) {
        role = 'faculty';
      } else if (emailLower.includes('counselor')) {
        role = 'counselor';
      }

      let userData: any;

      if (!userDocSnap.exists()) {
        userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google User',
          email: firebaseUser.email,
          role,
          department,
          semester,
          cgpa,
          overallAttendance,
          riskScore,
          dropoutProbability,
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, userData);
      } else {
        userData = userDocSnap.data();
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        avatarUrl: firebaseUser.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      };

      // Also sync with express backend
      try {
        const response = await api.post('/api/auth/login-google', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'Google User',
          role: userData.role,
          avatarUrl: firebaseUser.photoURL,
        });
        const { token } = response.data;
        localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      } catch (err) {
        console.warn('Backend google sync failed, generating mock token', err);
        const token = `jwt_token_resolved_${user.role}_${Date.now()}`;
        localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      }

      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Sign In Successful', {
        description: `Welcome back, ${user.name}!`,
      });

      return user;
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      const errorMsg = error.message || 'Google Authentication Failed';
      toast.error('Authentication Failed', {
        description: errorMsg,
      });
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.warn('Backend logout failed, clearing local session anyway.', e);
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      localStorage.removeItem('edupredict_refresh_token');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      toast.info('Signed Out', {
        description: 'Session ended successfully.',
      });
    }
  };

  const switchRole = async (role: UserRole) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/api/auth/switch-role', { role });
      const { user, token } = response.data;

      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));

      setState((prev) => ({
        ...prev,
        user,
        isLoading: false,
      }));

      toast.success('Role Switched', {
        description: `Now operating as ${user.name} (${role.toUpperCase()})`,
      });
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      toast.error('Role Switch Failed', {
        description: error.response?.data?.message || 'Could not perform role swapping.',
      });
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    phone: string,
    role: UserRole,
    department: string
  ): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await api.post('/api/auth/register', {
        name,
        email,
        phone,
        role,
        department,
      });
      setState((prev) => ({ ...prev, isLoading: false }));
      toast.success('Registration Complete', {
        description: 'Account created successfully. You can now log in.',
      });
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      const errorMsg = error.response?.data?.message || 'Registration failed';
      toast.error('Registration Failed', {
        description: errorMsg,
      });
      throw new Error(errorMsg);
    }
  };

  const forgotPassword = async (email: string): Promise<{ otp?: string; firebaseSent?: boolean }> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    let otpCode: string | undefined;
    let firebaseSent = false;

    try {
      // 1. Dispatch recovery code from backend API
      try {
        const response = await api.post('/api/auth/forgot-password', { email });
        if (response.data && response.data.otp) {
          otpCode = response.data.otp;
        }
      } catch (err: any) {
        console.warn('Backend recovery dispatch note:', err?.response?.data?.message || err.message);
      }

      // 2. Dispatch real Firebase Auth reset email if configured
      try {
        await sendPasswordResetEmail(auth, email);
        firebaseSent = true;
      } catch (fbErr: any) {
        // Safe fallback if account is institutional/mock or offline
        console.log('Firebase Auth reset note:', fbErr?.code || fbErr?.message);
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      
      const desc = firebaseSent
        ? `Official reset link sent via Firebase, and recovery OTP dispatched for ${email}.`
        : `Security verification OTP dispatched for ${email}.`;

      toast.success('Recovery Dispatched', {
        description: desc,
      });

      return { otp: otpCode, firebaseSent };
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      const errorMsg = error.response?.data?.message || 'Failed to dispatch recovery code';
      toast.error('Error', {
        description: errorMsg,
      });
      throw new Error(errorMsg);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp });
      setState((prev) => ({ ...prev, isLoading: false }));
      toast.success('OTP Verified', {
        description: 'Code matches. Please set your new password.',
      });
      return !!res.data.success;
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      const errorMsg = error.response?.data?.message || 'Invalid OTP code';
      toast.error('Verification Failed', {
        description: errorMsg,
      });
      throw new Error(errorMsg);
    }
  };

  const resetPassword = async (email: string, password: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await api.post('/api/auth/reset-password', { email, password });
      setState((prev) => ({ ...prev, isLoading: false }));
      toast.success('Password Restructured', {
        description: 'Your security key has been updated. Please sign in.',
      });
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      const errorMsg = error.response?.data?.message || 'Failed to reset password';
      toast.error('Reset Failed', {
        description: errorMsg,
      });
      throw new Error(errorMsg);
    }
  };

  const refreshToken = async (): Promise<string> => {
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      const email = storedUser ? JSON.parse(storedUser).email : '';
      const rToken = localStorage.getItem('edupredict_refresh_token') || `mock_refresh_${Date.now()}`;

      const res = await api.post('/api/auth/refresh', {
        email,
        refreshToken: rToken,
      });

      const { token, refreshToken: newRefreshToken } = res.data;
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      if (newRefreshToken) {
        localStorage.setItem('edupredict_refresh_token', newRefreshToken);
      }
      console.log('JWT Token refreshed successfully.');
      return token;
    } catch (err) {
      console.error('Auto-refresh failed:', err);
      throw err;
    }
  };

  // Inactivity safety tracker (Automatic Logout)
  useEffect(() => {
    if (!state.isAuthenticated) return;

    // Timeout duration: 15 minutes (900,000 ms)
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        toast.warning('Session Expired', {
          description: 'You have been signed out automatically due to 15 minutes of inactivity.',
          duration: 6000,
        });
      }, INACTIVITY_TIMEOUT);
    };

    // Listen to major user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Start timer on mount
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [state.isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithGoogle,
        logout,
        switchRole,
        registerUser,
        forgotPassword,
        verifyOtp,
        resetPassword,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
