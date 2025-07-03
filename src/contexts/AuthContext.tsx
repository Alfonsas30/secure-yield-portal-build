import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface Profile {
  id: string;
  user_id: string;
  account_number: string;
  display_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  totp_enabled: boolean;
  totp_secret: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  timeLeft: number;
  pendingMFAEmail: string | null;
  showTOTPSetup: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; requiresTOTP?: boolean }>;
  signOut: () => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  sendVerificationCode: (email: string) => Promise<{ error: any }>;
  verifyCodeAndSignIn: (email: string, password: string, code: string) => Promise<{ error: any }>;
  setupTOTP: () => Promise<{ error: any }>;
  verifyTOTP: (code: string, isBackupCode?: boolean) => Promise<{ error: any }>;
  setShowTOTPSetup: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  
  // Mobile-optimized timeouts for better security
  const IDLE_TIMEOUT = isMobile ? 2 * 60 * 1000 : 5 * 60 * 1000; // 2 min mobile, 5 min desktop
  const WARNING_TIME = 30 * 1000; // 30 seconds warning
  const VISIBILITY_TIMEOUT = isMobile ? 10 * 1000 : 30 * 1000; // 10 sec mobile, 30 sec desktop
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(IDLE_TIMEOUT);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionTimeoutActive, setSessionTimeoutActive] = useState(false);
  const [pendingMFAEmail, setPendingMFAEmail] = useState<string | null>(null);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [pendingTOTPEmail, setPendingTOTPEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Comprehensive auth data cleanup function
  const clearAllAuthData = () => {
    try {
      // Clear all possible Supabase auth tokens
      const supabaseProjectRef = 'latwptcvghypdopbpxfr';
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem(`sb-${supabaseProjectRef}-auth-token`);
      sessionStorage.removeItem(`sb-${supabaseProjectRef}-auth-token`);
      
      // Clear any other auth-related storage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log(`Mobile logout cleanup completed. Mobile: ${isMobile}`);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

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
            }
            
            // Auto redirect to dashboard after login
            if (event === 'SIGNED_IN') {
              navigate('/dashboard');
            }
          }, 0);
        } else {
          setProfile(null);
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
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
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

    if (error) {
      toast({
        title: "Registracijos klaida",
        description: getErrorMessage(error.message),
        variant: "destructive"
      });
    } else {
      toast({
        title: "Registracija sėkminga",
        description: "Patikrinkite el. paštą ir patvirtinkite paskyrą",
        variant: "default"
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting signIn for:', email);
      
      // First check credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.log('SignIn error:', signInError);
        toast({
          title: "Prisijungimo klaida",
          description: getErrorMessage(signInError.message),
          variant: "destructive"
        });
        return { error: signInError };
      }

      console.log('SignIn successful, checking TOTP status for user:', signInData.user.id);

      // Check if user has TOTP enabled
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('totp_enabled, totp_secret')
        .eq('user_id', signInData.user.id)
        .single();

      console.log('Profile data:', profileData, 'Profile error:', profileError);

      if (profileData?.totp_enabled) {
        console.log('TOTP enabled, requiring TOTP verification');
        // User has TOTP enabled, sign out and require TOTP
        await supabase.auth.signOut();
        setPendingTOTPEmail(email);
        
        toast({
          title: "TOTP reikalingas",
          description: "Įveskite kodą iš Authenticator programėlės",
          variant: "default"
        });
        
        return { error: null, requiresTOTP: true };
      } else {
        console.log('TOTP not enabled, showing mandatory setup modal');
        // User doesn't have TOTP enabled - show MANDATORY setup modal
        
        // Wait a bit for the navigation to complete
        setTimeout(() => {
          console.log('Setting showTOTPSetup to true (REQUIRED)');
          setShowTOTPSetup(true);
        }, 500);
        
        toast({
          title: "Privalomas saugumo nustatymas",
          description: "Turite nustatyti dviejų faktorių autentifikavimą",
          variant: "destructive"
        });
        
        return { error: null };
      }
    } catch (error: any) {
      console.error('SignIn exception:', error);
      toast({
        title: "Prisijungimo klaida",
        description: getErrorMessage(error.message),
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    if (isLoggingOut) return { error: null };
    
    setIsLoggingOut(true);
    setSessionTimeoutActive(false);
    console.log('Attempting to sign out...');
    
    // Clear all timers and state
    setTimeLeft(IDLE_TIMEOUT);
    setLastActivity(Date.now());
    setShowWarning(false);
    
    try {
      // Check if we have a valid session before attempting logout
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log('No active session found, clearing state...');
        // Clear all Supabase authentication data thoroughly
        clearAllAuthData();
        setUser(null);
        setSession(null);
        setProfile(null);
        navigate('/');
        return { error: null };
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message.includes('session_not_found') && !error.message.includes('Session not found')) {
        console.error('Logout error:', error);
        toast({
          title: "Atsijungimo klaida",
          description: "Nepavyko atsijungti",
          variant: "destructive"
        });
      } else {
        console.log('Successfully signed out');
        // Use comprehensive cleanup
        clearAllAuthData();
        navigate('/');
      }

      return { error };
    } finally {
      setIsLoggingOut(false);
    }
  };

  const resendConfirmation = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko išsiųsti patvirtinimo",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Patvirtinimas išsiųstas",
        description: "Patikrinkite el. paštą",
        variant: "default"
      });
    }

    return { error };
  };

  const sendVerificationCode = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { email }
      });

      if (error) throw error;

      setPendingMFAEmail(email);
      toast({
        title: "Kodas išsiųstas",
        description: "Patikrinkite el. paštą ir įveskite gavotą kodą",
        variant: "default"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko išsiųsti patvirtinimo kodo",
        variant: "destructive"
      });
      return { error };
    }
  };

  const verifyCodeAndSignIn = async (email: string, password: string, code: string) => {
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

      setPendingMFAEmail(null);
      toast({
        title: "Prisijungimas sėkmingas",
        description: "Nukreipiame į asmeninį kabinetą",
        variant: "default"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Prisijungimo klaida",
        description: getErrorMessage(error.message),
        variant: "destructive"
      });
      return { error };
    }
  };

  const setupTOTP = async () => {
    try {
      console.log('Calling setup-totp edge function...');
      const { data, error } = await supabase.functions.invoke('setup-totp');
      
      console.log('Setup-totp response:', { data, error });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return { error: null };
    } catch (error: any) {
      console.error('Setup TOTP error:', error);
      toast({
        title: "TOTP nustatymo klaida",
        description: error.message || "Nepavyko nustatyti TOTP",
        variant: "destructive"
      });
      return { error };
    }
  };

  const verifyTOTP = async (code: string, isBackupCode = false) => {
    try {
      if (!pendingTOTPEmail) {
        throw new Error('No pending TOTP verification');
      }

      const { data, error } = await supabase.functions.invoke('verify-totp-login', {
        body: { 
          email: pendingTOTPEmail, 
          code,
          isBackupCode 
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Now complete the sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: pendingTOTPEmail,
        password: '' // This will be handled by TOTP verification
      });

      setPendingTOTPEmail(null);
      
      toast({
        title: "Prisijungimas sėkmingas",
        description: "Nukreipiame į asmeninį kabinetą",
        variant: "default"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "TOTP klaida",
        description: error.message || "Neteisingas kodas",
        variant: "destructive"
      });
      return { error };
    }
  };

  const getErrorMessage = (message: string) => {
    if (message.includes('Invalid login credentials')) {
      return 'Neteisingi prisijungimo duomenys';
    }
    if (message.includes('User already registered')) {
      return 'Vartotojas jau užsiregistravęs';
    }
    if (message.includes('Email not confirmed')) {
      return 'El. paštas nepatvirtintas';
    }
    if (message.includes('Password should be at least')) {
      return 'Slaptažodis turi būti bent 6 simbolių';
    }
    return message;
  };

  // Activity tracking and idle timeout logic
  const resetActivity = () => {
    setLastActivity(Date.now());
    setTimeLeft(IDLE_TIMEOUT);
    setShowWarning(false);
  };

  // Activity tracking useEffect
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetActivity();

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user]);

  // Page unload security - automatic logout when leaving site
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only show warning if user has been active recently
      const timeSinceActivity = Date.now() - lastActivity;
      if (timeSinceActivity < 60000) { // 1 minute
        event.preventDefault();
        return 'Ar tikrai norite palikti banko puslapį? Jūs būsite automatiškai atsijungti.';
      }
    };

    const handleUnload = () => {
      // Quick signout on page unload - clear session immediately
      try {
        // Use comprehensive cleanup
        clearAllAuthData();
        
        // Attempt to notify server with keepalive (mobile-friendly)
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/logout');
        } else if (isMobile) {
          // For mobile browsers, use sync XHR as last resort
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/logout', false); // synchronous
          xhr.send();
        } else {
          // Fallback for browsers without sendBeacon
          fetch('/logout', { 
            method: 'POST', 
            keepalive: true,
            headers: { 'Content-Type': 'application/json' }
          }).catch(() => {});
        }
      } catch (error) {
        console.error('Error during unload cleanup:', error);
      }
    };

    const handlePageHide = () => {
      // Alternative to unload for better mobile support
      console.log(`Page hidden on ${isMobile ? 'mobile' : 'desktop'}`);
      handleUnload();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log(`Document hidden, starting ${VISIBILITY_TIMEOUT}ms timeout (Mobile: ${isMobile})`);
        // Use mobile-optimized timeout when page becomes hidden
        setTimeout(() => {
          if (document.hidden) {
            console.log('Signing out due to visibility timeout');
            signOut();
          }
        }, VISIBILITY_TIMEOUT);
      } else {
        console.log('Document visible again');
        resetActivity(); // Reset activity when user returns
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, lastActivity, signOut]);

  // Idle timeout timer
  useEffect(() => {
    if (!user || isLoggingOut || sessionTimeoutActive) return;

    const timer = setInterval(async () => {
      // Check if session still exists before proceeding
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession || isLoggingOut || sessionTimeoutActive) {
        return;
      }

      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = IDLE_TIMEOUT - elapsed;

      if (remaining <= 0 && !sessionTimeoutActive) {
        setSessionTimeoutActive(true);
        toast({
          title: "Sesija baigėsi",
          description: "Atsijungiama dėl neaktyvumo",
          variant: "destructive"
        });
        signOut();
        return;
      }

      if (remaining <= WARNING_TIME && !showWarning && !sessionTimeoutActive) {
        setShowWarning(true);
        toast({
          title: "Sesija baigiasi",
          description: `Sesija baigsis po ${Math.ceil(remaining / 1000)} sekundžių`,
          variant: "destructive"
        });
      }

      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [user, lastActivity, showWarning, isLoggingOut, sessionTimeoutActive]);

  const value = {
    user,
    session,
    profile,
    loading,
    timeLeft,
    pendingMFAEmail,
    showTOTPSetup,
    signUp,
    signIn,
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