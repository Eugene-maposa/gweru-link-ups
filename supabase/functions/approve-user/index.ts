
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Invalid approval link', { status: 400 });
    }

    console.log('Processing approval with token:', token);

    // Find the approval token
    const { data: tokenData, error: tokenError } = await supabase
      .from('approval_tokens')
      .select('*')
      .or(`approve_token.eq.${token},reject_token.eq.${token}`)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token not found:', tokenError);
      return new Response('Invalid or expired approval link', { status: 400 });
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response('Approval link has expired', { status: 400 });
    }

    const isApproval = token === tokenData.approve_token;
    const newStatus = isApproval ? 'approved' : 'rejected';

    // Update user approval status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ approval_status: newStatus })
      .eq('id', tokenData.user_id);

    if (updateError) {
      console.error('Error updating user status:', updateError);
      return new Response('Error processing approval', { status: 500 });
    }

    // Delete the used token
    await supabase
      .from('approval_tokens')
      .delete()
      .eq('id', tokenData.id);

    const message = isApproval 
      ? '✅ User has been approved successfully!' 
      : '❌ User has been rejected.';

    return new Response(`
      <html>
        <head>
          <title>User ${isApproval ? 'Approved' : 'Rejected'}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #16a34a; }
            .reject { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="${isApproval ? 'success' : 'reject'}">${message}</h1>
          <p>The user's status has been updated in the system.</p>
          <a href="${Deno.env.get('SITE_URL') || 'https://your-app-url.com'}/admin">Go to Admin Dashboard</a>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error: any) {
    console.error("Error in approve-user function:", error);
    return new Response('Internal server error', { status: 500 });
  }
};

serve(handler);
