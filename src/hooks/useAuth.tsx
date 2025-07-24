import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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
  login: (email: string, password: string) => Promise<void>;
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
  const [sessionChecked, setSessionChecked] = useState(false);

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (sessionChecked) return;
      
      try {
        // First check if we have a stored session
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            localStorage.removeItem('auth_user');
          }
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          await fetchUserProfile(session.access_token);
        } else if (!storedUser) {
          // Only clear user if no stored user and no session
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Don't clear user on network errors, keep existing state
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
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
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        // Refresh user profile on token refresh
        await fetchUserProfile(session.access_token);
      }
      
      if (sessionChecked) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [sessionChecked]);

  const fetchUserProfile = async (token: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      
      if (authUser) {
        // Get user profile from database
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('Failed to fetch user profile:', error);
          // Don't clear user on profile fetch error, keep existing state
          if (!user) {
            setUser(null);
          }
        } else {
          // Store user in localStorage for persistence
          localStorage.setItem('auth_user', JSON.stringify(profile));
          setUser(profile);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Don't clear user on network errors
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
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Use backend API for login
      const response = await apiClient.login({ email, password });
      console.log('Login response:', response);

      if (!response || (!response.user && !response.session)) {
        toast.error('Login failed: No user or session returned');
        setUser(null);
        localStorage.removeItem('auth_user');
        return;
      }

      // Try to set the session in Supabase client if available
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
        toast.success('Logged in successfully!');
      } else {
        toast.error('Login failed: No user returned');
        setUser(null);
        localStorage.removeItem('auth_user');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      setUser(null);
      localStorage.removeItem('auth_user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logout: starting');
      // Try to sign out from Supabase
      console.log('Logout: before supabase.auth.signOut');
      let signOutResult = null;
      try {
        signOutResult = await supabase.auth.signOut();
        console.log('Logout: after supabase.auth.signOut', signOutResult);
        if (signOutResult && signOutResult.error) {
          console.warn('Supabase logout failed:', signOutResult.error);
        } else {
          console.log('Supabase signOut succeeded');
        }
      } catch (error) {
        console.warn('Supabase logout threw error:', error);
      }

      // Clear all user-related state and storage
      localStorage.removeItem('auth_user');
      setUser(null);
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      console.log('Logout: cleared localStorage, setUser(null)');

      toast.success('Logged out successfully');

      // Force reload to ensure all state is reset
      setTimeout(() => {
        console.log('Logout: reloading page');
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear user state even if logout fails
      localStorage.removeItem('auth_user');
      setUser(null);
      toast.success('Logged out');
      setTimeout(() => {
        console.log('Logout: reloading page after error');
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
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Update failed');
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