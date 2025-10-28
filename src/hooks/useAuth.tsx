
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any;
  userRoles: string[];
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider useEffect - Setting up auth listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls to prevent deadlocks
          setTimeout(() => {
            console.log('Fetching user profile for:', session.user.id);
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          console.log('No session, clearing profile');
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, retries = 3) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        if (retries > 0) {
          setTimeout(() => fetchUserProfile(userId, retries - 1), 1000);
          return;
        }
        setUserProfile(null);
      } else if (profile) {
        setUserProfile(profile);
        
        // Fetch user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        
        if (!rolesError && rolesData) {
          setUserRoles(rolesData.map((r: any) => r.role));
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => fetchUserProfile(userId, retries - 1), 1000);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    }
  };
  
  const hasRole = (role: string) => {
    return userRoles.includes(role);
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Starting signup process for:', email);
      setLoading(true);
      
      // Check if user already has a profile in our database
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (existingProfile) {
        console.log('User profile already exists in database');
        setLoading(false);
        return { error: { message: 'User already registered. Please try signing in instead.' } };
      }
      
      // Attempt to create new user - the database trigger will handle profile creation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
          data: {
            full_name: userData.fullName,
            phone: userData.phone,
            national_id: userData.nationalId,
            role: userData.role,
            location: userData.location
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        setLoading(false);
        return { error: authError };
      }

      if (authData.user) {
        console.log('User created successfully:', authData.user.id);
        
        // Notify admin about new registration
        try {
          const { error: notifyError } = await supabase.functions.invoke('notify-admin-registration', {
            body: {
              userId: authData.user.id,
              userEmail: email,
              fullName: userData.fullName,
              role: userData.role,
              nationalId: userData.nationalId,
              phone: userData.phone,
              location: userData.location
            }
          });
          
          if (notifyError) {
            console.error('Admin notification error:', notifyError);
          } else {
            console.log('Admin notification sent successfully');
          }
        } catch (notifyError) {
          console.error('Failed to notify admin:', notifyError);
        }
      }

      setLoading(false);
      return { error: null, data: authData };
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting signin process for:', email);
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      setLoading(false);
      return { error };
    } catch (error) {
      console.error('Signin error:', error);
      setLoading(false);
      return { error };
    }
  };

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      console.log('Starting admin signin process for:', email);
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.log('Admin signin failed:', error.message);
        setLoading(false);
        return { error: { message: 'Invalid admin credentials. Please check your email and password.' } };
      }
      
      setLoading(false);
      return { error: null };
    } catch (error) {
      console.error('Admin signin error:', error);
      setLoading(false);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Starting password reset for:', email);
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`
      });
      
      setLoading(false);
      return { error };
    } catch (error) {
      console.error('Password reset error:', error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUserProfile(null);
      setUserRoles([]);
      setSession(null);
      setUser(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userProfile,
      userRoles,
      loading,
      signUp,
      signIn,
      signInAsAdmin,
      resetPassword,
      signOut,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
