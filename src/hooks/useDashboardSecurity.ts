import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const VISIBILITY_TIMEOUT = 30000; // 30 seconds
const BEFOREUNLOAD_ENABLED = true;

export function useDashboardSecurity() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isPageVisible, setIsPageVisible] = useState(true);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);

      if (!isVisible) {
        // Page is hidden - start timeout
        visibilityTimeoutRef.current = setTimeout(() => {
          // Check if user has been inactive and page is still hidden
          if (document.hidden) {
            toast({
              title: "Automatinis atsijungimas",
              description: "Atsijungiama dėl saugumo - puslapis buvo paliktas",
              variant: "destructive"
            });
            signOut();
          }
        }, VISIBILITY_TIMEOUT);
      } else {
        // Page is visible again - clear timeout
        if (visibilityTimeoutRef.current) {
          clearTimeout(visibilityTimeoutRef.current);
          visibilityTimeoutRef.current = null;
        }
        lastActivityRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [signOut, toast]);

  // Track user activity to update last activity time
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Handle beforeunload - warn before leaving
  useEffect(() => {
    if (!BEFOREUNLOAD_ENABLED) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only show warning if user has been active recently
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      if (timeSinceActivity < 60000) { // 1 minute
        event.preventDefault();
        return 'Ar tikrai norite palikti banko puslapį? Jūs būsite automatiškai atsijungti.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Handle page unload - automatic signout (removed aggressive signout)
  useEffect(() => {
    const handleUnload = () => {
      // Only perform cleanup, don't force signout
      console.log('Page unloading, cleaning up...');
    };

    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  return {
    isPageVisible,
    isSecurityActive: true
  };
}