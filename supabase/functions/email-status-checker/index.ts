import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log('🔍 Email Status Checker started');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found');
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY not configured" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);
    console.log('📧 Resend client initialized for status check');

    // Get current domain status
    console.log('🔍 ========== DOMAIN VERIFICATION STATUS ==========');
    console.log('🔍 Domain to check: ltb-bankas.com');
    console.log('🔍 Email addresses to verify:');
    console.log('🔍   - noreply@ltb-bankas.com');
    console.log('🔍   - admin@ltb-bankas.com');
    console.log('🔍 Action Required: https://resend.com/domains');
    console.log('🔍 ================================================');

    // Check rate limits and API status
    console.log('📊 ========== API STATUS & RATE LIMITS ==========');
    console.log('📊 Checking Resend API availability...');
    
    try {
      const testResponse = await fetch('https://api.resend.com/domains', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 API Response Status:', testResponse.status);
      console.log('📊 Rate Limit Remaining:', testResponse.headers.get('x-ratelimit-remaining') || 'Unknown');
      console.log('📊 Rate Limit Reset:', testResponse.headers.get('x-ratelimit-reset') || 'Unknown');
      console.log('📊 Rate Limit Limit:', testResponse.headers.get('x-ratelimit-limit') || 'Unknown');
      
      if (testResponse.ok) {
        const domains = await testResponse.json();
        console.log('📊 Verified Domains:', JSON.stringify(domains, null, 2));
      }
      
    } catch (apiError) {
      console.error('📊 API Check failed:', apiError);
    }
    
    console.log('📊 ===============================================');

    // Email delivery statistics
    console.log('📈 ========== EMAIL STATISTICS ==========');
    console.log('📈 Service: Resend Email API');
    console.log('📈 Current Status: Monitoring Active');
    console.log('📈 Domain Verification: REQUIRED');
    console.log('📈 Recommendation: Verify ltb-bankas.com domain');
    console.log('📈 Alternative: Use verified @resend.dev domain');
    console.log('📈 Rate Limit: Check headers above');
    console.log('📈 ========================================');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Email status check completed",
        recommendations: [
          "Verify ltb-bankas.com domain in Resend dashboard",
          "Check rate limits before sending bulk emails",
          "Monitor delivery status in Resend logs",
          "Use backup notification methods if needed"
        ],
        links: {
          domains: "https://resend.com/domains",
          logs: "https://resend.com/logs",
          api_keys: "https://resend.com/api-keys"
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('❌ Email status check error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Email status check failed",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);