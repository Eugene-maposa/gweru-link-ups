
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
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
      console.log('Fetching profile for user:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        if (retries > 0) {
          console.log(`Retrying profile fetch, ${retries} attempts left`);
          setTimeout(() => fetchUserProfile(userId, retries - 1), 1000);
          return;
        }
        setUserProfile(null);
      } else if (profile) {
        console.log('Profile fetched successfully:', profile);
        setUserProfile(profile);
      } else {
        console.log('No profile found for user:', userId);
        setUserProfile(null);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error in profile fetch:', err);
      if (retries > 0) {
        setTimeout(() => fetchUserProfile(userId, retries - 1), 1000);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Starting signup process for:', email);
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        setLoading(false);
        return { error: authError };
      }

      if (authData.user) {
        console.log('User created, creating profile:', authData.user.id);
        
        // Wait a moment for the user to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            full_name: userData.fullName,
            phone: userData.phone,
            national_id: userData.nationalId,
            role: userData.role,
            location: userData.location,
            approval_status: 'pending'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail signup completely for profile creation issues
        } else {
          console.log('Profile created successfully');
        }
      }

      setLoading(false);
      return { error: null };
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

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUserProfile(null);
      setSession(null);
      setUser(null);
      setLoading(false);
    } catch (error) {
      console.error('Signout error:', error);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userProfile,
      loading,
      signUp,
      signIn,
      signInAsAdmin,
      signOut
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
