
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TOTP } from 'https://esm.sh/otpauth@9.4.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Proper Base32 alphabet (RFC 4648) - ONLY these 32 characters are allowed
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(length = 32): string {
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_ALPHABET[Math.floor(Math.random() * BASE32_ALPHABET.length)];
  }
  return secret;
}

// Validate that secret is proper base32
function isValidBase32(secret: string): boolean {
  const base32Regex = /^[A-Z2-7]+$/;
  return base32Regex.test(secret) && secret.length % 8 === 0;
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

    // Clear any existing invalid TOTP secret first
    await supabaseClient
      .from('profiles')
      .update({ 
        totp_secret: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    console.log('Cleared existing TOTP secret for fresh setup')

    // Generate proper base32 secret for TOTP (must be multiple of 8 for proper base32)
    const base32Secret = generateBase32Secret(32) // 32 chars = proper base32 length
    
    // Validate the generated secret
    if (!isValidBase32(base32Secret)) {
      console.error('Generated invalid base32 secret:', base32Secret)
      throw new Error('Failed to generate valid base32 secret')
    }
    
    console.log('Generated valid base32 secret:', {
      length: base32Secret.length,
      isValid: isValidBase32(base32Secret),
      sample: base32Secret.substring(0, 8) + '...'
    })

    // Create TOTP instance with the secret
    const totp = new TOTP({
      issuer: 'VILTB Bankas',
      label: user.email || profile.email || 'VILTB vartotojas',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: base32Secret
    })

    // Test that the TOTP instance works
    try {
      const testToken = totp.generate()
      console.log('TOTP test generation successful, token length:', testToken.length)
    } catch (totpError) {
      console.error('TOTP generation test failed:', totpError)
      throw new Error('Generated secret cannot be used for TOTP')
    }

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
    console.log('TOTP URL generated successfully for secret:', base32Secret.substring(0, 8) + '...')

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
