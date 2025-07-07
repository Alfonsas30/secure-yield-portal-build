import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/utils/authErrors';

export class AuthService {
  static async signUp(email: string, password: string, t: (key: string) => string, displayName?: string) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });

    return { error };
  }

  static async signIn(email: string, password: string, t: (key: string) => string) {
    try {
      console.log('=== SIGNIN STARTED ===');
      console.log('Email:', email);
      console.log('Timestamp:', new Date().toISOString());
      
      // First check if user exists and has MFA/TOTP enabled
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('mfa_enabled, totp_enabled, email')
        .eq('email', email)
        .single();

      console.log('Profile query result:', { profileData, profileError });

      // If user not found in profiles, try regular signin (might be new user)
      if (profileError || !profileData) {
        console.log('No profile found, attempting regular signin');
        console.log('This might be a new user or profile was deleted after DB restore');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.log('Regular SignIn error:', signInError);
          console.log('Error code:', signInError.message);
          
          // Provide more helpful error messages
        if (signInError.message.includes('Invalid login credentials')) {
          const helpfulError = new Error(
            'Neteisingi prisijungimo duomenys. Po duomenų bazės atnaujinimo jūsų senos paskyros gali nebelikti. ' +
            'Pabandykite užsiregistruoti iš naujo su tuo pačiu el. paštu arba išvalykite cache duomenis.'
          );
          return { error: helpfulError };
        }
        
        // Check if this might be a profile/balance creation issue
        if (signInError.message.includes('violates row-level security') || 
            signInError.message.includes('account_balances')) {
          const helpfulError = new Error(
            'Klaida kuriant vartotojo duomenis. Bandykite prisijungti dar kartą arba susisiekite su administracija.'
          );
          return { error: helpfulError };
        }
          
          return { error: signInError };
        }

        console.log('Regular SignIn successful');
        return { error: null };
      }

      // If user has MFA enabled, try to send verification code but allow fallback
      if (profileData.mfa_enabled) {
        console.log('=== MFA ENABLED - Attempting to send verification code ===');
        try {
          const { error: codeError } = await AuthService.sendVerificationCode(email, t);
          if (!codeError) {
            console.log('=== MFA code sent successfully ===');
            return { error: null, requiresMFA: true };
          } else {
            console.log('=== MFA code sending failed, allowing signin without MFA ===');
            console.log('MFA Error:', codeError);
          }
        } catch (mfaError) {
          console.log('=== MFA system failed, proceeding with regular signin ===');
          console.log('MFA Exception:', mfaError);
        }
        
        // Fallback: If MFA fails, allow regular signin
        console.log('=== FALLBACK: Proceeding with regular signin (MFA bypass) ===');
      }

      // TOTP temporarily disabled
      // if (profileData.totp_enabled) {
      //   console.log('=== TOTP ENABLED - Requiring TOTP verification ===');
      //   return { error: null, requiresTOTP: true };
      // }

      // Regular sign in for users without MFA/TOTP
      console.log('=== REGULAR SIGNIN - No 2FA required ===');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.log('SignIn error:', signInError);
        
        // Provide more helpful error messages
        if (signInError.message.includes('Invalid login credentials')) {
          const helpfulError = new Error(
            'Neteisingi prisijungimo duomenys. Po duomenų bazės atnaujinimo jūsų senos paskyros gali nebelikti. ' +
            'Pabandykite užsiregistruoti iš naujo su tuo pačiu el. paštu arba išvalykite cache duomenis.'
          );
          return { error: helpfulError };
        }
        
        return { error: signInError };
      }

      console.log('SignIn successful for user:', signInData.user.id);
      return { error: null };
    } catch (error: any) {
      console.error('SignIn exception:', error);
      return { error };
    }
  }

  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      return { error };
    } catch (error: any) {
      console.error('Google signIn exception:', error);
      return { error };
    }
  }

  static async signOut(clearAllAuthData: () => void) {
    console.log('Attempting to sign out...');
    
    try {
      // Check if we have a valid session before attempting logout
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log('No active session found, clearing state...');
        // Clear all Supabase authentication data thoroughly
        clearAllAuthData();
        return { error: null };
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message.includes('session_not_found') && !error.message.includes('Session not found')) {
        console.error('Logout error:', error);
        return { error };
      } else {
        console.log('Successfully signed out');
        // Use comprehensive cleanup
        clearAllAuthData();
      }

      return { error };
    } catch (error) {
      console.error('SignOut exception:', error);
      return { error };
    }
  }

  static async resendConfirmation(email: string) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    return { error };
  }

  static async sendVerificationCode(email: string, t: (key: string) => string) {
    try {
      console.log('Sending verification code to:', email);
      
      // Use Supabase functions invoke instead of direct HTTP
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { email }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (!data.success) {
        console.error('Verification code sending failed:', data.error);
        throw new Error(data.error || 'Failed to send verification code');
      }

      console.log('Verification code sent successfully');
      return { error: null };
    } catch (error: any) {
      console.error('sendVerificationCode error:', error);
      return { error };
    }
  }

  static async verifyCodeAndSignIn(email: string, password: string, code: string) {
    try {
      console.log('Verifying code and signing in...');
      
      // Use Supabase functions invoke to verify code
      const { data, error } = await supabase.functions.invoke('verify-code', {
        body: { email, code }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw error;
      }

      if (!data.success) {
        console.error('Code verification failed:', data.error);
        throw new Error(data.error || 'Invalid verification code');
      }

      // If code is valid, proceed with normal sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      console.log('Verification and sign in successful');
      return { error: null };
    } catch (error: any) {
      console.error('verifyCodeAndSignIn error:', error);
      return { error };
    }
  }

  static async setupTOTP() {
    try {
      console.log('Calling setup-totp edge function...');
      const { data, error } = await supabase.functions.invoke('setup-totp');
      
      console.log('Setup-totp response:', { data, error });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return { error: null };
    } catch (error: any) {
      console.error('Setup TOTP error:', error);
      return { error };
    }
  }

  static async verifyTOTP(email: string, code: string, isBackupCode = false) {
    try {
      console.log('Verifying TOTP for email:', email);

      const { data, error } = await supabase.functions.invoke('verify-totp-login', {
        body: { 
          email, 
          code,
          isBackupCode 
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      console.log('TOTP verification successful');
      return { error: null };
    } catch (error: any) {
      console.error('TOTP verification error:', error);
      return { error };
    }
  }
}