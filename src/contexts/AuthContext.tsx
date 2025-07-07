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
      (event, session) => {
        console.log('=== AUTH STATE CHANGE ===');
        console.log('Event:', event);
        console.log('Session user ID:', session?.user?.id);
        console.log('Session access_token present:', !!session?.access_token);
        console.log('Session expires_at:', session?.expires_at);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with proper session context
          setTimeout(async () => {
            console.log('Fetching profile for user:', session.user.id);
            
            // Verify session is still valid before making requests
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession || currentSession.user.id !== session.user.id) {
              console.error('Session mismatch or invalid during profile fetch');
              return;
            }
            
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching profile:', error);
              console.error('Profile fetch failed - this might indicate RLS issues');
            } else {
              console.log('Profile fetched successfully:', profileData?.account_number);
              setProfile(profileData);
            }
            
            // Auto redirect to dashboard after login
            if (event === 'SIGNED_IN') {
              navigate('/dashboard');
            }
          }, 100); // Slightly longer delay to ensure session is stable
        } else {
          console.log('No session - clearing profile data');
          setProfile(null);
          setShowTOTPSetup(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session with enhanced logging
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('=== INITIAL SESSION CHECK ===');
      console.log('Session error:', error);
      console.log('Session user ID:', session?.user?.id);
      console.log('Session expires at:', session?.expires_at);
      console.log('Session is expired:', session?.expires_at ? new Date(session.expires_at * 1000) < new Date() : 'N/A');
      
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
    // TOTP temporarily disabled
    // } else if (result.requiresTOTP) {
    //   setPendingTOTPEmail(email);
    //   setPendingTOTPPassword(password);
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

  // Add session refresh function for critical operations
  const refreshSession = async () => {
    try {
      console.log('Refreshing session...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        // Force logout on refresh failure
        signOut();
        return null;
      }
      
      console.log('Session refreshed successfully');
      return session;
    } catch (error) {
      console.error('Exception during session refresh:', error);
      return null;
    }
  };

  // Periodic session validation
  useEffect(() => {
    if (!session || !user) return;
    
    const interval = setInterval(async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log('Session lost, forcing logout');
        signOut();
      } else if (currentSession.expires_at && new Date(currentSession.expires_at * 1000) < new Date()) {
        console.log('Session expired, refreshing...');
        await refreshSession();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [session, user]);

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
    setShowTOTPSetup,
    refreshSession
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