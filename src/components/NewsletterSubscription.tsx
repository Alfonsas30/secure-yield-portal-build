import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSubscription = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !consent) {
      toast({
        title: "Klaida",
        description: "Prašome užpildyti el. pašto lauką ir sutikti su duomenų tvarkymu",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: email.toLowerCase().trim(),
            name: name.trim() || null,
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "El. paštas jau prenumeruoja",
            description: "Šis el. pašto adresas jau prenumeruoja mūsų naujienas",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      // Send welcome email
      await supabase.functions.invoke('subscribe-newsletter', {
        body: { email: email.toLowerCase().trim(), name: name.trim() || null }
      });

      toast({
        title: "Sėkmingai prenumeruojate!",
        description: "Ačiū! Netrukus gausite patvirtinimo laišką",
      });

      setEmail("");
      setName("");
      setConsent(false);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko prenumeruoti. Pabandykite dar kartą",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 bg-background/80 backdrop-blur-sm">
            <Mail className="w-4 h-4 mr-2" />
            Naujienos
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Gaukite naujienas el. paštu
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Prenumeruokite mūsų naujienlaiškį ir gaukite naujausią informaciją apie palūkanų pokyčius, 
            naujas paslaugas ir finansų patarimus
          </p>
        </div>

        <Card className="max-w-lg mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Prenumeruoti naujienas</CardTitle>
            <CardDescription className="text-center">
              Būkite pirmi sužinoję apie naujas galimybes ir pasiūlymus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">El. pašto adresas *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jusu.pastas@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Vardas (neprivaloma)</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jūsų vardas"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                />
                <Label htmlFor="consent" className="text-sm">
                  Sutinku, kad mano duomenys būtų tvarkomi naujienlaiškio siuntimui *
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  "Prenumeruojama..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Prenumeruoti
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSubscription;