import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Zap, Coins, Banknote, Star, Sparkles, Heart, Diamond, Gem, Hexagon, Triangle, Circle } from "lucide-react";
import { RegistrationModal } from "./RegistrationModal";
import { DiscountRequestModal } from "./DiscountRequestModal";
import { AuthModal } from "./auth/AuthModal";

const Hero = () => {
  const { t } = useTranslation();
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [discountRequestOpen, setDiscountRequestOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <section className="relative py-20 px-4 min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-vibrant-purple via-vibrant-cyan to-vibrant-lime animate-aurora-wave bg-300%">
      {/* Plūduriuojantys pinigų elementai */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <Coins className="w-8 h-8 text-neon-blue opacity-80 animate-neon-glow" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <Banknote className="w-12 h-12 text-neon-purple opacity-70 animate-wobble" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float-slow">
          <Star className="w-6 h-6 text-neon-pink opacity-60 animate-rainbow-shift" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float">
          <Sparkles className="w-10 h-10 text-purple-500 opacity-70 animate-pulse" />
        </div>
        <div className="absolute top-60 left-1/3 animate-float-delayed">
          <Heart className="w-6 h-6 text-pink-500 opacity-60 animate-wobble" />
        </div>
        <div className="absolute top-32 right-1/3 animate-float-slow">
          <Diamond className="w-8 h-8 text-cyan-500 opacity-50 animate-rainbow-shift" />
        </div>
        <div className="absolute top-80 left-1/4 animate-float">
          <Gem className="w-7 h-7 text-emerald-500 opacity-60 animate-pulse" />
        </div>
        <div className="absolute bottom-60 right-1/4 animate-float-delayed">
          <Hexagon className="w-5 h-5 text-orange-500 opacity-50 animate-wobble" />
        </div>
        <div className="absolute top-1/2 left-10 animate-float-slow">
          <Triangle className="w-4 h-4 text-indigo-500 opacity-40 animate-rainbow-shift" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-float">
          <Circle className="w-6 h-6 text-rose-500 opacity-60 animate-pulse" />
        </div>
      </div>

      {/* Fono dalelių sistema */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full opacity-30 ${
              i % 4 === 0 ? 'bg-gradient-to-r from-neon-blue to-neon-purple animate-bubble-rise' :
              i % 4 === 1 ? 'bg-gradient-to-r from-neon-pink to-vibrant-orange animate-particle-float' :
              i % 4 === 2 ? 'bg-gradient-to-r from-vibrant-cyan to-vibrant-lime animate-matrix-rain' :
              'bg-gradient-to-r from-vibrant-purple to-vibrant-pink animate-particle-float'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${10 + Math.random() * 8}s`
            }}
          />
        ))}
      </div>
      
      {/* Papildomi neon burbulai */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className={`absolute rounded-full animate-bubble-rise ${
              i % 3 === 0 ? 'w-4 h-4 bg-neon-blue/20' :
              i % 3 === 1 ? 'w-6 h-6 bg-neon-purple/15' :
              'w-5 h-5 bg-neon-pink/20'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${12 + Math.random() * 6}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto text-center max-w-6xl relative z-10">
        <div className="animate-slide-in-left">
          <Badge variant="outline" className="mb-6 bg-blue-50/80 backdrop-blur-sm text-blue-700 border-blue-200 px-6 py-3 hover:bg-blue-100/80 transition-all duration-300 animate-pulse-glow">
            <Zap className="w-4 h-4 mr-2 animate-pulse" />
            {t('hero.badge')}
          </Badge>
        </div>
        
        <div className="relative mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-scale-in">
            <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-green-800 bg-clip-text text-transparent animate-gradient-x bg-300%">
              {t('hero.title')}
            </span>
            <br />
            <span className="text-4xl md:text-6xl bg-gradient-to-r from-blue-600 via-green-600 to-blue-800 bg-clip-text text-transparent animate-gradient-shift bg-300%">
              {t('hero.subtitle')}
            </span>
          </h1>
          
          {/* Rašymo mašinėlės efekto indikatorius */}
          <div className="absolute -right-4 top-4 w-1 h-8 bg-blue-600 animate-blink hidden md:block"></div>
        </div>
        
        <div className="animate-slide-in-right">
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <Button 
            onClick={() => setAuthModalOpen(true)}
            size="lg" 
            className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow group"
          >
            <span className="relative z-10">{t('hero.startSaving')}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 py-6 text-lg font-semibold border-2 hover:bg-slate-50 transition-all duration-300 backdrop-blur-sm bg-white/80 hover:scale-105 transform"
          >
            {t('hero.learnMore')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            {
              icon: TrendingUp,
              title: t('hero.features.dailyInterest.title'),
              description: t('hero.features.dailyInterest.description'),
              color: "green",
              delay: "0.2s"
            },
            {
              icon: Shield,
              title: t('hero.features.security.title'),
              description: t('hero.features.security.description'),
              color: "blue",
              delay: "0.4s"
            },
            {
              icon: Zap,
              title: t('hero.features.noFees.title'),
              description: t('hero.features.noFees.description'),
              color: "purple",
              delay: "0.6s"
            }
          ].map((item, index) => {
            const IconComponent = item.icon;
            const colorMap = {
              green: "bg-green-100 text-green-600 group-hover:bg-green-200",
              blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
              purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
            };

            return (
              <div 
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300 animate-scale-in hover:scale-105 transform cursor-pointer hover:bg-white/90"
                style={{ animationDelay: item.delay }}
              >
                <div className={`${colorMap[item.color]} p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-all duration-300 animate-morph`}>
                  <IconComponent className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 group-hover:text-blue-800 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                  {item.description}
                </p>
              </div>
            );
          })}
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
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultTab="signup"
      />
    </section>
  );
};

export default Hero;
