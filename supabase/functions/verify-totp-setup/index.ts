
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TOTP } from 'https://esm.sh/otpauth@9.4.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate random backup codes
function generateBackupCodes(count = 10): string[] {
  const codes = []
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
    codes.push(code)
  }
  return codes
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
      throw new Error('Reikalinga autentifikacija')
    }

    // Verify JWT and get user
    const jwt = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt)
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      throw new Error('Netinkama autentifikacija')
    }

    const { token } = await req.json()
    
    if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
      throw new Error('Netinkamas kodo formatas. Reikalingas 6 skaitmenų kodas.')
    }

    console.log('Verifying TOTP setup for user:', user.id)

    // Get user profile with temporary TOTP secret
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('totp_secret, totp_enabled, email')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      throw new Error('Vartotojo profilis nerastas')
    }

    if (!profile.totp_secret) {
      throw new Error('TOTP dar nebuvo sukonfigūruotas. Pirmiausia paleiskite TOTP setup.')
    }

    if (profile.totp_enabled) {
      throw new Error('TOTP jau įjungtas')
    }

    // Verify TOTP token with the temporary secret
    const totp = new TOTP({
      issuer: 'VILTB Bankas',
      label: user.email || profile.email || 'VILTB vartotojas',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: profile.totp_secret
    })

    const delta = totp.validate({ token, window: 1 })
    
    if (delta === null) {
      console.log('Invalid TOTP token provided during setup for user:', user.id)
      throw new Error('Neteisingas TOTP kodas. Patikrinkite laiką ir bandykite dar kartą.')
    }

    console.log('TOTP token verified successfully, delta:', delta)

    // Generate backup codes
    const backupCodes = generateBackupCodes(10)
    console.log('Generated', backupCodes.length, 'backup codes')

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
      throw new Error('Nepavyko išsaugoti atsarginių kodų')
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
      throw new Error('Nepavyko įjungti TOTP')
    }

    console.log('TOTP setup completed successfully for user:', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'TOTP sėkmingai sukonfigūruotas',
        backupCodes: backupCodes
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('TOTP setup verification error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'TOTP patvirtinimo klaida'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
