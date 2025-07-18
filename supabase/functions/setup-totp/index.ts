
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TOTP } from 'https://esm.sh/otpauth@9.4.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Base32 alphabet for proper TOTP secret generation
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(length = 32): string {
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_ALPHABET[Math.floor(Math.random() * BASE32_ALPHABET.length)];
  }
  return secret;
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
      console.error('Authentication error:', authError)
      throw new Error('Invalid authorization')
    }

    console.log('Setting up TOTP for user:', user.id)

    // Check if user already has TOTP enabled
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('totp_enabled, totp_secret, email')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      throw new Error('User profile not found')
    }

    if (profile?.totp_enabled) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'TOTP jau įjungtas šiam vartotojui' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate proper base32 secret for TOTP
    const base32Secret = generateBase32Secret(32)
    console.log('Generated base32 secret length:', base32Secret.length)

    // Create TOTP instance with the secret
    const totp = new TOTP({
      issuer: 'VILTB Bankas',
      label: user.email || profile.email || 'VILTB vartotojas',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: base32Secret
    })

    // Save the secret to database (will be confirmed when user verifies)
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        totp_secret: base32Secret,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error saving TOTP secret:', updateError)
      throw new Error('Nepavyko išsaugoti TOTP nustatymų')
    }

    // Generate QR code URL
    const totpUrl = totp.toString()
    console.log('TOTP URL generated successfully')

    console.log('TOTP setup successful for user:', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        qrCodeUrl: totpUrl,
        secret: base32Secret,
        backupUrl: `otpauth://totp/${encodeURIComponent(user.email || profile.email || 'VILTB vartotojas')}?secret=${base32Secret}&issuer=${encodeURIComponent('VILTB Bankas')}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('TOTP setup error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Nepavyko sukonfigūruoti TOTP',
        details: 'TOTP konfigūracijos klaida'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
