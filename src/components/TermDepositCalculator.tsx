import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Coins, ArrowRight, Sparkles, Crown, Star, Diamond } from "lucide-react";
import { RegistrationModal } from "./RegistrationModal";
import { DiscountRequestModal } from "./DiscountRequestModal";

const TermDepositCalculator = () => {
  const [amount, setAmount] = useState<string>("10000");
  const [animatedMonthly, setAnimatedMonthly] = useState<number>(0);
  const [animatedYearly, setAnimatedYearly] = useState<number>(0);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  
  const getInterestRate = (depositAmount: number) => {
    if (depositAmount < 10000) return 8;
    if (depositAmount < 100000) return 10;
    return 12;
  };

  const getRateCategory = (depositAmount: number) => {
    if (depositAmount < 10000) return { category: "Pradedantis", icon: Star, color: "from-amber-500 to-orange-500" };
    if (depositAmount < 100000) return { category: "Pažengęs", icon: Crown, color: "from-blue-500 to-purple-500" };
    return { category: "VIP", icon: Diamond, color: "from-purple-500 to-pink-500" };
  };
  
  const calculateInterest = () => {
    const principal = parseFloat(amount) || 0;
    const rate = getInterestRate(principal);
    const monthlyInterest = (principal * (rate / 100)) / 12;
    const yearlyInterest = principal * (rate / 100);
    
    return {
      rate,
      monthly: monthlyInterest,
      yearly: yearlyInterest
    };
  };

  const interest = calculateInterest();
  const rateCategory = getRateCategory(parseFloat(amount) || 0);

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

    animateNumber(interest.monthly, setAnimatedMonthly, 1000);
    animateNumber(interest.yearly, setAnimatedYearly, 1200);
  }, [amount, interest.monthly, interest.yearly]);

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 animate-gradient-shift bg-300% overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <Coins className="w-6 h-6 text-amber-500 opacity-40" />
        </div>
        <div className="absolute bottom-32 right-20 animate-float-delayed">
          <Sparkles className="w-8 h-8 text-orange-500 opacity-30" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-slow">
          <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-40"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-12 animate-scale-in">
          <Badge variant="outline" className="mb-4 bg-amber-50/80 backdrop-blur-sm text-amber-700 border-amber-200 animate-pulse-glow">
            <Calculator className="w-4 h-4 mr-2" />
            Terminuotų indėlių skaičiuoklė
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
            Terminuoti indėliai
          </h2>
          <p className="text-xl text-slate-600 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            Aukštesnės palūkanos už didesnės sumos indėlius
          </p>
        </div>

        {/* Interest rate tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h3 className="font-semibold text-amber-800">Pradedantis</h3>
              <p className="text-sm text-amber-700">Iki 10,000€</p>
              <p className="text-2xl font-bold text-amber-800">8%</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <Crown className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800">Pažengęs</h3>
              <p className="text-sm text-blue-700">10,000€ - 100,000€</p>
              <p className="text-2xl font-bold text-blue-800">10%</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Diamond className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800">VIP</h3>
              <p className="text-sm text-purple-700">100,000€ ir daugiau</p>
              <p className="text-2xl font-bold text-purple-800">12%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-slide-in-left hover:shadow-2xl transition-all duration-500 group">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900 group-hover:text-amber-800 transition-colors duration-300">
                Įveskite indėlio sumą
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="amount" className="text-base font-medium text-slate-700 mb-2 block">
                  Indėlio suma (€)
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-xl py-4 border-2 focus:border-amber-500 transition-all duration-300 animate-pulse-glow bg-white/90 backdrop-blur-sm"
                    placeholder="10000"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Current rate category */}
              <div className={`bg-gradient-to-r ${rateCategory.color} p-6 rounded-xl text-white relative overflow-hidden group/badge`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 animate-gradient-x bg-300% opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <rateCategory.icon className="w-6 h-6 animate-pulse" />
                    <div>
                      <div className="font-medium">{rateCategory.category} lygis</div>
                      <div className="text-sm opacity-90">Jūsų palūkanų norma</div>
                    </div>
                  </div>
                  <Badge className="bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white border-white/30">
                    <TrendingUp className="w-4 h-4 mr-1 animate-pulse" />
                    {interest.rate}% per metus
                  </Badge>
                </div>
              </div>

              {/* Money flow visualization */}
              <div className="flex items-center justify-center space-x-4 py-4">
                <div className="flex items-center space-x-2 animate-slide-in-left" style={{ animationDelay: '0.5s' }}>
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-sm font-bold">€</span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-400 animate-pulse" />
                  <ArrowRight className="w-6 h-6 text-slate-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <ArrowRight className="w-6 h-6 text-slate-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.6s' }}>
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-xl border-0 bg-gradient-to-br ${rateCategory.color} text-white animate-slide-in-right hover:shadow-2xl transition-all duration-500 relative overflow-hidden group`}>
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 animate-gradient-shift bg-300% opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-semibold flex items-center">
                <Sparkles className="w-6 h-6 mr-2 animate-pulse" />
                Jūsų pelnas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300 animate-count-up group/item">
                  <div className="text-sm opacity-90 mb-1">Per mėnesį</div>
                  <div className="text-2xl font-bold group-hover/item:scale-105 transition-transform duration-300">
                    +{animatedMonthly.toFixed(2)} €
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-shimmer" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300 animate-count-up group/item" style={{ animationDelay: '0.2s' }}>
                  <div className="text-sm opacity-90 mb-1">Per metus</div>
                  <div className="text-3xl font-bold group-hover/item:scale-105 transition-transform duration-300">
                    +{animatedYearly.toFixed(2)} €
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-shimmer" style={{ width: '100%', animationDelay: '0.5s' }}></div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setShowRegistrationModal(true)}
                className="w-full bg-white text-slate-800 hover:bg-slate-50 font-semibold py-3 transition-all duration-300 hover:shadow-lg animate-pulse-glow relative overflow-hidden group/btn"
                size="lg"
              >
                <span className="relative z-10">Atidaryti terminuotą indėlį</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <RegistrationModal
        open={showRegistrationModal}
        onOpenChange={setShowRegistrationModal}
        onRequestDiscount={() => {
          setShowRegistrationModal(false);
          setShowDiscountModal(true);
        }}
      />

      <DiscountRequestModal
        open={showDiscountModal}
        onOpenChange={setShowDiscountModal}
      />
    </section>
  );
};

export default TermDepositCalculator;