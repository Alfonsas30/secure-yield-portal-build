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
    const { code } = await req.json()
    
    if (!code || code.length !== 6) {
      throw new Error('Invalid TOTP code format')
    }

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

    console.log('Verifying TOTP setup for user:', user.id, 'with code:', code)

    // Get user's TOTP secret
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('totp_secret, totp_enabled')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('User profile not found')
    }

    if (profile.totp_enabled) {
      throw new Error('TOTP already enabled')
    }

    if (!profile.totp_secret) {
      throw new Error('TOTP secret not found. Please restart setup.')
    }

    // Verify TOTP code
    const totp = new TOTP({
      issuer: 'Banko Sistema',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: profile.totp_secret
    })

    const isValid = totp.validate({ token: code, window: 1 }) !== null

    if (!isValid) {
      console.log('Invalid TOTP code for user:', user.id)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid TOTP code. Please try again.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enable TOTP for user
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

    // Generate backup codes
    const backupCodes = []
    for (let i = 0; i < 10; i++) {
      const { data } = await supabaseClient.rpc('generate_backup_code')
      backupCodes.push(data)
    }

    // Save backup codes
    const backupCodeInserts = backupCodes.map(code => ({
      user_id: user.id,
      code: code
    }))

    const { error: backupError } = await supabaseClient
      .from('backup_codes')
      .insert(backupCodeInserts)

    if (backupError) {
      console.error('Error saving backup codes:', backupError)
      // Don't fail the whole process, just log the error
    }

    console.log('TOTP setup completed for user:', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'TOTP enabled successfully',
        backupCodes: backupCodes
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('TOTP verification error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})