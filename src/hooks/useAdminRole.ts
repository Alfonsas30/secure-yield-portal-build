import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useAdminRole() {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔧 useAdminRole: Starting admin check...', { 
      user: user?.id, 
      email: user?.email,
      session: !!session 
    });

    const checkAdminRole = async () => {
      if (!user) {
        console.log('🔧 useAdminRole: No user found, setting admin=false');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('🔧 useAdminRole: Checking admin role for user:', user.id);

      try {
        // Simplified query to get all roles for user first
        const { data: allRoles, error: allRolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        console.log('🔧 useAdminRole: All user roles:', allRoles, 'Error:', allRolesError);

        if (allRolesError) {
          console.error('🔧 useAdminRole: Error fetching all roles:', allRolesError);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check if admin role exists
        const hasAdminRole = allRoles?.some(roleData => roleData.role === 'admin') || false;
        console.log('🔧 useAdminRole: Has admin role:', hasAdminRole);

        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('🔧 useAdminRole: Exception during role check:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        console.log('🔧 useAdminRole: Admin check complete, loading=false');
      }
    };

    checkAdminRole();
  }, [user, session]);

  console.log('🔧 useAdminRole: Returning state:', { isAdmin, loading, userId: user?.id });
  return { isAdmin, loading };
}