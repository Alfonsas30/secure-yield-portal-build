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
      console.log('Sending Email 2FA verification code to:', email);
      
      // Use direct HTTP call to send-email-2fa function
      const functionUrl = 'https://khcelroaozkzpyxayvpj.supabase.co/functions/v1/send-email-2fa';
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY2Vscm9hb3prenB5eGF5dnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTEzODQsImV4cCI6MjA2NzEyNzM4NH0.vL2P2P6xuWR-n-dZGg7kcg8l5y1nOn2N_XznyqYL97c`,
        },
        body: JSON.stringify({ 
          action: 'send_code', 
          email 
        })
      });

      console.log('HTTP Response status:', response.status);
      console.log('HTTP Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('send-email-2fa response data:', data);

      if (!data.success) {
        console.error('Verification code sending failed:', data.error);
        throw new Error(data.error || 'Failed to send verification code');
      }

      console.log('Email 2FA verification code sent successfully');
      return { error: null };
    } catch (error: any) {
      console.error('sendVerificationCode error:', error);
      return { error };
    }
  }

  static async verifyCodeAndSignIn(email: string, password: string, code: string) {
    try {
      console.log('Verifying Email 2FA code and signing in...');
      
      // Use direct HTTP call to verify code
      const functionUrl = 'https://khcelroaozkzpyxayvpj.supabase.co/functions/v1/send-email-2fa';
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY2Vscm9hb3prenB5eGF5dnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTEzODQsImV4cCI6MjA2NzEyNzM4NH0.vL2P2P6xuWR-n-dZGg7kcg8l5y1nOn2N_XznyqYL97c`,
        },
        body: JSON.stringify({ 
          action: 'verify_code', 
          code, 
          email 
        })
      });

      console.log('Verify HTTP Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Verify HTTP Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const verifyData = await response.json();
      console.log('Email 2FA verification response:', verifyData);

      if (!verifyData.success) throw new Error(verifyData.error);

      // If code is valid, proceed with normal sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      console.log('Email 2FA verification and sign in successful');
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