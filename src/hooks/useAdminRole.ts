
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useAdminRole() {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== ADMIN ROLE CHECK START ===');
    console.log('User:', user?.id);
    console.log('Session exists:', !!session);
    console.log('Session access_token exists:', !!session?.access_token);

    const checkAdminRole = async () => {
      if (!user) {
        console.log('No user - setting isAdmin to false');
        setIsAdmin(false);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        console.log('Checking admin role for user:', user.id);
        setError(null);
        
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        console.log('User roles query result:', { roles, error });

        if (error) {
          console.error('Error fetching admin role:', error);
          setError(error.message);
          setIsAdmin(false);
        } else {
          const hasAdminRole = roles?.some(roleData => roleData.role === 'admin') || false;
          console.log('Has admin role:', hasAdminRole);
          setIsAdmin(hasAdminRole);
        }
      } catch (error: any) {
        console.error('Admin role check exception:', error);
        setError(error.message || 'Unknown error');
        setIsAdmin(false);
      } finally {
        console.log('Admin role check completed');
        setLoading(false);
      }
    };

    // Add a small delay to prevent race conditions
    const timeoutId = setTimeout(checkAdminRole, 100);
    
    return () => clearTimeout(timeoutId);
  }, [user, session]);

  console.log('useAdminRole hook state:', { isAdmin, loading, error });

  return { isAdmin, loading, error };
}
