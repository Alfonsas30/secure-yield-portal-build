import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

interface UseAuthActivityProps {
  user: any;
  lastActivity: number;
  timeLeft: number;
  showWarning: boolean;
  isLoggingOut: boolean;
  sessionTimeoutActive: boolean;
  resetActivity: () => void;
  clearAllAuthData: () => void;
  signOut: () => Promise<{ error: any }>;
  setTimeLeft: (time: number) => void;
  setShowWarning: (show: boolean) => void;
  setSessionTimeoutActive: (active: boolean) => void;
  IDLE_TIMEOUT: number;
  WARNING_TIME: number;
  VISIBILITY_TIMEOUT: number;
}

export function useAuthActivity({
  user,
  lastActivity,
  timeLeft,
  showWarning,
  isLoggingOut,
  sessionTimeoutActive,
  resetActivity,
  clearAllAuthData,
  signOut,
  setTimeLeft,
  setShowWarning,
  setSessionTimeoutActive,
  IDLE_TIMEOUT,
  WARNING_TIME,
  VISIBILITY_TIMEOUT
}: UseAuthActivityProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { toast } = useToast();

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
  }, [user, resetActivity]);

  // Page unload security - automatic logout when leaving site
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only show warning if user has been active recently
      const timeSinceActivity = Date.now() - lastActivity;
      if (timeSinceActivity < 60000) { // 1 minute
        event.preventDefault();
        return t('auth.toast.pageUnloadWarning');
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
  }, [user, lastActivity, signOut, clearAllAuthData, resetActivity, t, isMobile, VISIBILITY_TIMEOUT]);

  // Idle timeout timer with reduced session checks
  useEffect(() => {
    if (!user || isLoggingOut || sessionTimeoutActive) return;

    let sessionCheckCount = 0;
    const timer = setInterval(async () => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = IDLE_TIMEOUT - elapsed;

      // Only check session every 30 seconds to reduce API calls
      sessionCheckCount++;
      if (sessionCheckCount % 30 === 0) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession || isLoggingOut || sessionTimeoutActive) {
            return;
          }
        } catch (error: any) {
          if (error.message?.includes('429') || error.message?.includes('rate limit')) {
            console.log('Rate limited during session check in idle timer');
            return;
          }
        }
      }

      if (remaining <= 0 && !sessionTimeoutActive) {
        setSessionTimeoutActive(true);
        toast({
          title: t('auth.toast.sessionExpired'),
          description: t('auth.toast.sessionExpiredDescription'),
          variant: "destructive"
        });
        signOut();
        return;
      }

      if (remaining <= WARNING_TIME && !showWarning && !sessionTimeoutActive) {
        setShowWarning(true);
        toast({
          title: t('auth.toast.sessionExpiring'),
          description: t('auth.toast.sessionExpiringDescription', { seconds: Math.ceil(remaining / 1000) }),
          variant: "destructive"
        });
      }

      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [user, lastActivity, showWarning, isLoggingOut, sessionTimeoutActive, signOut, setTimeLeft, setShowWarning, setSessionTimeoutActive, t, toast, IDLE_TIMEOUT, WARNING_TIME]);
}
