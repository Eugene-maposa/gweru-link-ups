
// @ts-ignore - remote Deno std import resolved at deploy time
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore - esm.sh import resolved at deploy time
import { Resend } from "https://esm.sh/resend@2.0.0";
// @ts-ignore - esm.sh import resolved at deploy time
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationNotificationRequest {
  userId: string;
  userEmail: string;
  fullName: string;
  role: string;
  nationalId: string;
  phone: string;
  location: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userEmail, fullName, role, nationalId, phone, location }: RegistrationNotificationRequest = await req.json();

    console.log('Sending registration notification for user:', userEmail);

    // Create approval tokens for email-based approval
    const approveToken = crypto.randomUUID();
    const rejectToken = crypto.randomUUID();

    // Wait for profile to be created by trigger before storing tokens
    // Retry logic to handle timing issues
    let tokenStored = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (profile) {
        // Profile exists, store tokens
        const { error: tokenError } = await supabase
          .from('approval_tokens')
          .insert([{
            user_id: userId,
            approve_token: approveToken,
            reject_token: rejectToken,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          }]);

        if (tokenError) {
          console.error('Error storing approval tokens:', tokenError);
        } else {
          tokenStored = true;
          console.log('Approval tokens stored successfully');
        }
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (!tokenStored) {
      console.warn('Could not store approval tokens - profile may not exist yet');
    }

    const adminEmail = 'mapseujers@gmail.com'; // Eugene Maposa's email
    const baseUrl = 'https://vdjiufcrirttivpwdeoa.supabase.co/functions/v1';

    const emailResponse = await resend.emails.send({
      from: "BulawayoJobs <noreply@resend.dev>",
      to: [adminEmail],
      subject: `New User Registration Pending Approval - ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New User Registration - BulawayoJobs</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>User Details:</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>National ID:</strong> ${nationalId}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Location:</strong> ${location}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/approve-user?token=${approveToken}" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
              ✅ APPROVE USER
            </a>
            
            <a href="${baseUrl}/approve-user?token=${rejectToken}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
              ❌ REJECT USER
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            You can also approve or reject this user by logging into the admin dashboard at: 
            <a href="${Deno.env.get('SITE_URL') || 'https://your-app-url.com'}/admin">Admin Dashboard</a>
          </p>

          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            This approval request will expire in 7 days.
          </p>
        </div>
      `,
    });

    console.log("Registration notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-admin-registration function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
