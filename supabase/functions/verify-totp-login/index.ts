
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
    const { email, token, isBackupCode = false } = await req.json()
    
    if (!email || !token) {
      throw new Error('El. paštas ir kodas yra privalomi')
    }

    // Validate token format
    if (!isBackupCode && (token.length !== 6 || !/^\d{6}$/.test(token))) {
      throw new Error('TOTP kodas turi būti 6 skaitmenų')
    }

    if (isBackupCode && (token.length !== 8 || !/^[A-F0-9]{8}$/.test(token.toUpperCase()))) {
      throw new Error('Atsarginis kodas turi būti 8 simbolių')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Verifying TOTP login for email:', email, 'isBackupCode:', isBackupCode)
    console.log('Server time:', new Date().toISOString())

    // Get user profile with TOTP secret
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('totp_secret, totp_enabled, user_id, email')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      throw new Error('Vartotojas nerastas')
    }

    if (!profile.totp_enabled || !profile.totp_secret) {
      throw new Error('TOTP neįjungtas šiam vartotojui')
    }

    let verificationSuccessful = false

    if (isBackupCode) {
      // Verify backup code
      const { data: backupCode, error: backupError } = await supabaseClient
        .from('backup_codes')
        .select('id, used')
        .eq('user_id', profile.user_id)
        .eq('code', token.toUpperCase())
        .eq('used', false)
        .single()

      if (backupError || !backupCode) {
        console.log('Invalid or used backup code for user:', profile.user_id)
        throw new Error('Neteisingas arba jau panaudotas atsarginis kodas')
      }

      // Mark backup code as used
      const { error: markUsedError } = await supabaseClient
        .from('backup_codes')
        .update({ 
          used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('id', backupCode.id)

      if (markUsedError) {
        console.error('Error marking backup code as used:', markUsedError)
        throw new Error('Nepavyko atnaujinti atsarginio kodo')
      }

      verificationSuccessful = true
      console.log('Backup code verification successful for user:', profile.user_id)
    } else {
      // Verify TOTP token
      const totp = new TOTP({
        issuer: 'VILTB Bankas',
        label: email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: profile.totp_secret
      })

      // Increased window from 1 to 2 for better time synchronization (±60 seconds)
      const delta = totp.validate({ token, window: 2 })
      
      console.log('TOTP validation attempt:', {
        token,
        window: 2,
        delta,
        serverTime: new Date().toISOString(),
        secret: profile.totp_secret.substring(0, 8) + '...' // Log partial secret for debugging
      })
      
      if (delta === null) {
        console.log('Invalid TOTP token provided for user:', profile.user_id)
        throw new Error('Neteisingas TOTP kodas. Patikrinkite, ar jūsų įrenginio laikas yra sinchronizuotas. TOTP kodai veikia 30 sekundžių ir priklauso nuo tikslaus laiko. Bandykite naują kodą iš programėlės.')
      }

      verificationSuccessful = true
      console.log('TOTP verification successful for user:', profile.user_id, 'delta:', delta)
    }

    if (verificationSuccessful) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'TOTP patvirtinimas sėkmingas',
          user_id: profile.user_id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('TOTP login verification error:', error)
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
