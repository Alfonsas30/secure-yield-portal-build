import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

export function useAuthSession() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Mobile-optimized timeouts for better security
  const IDLE_TIMEOUT = isMobile ? 2 * 60 * 1000 : 5 * 60 * 1000; // 2 min mobile, 5 min desktop
  const WARNING_TIME = 30 * 1000; // 30 seconds warning
  const VISIBILITY_TIMEOUT = isMobile ? 10 * 1000 : 30 * 1000; // 10 sec mobile, 30 sec desktop

  const [timeLeft, setTimeLeft] = useState(IDLE_TIMEOUT);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionTimeoutActive, setSessionTimeoutActive] = useState(false);

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

  // Activity tracking and idle timeout logic
  const resetActivity = () => {
    setLastActivity(Date.now());
    setTimeLeft(IDLE_TIMEOUT);
    setShowWarning(false);
  };

  return {
    timeLeft,
    lastActivity,
    showWarning,
    isLoggingOut,
    sessionTimeoutActive,
    resetActivity,
    clearAllAuthData,
    setTimeLeft,
    setLastActivity,
    setShowWarning,
    setIsLoggingOut,
    setSessionTimeoutActive,
    IDLE_TIMEOUT,
    WARNING_TIME,
    VISIBILITY_TIMEOUT
  };
}