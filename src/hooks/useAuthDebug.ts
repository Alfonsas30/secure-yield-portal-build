import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DebugInfo {
  email: string;
  profile: any;
  authUser: any;
  recentCodes: number;
  errors: any;
  canTestMFA: boolean;
  nextSteps: string[];
}

export function useAuthDebug() {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const debugMFA = async (email: string) => {
    if (!email) {
      toast({
        title: "Klaida",
        description: "Įveskite el. pašto adresą",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('debug-mfa', {
        body: { email }
      });

      if (error) throw error;

      setDebugInfo(data.debug);
      
      toast({
        title: "Debug informacija gauta",
        description: `Patikrinta ${email} sąskaita`
      });
    } catch (error: any) {
      console.error('Debug MFA error:', error);
      toast({
        title: "Debug klaida",
        description: error.message || "Nepavyko gauti debug informacijos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendEmailCode = async () => {
    if (!profile?.email) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email-2fa', {
        body: { action: 'send_code' }
      });

      if (error) throw error;

      toast({
        title: "Kodas išsiųstas",
        description: "Patvirtinimo kodas išsiųstas į el. paštą"
      });
    } catch (error: any) {
      console.error('Send email code error:', error);
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko išsiųsti kodo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailCode = async (code: string) => {
    if (!code || code.length !== 6) {
      toast({
        title: "Klaida",
        description: "Įveskite 6 skaitmenų kodą",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email-2fa', {
        body: { action: 'verify_code', code }
      });

      if (error) throw error;

      toast({
        title: "Kodas patvirtintas",
        description: "El. pašto 2FA kodas sėkmingai patvirtintas"
      });
    } catch (error: any) {
      console.error('Verify email code error:', error);
      toast({
        title: "Klaida",
        description: error.message || "Neteisingas kodas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupTOTP = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-totp');

      if (error) throw error;

      toast({
        title: "TOTP sukonfigūruotas",
        description: "Authenticator programėlė sėkmingai sukonfigūruota"
      });

      return data;
    } catch (error: any) {
      console.error('Setup TOTP error:', error);
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko sukonfigūruoti TOTP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTPSetup = async (token: string) => {
    if (!token || token.length !== 6) {
      toast({
        title: "Klaida",
        description: "Įveskite 6 skaitmenų kodą",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-totp-setup', {
        body: { token }
      });

      if (error) throw error;

      toast({
        title: "TOTP patvirtintas",
        description: "Authenticator sėkmingai patvirtintas"
      });

      return data;
    } catch (error: any) {
      console.error('Verify TOTP setup error:', error);
      toast({
        title: "Klaida",
        description: error.message || "Neteisingas TOTP kodas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    debugInfo,
    debugMFA,
    sendEmailCode,
    verifyEmailCode,
    setupTOTP,
    verifyTOTPSetup
  };
}