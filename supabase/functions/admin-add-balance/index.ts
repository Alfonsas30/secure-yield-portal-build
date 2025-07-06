import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ADMIN ADD BALANCE FUNCTION START ===');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { amount, userId, description } = await req.json();
    
    console.log('Request data:', { amount, userId, description });

    if (!amount || !userId) {
      throw new Error('Amount and userId are required');
    }

    // Use atomic balance update function to safely add funds
    const { data: updateResult, error: updateError } = await supabase
      .rpc('atomic_balance_update', {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: 'admin_credit',
        p_description: description || 'Admin balance adjustment'
      });

    if (updateError) {
      console.error('Balance update error:', updateError);
      throw updateError;
    }

    console.log('Balance update result:', updateResult);

    if (!updateResult.success) {
      throw new Error(updateResult.error || 'Failed to update balance');
    }

    console.log('=== ADMIN ADD BALANCE SUCCESS ===');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Balance updated successfully',
        newBalance: updateResult.new_balance,
        transactionId: updateResult.transaction_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Admin add balance error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});