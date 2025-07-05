import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Setting up cron jobs for automatic interest calculation');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create cron job for daily interest calculation
    const cronQuery = `
      SELECT cron.schedule(
        'daily-interest-calculation',
        '0 0 * * *', -- Run at midnight every day
        $$
        SELECT net.http_post(
          url := 'https://latwptcvghypdopbpxfr.supabase.co/functions/v1/calculate-daily-interest',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}"}'::jsonb,
          body := '{"scheduled": true}'::jsonb
        ) as request_id;
        $$
      );
    `;

    const { error } = await supabaseClient.rpc('http_post', {
      url: `${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/exec`,
      body: JSON.stringify({ query: cronQuery }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      }
    });

    if (error) {
      console.error('Cron setup error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to setup cron job' }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('✅ Daily interest calculation cron job set up successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron jobs configured successfully',
        jobs: [
          {
            name: 'daily-interest-calculation',
            schedule: '0 0 * * *',
            description: 'Calculate daily interest for all accounts'
          }
        ]
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error setting up cron jobs:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});