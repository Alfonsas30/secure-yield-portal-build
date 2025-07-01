
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CreditCard, TrendingUp, Banknote } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Registruokitės",
      description: "Sukurkite paskyrą per 3 minutes. Jokių sudėtingų dokumentų ar ataskaičių nereikia.",
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "02", 
      icon: CreditCard,
      title: "Įneškite pinigus",
      description: "Perveskite pinigus iš bet kurio Lietuvos banko. Pervedimai yra greiti ir saugūs.",
      color: "from-green-500 to-green-600"
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Gaukite palūkanas",
      description: "Jūsų pinigai pradės dirbti iš karto. Palūkanos skaičiuojamos ir mokai kasdien.",
      color: "from-purple-500 to-purple-600"
    },
    {
      number: "04",
      icon: Banknote,
      title: "Naudokitės pinigais",
      description: "Pinigai prieinami bet kada. Galite išsiimti visą sumą ar tik dalį - kaip jums patogu.",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section id="kaip-veikia" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-purple-50 text-purple-700 border-purple-200">
            Paprastas procesas
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Kaip tai veikia?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Pradėti taupyti su InnoBank yra paprasta ir greitai. Štai kaip tai veikia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card key={index} className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 group">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4 text-slate-900">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-slate-300 to-slate-400 transform -translate-y-1/2 z-10">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-2xl font-semibold mb-4 text-slate-900">
              Pasiruošę pradėti taupyti?
            </h3>
            <p className="text-slate-600 mb-6 text-lg">
              Prisijunkite prie tūkstančių klientų, kurie jau uždirba su InnoBank
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                Registruotis dabar
              </button>
              <button className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-slate-50">
                Skaityti daugiau
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
