import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { email } = await req.json()
    
    if (!email) {
      throw new Error('Email is required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('=== MFA DEBUG FOR EMAIL:', email, '===')

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    console.log('Profile data:', profile)
    console.log('Profile error:', profileError)

    // Get user from auth.users
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()
    const authUser = authUsers.users.find(u => u.email === email)
    
    console.log('Auth user:', authUser ? { id: authUser.id, email: authUser.email, confirmed_at: authUser.confirmed_at } : 'Not found')

    // Get verification codes
    const { data: codes, error: codesError } = await supabaseClient
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log('Recent verification codes:', codes)

    // Get backup codes if TOTP enabled
    let backupCodes = null
    if (profile?.totp_enabled && authUser) {
      const { data: backup } = await supabaseClient
        .from('backup_codes')
        .select('code, used, created_at')
        .eq('user_id', authUser.id)
        .limit(3)
      
      backupCodes = backup
      console.log('Backup codes sample:', backup)
    }

    const debugInfo = {
      email,
      profile: profile ? {
        mfa_enabled: profile.mfa_enabled,
        totp_enabled: profile.totp_enabled,
        user_id: profile.user_id,
        created_at: profile.created_at
      } : null,
      authUser: authUser ? {
        id: authUser.id,
        confirmed: !!authUser.confirmed_at,
        created_at: authUser.created_at
      } : null,
      recentCodes: codes?.length || 0,
      errors: {
        profileError: profileError?.message,
        authError: authError?.message,
        codesError: codesError?.message
      }
    }

    console.log('=== DEBUG SUMMARY ===')
    console.log(JSON.stringify(debugInfo, null, 2))

    return new Response(
      JSON.stringify({
        success: true,
        debug: debugInfo,
        canTestMFA: !!(profile && authUser),
        nextSteps: [
          !profile ? 'User profile not found' : null,
          !authUser ? 'Auth user not found' : null,
          !profile?.mfa_enabled ? 'MFA not enabled - enable in profile settings' : null,
          !authUser?.confirmed_at ? 'Email not confirmed' : null,
        ].filter(Boolean)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Debug MFA error:', error)
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