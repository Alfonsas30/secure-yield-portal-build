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
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
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
              
              // Auto-redirect to dashboard after successful login (not on initial load)
              if (event === 'SIGNED_IN' && window.location.pathname === '/') {
                navigate('/dashboard');
              }
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
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Atsijungimo klaida",
        description: "Nepavyko atsijungti",
        variant: "destructive"
      });
    } else {
      // Navigate to home page after successful logout
      navigate('/');
    }

    return { error };
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

  const value = {
    user,
    session,
    profile,
    loading,
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