import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendNewsletterRequest {
  campaignId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send newsletter request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId }: SendNewsletterRequest = await req.json();
    console.log("Processing newsletter send for campaign:", campaignId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('status', 'draft')
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found or already sent');
    }

    // Get active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscribers')
      .select('email, name, unsubscribe_token')
      .eq('status', 'active');

    if (subscribersError) {
      throw new Error('Failed to get subscribers');
    }

    if (!subscribers || subscribers.length === 0) {
      throw new Error('No active subscribers found');
    }

    console.log(`Sending newsletter to ${subscribers.length} subscribers`);

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-newsletter?token=${subscriber.unsubscribe_token}`;
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">LTB Bankas</h1>
            <p style="color: #64748b; font-size: 14px;">Naujienlaiškis</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            ${campaign.content}
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
              Jei nebenorite gauti mūsų laiškų, galite 
              <a href="${unsubscribeUrl}" style="color: #2563eb;">atsisakyti prenumeratos</a>
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © 2024 LTB Bankas. Visi teisės saugomos.
            </p>
          </div>
        </div>
      `;

      return resend.emails.send({
        from: "LTB Bankas <hello@viltb.com>",
        to: [subscriber.email],
        subject: campaign.subject,
        html: emailContent,
      });
    });

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failureCount = results.filter(result => result.status === 'rejected').length;

    console.log(`Email sending complete: ${successCount} successful, ${failureCount} failed`);

    // Update campaign status
    const { error: updateError } = await supabase
      .from('newsletter_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipient_count: successCount,
      })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Error updating campaign status:', updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Newsletter sent to ${successCount} subscribers`,
      stats: {
        total: subscribers.length,
        successful: successCount,
        failed: failureCount,
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);