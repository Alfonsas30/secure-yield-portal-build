import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple HMAC-SHA256 implementation for Binance API
async function createSignature(secret: string, queryString: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(queryString)
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, apiKey, apiSecret, amount, asset } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const baseUrl = "https://api.binance.com";
    
    if (action === "verify") {
      // Verify API key and check restrictions
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = await createSignature(apiSecret, queryString);
      
      const response = await fetch(`${baseUrl}/sapi/v1/account/apiRestrictions?${queryString}&signature=${signature}`, {
        headers: {
          'X-MBX-APIKEY': apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error("Invalid API credentials or insufficient permissions");
      }
      
      const restrictions = await response.json();
      
      // Check if API has required permissions
      if (!restrictions.enableReading || restrictions.enableSpotAndMarginTrading) {
        throw new Error("API key must have reading permissions only");
      }

      // Store encrypted API credentials in database
      const { error: upsertError } = await supabaseClient
        .from('profiles')
        .update({
          binance_api_key: apiKey,
          binance_api_secret: apiSecret // In production, this should be encrypted
        })
        .eq('user_id', user.id);

      if (upsertError) {
        console.error('Error storing API credentials:', upsertError);
        throw new Error("Failed to store API credentials");
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Binance account connected successfully",
        restrictions 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
      
    } else if (action === "getBalances") {
      // Get account balances
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('binance_api_key, binance_api_secret')
        .eq('user_id', user.id)
        .single();

      if (!profile?.binance_api_key) {
        throw new Error("Binance account not connected");
      }

      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = await createSignature(profile.binance_api_secret, queryString);
      
      const response = await fetch(`${baseUrl}/api/v3/account?${queryString}&signature=${signature}`, {
        headers: {
          'X-MBX-APIKEY': profile.binance_api_key
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch balances");
      }
      
      const account = await response.json();
      
      // Filter relevant assets (USDT, USDC, BTC, ETH, BNB)
      const relevantAssets = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'];
      const balances = account.balances
        .filter((balance: any) => relevantAssets.includes(balance.asset) && parseFloat(balance.free) > 0)
        .map((balance: any) => ({
          asset: balance.asset,
          free: parseFloat(balance.free),
          locked: parseFloat(balance.locked)
        }));

      return new Response(JSON.stringify({ 
        success: true, 
        balances 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
      
    } else if (action === "transfer") {
      // Simulate transfer (in real implementation, this would use spot trading to convert to USDT/USDC)
      if (!amount || !asset) {
        throw new Error("Amount and asset are required");
      }

      // Convert to LT based on asset type
      let ltAmount = 0;
      if (asset === 'USDT' || asset === 'USDC') {
        ltAmount = amount * 3.5; // 1 USD = 3.5 LT
      } else if (asset === 'BTC') {
        // For demo, assume 1 BTC = 90000 USD
        ltAmount = amount * 90000 * 3.5;
      } else if (asset === 'ETH') {
        // For demo, assume 1 ETH = 3000 USD
        ltAmount = amount * 3000 * 3.5;
      } else {
        throw new Error("Unsupported asset for transfer");
      }

      // Update user balance using atomic function
      const supabaseServiceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { data, error } = await supabaseServiceClient.rpc('atomic_balance_update', {
        p_user_id: user.id,
        p_amount: ltAmount,
        p_transaction_type: 'binance_deposit',
        p_description: `Papildymas iš Binance: ${amount} ${asset}`
      });

      if (error) {
        console.error('Balance update error:', error);
        throw new Error("Failed to update balance");
      }

      return new Response(JSON.stringify({ 
        success: true, 
        new_balance: data.new_balance,
        amount_lt: ltAmount,
        amount_crypto: amount,
        asset: asset
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Invalid action");
    
  } catch (error) {
    console.error('Binance API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});