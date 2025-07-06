import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile, AuthContextType } from '@/types/auth';
import { AuthService } from '@/services/authService';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthActivity } from '@/hooks/useAuthActivity';
import { getErrorMessage } from '@/utils/authErrors';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingMFAEmail, setPendingMFAEmail] = useState<string | null>(null);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [pendingTOTPEmail, setPendingTOTPEmail] = useState<string | null>(null);
  const [pendingTOTPPassword, setPendingTOTPPassword] = useState<string | null>(null);

  const sessionHook = useAuthSession();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and redirect to dashboard after successful login
          setTimeout(async () => {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching profile:', error);
            } else {
              setProfile(profileData);
              
              // Check if TOTP setup is required after profile is loaded
              if (profileData && !profileData.totp_enabled) {
                console.log('TOTP not enabled, showing setup modal');
                setShowTOTPSetup(true);
              }
            }
            
            // Auto redirect to dashboard after login
            if (event === 'SIGNED_IN') {
              navigate('/dashboard');
            }
          }, 0);
        } else {
          setProfile(null);
          setShowTOTPSetup(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await AuthService.signUp(email, password, t, displayName);

    if (error) {
      toast({
        title: t('auth.toast.signUpError'),
        description: getErrorMessage(error.message, t),
        variant: "destructive"
      });
    } else {
      toast({
        title: t('auth.toast.signUpSuccess'),
        description: t('auth.toast.signUpSuccessDescription'),
        variant: "default"
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const result = await AuthService.signIn(email, password, t);

    if (result.error) {
      toast({
        title: t('auth.toast.signInError'),
        description: getErrorMessage(result.error.message, t),
        variant: "destructive"
      });
    } else if (result.requiresMFA) {
      setPendingMFAEmail(email);
      toast({
        title: t('auth.toast.codeSent'),
        description: t('auth.toast.codeSentDescription'),
        variant: "default"
      });
    } else if (result.requiresTOTP) {
      setPendingTOTPEmail(email);
      setPendingTOTPPassword(password);
    } else {
      toast({
        title: t('auth.toast.signInSuccess'),
        description: t('auth.toast.signInSuccessDescription'),
        variant: "default"
      });
    }

    return result;
  };

  const signInWithGoogle = async () => {
    const { error } = await AuthService.signInWithGoogle();

    if (error) {
      toast({
        title: t('auth.toast.googleSignInError'),
        description: getErrorMessage(error.message, t),
        variant: "destructive"
      });
    }

    return { error };
  };

  const signOut = async () => {
    if (sessionHook.isLoggingOut) return { error: null };
    
    sessionHook.setIsLoggingOut(true);
    sessionHook.setSessionTimeoutActive(false);
    
    // Clear all timers and state
    sessionHook.setTimeLeft(sessionHook.IDLE_TIMEOUT);
    sessionHook.setLastActivity(Date.now());
    sessionHook.setShowWarning(false);
    
    try {
      const { error } = await AuthService.signOut(sessionHook.clearAllAuthData);
      
      if (error && !error.message.includes('session_not_found') && !error.message.includes('Session not found')) {
        toast({
          title: t('auth.toast.signOutError'),
          description: t('auth.toast.signOutErrorDescription'),
          variant: "destructive"
        });
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        navigate('/');
      }

      return { error };
    } finally {
      sessionHook.setIsLoggingOut(false);
    }
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await AuthService.resendConfirmation(email);

    if (error) {
      toast({
        title: t('auth.toast.confirmationError'),
        description: t('auth.toast.confirmationErrorDescription'),
        variant: "destructive"
      });
    } else {
      toast({
        title: t('auth.toast.confirmationSent'),
        description: t('auth.toast.confirmationSentDescription'),
        variant: "default"
      });
    }

    return { error };
  };

  const sendVerificationCode = async (email: string) => {
    const { error } = await AuthService.sendVerificationCode(email, t);

    if (error) {
      toast({
        title: t('auth.toast.verificationError'),
        description: error.message || t('auth.toast.verificationErrorDescription'),
        variant: "destructive"
      });
    } else {
      setPendingMFAEmail(email);
      toast({
        title: t('auth.toast.codeSent'),
        description: t('auth.toast.codeSentDescription'),
        variant: "default"
      });
    }

    return { error };
  };

  const verifyCodeAndSignIn = async (email: string, password: string, code: string) => {
    const { error } = await AuthService.verifyCodeAndSignIn(email, password, code);

    if (error) {
      toast({
        title: t('auth.toast.signInError'),
        description: getErrorMessage(error.message, t),
        variant: "destructive"
      });
    } else {
      setPendingMFAEmail(null);
      toast({
        title: t('auth.toast.signInSuccess'),
        description: t('auth.toast.signInSuccessDescription'),
        variant: "default"
      });
    }

    return { error };
  };

  const setupTOTP = async () => {
    const { error } = await AuthService.setupTOTP();

    if (error) {
      toast({
        title: t('auth.toast.totpSetupError'),
        description: error.message || t('auth.toast.totpSetupErrorDescription'),
        variant: "destructive"
      });
    }

    return { error };
  };

  const verifyTOTP = async (code: string, isBackupCode = false) => {
    if (!pendingTOTPEmail) {
      const error = new Error('No pending TOTP verification');
      toast({
        title: t('auth.toast.totpError'),
        description: error.message || t('auth.toast.totpErrorDescription'),
        variant: "destructive"
      });
      return { error };
    }

    const { error } = await AuthService.verifyTOTP(pendingTOTPEmail, code, isBackupCode);

    if (error) {
      toast({
        title: t('auth.toast.totpError'),
        description: error.message || t('auth.toast.totpErrorDescription'),
        variant: "destructive"
      });
      return { error };
    }

    // Now complete the sign in using the stored password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: pendingTOTPEmail,
      password: pendingTOTPPassword!
    });

    if (signInError) {
      toast({
        title: t('auth.toast.signInError'),
        description: getErrorMessage(signInError.message, t),
        variant: "destructive"
      });
      return { error: signInError };
    }

    setPendingTOTPEmail(null);
    setPendingTOTPPassword(null);
    
    toast({
      title: t('auth.toast.signInSuccess'),
      description: t('auth.toast.signInSuccessDescription'),
      variant: "default"
    });

    return { error: null };
  };

  // Set up activity tracking
  useAuthActivity({
    user,
    lastActivity: sessionHook.lastActivity,
    timeLeft: sessionHook.timeLeft,
    showWarning: sessionHook.showWarning,
    isLoggingOut: sessionHook.isLoggingOut,
    sessionTimeoutActive: sessionHook.sessionTimeoutActive,
    resetActivity: sessionHook.resetActivity,
    clearAllAuthData: sessionHook.clearAllAuthData,
    signOut,
    setTimeLeft: sessionHook.setTimeLeft,
    setShowWarning: sessionHook.setShowWarning,
    setSessionTimeoutActive: sessionHook.setSessionTimeoutActive,
    IDLE_TIMEOUT: sessionHook.IDLE_TIMEOUT,
    WARNING_TIME: sessionHook.WARNING_TIME,
    VISIBILITY_TIMEOUT: sessionHook.VISIBILITY_TIMEOUT
  });

  const value = {
    user,
    session,
    profile,
    loading,
    timeLeft: sessionHook.timeLeft,
    pendingMFAEmail,
    showTOTPSetup,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resendConfirmation,
    sendVerificationCode,
    verifyCodeAndSignIn,
    setupTOTP,
    verifyTOTP,
    setShowTOTPSetup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}