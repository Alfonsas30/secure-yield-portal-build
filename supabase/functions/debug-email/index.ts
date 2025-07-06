import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 DEBUG EMAIL FUNCTION STARTED');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if RESEND_API_KEY exists
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log('🔑 RESEND_API_KEY exists:', !!resendApiKey);
    console.log('🔑 RESEND_API_KEY length:', resendApiKey?.length || 0);
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found');
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY not configured",
          details: "Missing API key in environment variables"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);
    console.log('📧 Resend client initialized');

    // Get admin email
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    console.log('🎯 Target email:', adminEmail);

    // Log email details before sending
    const emailSubject = `Email Test - ${new Date().toLocaleTimeString()}`;
    const emailContent = `Email test sent at: ${new Date().toLocaleString('lt-LT')}`;
    
    console.log('📧 ========== EMAIL SENDING DETAILS ==========');
    console.log('📧 From:', 'LTB Bankas <noreply@ltb-bankas.com>');
    console.log('📧 To:', adminEmail);
    console.log('📧 Subject:', emailSubject);
    console.log('📧 Content Length:', emailContent.length, 'characters');
    console.log('📧 Timestamp:', new Date().toISOString());
    console.log('📧 Domain Status: Need to verify noreply@ltb-bankas.com in Resend');
    console.log('📧 =============================================');

    // Send test email with improved sender and simpler content
    console.log('📤 Attempting to send test email...');
    const startTime = Date.now();
    
    const emailResponse = await resend.emails.send({
      from: `LTB Bankas <noreply@ltb-bankas.com>`,
      to: [adminEmail],
      subject: emailSubject,
      html: `
        <h2>Email Test Successful!</h2>
        <p>Test sent at: ${new Date().toLocaleString('lt-LT')}</p>
        <p>Function: debug-email</p>
        <p>Target: ${adminEmail}</p>
        <p>If you see this - email system works!</p>
      `,
    });

    const processingTime = Date.now() - startTime;

    console.log('📧 ========== RESEND API RESPONSE ==========');
    console.log('📧 Processing Time:', processingTime + 'ms');
    console.log('📧 Response Status:', emailResponse.error ? 'ERROR' : 'SUCCESS');
    
    if (emailResponse.data) {
      console.log('📧 Email ID:', emailResponse.data.id);
      console.log('📧 Created At:', emailResponse.data.created_at);
      console.log('📧 From:', emailResponse.data.from);
      console.log('📧 To:', emailResponse.data.to);
      console.log('📧 Subject:', emailResponse.data.subject);
    }
    
    console.log('📧 Full Response:', JSON.stringify(emailResponse, null, 2));
    console.log('📧 ==========================================');

    if (emailResponse.error) {
      console.error('❌ Resend API error:', emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: "Email sending failed",
          details: emailResponse.error,
          resend_response: emailResponse
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('✅ DEBUG EMAIL SENT SUCCESSFULLY!');
    console.log('📧 Email ID:', emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Debug email sent successfully",
        email_id: emailResponse.data?.id,
        sent_to: adminEmail,
        resend_response: emailResponse.data
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('❌ DEBUG EMAIL ERROR:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({ 
        error: "Debug email failed",
        details: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);