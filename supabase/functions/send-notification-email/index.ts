import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface NotificationRequest {
  to: string | string[];
  subject: string;
  message: string;
  html?: string;
  notification_type?: 'info' | 'warning' | 'success' | 'error';
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== SEND-NOTIFICATION-EMAIL STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Only POST method allowed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      }
    );
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      throw new Error("El. pašto paslauga nesukonfigūruota");
    }

    const resend = new Resend(resendApiKey);
    console.log('Resend client initialized for notification email');

    const { 
      to, 
      subject, 
      message, 
      html,
      notification_type = 'info'
    }: NotificationRequest = await req.json();

    console.log("Notification request:", { 
      to: Array.isArray(to) ? to.length + ' recipients' : to, 
      subject, 
      notification_type,
      has_html: !!html
    });

    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Trūksta duomenų pranešimo siuntimui" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Convert single email to array
    const recipients = Array.isArray(to) ? to : [to];
    
    // Determine notification styling based on type
    let headerColor = '#2563eb';
    let backgroundColor = '#dbeafe';
    let borderColor = '#2563eb';
    let icon = '📢';
    
    switch (notification_type) {
      case 'success':
        headerColor = '#16a34a';
        backgroundColor = '#f0fdf4';
        borderColor = '#16a34a';
        icon = '✅';
        break;
      case 'warning':
        headerColor = '#f59e0b';
        backgroundColor = '#fef3c7';
        borderColor = '#f59e0b';
        icon = '⚠️';
        break;
      case 'error':
        headerColor = '#dc2626';
        backgroundColor = '#fef2f2';
        borderColor = '#dc2626';
        icon = '❌';
        break;
      default:
        // info - keep default colors
        break;
    }

    // Generate HTML content if not provided
    const emailHtml = html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: ${headerColor}; text-align: center;">
          ${icon} VILTB Pranešimas
        </h1>
        
        <div style="background: ${backgroundColor}; padding: 20px; border-radius: 8px; border-left: 4px solid ${borderColor}; margin: 20px 0;">
          <h2 style="color: ${headerColor}; margin-top: 0;">${subject}</h2>
          <div style="color: ${headerColor}; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #6b7280;">
            Gavote šį pranešimą iš VILTB banko sistemos.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          VILTB Banko sistema - Patikimas ir saugus<br>
          Jei turite klausimų, susisiekite su mumis.
        </p>
      </div>
    `;

    // Send emails to all recipients
    const emailPromises = recipients.map(email => 
      resend.emails.send({
        from: "VILTB Bankas <noreply@viltb.com>",
        to: [email],
        subject: `VILTB: ${subject}`,
        html: emailHtml,
      })
    );

    const emailResults = await Promise.allSettled(emailPromises);
    
    // Count successes and failures
    const successful = emailResults.filter(result => result.status === 'fulfilled').length;
    const failed = emailResults.filter(result => result.status === 'rejected').length;

    console.log(`Notification emails sent: ${successful} successful, ${failed} failed`);

    // Log any failures
    emailResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send to ${recipients[index]}:`, result.reason);
      }
    });

    if (failed > 0 && successful === 0) {
      throw new Error("Nepavyko išsiųsti nei vieno pranešimo");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Pranešimas išsiųstas: ${successful} sėkmingai, ${failed} nesėkmingai`,
        stats: { successful, failed, total: recipients.length }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-notification-email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Nepavyko išsiųsti pranešimo" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
