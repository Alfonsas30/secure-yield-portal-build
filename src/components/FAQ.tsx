
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const { toast } = useToast();
  const { t } = useLanguage();

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
        title: "Žinutė išsiųsta!",
        description: "Mes susisieksime su jumis per 24 valandas.",
      });
      
      setFormData({ name: "", email: "", message: "" });
      setShowContactForm(false);
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko išsiųsti žinutės. Pabandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const faqs = [
    {
      question: "Kaip veikia dienos palūkanos?",
      answer: "Palūkanos skaičiuojamos kasdien pagal jūsų sąskaitos likutį. Vietoj to, kad palūkanos būtų mokamos kartą per metus, mes jas mokame kasdien. Tai reiškia, kad jūsų pinigai auga kiekvieną dieną, o ne tik metų pabaigoje."
    },
    {
      question: "Ar tikrai nereikia teikti jokių ataskaičių?",
      answer: "Taip, mums nereikia pajamų deklaracijų, darbuotojų pažymų ar kitų dokumentų. Tiesiog atidarykite sąskaitą ir pradėkite taupyti. Mes tikime, kad taupymas turi būti paprastas ir prieinamas visiems."
    },
    {
      question: "Kiek saugūs mano pinigai?",
      answer: "Jūsų indėliai yra apdrausti pagal ES direktyvas iki 100,000 € per klientą. Mes naudojame aukščiausio lygio šifravimo technologijas ir laikome griežtus saugumo protokolus. Jūsų duomenys yra konfidencialūs ir niekam neatskleidžiami."
    },
    {
      question: "Ar galiu išsiimti pinigus bet kada?",
      answer: "Taip, jūsų pinigai yra prieinami bet kada. Nėra jokių užšaldymo terminų ar baudų už ankstyvas išėmimas. Galite išsiimti visą sumą arba tik dalį - sprendžiate patys."
    },
    {
      question: "Kokie yra mokesčiai?",
      answer: "Mes neimame jokių mokesčių už sąskaitos tvarkymą, pervedimu ar saugojimą. Vienintelis mokestis, kurį mokate, yra standartinis valstybės pajamų mokestis nuo užvaldytų palūkanų."
    },
    {
      question: "Kokia minimuma suma reikalinga pradėti?",
      answer: "Minimalus indėlio dydis yra tik 100 €. Maksimalaus dydžio apribojimų nėra, tačiau indėliai viršijantys 100,000 € nėra apdrausti pagal ES direktyvas."
    },
    {
      question: "Kaip greitai gaunu palūkanas?",
      answer: "Palūkanos skaičiuojamos ir prijungiamos prie jūsų sąskaitos kasdien. Galite matyti, kaip jūsų balansas auga kiekvieną dieną mūsų mobilejeje aplikacijoje arba internetinėje bankininkystėje."
    },
    {
      question: "Kas nutiks, jei bankrotuosite?",
      answer: "LTB Bankas yra licencijuotas bankas, prižiūrimas Lietuvos banko. Mūsų veikla yra reguliuojama pagal ES direktyvas, o indėliai apdrausti iki 100,000 € per klientą. Jūsų pinigai yra saugūs."
    }
  ];

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
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl">
          <Accordion type="single" collapsible className="p-6">
            {faqs.map((faq, index) => (
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
              {t('faq.notFound.title')}
            </h3>
            <p className="text-slate-600 mb-6">
              {t('faq.notFound.description')}
            </p>
            
            {!showContactForm ? (
              <Button 
                onClick={() => setShowContactForm(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                {t('faq.notFound.button')}
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 text-left">
                <div>
                  <Label htmlFor="quick-name" className="text-sm font-medium text-slate-700">
                    {t('faq.form.name')} *
                  </Label>
                  <Input
                    id="quick-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder={t('faq.form.placeholder.name')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="quick-email" className="text-sm font-medium text-slate-700">
                    {t('faq.form.email')} *
                  </Label>
                  <Input
                    id="quick-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder={t('faq.form.placeholder.email')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="quick-message" className="text-sm font-medium text-slate-700">
                    {t('faq.form.message')} *
                  </Label>
                  <Textarea
                    id="quick-message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="mt-1"
                    placeholder={t('faq.form.placeholder.message')}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    {isLoading ? (
                      t('faq.form.sending')
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('faq.form.send')}
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
                    {t('faq.form.cancel')}
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
