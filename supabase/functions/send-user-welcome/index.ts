import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userEmail: string;
  fullName: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, fullName, role }: WelcomeEmailRequest = await req.json();

    console.log('Sending welcome email to user:', userEmail);

    const emailResponse = await resend.emails.send({
      from: "GweruJobs <noreply@resend.dev>",
      to: [userEmail],
      subject: `Welcome to GweruJobs, ${fullName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Welcome to GweruJobs!</h1>
          </div>
          
          <p style="font-size: 16px; color: #333;">Dear ${fullName},</p>
          
          <p style="font-size: 16px; color: #333;">
            Thank you for registering with GweruJobs as a <strong>${role}</strong>. 
            Your account has been created successfully!
          </p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0;">What's Next?</h3>
            <p style="margin: 0; color: #333;">
              Your registration is pending admin approval. Once approved, you'll have full access to:
            </p>
            <ul style="color: #333; margin: 10px 0;">
              ${role === 'worker' 
                ? '<li>Browse and apply for jobs in Gweru</li><li>Create your professional profile</li><li>Connect with employers</li>'
                : '<li>Post job opportunities</li><li>Find skilled workers in Gweru</li><li>Manage your job listings</li>'
              }
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #333;">
            You will receive another email once your account has been approved. This usually takes 1-2 business days.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://id-preview--31d30469-ab2a-4307-aaac-5ecd4b4d9715.lovable.app/auth" 
               style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Sign In to Your Account
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            If you didn't create this account, please ignore this email.
          </p>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Best regards,<br>
            <strong>The GweruJobs Team</strong>
          </p>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-welcome function:", error);
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
