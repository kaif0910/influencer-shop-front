import React, { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender: 'male' | 'female';
  is_influencer: boolean;
  avatar_url?: string;
  body_type?: string;
  style_preference?: string;
  color_season?: string;
  notes?: string;
  bio?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender: 'male' | 'female';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loginPromiseRef = useRef<Promise<boolean> | null>(null);

  const isAuthenticated = !!user;

  // Check for existing session and listen for auth changes on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (session?.access_token) {
          await fetchUserProfile(session.access_token);
        } else {
          if (!user) {
            localStorage.removeItem('auth_user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session);
      if (event === 'SIGNED_IN' && session?.access_token) {
        await fetchUserProfile(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('auth_user');
        setUser(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        await fetchUserProfile(session.access_token);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const userResponse = await supabase.auth.getUser(token);
      const authUser = userResponse && userResponse.data && userResponse.data.user ? userResponse.data.user : null;
      console.log('fetchUserProfile: authUser', authUser);
      if (authUser) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        console.log('fetchUserProfile: profile', profile, 'error', error);
        if (error || !profile) {
          // If not found, create the user profile
          const insertRes = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              name: authUser.user_metadata?.name || authUser.email,
              email: authUser.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // add other default fields as needed
            })
            .select()
            .single();
          const newProfile = insertRes.data;
          const insertError = insertRes.error;
           if (insertError || !newProfile) {
             console.warn('Failed to create user profile');
             // do not clear existing user state here
             return;
           } else {
             localStorage.setItem('auth_user', JSON.stringify(newProfile));
             setUser(newProfile);
           }
        } else {
          localStorage.setItem('auth_user', JSON.stringify(profile));
          setUser(profile);
        }
      } else {
        console.warn('No Supabase user found during profile fetch');
        // do not clear existing user state here
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // do not clear existing user state here
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);

      // Use backend API for registration
      const response = await apiClient.register(data);

      // Set the session in Supabase client if available
      if (response.session) {
        try {
          const { error: sessionError } = await supabase.auth.setSession(response.session);
          if (sessionError) {
            console.warn('Session setting failed, but continuing with manual auth:', sessionError);
          }
        } catch (sessionError) {
          console.warn('Session setting failed, but continuing with manual auth:', sessionError);
        }
      }

      // Set user profile regardless of session status
      if (response.user) {
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        setUser(response.user);
      }

      toast.success('Account created successfully!');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (loginPromiseRef.current) {
      return loginPromiseRef.current;
    }
    setIsLoading(true);

    const promise = (async () => {
      try {
        const response = await apiClient.login({ email, password });
        console.log('Login response:', response);

        // Treat backend user as success and set immediately
        if (response?.user) {
          localStorage.setItem('auth_user', JSON.stringify(response.user));
          setUser(response.user);
        } else {
          toast.error('Login failed: No user returned');
          setUser(null);
          localStorage.removeItem('auth_user');
          return false;
        }

        // Best-effort: if Supabase session exists, refresh profile in background
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (token) {
            fetchUserProfile(token).catch((e) => console.warn('fetchUserProfile failed after login:', e));
          }
        } catch (e) {
          console.warn('getSession failed after login:', e);
        }

        toast.success('Logged in successfully!');
        return true;
      } catch (error: unknown) {
        console.error('Login error:', error);
        const message = error instanceof Error ? error.message : 'Login failed';
        toast.error(message);
        setUser(null);
        localStorage.removeItem('auth_user');
        return false;
      } finally {
        setIsLoading(false);
        loginPromiseRef.current = null;
        console.log('[Auth] setIsLoading(false) called in login.finally');
      }
    })();

    loginPromiseRef.current = promise;
    return promise;
  };

  const logout = async () => {
    try {
      console.log('Logout: starting');
      // Try to sign out from Supabase
      let signOutResult = null;
      try {
        signOutResult = await supabase.auth.signOut();
        // Force clear Supabase session in-memory as well
        await supabase.auth.setSession(null);
        const maybeError = (signOutResult as { error?: unknown } | null)?.error;
        if (maybeError) {
          console.warn('Supabase logout failed:', maybeError);
        } else {
          console.log('Supabase signOut succeeded');
        }
      } catch (error) {
        console.warn('Supabase logout threw error:', error);
      }

      // Clear all user-related state and storage
      localStorage.removeItem('auth_user');
      setUser(null);
      // Remove all Supabase session keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      // Remove all Supabase session keys from sessionStorage
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('sb-')) sessionStorage.removeItem(key);
      });
      sessionStorage.clear();
      console.log('Logout: cleared localStorage, sessionStorage, setUser(null)');

      toast.success('Logged out successfully');
      // Force reload to ensure all state is reset and UI updates
      setTimeout(async () => {
        // Double clear after reload for extra safety
        await supabase.auth.signOut();
        await supabase.auth.setSession(null);
        localStorage.removeItem('auth_user');
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-')) localStorage.removeItem(key);
        });
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('sb-')) sessionStorage.removeItem(key);
        });
        sessionStorage.clear();
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if logout fails
      localStorage.removeItem('auth_user');
      setUser(null);
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('sb-')) sessionStorage.removeItem(key);
      });
      sessionStorage.clear();
      toast.success('Logged out');
      setTimeout(async () => {
        await supabase.auth.signOut();
        await supabase.auth.setSession(null);
        localStorage.removeItem('auth_user');
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-')) localStorage.removeItem(key);
        });
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('sb-')) sessionStorage.removeItem(key);
        });
        sessionStorage.clear();
        window.location.reload();
      }, 500);
    }
  };

  const updateUser = async (data: Partial<AuthUser>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw new Error('Failed to update profile');
      }

      // Update localStorage with new user data
      localStorage.setItem('auth_user', JSON.stringify(updatedProfile));
      setUser(updatedProfile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      const message = error instanceof Error ? error.message : 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetchUserProfile(session.access_token);
      } else {
        // If no session but we have stored user, keep the stored user
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser && !user) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem('auth_user');
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Don't clear user on refresh errors
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};