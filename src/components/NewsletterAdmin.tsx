import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  status: string;
}

interface Campaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  sent_at: string | null;
  recipient_count: number;
  status: string;
  created_at: string;
}

const NewsletterAdmin = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  
  // Campaign form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    loadSubscribers();
    loadCampaigns();
  }, []);

  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('status', 'active')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error loading subscribers:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko įkelti prenumeratorių sąrašo",
        variant: "destructive",
      });
    }
  };

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko įkelti kampanijų sąrašo",
        variant: "destructive",
      });
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !subject || !content) {
      toast({
        title: "Klaida",
        description: "Prašome užpildyti visus laukus",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .insert([
          {
            title: title.trim(),
            subject: subject.trim(),
            content: content.trim(),
          }
        ]);

      if (error) throw error;

      toast({
        title: "Kampanija sukurta",
        description: "Naujienlaiškio kampanija sėkmingai sukurta",
      });

      setTitle("");
      setSubject("");
      setContent("");
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko sukurti kampanijos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async (campaignId: string) => {
    if (!confirm("Ar tikrai norite išsiųsti šią kampaniją visiems prenumeratoriams?")) {
      return;
    }

    setSendingNewsletter(true);

    try {
      const { error } = await supabase.functions.invoke('send-newsletter', {
        body: { campaignId }
      });

      if (error) throw error;

      toast({
        title: "Naujienlaiškis išsiųstas",
        description: "Naujienlaiškis sėkmingai išsiųstas visiems prenumeratoriams",
      });

      loadCampaigns();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko išsiųsti naujienlaiškio",
        variant: "destructive",
      });
    } finally {
      setSendingNewsletter(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Naujienlaiškių valdymas</h2>
        <p className="text-muted-foreground">
          Valdykite prenumeratorius ir siųskite naujienlaiškius
        </p>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">
            <Mail className="w-4 h-4 mr-2" />
            Kampanijos
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            <Users className="w-4 h-4 mr-2" />
            Prenumeratoriai ({subscribers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sukurti naują kampaniją</CardTitle>
              <CardDescription>
                Sukurkite naują naujienlaiškio kampaniją siuntimui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Kampanijos pavadinimas</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Mėnesio naujienos"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">El. pašto tema</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="LTB Bankas - Mėnesio naujienos ir pasiūlymai"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Turinys (HTML)</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="<h1>Sveiki!</h1><p>Šios savaitės naujienos...</p>"
                    rows={8}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Kuriama..." : "Sukurti kampaniją"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kampanijų istorija</CardTitle>
              <CardDescription>
                Peržiūrėkite ir valdykite sukurtas kampanijas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pavadinimas</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Statusas</TableHead>
                    <TableHead>Gavėjai</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Veiksmai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.title}</TableCell>
                      <TableCell>{campaign.subject}</TableCell>
                      <TableCell>
                        <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                          {campaign.status === 'sent' ? 'Išsiųsta' : 'Juodraštis'}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.recipient_count}</TableCell>
                      <TableCell>
                        {campaign.sent_at ? formatDate(campaign.sent_at) : formatDate(campaign.created_at)}
                      </TableCell>
                      <TableCell>
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendNewsletter(campaign.id)}
                            disabled={sendingNewsletter}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Siųsti
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {campaigns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Kampanijų nėra
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prenumeratorių sąrašas</CardTitle>
              <CardDescription>
                Aktyvūs naujienlaiškio prenumeratoriai
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>El. paštas</TableHead>
                    <TableHead>Vardas</TableHead>
                    <TableHead>Prenumeratos data</TableHead>
                    <TableHead>Statusas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{subscriber.name || '-'}</TableCell>
                      <TableCell>{formatDate(subscriber.subscribed_at)}</TableCell>
                      <TableCell>
                        <Badge variant="default">Aktyvus</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subscribers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Prenumeratorių nėra
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsletterAdmin;