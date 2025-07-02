import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  account_number: string;
  display_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  timeLeft: number;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const WARNING_TIME = 30 * 1000; // 30 seconds warning

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(IDLE_TIMEOUT);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
              
              // No automatic redirect - let users choose where to go
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Prisijungimo klaida",
        description: getErrorMessage(error.message),
        variant: "destructive"
      });
    } else {
      toast({
        title: "Prisijungimas sėkmingas",
        description: "Nukreipiame į asmeninį kabinetą",
        variant: "default"
      });
      // Navigation will be handled by the auth state change listener
    }

    return { error };
  };

  const signOut = async () => {
    if (isLoggingOut) return { error: null };
    
    setIsLoggingOut(true);
    console.log('Attempting to sign out...');
    
    try {
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
        // Navigate to home page after successful logout
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

    // Removed aggressive page visibility and beforeunload handlers
    // These were causing premature logouts

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user]);

  // Idle timeout timer
  useEffect(() => {
    if (!user) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = IDLE_TIMEOUT - elapsed;

      if (remaining <= 0) {
        toast({
          title: "Sesija baigėsi",
          description: "Atsijungiama dėl neaktyvumo",
          variant: "destructive"
        });
        signOut();
        return;
      }

      if (remaining <= WARNING_TIME && !showWarning) {
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
  }, [user, lastActivity, showWarning]);

  const value = {
    user,
    session,
    profile,
    loading,
    timeLeft,
    signUp,
    signIn,
    signOut,
    resendConfirmation
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