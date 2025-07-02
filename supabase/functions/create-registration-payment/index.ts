import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  name: string;
  email: string;
  account_type: 'personal' | 'company';
  discount_code?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, account_type, discount_code }: PaymentRequest = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Define prices
    const prices = {
      personal: 80000, // 800€ in cents
      company: 150000  // 1500€ in cents
    };

    let originalPrice = prices[account_type];
    let finalPrice = originalPrice;
    let discountPercent = 0;

    // Apply discount if code provided
    if (discount_code) {
      const { data: discountData } = await supabaseClient
        .from('discount_codes')
        .select('discount_percent')
        .eq('code', discount_code.toUpperCase())
        .eq('email', email)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (discountData) {
        discountPercent = discountData.discount_percent;
        finalPrice = Math.round(originalPrice * (1 - discountPercent / 100));
      }
    }

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { 
              name: account_type === 'personal' 
                ? "LTB Bankas - Asmeninė sąskaita" 
                : "LTB Bankas - Įmonės sąskaita"
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
      metadata: {
        account_type,
        discount_code: discount_code || '',
        original_price: originalPrice.toString(),
        discount_percent: discountPercent.toString()
      }
    });

    // Store registration record
    await supabaseClient.from('account_registrations').insert({
      email,
      name,
      account_type,
      original_price: originalPrice,
      discount_code: discount_code || null,
      final_price: finalPrice,
      stripe_session_id: session.id,
      payment_status: 'pending'
    });

    console.log("Payment session created:", { 
      email, 
      account_type, 
      original_price: originalPrice, 
      final_price: finalPrice,
      discount_percent: discountPercent 
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-registration-payment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});