
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Coins, ArrowRight, Sparkles } from "lucide-react";
import { RegistrationModal } from "./RegistrationModal";
import { DiscountRequestModal } from "./DiscountRequestModal";

const InterestCalculator = () => {
  const [amount, setAmount] = useState<string>("10000");
  const [rate] = useState<number>(2); // 2% per year
  const [animatedDaily, setAnimatedDaily] = useState<number>(0);
  const [animatedMonthly, setAnimatedMonthly] = useState<number>(0);
  const [animatedYearly, setAnimatedYearly] = useState<number>(0);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [discountRequestOpen, setDiscountRequestOpen] = useState(false);
  
  const calculateInterest = () => {
    const principal = parseFloat(amount) || 0;
    const dailyRate = rate / 365 / 100;
    const dailyInterest = principal * dailyRate;
    const monthlyInterest = dailyInterest * 30;
    const yearlyInterest = principal * (rate / 100);
    
    return {
      daily: dailyInterest,
      monthly: monthlyInterest,
      yearly: yearlyInterest
    };
  };

  const interest = calculateInterest();

  // Animuotas skaičių atnaujinimas
  useEffect(() => {
    const animateNumber = (target: number, setter: (value: number) => void, duration: number = 1000) => {
      const start = Date.now();
      const startValue = 0;
      
      const animation = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (target - startValue) * easeOut;
        
        setter(current);
        
        if (progress < 1) {
          requestAnimationFrame(animation);
        }
      };
      
      requestAnimationFrame(animation);
    };

    animateNumber(interest.daily, setAnimatedDaily, 800);
    animateNumber(interest.monthly, setAnimatedMonthly, 1000);
    animateNumber(interest.yearly, setAnimatedYearly, 1200);
  }, [amount, interest.daily, interest.monthly, interest.yearly]);

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 animate-gradient-shift bg-300% overflow-hidden">
      {/* Fono dalelių efektai */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <Coins className="w-6 h-6 text-yellow-500 opacity-40" />
        </div>
        <div className="absolute bottom-32 right-20 animate-float-delayed">
          <Sparkles className="w-8 h-8 text-blue-500 opacity-30" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-slow">
          <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-40"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl relative">
        <div className="text-center mb-12 animate-scale-in">
          <Badge variant="outline" className="mb-4 bg-blue-50/80 backdrop-blur-sm text-blue-700 border-blue-200 animate-pulse-glow">
            <Calculator className="w-4 h-4 mr-2" />
            Palūkanų skaičiuoklė
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 bg-gradient-to-r from-blue-900 to-green-800 bg-clip-text text-transparent">
            Apskaičiuokite savo pelną
          </h2>
          <p className="text-xl text-slate-600 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            Sužinokite, kiek uždirbsite su mūsų dienos palūkanomis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-slide-in-left hover:shadow-2xl transition-all duration-500 group">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900 group-hover:text-blue-800 transition-colors duration-300">
                Įveskite sumą
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="amount" className="text-base font-medium text-slate-700 mb-2 block">
                  Taupoma suma (€)
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-xl py-4 border-2 focus:border-blue-500 transition-all duration-300 animate-pulse-glow bg-white/90 backdrop-blur-sm"
                    placeholder="10000"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200/50 relative overflow-hidden group/badge">
                {/* Animuotas fonas */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-green-100/50 to-blue-100/50 animate-gradient-x bg-300% opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-slate-700 font-medium">Palūkanų norma:</span>
                  <Badge className="bg-green-600 hover:bg-green-700 transition-colors duration-300 animate-pulse-glow">
                    <TrendingUp className="w-4 h-4 mr-1 animate-pulse" />
                    {rate}% per metus
                  </Badge>
                </div>
              </div>

              {/* Pinigų srautų vizualizacija */}
              <div className="flex items-center justify-center space-x-4 py-4">
                <div className="flex items-center space-x-2 animate-slide-in-left" style={{ animationDelay: '0.5s' }}>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-sm font-bold">€</span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-400 animate-pulse" />
                  <ArrowRight className="w-6 h-6 text-slate-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <ArrowRight className="w-6 h-6 text-slate-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.6s' }}>
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-600 to-green-600 text-white animate-slide-in-right hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            {/* Animuotas fonas */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700/50 via-green-700/50 to-blue-700/50 animate-gradient-shift bg-300% opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-semibold flex items-center">
                <Sparkles className="w-6 h-6 mr-2 animate-pulse" />
                Jūsų pelnas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300 animate-count-up group/item">
                  <div className="text-sm opacity-90 mb-1">Per dieną</div>
                  <div className="text-2xl font-bold group-hover/item:scale-105 transition-transform duration-300">
                    +{animatedDaily.toFixed(2)} €
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-shimmer" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300 animate-count-up group/item" style={{ animationDelay: '0.2s' }}>
                  <div className="text-sm opacity-90 mb-1">Per mėnesį</div>
                  <div className="text-2xl font-bold group-hover/item:scale-105 transition-transform duration-300">
                    +{animatedMonthly.toFixed(2)} €
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-shimmer" style={{ width: '60%', animationDelay: '0.5s' }}></div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300 animate-count-up group/item" style={{ animationDelay: '0.4s' }}>
                  <div className="text-sm opacity-90 mb-1">Per metus</div>
                  <div className="text-3xl font-bold group-hover/item:scale-105 transition-transform duration-300">
                    +{animatedYearly.toFixed(2)} €
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-shimmer" style={{ width: '100%', animationDelay: '1s' }}></div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setRegistrationOpen(true)}
                className="w-full bg-white text-blue-600 hover:bg-slate-50 font-semibold py-3 transition-all duration-300 hover:shadow-lg animate-pulse-glow relative overflow-hidden group/btn"
                size="lg"
              >
                <span className="relative z-10">Pradėti taupyti</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-green-100/50 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <RegistrationModal 
        open={registrationOpen} 
        onOpenChange={setRegistrationOpen}
        onRequestDiscount={() => setDiscountRequestOpen(true)}
      />
      <DiscountRequestModal 
        open={discountRequestOpen} 
        onOpenChange={setDiscountRequestOpen}
      />
    </section>
  );
};

export default InterestCalculator;
