import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TOTP } from 'https://esm.sh/otpauth@9.4.0'

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
    const { email, token } = await req.json()
    
    if (!email || !token) {
      throw new Error('Email and token are required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Verifying TOTP login for email:', email)

    // Get user profile with TOTP secret
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('totp_secret, totp_enabled, user_id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      throw new Error('User not found')
    }

    if (!profile.totp_enabled || !profile.totp_secret) {
      throw new Error('TOTP not enabled for this user')
    }

    // Verify TOTP token
    const totp = new TOTP({
      issuer: 'Banko Sistema',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: profile.totp_secret
    })

    const delta = totp.validate({ token, window: 1 })
    
    if (delta === null) {
      console.log('Invalid TOTP token provided')
      throw new Error('Invalid TOTP token')
    }

    console.log('TOTP verification successful for user:', profile.user_id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'TOTP verification successful',
        user_id: profile.user_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('TOTP login verification error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})