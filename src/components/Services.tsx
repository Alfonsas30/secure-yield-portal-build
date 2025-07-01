
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Shield, Eye, Calculator, Clock, TrendingUp } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Calendar,
      title: "Dienos palūkanos",
      description: "Gaukite palūkanas kasdien, o ne tik metų pabaigoje. Jūsų pinigai dirba kiekvieną dieną.",
      badge: "Populiariausia",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Eye,
      title: "Jokių ataskaičių",
      description: "Niekas neprašys deklaracijų ar pajamų paaiškinimų. Tiesiog taupykite ir gaukite palūkanas.",
      badge: "Paprasta",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Shield,
      title: "Konfidencialumas",
      description: "Jūsų finansinė informacija yra griežtai konfidenciali. Niekam neatskleidžiame duomenų.",
      badge: "Saugus",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Calculator,
      title: "Skaidrus skaičiavimas",
      description: "Visada žinote, kiek uždirbsite. Jokių slepiamų mokesčių ar sudėtingų sąlygų.",
      badge: "Aiškus",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: Clock,
      title: "Greitas priėjimas",
      description: "Pinigai prieinami bet kada. Nėra užšaldymo periodų ar išėmimo apribojimų.",
      badge: "Greitas",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: TrendingUp,
      title: "Konkurencingos palūkanos",
      description: "Siūlome vieną iš aukščiausių palūkanų normų rinkoje - iki 8% per metus.",
      badge: "Pelningas",
      color: "bg-cyan-100 text-cyan-600"
    }
  ];

  return (
    <section id="paslaugos" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-green-50 text-green-700 border-green-200">
            Mūsų paslaugos
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Kodėl rinktis LTB Bankas?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Siūlome inovatyvius sprendimus, kurie padės jums taupyti efektyviau ir saugiau nei bet kada anksčiau.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${service.color.replace('text-', 'bg-').replace('-600', '-100')} ${service.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {service.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
