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
  hasOrganizationRole: (organizationId: string, role: string) => Promise<boolean>;
  getOrganizationPermissions: (organizationId: string) => Promise<string[]>;
  isOrganizationAdmin: (organizationId: string) => Promise<boolean>;
  canAccessOrganizationData: (organizationId: string) => Promise<boolean>;
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

  // Create a basic profile from user data - no database calls
  const createBasicProfile = (user: User): UserProfile => {
    return {
      id: user.id,
      email: user.email || '',
      role: 'public' as UserRole,
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
  };

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Simply create a basic profile from user data
    console.log('🔄 Creating basic profile for user:', user.id);
    const basicProfile = createBasicProfile(user);
    setProfile(basicProfile);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const basicProfile = createBasicProfile(session.user);
          setProfile(basicProfile);
        }
        setLoading(false);
      })
      .catch((error) => {
        if (!mounted) return;
        console.error('Error getting session:', error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const basicProfile = createBasicProfile(session.user);
        setProfile(basicProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      // Profile will be set by the auth state change listener
    }
    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    setLoading(false);
    return { data, error };
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
    // Just update local state for now
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
    return true;
  };

  const isOrganizationMember = async (organizationId?: string): Promise<boolean> => {
    // Simplified - just return false for now
    return false;
  };

  const getUserOrganizations = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('organization_memberships')
        .select(`
          organization_id,
          role,
          permissions,
          research_organizations (
            id,
            name,
            org_id,
            organization_type,
            verification_status,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching organizations:', error);
        return [];
      }
      
      // If no organizations found, return demo organizations for hackathon demo
      if (!data || data.length === 0) {
        return [
          {
            organization_id: 'demo-stanford',
            role: 'admin',
            permissions: ['manage_organization', 'invite_members', 'submit_studies'],
            research_organizations: {
              id: 'demo-stanford',
              name: 'Stanford Medical AI Research Lab',
              org_id: 'STANFORD_AI_001',
              organization_type: 'university',
              verification_status: 'verified',
              description: 'Leading research in AI-driven medical diagnostics and privacy-preserving analytics'
            }
          },
          {
            organization_id: 'demo-broad',
            role: 'researcher',
            permissions: ['submit_studies', 'view_data'],
            research_organizations: {
              id: 'demo-broad',
              name: 'Broad Institute Genomics Consortium',
              org_id: 'BROAD_GENOMICS_001',
              organization_type: 'research_institute',
              verification_status: 'verified',
              description: 'Pioneering genomic research for precision medicine and therapeutic development'
            }
          }
        ];
      }
      
      return data || [];
    } catch (error) {
      console.error('Exception fetching organizations:', error);
      // Return demo organizations on error for hackathon demo
      return [
        {
          organization_id: 'demo-stanford',
          role: 'admin',
          permissions: ['manage_organization', 'invite_members', 'submit_studies'],
          research_organizations: {
            id: 'demo-stanford',
            name: 'Stanford Medical AI Research Lab',
            org_id: 'STANFORD_AI_001',
            organization_type: 'university',
            verification_status: 'verified',
            description: 'Leading research in AI-driven medical diagnostics and privacy-preserving analytics'
          }
        }
      ];
    }
  };

  const hasOrganizationRole = async (organizationId: string, role: string): Promise<boolean> => {
    return false;
  };

  const getOrganizationPermissions = async (organizationId: string): Promise<string[]> => {
    return [];
  };

  const isOrganizationAdmin = async (organizationId: string): Promise<boolean> => {
    return false;
  };

  const canAccessOrganizationData = async (organizationId: string): Promise<boolean> => {
    if (!user) return false;
    
    // Super admins can access all organization data
    if (profile?.role === 'super_admin') return true;
    
    return false;
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
    hasOrganizationRole,
    getOrganizationPermissions,
    isOrganizationAdmin,
    canAccessOrganizationData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};