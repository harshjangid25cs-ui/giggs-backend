import { supabase } from './supabaseClient';
import { User, UserRole } from '../types/database';
import { INITIAL_DATABASE_STATE } from './supabase';

export interface AuthSession {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
}

export const DEMO_PROFILES: Record<UserRole, User> = {
  resident: INITIAL_DATABASE_STATE.users[0],
  society: INITIAL_DATABASE_STATE.users[1],
  society_staff: INITIAL_DATABASE_STATE.users[1],
  worker: INITIAL_DATABASE_STATE.users[2],
  admin: INITIAL_DATABASE_STATE.users[3]
};

// Map roles to their demo email addresses
const DEMO_EMAILS: Record<UserRole, string> = {
  resident: 'arun.verma@greenvalley.res',
  society: 'estate.manager@greenvalley.com',
  society_staff: 'estate.manager@greenvalley.com',
  worker: 'ramesh.k@hvac-cooperative.org',
  admin: 'ops@giggs.community'
};

const DEFAULT_PASSWORD = 'password123'; // The password we set in the seed file

export async function signInDemoUser(role: UserRole): Promise<AuthSession> {
  const email = DEMO_EMAILS[role];
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: DEFAULT_PASSWORD,
    });
    
    // If we fail (e.g., Supabase not configured), fallback to mock session
    if (error || !data.user) {
      console.warn('Supabase auth failed, falling back to mock session:', error?.message);
      return getDemoSession(role);
    }

    // Attempt to fetch the user profile from our public.users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profileData) {
      console.warn('Could not fetch user profile, falling back to mock profile', profileError);
      return getDemoSession(role);
    }

    return {
      user: {
        id: profileData.id,
        name: profileData.name,
        phone: profileData.phone,
        email: profileData.email,
        role: profileData.role as UserRole,
        avatarUrl: profileData.avatar_url,
        societyId: profileData.society_id,
        flatNo: profileData.flat_no,
        createdAt: profileData.created_at
      },
      role: profileData.role as UserRole,
      isAuthenticated: true
    };

  } catch (err) {
    console.error('Auth error:', err);
    return getDemoSession(role);
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function getDemoSession(role: UserRole = 'resident'): AuthSession {
  return {
    user: DEMO_PROFILES[role] || DEMO_PROFILES.resident,
    role,
    isAuthenticated: true
  };
}
