import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Edit, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface User {
  user_id: string;
  email: string;
  display_name: string | null;
  account_number: string;
  created_at: string;
  balance: number;
  role: string | null;
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name, account_number, created_at');

      if (profilesError) {
        console.error('Profiles query error:', profilesError);
        throw profilesError;
      }

      console.log('Profiles data:', profiles);

      // Get all balances
      const { data: balances, error: balancesError } = await supabase
        .from('account_balances')
        .select('user_id, balance');

      if (balancesError) {
        console.error('Balances query error:', balancesError);
        throw balancesError;
      }

      console.log('Balances data:', balances);

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Roles query error:', rolesError);
        throw rolesError;
      }

      console.log('Roles data:', roles);

      // Merge data in JavaScript
      const formattedUsers = profiles?.map(profile => {
        // Find balance for this user
        const userBalance = balances?.find(b => b.user_id === profile.user_id);
        
        // Find role for this user
        const userRole = roles?.find(r => r.user_id === profile.user_id);

        return {
          user_id: profile.user_id,
          email: profile.email,
          display_name: profile.display_name,
          account_number: profile.account_number,
          created_at: profile.created_at,
          balance: userBalance?.balance || 0,
          role: userRole?.role || null
        };
      }) || [];

      console.log('Formatted users:', formattedUsers);
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      toast({
        title: 'Klaida',
        description: `Nepavyko užkrauti vartotojų sąrašo: ${error.message || 'Nežinoma klaida'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      // First, delete existing role if any
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then insert new role if not 'none'
      if (role !== 'none') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: role as 'admin' | 'moderator' | 'user' });

        if (error) throw error;
      }

      toast({
        title: 'Sėkme',
        description: 'Vartotojo vaidmuo atnaujintas'
      });

      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Klaida',
        description: 'Nepavyko atnaujinti vartotojo vaidmens',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.account_number.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter || 
                       (roleFilter === 'none' && !user.role);
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      case 'user': return 'default';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'admin': return 'Administratorius';
      case 'moderator': return 'Moderatorius';
      case 'user': return 'Vartotojas';
      default: return 'Nėra vaidmens';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vartotojų valdymas</CardTitle>
          <CardDescription>
            Peržiūrėkite ir valdykite visus registruotus vartotojus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ieškoti pagal el. paštą, vardą arba sąskaitos numerį..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtruoti pagal vaidmenį" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Visi vaidmenys</SelectItem>
                <SelectItem value="admin">Administratoriai</SelectItem>
                <SelectItem value="moderator">Moderatoriai</SelectItem>
                <SelectItem value="user">Vartotojai</SelectItem>
                <SelectItem value="none">Be vaidmens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>El. paštas</TableHead>
                  <TableHead>Vardas</TableHead>
                  <TableHead>Sąskaitos Nr.</TableHead>
                  <TableHead>Balansas</TableHead>
                  <TableHead>Vaidmuo</TableHead>
                  <TableHead>Registracijos data</TableHead>
                  <TableHead>Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.display_name || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{user.account_number}</TableCell>
                    <TableCell>{user.balance.toFixed(2)} LT</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('lt-LT')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Vartotojo informacija</DialogTitle>
                              <DialogDescription>
                                Detalus vartotojo profilis ir statistikos
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">El. paštas</label>
                                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Vardas</label>
                                  <p className="text-sm text-muted-foreground">{selectedUser.display_name || 'Nenurodytas'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Sąskaitos numeris</label>
                                  <p className="text-sm text-muted-foreground font-mono">{selectedUser.account_number}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Balansas</label>
                                  <p className="text-sm text-muted-foreground">{selectedUser.balance.toFixed(2)} LT</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Vaidmuo</label>
                                  <div className="mt-1">
                                    <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                                      {getRoleLabel(selectedUser.role)}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Registracijos data</label>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(selectedUser.created_at).toLocaleString('lt-LT')}
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Select 
                          value={user.role || 'none'} 
                          onValueChange={(value) => updateUserRole(user.user_id, value)}
                        >
                          <SelectTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Shield className="w-4 h-4" />
                            </Button>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Be vaidmens</SelectItem>
                            <SelectItem value="user">Vartotojas</SelectItem>
                            <SelectItem value="moderator">Moderatorius</SelectItem>
                            <SelectItem value="admin">Administratorius</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nerasta vartotojų pagal nurodytus kriterijus
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}