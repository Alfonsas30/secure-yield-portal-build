import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, formData } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Insert loan application with payment info
    const { error: dbError } = await supabaseService
      .from('loan_applications')
      .insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        monthly_income: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
        employment_info: formData.employmentInfo,
        loan_purpose: formData.loanPurpose,
        loan_amount: formData.loanAmount,
        loan_term_months: formData.loanTerm,
        monthly_payment: formData.monthlyPayment,
        total_payment: formData.totalPayment,
        interest_rate: formData.interestRate,
        stripe_session_id: sessionId,
        payment_status: 'paid',
        payment_amount: 1000
      });

    if (dbError) throw dbError;

    // Send email notification
    const { error: emailError } = await supabaseService.functions.invoke('submit-loan-application', {
      body: {
        ...formData,
        paymentConfirmed: true
      }
    });

    if (emailError) {
      console.error('Email error:', emailError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error processing loan payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});