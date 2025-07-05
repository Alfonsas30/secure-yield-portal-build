import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save contact message to database
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            message: formData.message
          }
        ]);

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Klaida išsaugant žinutę",
          description: "Nepavyko išsaugoti jūsų žinutės. Bandykite dar kartą.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Žinutė gauta!",
        description: "Jūsų žinutė buvo sėkmingai išsaugota. Susisieksime su jumis netrukus.",
      });
      
      // Clear form on success
      setFormData({ name: "", email: "", phone: "", message: "" });
      
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Nepavyko išsiųsti žinutės",
        description: "Įvyko nežinoma klaida. Bandykite dar kartą.",
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

  return (
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
  );
};

export default ContactForm;