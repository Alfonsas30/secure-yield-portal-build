import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { amount, recipientAccount, recipientName, description } = await req.json()

    // Input validation
    if (!amount || amount <= 0 || amount > 50000) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount. Must be between 0.01 and 50,000 LT' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!recipientAccount || !recipientName) {
      return new Response(
        JSON.stringify({ error: 'Recipient account and name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Processing withdrawal request for user ${user.id}: ${amount} LT to ${recipientAccount}`)

    // Use the atomic balance update function to process withdrawal (negative amount)
    const { data: result, error: withdrawalError } = await supabase
      .rpc('atomic_balance_update', {
        p_user_id: user.id,
        p_amount: -Math.abs(amount), // Ensure negative amount for withdrawal
        p_transaction_type: 'withdrawal',
        p_description: description || `Pinigų išėmimas į ${recipientName} sąskaitą ${recipientAccount}`,
        p_recipient_account: recipientAccount,
        p_recipient_name: recipientName
      })

    if (withdrawalError) {
      console.error('Withdrawal error:', withdrawalError)
      return new Response(
        JSON.stringify({ error: withdrawalError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!result?.success) {
      console.error('Withdrawal failed:', result)
      return new Response(
        JSON.stringify({ 
          error: result?.error || 'Withdrawal failed',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Withdrawal successful: ${amount} LT withdrawn to ${recipientAccount}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Withdrawal processed successfully',
        newBalance: result.new_balance,
        transactionId: result.transaction_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})