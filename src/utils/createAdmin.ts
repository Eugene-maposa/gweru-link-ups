import { supabase } from "@/integrations/supabase/client";

export const createAdminAccount = async (email: string, password: string, adminData: {
  fullName: string;
  phone: string;
  nationalId: string;
  location: string;
}) => {
  try {
    // First, sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
        data: {
          full_name: adminData.fullName,
          phone: adminData.phone,
          national_id: adminData.nationalId,
          location: adminData.location,
          role: 'admin' // This will be inserted into user_roles table by trigger
        }
      }
    });

    if (authError) {
      return { error: authError };
    }

    if (authData.user) {
      // Wait for trigger to create profile and role
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify admin role was created
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (roleError || !roleData) {
        return { error: { message: 'Failed to create admin role. Please contact system administrator.' } };
      }
      
      // Update approval status to approved for admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', authData.user.id);

      if (profileError) {
        return { error: profileError };
      }
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};
