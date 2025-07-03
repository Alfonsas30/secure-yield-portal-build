
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const { t } = useTranslation();

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

      </div>
    </section>
  );
};

export default FAQ;
