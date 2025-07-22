
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
    console.log('=== useAdminRole - checkAdminRole START ===');
    console.log('User ID:', user?.id);
    console.log('Session exists:', !!session);
    console.log('Retry attempt:', retryAttempt);

    if (!user) {
      console.log('useAdminRole: No user, setting isAdmin to false');
      setIsAdmin(false);
      setLoading(false);
      setError(null);
      setRetryCount(0);
      return;
    }

    try {
      console.log('useAdminRole: Checking admin role for user:', user.id);
      setError(null);
      
      const { data: roles, error: queryError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      console.log('useAdminRole: Query result:', { roles, error: queryError });

      if (queryError) {
        console.error('useAdminRole: Query error:', queryError);
        
        // Retry for specific errors
        if (retryAttempt < 2 && (
          queryError.message?.includes('fetch') || 
          queryError.message?.includes('network') || 
          queryError.code === 'PGRST301'
        )) {
          console.log(`useAdminRole: Retrying (attempt ${retryAttempt + 1})`);
          setTimeout(() => {
            setRetryCount(retryAttempt + 1);
            checkAdminRole(retryAttempt + 1);
          }, 1000 * (retryAttempt + 1));
          return;
        }
        
        setError(queryError.message);
        setIsAdmin(false);
      } else {
        const hasAdminRole = roles?.some(roleData => roleData.role === 'admin') || false;
        console.log('useAdminRole: Has admin role:', hasAdminRole);
        setIsAdmin(hasAdminRole);
        setRetryCount(0);
      }
    } catch (error: any) {
      console.error('useAdminRole: Exception:', error);
      
      // Retry for exceptions
      if (retryAttempt < 2) {
        console.log(`useAdminRole: Retrying after exception (attempt ${retryAttempt + 1})`);
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
      console.log('=== useAdminRole - checkAdminRole END ===');
    }
  }, [user, session]);

  useEffect(() => {
    console.log('useAdminRole: Effect triggered, user changed');
    setLoading(true);
    
    const timeoutId = setTimeout(() => {
      checkAdminRole(0);
    }, 100);
    
    return () => {
      console.log('useAdminRole: Cleanup timeout');
      clearTimeout(timeoutId);
    };
  }, [checkAdminRole]);

  console.log('useAdminRole: Current state:', { 
    isAdmin, 
    loading, 
    error, 
    retryCount,
    userId: user?.id 
  });

  return { isAdmin, loading, error, retryCount };
}
