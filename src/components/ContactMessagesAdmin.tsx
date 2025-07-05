import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Phone, Calendar, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const ContactMessagesAdmin = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Klaida",
          description: "Nepavyko užkrauti žinučių",
          variant: "destructive",
        });
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko užkrauti žinučių",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Klaida",
          description: "Nepavyko atnaujinti būsenos",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: newStatus } : msg
      ));

      toast({
        title: "Sėkmingai atnaujinta",
        description: "Žinutės būsena pakeista",
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveAdminNotes = async (messageId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ admin_notes: notes })
        .eq('id', messageId);

      if (error) {
        console.error('Error saving notes:', error);
        toast({
          title: "Klaida",
          description: "Nepavyko išsaugoti pastabų",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, admin_notes: notes } : msg
      ));

      toast({
        title: "Pastabos išsaugotos",
        description: "Admin pastabos sėkmingai išsaugotos", 
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('lt-LT');
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="animate-spin h-8 w-8" />
          <span className="ml-2">Kraunama...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kontaktų žinutės</h1>
        <Button onClick={fetchMessages} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atnaujinti
        </Button>
      </div>

      <div className="grid gap-6">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Žinučių nėra</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {message.name}
                  </CardTitle>
                  <Badge className={getStatusColor(message.status)}>
                    {message.status === 'new' && 'Nauja'}
                    {message.status === 'in_progress' && 'Vykdoma'}
                    {message.status === 'completed' && 'Užbaigta'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {message.email}
                  </span>
                  {message.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {message.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(message.created_at)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Žinutė:</h4>
                    <p className="bg-gray-50 p-3 rounded-md">{message.message}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={message.status === 'new' ? 'default' : 'outline'}
                      onClick={() => updateMessageStatus(message.id, 'new')}
                    >
                      Nauja
                    </Button>
                    <Button 
                      size="sm" 
                      variant={message.status === 'in_progress' ? 'default' : 'outline'}
                      onClick={() => updateMessageStatus(message.id, 'in_progress')}
                    >
                      Vykdoma
                    </Button>
                    <Button 
                      size="sm" 
                      variant={message.status === 'completed' ? 'default' : 'outline'}
                      onClick={() => updateMessageStatus(message.id, 'completed')}
                    >
                      Užbaigta
                    </Button>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Admin pastabos:</h4>
                    <Textarea
                      value={selectedMessage?.id === message.id ? adminNotes : message.admin_notes || ''}
                      onChange={(e) => {
                        setAdminNotes(e.target.value);
                        setSelectedMessage(message);
                      }}
                      placeholder="Pridėti pastabas..."
                      rows={3}
                    />
                    {selectedMessage?.id === message.id && (
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          saveAdminNotes(message.id, adminNotes);
                          setSelectedMessage(null);
                          setAdminNotes('');
                        }}
                      >
                        Išsaugoti pastabas
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactMessagesAdmin;