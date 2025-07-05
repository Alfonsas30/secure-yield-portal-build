import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSubscription = () => {
  const { t } = useTranslation();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterName, setNewsletterName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail || !consent) {
      toast({
        title: t('contact.toast.error'),
        description: t('contact.toast.newsletterValidation'),
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
            email: newsletterEmail.toLowerCase().trim(),
            name: newsletterName.trim() || null,
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: t('contact.toast.alreadySubscribed'),
            description: t('contact.toast.alreadyDescription'),
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      // Send welcome email
      await supabase.functions.invoke('subscribe-newsletter', {
        body: { email: newsletterEmail.toLowerCase().trim(), name: newsletterName.trim() || null }
      });

      toast({
        title: t('contact.toast.subscribeSuccess'),
        description: t('contact.toast.subscribeDescription'),
      });

      setNewsletterEmail("");
      setNewsletterName("");
      setConsent(false);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: t('contact.toast.error'),
        description: t('contact.toast.newsletterError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-600 to-green-600 text-white">
      <CardContent className="p-8">
        <h3 className="text-2xl font-semibold mb-6">{t('contact.newsletter.title')}</h3>
        <p className="opacity-90 mb-6">
          {t('contact.newsletter.description')}
        </p>
        
        <form onSubmit={handleNewsletterSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsletter-email" className="text-white">
              {t('contact.newsletter.email')} *
            </Label>
            <Input
              id="newsletter-email"
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={t('contact.newsletter.emailPlaceholder')}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newsletter-name" className="text-white">
              {t('contact.newsletter.name')}
            </Label>
            <Input
              id="newsletter-name"
              type="text"
              value={newsletterName}
              onChange={(e) => setNewsletterName(e.target.value)}
              placeholder={t('contact.newsletter.namePlaceholder')}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter-consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
              className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
            />
            <Label htmlFor="newsletter-consent" className="text-sm text-white">
              {t('contact.newsletter.consent')} *
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold py-3" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              t('contact.newsletter.subscribing')
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t('contact.newsletter.subscribe')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterSubscription;