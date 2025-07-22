
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useAdminRole() {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkAdminRole = useCallback(async (retryAttempt = 0) => {
    console.log('=== ADMIN ROLE CHECK START ===');
    console.log('User:', user?.id);
    console.log('Session exists:', !!session);
    console.log('Retry attempt:', retryAttempt);

    if (!user) {
      console.log('No user - setting isAdmin to false');
      setIsAdmin(false);
      setLoading(false);
      setError(null);
      setRetryCount(0);
      return;
    }

    try {
      console.log('Checking admin role for user:', user.id);
      setError(null);
      
      const { data: roles, error: queryError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      console.log('User roles query result:', { roles, error: queryError });

      if (queryError) {
        console.error('Error fetching admin role:', queryError);
        
        // Retry logic for network errors
        if (retryAttempt < 3 && (
          queryError.message?.includes('fetch') || 
          queryError.message?.includes('network') || 
          queryError.code === 'PGRST301'
        )) {
          console.log(`Retrying admin role check (attempt ${retryAttempt + 1})`);
          setTimeout(() => {
            setRetryCount(retryAttempt + 1);
            checkAdminRole(retryAttempt + 1);
          }, 1000 * (retryAttempt + 1)); // Exponential backoff
          return;
        }
        
        setError(queryError.message);
        setIsAdmin(false);
      } else {
        const hasAdminRole = roles?.some(roleData => roleData.role === 'admin') || false;
        console.log('Has admin role:', hasAdminRole);
        setIsAdmin(hasAdminRole);
        setRetryCount(0);
      }
    } catch (error: any) {
      console.error('Admin role check exception:', error);
      
      // Retry for network exceptions
      if (retryAttempt < 3) {
        console.log(`Retrying admin role check after exception (attempt ${retryAttempt + 1})`);
        setTimeout(() => {
          setRetryCount(retryAttempt + 1);
          checkAdminRole(retryAttempt + 1);
        }, 1000 * (retryAttempt + 1));
        return;
      }
      
      setError(error.message || 'Unknown error');
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    console.log('useAdminRole effect triggered');
    setLoading(true);
    
    // Small delay to prevent race conditions and allow auth to stabilize
    const timeoutId = setTimeout(() => {
      checkAdminRole(0);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [checkAdminRole]);

  console.log('useAdminRole hook state:', { 
    isAdmin, 
    loading, 
    error, 
    retryCount,
    userId: user?.id 
  });

  return { isAdmin, loading, error, retryCount };
}
