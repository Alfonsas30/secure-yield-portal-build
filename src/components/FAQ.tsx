
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
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
      answer: "InnoBank yra licencijuotas bankas, prižiūrimas Lietuvos banko. Mūsų veikla yra reguliuojama pagal ES direktyvas, o indėliai apdrausti iki 100,000 € per klientą. Jūsų pinigai yra saugūs."
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            <HelpCircle className="w-4 h-4 mr-2" />
            Dažniausiai užduodami klausimai
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Turite klausimų?
          </h2>
          <p className="text-xl text-slate-600">
            Štai atsakymai į dažniausiai užduodamus klausimus apie InnoBank paslaugas
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
              Neradote atsakymo į savo klausimą?
            </h3>
            <p className="text-slate-600 mb-6">
              Susisiekite su mūsų ekspertų komanda - mes mielai padėsime
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
              Susisiekti su mumis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
