
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CreditCard, TrendingUp, Banknote, CheckCircle, Sparkles } from "lucide-react";
import { RegistrationModal } from "./RegistrationModal";
import { DiscountRequestModal } from "./DiscountRequestModal";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [discountRequestOpen, setDiscountRequestOpen] = useState(false);
  const { t } = useLanguage();

  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: t('howItWorks.steps.register.title'),
      description: t('howItWorks.steps.register.description'),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      delay: "0.1s"
    },
    {
      number: "02", 
      icon: CreditCard,
      title: t('howItWorks.steps.deposit.title'),
      description: t('howItWorks.steps.deposit.description'),
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      delay: "0.2s"
    },
    {
      number: "03",
      icon: TrendingUp,
      title: t('howItWorks.steps.earn.title'),
      description: t('howItWorks.steps.earn.description'),
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      delay: "0.3s"
    },
    {
      number: "04",
      icon: Banknote,
      title: t('howItWorks.steps.withdraw.title'),
      description: t('howItWorks.steps.withdraw.description'),
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      delay: "0.4s"
    }
  ];

  return (
    <section id="kaip-veikia" className="relative py-20 px-4 bg-gradient-to-br from-white via-slate-50 to-blue-50 overflow-hidden">
      {/* Fono efektai */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 right-20 animate-float">
          <Sparkles className="w-8 h-8 text-blue-300 opacity-40" />
        </div>
        <div className="absolute bottom-40 left-16 animate-float-delayed">
          <CheckCircle className="w-6 h-6 text-green-400 opacity-50" />
        </div>
        <div className="absolute top-2/3 right-1/3 animate-float-slow">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-30"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-16 animate-scale-in">
          <Badge variant="outline" className="mb-4 bg-purple-50/80 backdrop-blur-sm text-purple-700 border-purple-200 animate-pulse-glow">
            {t('howItWorks.badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 bg-gradient-to-r from-slate-900 via-purple-800 to-blue-800 bg-clip-text text-transparent">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Progreso indikatorius */}
        <div className="flex justify-center mb-12 animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center space-x-4">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${steps[index].color} animate-pulse`} style={{ animationDelay: `${index * 0.2}s` }}></div>
                {index < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-gradient-to-r from-slate-300 to-slate-400 mx-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 animate-shimmer"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Animuotas fono linija */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200 transform -translate-y-1/2 animate-shimmer"></div>
          
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card 
                key={index} 
                className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-slate-50 group animate-scale-in hover:scale-105 transform cursor-pointer z-10"
                style={{ animationDelay: step.delay }}
              >
                {/* Hover efekto fonas */}
                <div className={`absolute inset-0 ${step.bgColor}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg`}></div>
                
                {/* Shimmer efektas */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-lg"></div>

                <CardContent className="p-8 text-center relative z-10">
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 animate-morph relative overflow-hidden`}>
                      <IconComponent className="w-8 h-8 text-white relative z-10" />
                      {/* Pulsing efektas */}
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold group-hover:bg-blue-600 transition-colors duration-300 animate-pulse-glow">
                      {step.number}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4 text-slate-900 group-hover:text-blue-800 transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {step.description}
                  </p>

                  {/* Dekoratyvūs elementai */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-blue-300 to-green-300 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-700 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </CardContent>

                {/* Progreso linija tarp kortelių */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-slate-300 to-slate-400 transform -translate-y-1/2 z-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 animate-shimmer"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50/80 to-green-50/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 animate-scale-in hover:shadow-lg transition-all duration-500 relative overflow-hidden group cursor-pointer" style={{ animationDelay: '0.8s' }}>
            {/* Animuotas fonas */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-green-100/50 to-purple-100/50 animate-gradient-x bg-300% opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Dalelių efektai */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-60 animate-pulse transition-opacity duration-500"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-50 animate-pulse transition-opacity duration-700" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-70 animate-pulse transition-opacity duration-600" style={{ animationDelay: '0.5s' }}></div>
            
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse-glow group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-900 group-hover:text-blue-800 transition-colors duration-300">
                {t('howItWorks.cta.title')}
              </h3>
              <p className="text-slate-600 text-lg mb-6 group-hover:text-slate-700 transition-colors duration-300">
                {t('howItWorks.cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setRegistrationOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg animate-pulse-glow relative overflow-hidden group/btn"
                >
                  <span className="relative z-10">{t('howItWorks.cta.buttonPrimary')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
                </button>
                <button className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-slate-50 hover:scale-105 transform backdrop-blur-sm bg-white/80">
                  {t('howItWorks.cta.buttonSecondary')}
                </button>
              </div>
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

export default HowItWorks;
