
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterName, setNewsletterName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('contact.toast.messageSent'),
        description: t('contact.toast.messageDescription'),
      });
      
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: t('contact.toast.error'),
        description: t('contact.toast.contactError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
    <section id="kontaktai" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-green-50 text-green-700 border-green-200">
            <Mail className="w-4 h-4 mr-2" />
            {t('contact.badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                {t('contact.form.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                      {t('contact.form.name')} *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 border-2 focus:border-blue-500"
                      placeholder={t('contact.form.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                      {t('contact.form.phone')}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 border-2 focus:border-blue-500"
                      placeholder={t('contact.form.phonePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    {t('contact.form.email')} *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 border-2 focus:border-blue-500"
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-slate-700">
                    {t('contact.form.message')} *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="mt-1 border-2 focus:border-blue-500"
                    placeholder={t('contact.form.messagePlaceholder')}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 font-semibold py-3"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    t('contact.form.sending')
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t('contact.form.send')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Newsletter Subscription */}
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
        </div>
      </div>
    </section>
  );
};

export default Contact;
