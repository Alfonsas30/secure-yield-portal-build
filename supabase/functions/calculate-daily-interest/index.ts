import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InterestCalculationResult {
  success: boolean;
  accounts_processed: number;
  total_interest_paid: number;
  processed_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily interest calculation...');
    
    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call the database function to calculate daily interest
    const { data, error } = await supabase.rpc('calculate_daily_interest');

    if (error) {
      console.error('Error calculating daily interest:', error);
      throw error;
    }

    const result = data as InterestCalculationResult;
    
    console.log('Daily interest calculation completed:', {
      accounts_processed: result.accounts_processed,
      total_interest_paid: result.total_interest_paid,
      processed_at: result.processed_at
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily interest calculation completed successfully',
        ...result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in daily interest calculation:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});