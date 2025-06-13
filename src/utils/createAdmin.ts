
import { supabase } from "@/integrations/supabase/client";

export const createAdminAccount = async (email: string, password: string, adminData: {
  fullName: string;
  phone: string;
  nationalId: string;
  location: string;
}) => {
  try {
    console.log('Creating admin account for:', email);
    
    // First, sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return { error: authError };
    }

    if (authData.user) {
      console.log('Admin user created, now creating admin profile:', authData.user.id);
      
      // Wait a moment for the user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create admin profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: adminData.fullName,
          phone: adminData.phone,
          national_id: adminData.nationalId,
          role: 'admin',
          location: adminData.location,
          approval_status: 'approved' // Admin is automatically approved
        });

      if (profileError) {
        console.error('Admin profile creation error:', profileError);
        return { error: profileError };
      }

      console.log('Admin profile created successfully');
    }

    console.log('Admin account creation completed successfully');
    return { error: null };
  } catch (error) {
    console.error('Admin account creation error:', error);
    return { error };
  }
};
