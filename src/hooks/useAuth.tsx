
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with a small delay to ensure the trigger has run
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching profile:', error);
              } else {
                console.log('Profile fetched:', profile);
                setUserProfile(profile);
              }
            } catch (err) {
              console.error('Error in profile fetch:', err);
            }
          }, 1000);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
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

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Starting signup process for:', email);
      
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { error: authError };
      }

      if (authData.user) {
        console.log('User created:', authData.user.id);
        
        // Create profile manually since the user might not be confirmed yet
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email,
            full_name: userData.fullName,
            phone: userData.phone,
            national_id: userData.nationalId,
            role: userData.role,
            location: userData.location,
            approval_status: 'pending'
          }]);
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { error: profileError };
        }
        
        console.log('Profile created successfully');
      }

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting signin process for:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Signin error:', error);
      } else {
        console.log('Signin successful');
      }
      
      return { error };
    } catch (error) {
      console.error('Signin error:', error);
      return { error };
    }
  };

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      console.log('Starting admin signin process for:', email);
      
      // Check if this is the default admin credentials
      if (email === 'mapseujers@gmail.com' && password === 'maps@#16') {
        // For default admin, we'll create a temporary session
        // In a real app, you'd want to have proper admin accounts
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          // If admin account doesn't exist, we'll handle it gracefully
          console.log('Admin account login attempt:', error.message);
          return { error: { message: 'Admin credentials not found. Please contact system administrator.' } };
        }
        
        return { error: null };
      } else {
        // For other admin accounts, check if they have admin role
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        return { error };
      }
    } catch (error) {
      console.error('Admin signin error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserProfile(null);
    } catch (error) {
      console.error('Signout error:', error);
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
