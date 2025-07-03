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

    console.log('Setting up TOTP for user:', user.id)

    // Check if user already has TOTP enabled
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('totp_enabled, totp_secret')
      .eq('user_id', user.id)
      .single()

    if (profile?.totp_enabled) {
      return new Response(
        JSON.stringify({ error: 'TOTP already enabled' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate new TOTP secret
    const secret = new TOTP({
      issuer: 'Banko Sistema',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    })

    // Generate a random secret
    const randomSecret = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    secret.secret = randomSecret

    // Save the secret to database (will be confirmed when user verifies)
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        totp_secret: randomSecret,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error saving TOTP secret:', updateError)
      throw new Error('Failed to save TOTP secret')
    }

    // Generate QR code URL
    const totpUrl = secret.toString()

    console.log('TOTP setup successful for user:', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        qrCodeUrl: totpUrl,
        secret: randomSecret,
        backupUrl: `otpauth://totp/${encodeURIComponent(user.email || '')}?secret=${randomSecret}&issuer=${encodeURIComponent('Banko Sistema')}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('TOTP setup error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to setup TOTP'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})