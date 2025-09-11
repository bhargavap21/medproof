import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  isHospitalAdmin: (hospitalId?: string) => boolean;
  isOrganizationMember: (organizationId?: string) => Promise<boolean>;
  getUserOrganizations: () => Promise<any[]>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    console.log('🔍 fetchUserProfile called with userId:', userId);
    try {
      console.log('🔍 Making supabase query to user_profiles...');
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('🔍 fetchUserProfile query response:', { data: !!data, error: error?.message });

      if (error && error.code !== 'PGRST116') {
        console.error('🔍 Error fetching user profile:', error);
        return null;
      }

      console.log('🔍 fetchUserProfile returning:', data ? 'profile data' : 'null');
      return data;
    } catch (error) {
      console.error('🔍 Exception in fetchUserProfile:', error);
      return null;
    }
  };

  const createUserProfile = async (user: User) => {
    console.log('🏗️ createUserProfile called with user:', user.id);
    try {
      console.log('🏗️ Attempting to create profile via backend API...');
      
      // Try using backend API first to bypass RLS issues
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/auth/create-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email || '',
          metadata: {}
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🏗️ createUserProfile via API successful:', result.data ? 'created profile' : 'null');
        return result.data;
      }

      console.log('🏗️ Backend API failed, trying direct Supabase insert...');
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          role: 'public',
          credentials: {},
          settings: {},
          is_active: true,
        })
        .select()
        .single();

      console.log('🏗️ createUserProfile query response:', { data: !!data, error: error?.message });

      if (error) {
        console.error('🏗️ Error creating user profile:', error);
        console.log('🏗️ RLS policy may be blocking INSERT. Please run this in Supabase dashboard:');
        console.log('CREATE POLICY "Users can create their own profile" ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());');
        return null;
      }

      console.log('🏗️ createUserProfile returning:', data ? 'created profile' : 'null');
      return data;
    } catch (error) {
      console.error('🏗️ Exception in createUserProfile:', error);
      return null;
    }
  };

  const refreshProfile = useCallback(async () => {
    console.log('🔄 refreshProfile called with user:', user?.id);
    if (!user) {
      console.log('🔄 No user, setting loading to false');
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔄 Fetching user profile for:', user.id);
      let userProfile = await fetchUserProfile(user.id);
      
      // Create profile if it doesn't exist
      if (!userProfile) {
        console.log('🔄 No profile found, creating new profile');
        userProfile = await createUserProfile(user);
      }
      
      console.log('🔄 Profile set:', userProfile);
      setProfile(userProfile);
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
      // Don't fail completely - set a minimal profile to allow app to function
      setProfile({
        id: user.id,
        email: user.email || '',
        role: 'public' as any,
        credentials: {},
        settings: {},
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        first_name: null,
        last_name: null,
        title: null,
        institution: null,
        department: null,
        orcid_id: null,
        wallet_address: null
      });
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('🔐 Auth useEffect initializing...');
    
    // Add a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.error('🔐 Auth initialization timed out, setting loading false');
      setLoading(false);
    }, 5000);
    
    // Get initial session
    console.log('🔐 Calling supabase.auth.getSession()...');
    const sessionPromise = supabase.auth.getSession();
    console.log('🔐 getSession promise created:', sessionPromise);
    
    sessionPromise.then(({ data: { session } }) => {
      clearTimeout(timeoutId);
      console.log('🔐 Initial session response received:', session ? 'exists' : 'null');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('🔐 User found, calling refreshProfile');
        refreshProfile();
      } else {
        console.log('🔐 No user, setting loading false');
        setLoading(false);
      }
    }).catch(error => {
      clearTimeout(timeoutId);
      console.error('🔐 Error getting initial session:', error);
      console.error('🔐 Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session ? 'session exists' : 'no session');
      console.log('🔐 Session user:', session?.user ? session.user.id : 'no user');
      
      setSession(session);
      const newUser = session?.user ?? null;
      setUser(newUser);
      
      if (newUser) {
        console.log('🔐 User in auth change, calling refreshProfile with user:', newUser.id);
        // We need to call refreshProfile with the new user directly since state might not be updated yet
        try {
          console.log('🔄 Starting fetchUserProfile...');
          let userProfile = await fetchUserProfile(newUser.id);
          console.log('🔄 fetchUserProfile result:', userProfile ? 'found' : 'not found');
          
          if (!userProfile) {
            console.log('🔄 No profile found, creating new profile for:', newUser.id);
            console.log('🔄 Starting createUserProfile...');
            userProfile = await createUserProfile(newUser);
            console.log('🔄 createUserProfile result:', userProfile ? 'created' : 'failed');
          }
          
          console.log('🔄 Setting profile:', userProfile);
          setProfile(userProfile);
          console.log('🔄 Profile set successfully, setting loading false');
        } catch (error) {
          console.error('❌ Error refreshing profile in auth change:', error);
          console.error('❌ Error details:', {
            name: (error as any)?.name,
            message: (error as any)?.message,
            stack: (error as any)?.stack
          });
          console.log('🔄 Creating fallback profile...');
          const fallbackProfile = {
            id: newUser.id,
            email: newUser.email || '',
            role: 'public' as any,
            credentials: {},
            settings: {},
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            first_name: null,
            last_name: null,
            title: null,
            institution: null,
            department: null,
            orcid_id: null,
            wallet_address: null
          };
          setProfile(fallbackProfile);
          console.log('🔄 Fallback profile set, setting loading false');
        } finally {
          console.log('🔄 Finally block: setting loading false');
          setLoading(false);
        }
      } else {
        console.log('🔐 No user in auth change, clearing profile');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // No dependencies needed since we handle everything directly

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('🔐 useAuth.signUp called with:', { email, metadata });
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      console.log('🔐 Supabase signUp response:', { data: !!data, error: !!error });
      if (error) {
        console.error('🔐 Supabase signUp error:', error);
      }
      setLoading(false);
      return { data, error };
    } catch (err) {
      console.error('🔐 useAuth.signUp caught error:', err);
      setLoading(false);
      return { data: null, error: { message: 'SignUp function failed', name: 'SignUpError' } as any };
    }
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setProfile(null);
    setLoading(false);
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    // Update local profile state
    setProfile({ ...profile, ...updates });
  };

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    
    // Super admins have all permissions
    if (profile.role === 'super_admin') return true;
    
    // Hospital admins have management permissions within their hospital
    if (profile.role === 'hospital_admin') {
      return ['manage_hospitals', 'approve_organizations', 'approve_data_requests', 'view_hospital_data'].includes(permission);
    }
    
    // Organization admins can manage their organization and members
    if (profile.role === 'org_admin') {
      return ['manage_organization', 'invite_members', 'submit_studies', 'request_data_access'].includes(permission);
    }
    
    // Public users have limited read-only access
    if (profile.role === 'public') {
      return ['view_public_data', 'apply_to_organizations'].includes(permission);
    }
    
    return false;
  };

  const isHospitalAdmin = (hospitalId?: string): boolean => {
    if (!profile || profile.role !== 'hospital_admin') return false;
    
    // If no hospital ID provided, check if user is any hospital admin
    if (!hospitalId) return true;
    
    // In the new schema, hospital admins are determined by role only
    // Hospital-specific checks would need to be done via organization memberships or other means
    return true;
  };

  const isOrganizationMember = async (organizationId?: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('organization_memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('organization_id', organizationId || '');
      
      if (error) return false;
      return data.length > 0;
    } catch {
      return false;
    }
  };

  const getUserOrganizations = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('organization_memberships')
        .select(`
          organization_id,
          role,
          research_organizations (
            id,
            name,
            org_id,
            organization_type,
            verification_status
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) return [];
      return data;
    } catch {
      return [];
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole,
    hasPermission,
    isHospitalAdmin,
    isOrganizationMember,
    getUserOrganizations,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};