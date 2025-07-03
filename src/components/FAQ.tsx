
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FAQ = () => {
  const { t } = useTranslation();
  const [showContactForm, setShowContactForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          message: formData.message
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('faq.toast.success'),
        description: t('faq.toast.successDescription'),
      });
      
      setFormData({ name: "", email: "", message: "" });
      setShowContactForm(false);
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: t('faq.toast.error'),
        description: t('faq.toast.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const faqs = t('faq.questions', { returnObjects: true });
  const faqArray = Array.isArray(faqs) ? faqs as Array<{
    question: string;
    answer: string;
  }> : [];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            <HelpCircle className="w-4 h-4 mr-2" />
            {t('faq.badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            {t('faq.title')}
          </h2>
          <p className="text-xl text-slate-600">
            {t('faq.description')}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl">
          <Accordion type="single" collapsible className="p-6">
            {faqArray.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-slate-200">
                <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed text-base pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200">
            <h3 className="text-xl font-semibold mb-4 text-slate-900">
              {t('faq.contact.notFound')}
            </h3>
            <p className="text-slate-600 mb-6">
              {t('faq.contact.description')}
            </p>
            
            {!showContactForm ? (
              <Button 
                onClick={() => setShowContactForm(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                {t('faq.contact.button')}
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 text-left">
                <div>
                  <Label htmlFor="quick-name" className="text-sm font-medium text-slate-700">
                    {t('faq.contact.form.name')} *
                  </Label>
                  <Input
                    id="quick-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder={t('faq.contact.form.namePlaceholder')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="quick-email" className="text-sm font-medium text-slate-700">
                    {t('faq.contact.form.email')} *
                  </Label>
                  <Input
                    id="quick-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder={t('faq.contact.form.emailPlaceholder')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="quick-message" className="text-sm font-medium text-slate-700">
                    {t('faq.contact.form.message')} *
                  </Label>
                  <Textarea
                    id="quick-message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="mt-1"
                    placeholder={t('faq.contact.form.messagePlaceholder')}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    {isLoading ? (
                      t('faq.contact.form.sending')
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('faq.contact.form.send')}
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setShowContactForm(false);
                      setFormData({ name: "", email: "", message: "" });
                    }}
                    disabled={isLoading}
                  >
                    {t('faq.contact.form.cancel')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
