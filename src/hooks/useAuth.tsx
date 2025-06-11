
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
          // Fetch user profile immediately
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching profile:', error);
                // If profile doesn't exist, user might need to complete signup
                setUserProfile(null);
              } else {
                console.log('Profile fetched:', profile);
                setUserProfile(profile);
              }
            } catch (err) {
              console.error('Error in profile fetch:', err);
              setUserProfile(null);
            }
            setLoading(false);
          }, 500);
        } else {
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

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Starting signup process for:', email);
      setLoading(true);
      
      // First, sign up the user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
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
        // Create profile immediately
        try {
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
          } else {
            console.log('Profile created successfully');
          }
        } catch (profileErr) {
          console.error('Error creating profile:', profileErr);
        }

        // Send email notification to admin
        try {
          const { error: emailError } = await supabase.functions.invoke('notify-admin-registration', {
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

          if (emailError) {
            console.error('Failed to send admin notification email:', emailError);
          } else {
            console.log('Admin notification email sent successfully');
          }
        } catch (emailError) {
          console.error('Error sending admin notification:', emailError);
        }
      }

      console.log('User created successfully:', authData.user?.id);
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
      
      if (error) {
        console.error('Signin error:', error);
      } else {
        console.log('Signin successful');
      }
      
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
        console.log('Admin account login attempt:', error.message);
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
