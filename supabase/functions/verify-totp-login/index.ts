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
    const { email, code, isBackupCode = false } = await req.json()
    
    if (!email || !code) {
      throw new Error('Email and code are required')
    }

    if (!isBackupCode && code.length !== 6) {
      throw new Error('Invalid TOTP code format')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Verifying TOTP login for email:', email, 'backup code:', isBackupCode)

    // Get user profile by email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_id, totp_secret, totp_enabled, email')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      throw new Error('User not found')
    }

    if (!profile.totp_enabled) {
      throw new Error('TOTP not enabled for this user')
    }

    let isValid = false

    if (isBackupCode) {
      // Verify backup code
      const { data: backupCode, error: backupError } = await supabaseClient
        .from('backup_codes')
        .select('id, used')
        .eq('user_id', profile.user_id)
        .eq('code', code.toUpperCase())
        .single()

      if (backupError || !backupCode) {
        console.log('Backup code not found for user:', profile.user_id)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid backup code' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (backupCode.used) {
        console.log('Backup code already used for user:', profile.user_id)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Backup code already used' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Mark backup code as used
      const { error: updateError } = await supabaseClient
        .from('backup_codes')
        .update({ 
          used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('id', backupCode.id)

      if (updateError) {
        console.error('Error updating backup code:', updateError)
        throw new Error('Failed to process backup code')
      }

      isValid = true
    } else {
      // Verify TOTP code
      if (!profile.totp_secret) {
        throw new Error('TOTP secret not found')
      }

      const totp = new TOTP({
        issuer: 'Banko Sistema',
        label: profile.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: profile.totp_secret
      })

      isValid = totp.validate({ token: code, window: 1 }) !== null
    }

    if (!isValid) {
      console.log('Invalid TOTP code for user:', profile.user_id)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid code. Please try again.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('TOTP verification successful for user:', profile.user_id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'TOTP verification successful',
        userId: profile.user_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('TOTP login verification error:', error)
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