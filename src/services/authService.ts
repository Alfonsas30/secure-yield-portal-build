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
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.log('Regular SignIn error:', signInError);
          return { error: signInError };
        }

        console.log('Regular SignIn successful');
        return { error: null };
      }

      // If user has MFA enabled, send verification code
      if (profileData.mfa_enabled) {
        console.log('=== MFA ENABLED - Sending verification code ===');
        const { error: codeError } = await AuthService.sendVerificationCode(email, t);
        if (codeError) {
          return { error: codeError };
        }
        return { error: null, requiresMFA: true };
      }

      // If user has TOTP enabled, require TOTP verification
      if (profileData.totp_enabled) {
        console.log('=== TOTP ENABLED - Requiring TOTP verification ===');
        return { error: null, requiresTOTP: true };
      }

      // Regular sign in for users without MFA/TOTP
      console.log('=== REGULAR SIGNIN - No 2FA required ===');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.log('SignIn error:', signInError);
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
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { email }
      });

      console.log('send-verification-code response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data && !data.success) {
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
      // First verify the code
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-code', {
        body: { email, code }
      });

      if (verifyError) throw verifyError;
      if (!verifyData.success) throw new Error(verifyData.error);

      // If code is valid, proceed with normal sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      return { error: null };
    } catch (error: any) {
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