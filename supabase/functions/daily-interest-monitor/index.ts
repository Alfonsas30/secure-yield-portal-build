import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily interest monitoring check...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Check if yesterday's interest calculation exists
    const { data: yesterdayCalc, error: yesterdayError } = await supabase
      .from('daily_interest_calculations')
      .select('*')
      .eq('calculation_date', yesterday)
      .single();

    if (yesterdayError && yesterdayError.code !== 'PGRST116') {
      throw yesterdayError;
    }

    // Check if today's calculation should exist (after 00:30)
    const now = new Date();
    const shouldHaveTodayCalc = now.getHours() > 0 || (now.getHours() === 0 && now.getMinutes() > 30);
    
    let todayCalc = null;
    if (shouldHaveTodayCalc) {
      const { data, error } = await supabase
        .from('daily_interest_calculations')
        .select('*')
        .eq('calculation_date', today)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      todayCalc = data;
    }

    const issues = [];
    
    // Check for missing yesterday calculation
    if (!yesterdayCalc) {
      issues.push(`Missing daily interest calculation for ${yesterday}`);
      
      // Attempt to calculate missing interest
      try {
        const { data: calcResult, error: calcError } = await supabase
          .rpc('calculate_daily_interest');
        
        if (calcError) {
          issues.push(`Failed to auto-calculate missing interest: ${calcError.message}`);
        } else {
          console.log('Successfully calculated missing interest:', calcResult);
        }
      } catch (error) {
        issues.push(`Error running calculate_daily_interest: ${error.message}`);
      }
    }

    // Check for missing today calculation (if should exist)
    if (shouldHaveTodayCalc && !todayCalc) {
      issues.push(`Missing daily interest calculation for ${today} (should exist after 00:30)`);
    }

    if (issues.length > 0) {
      console.warn('Interest calculation issues found:', issues);
      
      // Send notification email about issues
      const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: 'admin@yourdomain.com', // Replace with actual admin email
          subject: 'Daily Interest Calculation Alert',
          message: `Daily interest calculation issues detected:\n\n${issues.join('\n')}\n\nTimestamp: ${new Date().toISOString()}`
        }
      });

      if (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      return new Response(
        JSON.stringify({
          success: false,
          issues,
          yesterday_calc: yesterdayCalc,
          today_calc: todayCalc,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log('All daily interest calculations are up to date');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'All daily interest calculations are up to date',
        yesterday_calc: yesterdayCalc,
        today_calc: todayCalc,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in daily interest monitoring:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});