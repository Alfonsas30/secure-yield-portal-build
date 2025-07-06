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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get JWT from Authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      throw new Error('No authorization header')
    }

    // Verify JWT and get user
    const jwt = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt)
    
    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    const { token } = await req.json()
    
    if (!token || token.length !== 6) {
      throw new Error('Invalid token format')
    }

    console.log('Verifying TOTP setup for user:', user.id)

    // Get user profile with temporary TOTP secret
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('totp_secret, totp_enabled')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      throw new Error('User profile not found')
    }

    if (!profile.totp_secret) {
      throw new Error('TOTP setup not initiated. Call setup-totp first.')
    }

    if (profile.totp_enabled) {
      throw new Error('TOTP already enabled')
    }

    // Verify TOTP token with the temporary secret
    const totp = new TOTP({
      issuer: 'Banko Sistema',
      label: user.email || '',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: profile.totp_secret
    })

    const delta = totp.validate({ token, window: 1 })
    
    if (delta === null) {
      console.log('Invalid TOTP token provided during setup')
      throw new Error('Invalid TOTP token')
    }

    // Generate backup codes
    const backupCodes = []
    for (let i = 0; i < 10; i++) {
      const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
      backupCodes.push(code)
    }

    // Save backup codes to database
    const backupCodeInserts = backupCodes.map(code => ({
      user_id: user.id,
      code: code,
      used: false
    }))

    const { error: backupError } = await supabaseClient
      .from('backup_codes')
      .insert(backupCodeInserts)

    if (backupError) {
      console.error('Error saving backup codes:', backupError)
      throw new Error('Failed to save backup codes')
    }

    // Enable TOTP for the user
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        totp_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error enabling TOTP:', updateError)
      throw new Error('Failed to enable TOTP')
    }

    console.log('TOTP setup completed successfully for user:', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'TOTP setup completed successfully',
        backup_codes: backupCodes
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('TOTP setup verification error:', error)
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