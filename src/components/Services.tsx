
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Shield, Eye, Calculator, Clock, TrendingUp, Sparkles } from "lucide-react";
import { RegistrationModal } from "./RegistrationModal";
import { DiscountRequestModal } from "./DiscountRequestModal";

const Services = () => {
  const { t } = useTranslation();
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [discountRequestOpen, setDiscountRequestOpen] = useState(false);

  const services = [
    {
      icon: Calendar,
      title: t('services.items.dailyInterest.title'),
      description: t('services.items.dailyInterest.description'),
      badge: t('services.items.dailyInterest.badge'),
      color: "bg-green-100 text-green-600",
      hoverColor: "hover:bg-green-200 hover:text-green-700",
      delay: "0.1s"
    },
    {
      icon: Eye,
      title: t('services.items.noReports.title'),
      description: t('services.items.noReports.description'),
      badge: t('services.items.noReports.badge'),
      color: "bg-blue-100 text-blue-600",
      hoverColor: "hover:bg-blue-200 hover:text-blue-700",
      delay: "0.2s"
    },
    {
      icon: Shield,
      title: t('services.items.confidentiality.title'),
      description: t('services.items.confidentiality.description'),
      badge: t('services.items.confidentiality.badge'),
      color: "bg-purple-100 text-purple-600",
      hoverColor: "hover:bg-purple-200 hover:text-purple-700",
      delay: "0.3s"
    },
    {
      icon: Calculator,
      title: t('services.items.transparent.title'),
      description: t('services.items.transparent.description'),
      badge: t('services.items.transparent.badge'),
      color: "bg-orange-100 text-orange-600",
      hoverColor: "hover:bg-orange-200 hover:text-orange-700",
      delay: "0.4s"
    },
    {
      icon: Clock,
      title: t('services.items.quickAccess.title'),
      description: t('services.items.quickAccess.description'),
      badge: t('services.items.quickAccess.badge'),
      color: "bg-red-100 text-red-600",
      hoverColor: "hover:bg-red-200 hover:text-red-700",
      delay: "0.5s"
    },
    {
      icon: TrendingUp,
      title: t('services.items.competitive.title'),
      description: t('services.items.competitive.description'),
      badge: t('services.items.competitive.badge'),
      color: "bg-cyan-100 text-cyan-600",
      hoverColor: "hover:bg-cyan-200 hover:text-cyan-700",
      delay: "0.6s"
    },
    {
      icon: Calculator,
      title: t('services.items.loans.title'),
      description: t('services.items.loans.description'),
      badge: t('services.items.loans.badge'),
      color: "bg-orange-100 text-orange-600",
      hoverColor: "hover:bg-orange-200 hover:text-orange-700",
      delay: "0.7s"
    }
  ];

  return (
    <section id="paslaugos" className="relative py-20 px-4 bg-gradient-to-br from-vibrant-orange/20 via-vibrant-pink/20 to-vibrant-cyan/20 animate-aurora-wave overflow-hidden">
      {/* Fono efektai */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 animate-float">
          <Sparkles className="w-6 h-6 text-neon-purple opacity-70 animate-neon-glow" />
        </div>
        <div className="absolute bottom-20 left-10 animate-float-delayed">
          <Sparkles className="w-8 h-8 text-neon-pink opacity-60 animate-wobble" />
        </div>
        <div className="absolute top-1/2 left-1/4 animate-float-slow">
          <div className="w-4 h-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full opacity-50 animate-rainbow-shift"></div>
        </div>
        <div className="absolute top-1/3 right-1/3 animate-float">
          <div className="w-3 h-3 bg-gradient-to-r from-vibrant-orange to-vibrant-pink rounded-full opacity-40 animate-pulse"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-float-delayed">
          <div className="w-5 h-5 bg-gradient-to-r from-vibrant-cyan to-vibrant-lime rounded-full opacity-45 animate-wobble"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-16 animate-scale-in">
          <Badge variant="outline" className="mb-4 bg-green-50/80 backdrop-blur-sm text-green-700 border-green-200 px-4 py-2 animate-pulse-glow">
            {t('services.badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 bg-gradient-to-r from-slate-900 via-blue-900 to-green-800 bg-clip-text text-transparent">
            {t('services.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            {t('services.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={index} 
                className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-slate-50 animate-scale-in hover:scale-105 transform cursor-pointer relative overflow-hidden"
                style={{ animationDelay: service.delay }}
              >
                {/* Hover efekto fonas */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Shimmer efektas */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${service.color} ${service.hoverColor} transition-all duration-300 animate-morph group-hover:scale-110 transform`}>
                      <IconComponent className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
                    </div>
                    <Badge variant="secondary" className="text-xs group-hover:bg-slate-200 transition-colors duration-300">
                      {service.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-blue-800 transition-colors duration-300">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-slate-600 text-base leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {service.description}
                  </CardDescription>
                </CardContent>

                {/* Dekoratyvūs elementai */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-200 to-green-200 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </Card>
            );
          })}
        </div>

        {/* Papildomi fono elementai */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50/80 to-green-50/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 animate-scale-in hover:shadow-lg transition-all duration-500 relative overflow-hidden group cursor-pointer" style={{ animationDelay: '0.8s' }}>
            {/* Animuotas fonas */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-green-100/50 to-blue-100/50 animate-gradient-x bg-300% opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse-glow">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-900 group-hover:text-blue-800 transition-colors duration-300">
                {t('services.cta.title')}
              </h3>
              <p className="text-slate-600 text-lg mb-6 group-hover:text-slate-700 transition-colors duration-300">
                {t('services.cta.description')}
              </p>
              <Button 
                onClick={() => setRegistrationOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 font-semibold transition-all duration-300 hover:shadow-lg animate-pulse-glow"
              >
                {t('services.cta.button')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RegistrationModal 
        open={registrationOpen} 
        onOpenChange={setRegistrationOpen}
      />
      <DiscountRequestModal 
        open={discountRequestOpen} 
        onOpenChange={setDiscountRequestOpen}
      />
    </section>
  );
};

export default Services;
