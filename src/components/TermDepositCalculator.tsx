import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, Coins, ArrowRight, Sparkles, Crown, Star, Diamond, Wallet, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./auth/AuthModal";
import { RegistrationModal } from "./RegistrationModal";
import { TermDepositContractModal } from "./TermDepositContractModal";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDualCurrency } from "@/lib/currency";

const TermDepositCalculator = () => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>("10000");
  const [selectedTerm, setSelectedTerm] = useState<12 | 72>(12); // 12 months or 72 months (6 years)
  const [animatedMonthly, setAnimatedMonthly] = useState<number>(0);
  const [animatedYearly, setAnimatedYearly] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch account balance for logged-in users
  useEffect(() => {
    if (user && profile) {
      fetchBalance();
    }
  }, [user, profile]);

  const fetchBalance = async () => {
    if (!profile) return;
    
    setLoadingBalance(true);
    try {
      const { data, error } = await supabase
        .from('account_balances')
        .select('balance')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching balance:', error);
      } else {
        setBalance(data?.balance || 0);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const getInterestRate = (depositAmount: number, termMonths: number) => {
    // 6 years term: 100% regardless of amount
    if (termMonths === 72) return 100;
    
    // 1 year term: traditional rates based on amount
    if (depositAmount < 10000) return 8;
    if (depositAmount < 100000) return 10;
    return 12;
  };

  const getRateCategory = (depositAmount: number, termMonths: number) => {
    if (termMonths === 72) {
      return { category: t('termDepositCalculator.category.vip6Years'), icon: Diamond, color: "from-purple-500 to-pink-500" };
    }
    
    if (depositAmount < 10000) return { category: t('termDepositCalculator.category.beginner'), icon: Star, color: "from-amber-500 to-orange-500" };
    if (depositAmount < 100000) return { category: t('termDepositCalculator.category.advanced'), icon: Crown, color: "from-blue-500 to-purple-500" };
    return { category: t('termDepositCalculator.category.vip'), icon: Diamond, color: "from-purple-500 to-pink-500" };
  };
  
  const calculateInterest = () => {
    const principal = parseFloat(amount) || 0;
    const rate = getInterestRate(principal, selectedTerm);
    const years = selectedTerm / 12;
    
    let totalReturn, totalProfit, yearlyProfit, monthlyProfit;
    
    if (selectedTerm === 72) {
      // 6 metų terminas: paprasta 100% palūkana (padvigubina sumą)
      totalReturn = principal * 2;
      totalProfit = principal; // 100% pelnas
      yearlyProfit = totalProfit / years;
      monthlyProfit = yearlyProfit / 12;
    } else {
      // 1 metų terminas: sudėtinė palūkana
      totalReturn = principal * Math.pow(1 + rate / 100, years);
      totalProfit = totalReturn - principal;
      yearlyProfit = totalProfit / years;
      monthlyProfit = yearlyProfit / 12;
    }
    
    return {
      rate,
      monthly: monthlyProfit,
      yearly: yearlyProfit,
      totalReturn,
      totalProfit
    };
  };

  const interest = calculateInterest();
  const rateCategory = getRateCategory(parseFloat(amount) || 0, selectedTerm);
  
  // Validation
  const amountValue = parseFloat(amount) || 0;
  const isOverBalance = user && balance !== null && amountValue > balance;
  const canInvest = user && amountValue > 0 && !isOverBalance;

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
    <section className="relative py-12 md:py-20 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 animate-gradient-shift bg-300% overflow-hidden">
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
            {t('termDepositCalculator.badge')}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-slate-900 bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
            {t('termDepositCalculator.title')}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            {t('termDepositCalculator.description')}
          </p>
        </div>

        {/* Term Selection */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('termDepositCalculator.selectTerm')}</h3>
            <p className="text-slate-600">{t('termDepositCalculator.termDescription')}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedTerm === 12 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => setSelectedTerm(12)}
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900">{t('termDepositCalculator.term1Year.title')}</h3>
                <p className="text-sm text-slate-600 mb-3">{t('termDepositCalculator.term1Year.description')}</p>
                <div className="space-y-1 text-sm">
                  <div>{t('termDepositCalculator.term1Year.rates.up10k')} <span className="font-bold text-blue-600">8%</span></div>
                  <div>{t('termDepositCalculator.term1Year.rates.up100k')} <span className="font-bold text-blue-600">10%</span></div>
                  <div>{t('termDepositCalculator.term1Year.rates.over100k')} <span className="font-bold text-blue-600">12%</span></div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedTerm === 72 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => setSelectedTerm(72)}
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Diamond className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900">{t('termDepositCalculator.term6Years.title')}</h3>
                <p className="text-sm text-slate-600 mb-3">{t('termDepositCalculator.term6Years.description')}</p>
                <div className="text-3xl font-bold text-purple-600 mb-2">{t('termDepositCalculator.term6Years.rate')}</div>
                <p className="text-sm text-slate-600">{t('termDepositCalculator.term6Years.subtitle')}</p>
                <Badge className="mt-2 bg-purple-600 text-white">{t('termDepositCalculator.term6Years.badge')}</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-slide-in-left hover:shadow-2xl transition-all duration-500 group">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900 group-hover:text-amber-800 transition-colors duration-300">
                {selectedTerm === 12 ? t('termDepositCalculator.enterAmount') : t('termDepositCalculator.enterInvestAmount')}
              </CardTitle>
              {selectedTerm === 72 && (
                <p className="text-sm text-slate-600 mt-2">
                  {t('termDepositCalculator.investDescription')}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Balance Display for logged-in users */}
              {user && (
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">{t('termDepositCalculator.accountBalance')}</span>
                    </div>
                    <div className="text-lg font-semibold text-slate-900">
                      {loadingBalance ? (
                        <div className="animate-pulse bg-slate-200 h-6 w-24 rounded"></div>
                      ) : (
                        formatDualCurrency(balance || 0)
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="amount" className="text-base font-medium text-slate-700 mb-2 block">
                  {t('termDepositCalculator.amountLabel')} {user && balance && `(${t('termDepositCalculator.maxAmount')} ${formatDualCurrency(balance)})`}
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={user && balance ? balance : undefined}
                    className={`text-base sm:text-lg lg:text-xl py-4 px-4 border-2 transition-all duration-300 bg-white/90 backdrop-blur-sm min-h-[48px] ${
                      isOverBalance 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-slate-200 focus:border-amber-500'
                    }`}
                    placeholder="10000"
                  />
                  {user && balance && (
                    <Slider
                      value={[amountValue]}
                      onValueChange={(value) => setAmount(value[0].toString())}
                      max={balance}
                      min={0}
                      step={1000}
                      className="mt-3 touch-manipulation"
                    />
                  )}
                </div>
                {isOverBalance && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{t('termDepositCalculator.overBalance')}</span>
                  </div>
                )}
                {user && balance && amountValue > 0 && !isOverBalance && (
                  <div className="mt-2 text-sm text-slate-600">
                    {t('termDepositCalculator.remainingBalance')} {formatDualCurrency(balance - amountValue)}
                  </div>
                )}
              </div>

              {/* Current rate category */}
              <div className={`bg-gradient-to-r ${rateCategory.color} p-6 rounded-xl text-white relative overflow-hidden group/badge`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 animate-gradient-x bg-300% opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <rateCategory.icon className="w-6 h-6 animate-pulse" />
                    <div>
                      <div className="font-medium">{rateCategory.category} {t('termDepositCalculator.categoryLevel')}</div>
                      <div className="text-sm opacity-90">{t('termDepositCalculator.rateDescription')}</div>
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
                    <span className="text-white text-sm font-bold">LT</span>
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
                {t('termDepositCalculator.profit')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300 animate-count-up group/item">
                  <div className="text-sm opacity-90 mb-1">{t('termDepositCalculator.yearlyProfit')}</div>
                  <div className="text-xl sm:text-2xl font-bold group-hover/item:scale-105 transition-transform duration-300">
                    +{animatedYearly.toFixed(2)} LT
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-shimmer" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-all duration-300 animate-count-up group/item" style={{ animationDelay: '0.2s' }}>
                  <div className="text-sm opacity-90 mb-1">
                    {t('termDepositCalculator.totalProfit')} {selectedTerm === 12 ? t('termDepositCalculator.years1') : t('termDepositCalculator.years6')}
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold group-hover/item:scale-105 transition-transform duration-300">
                    +{formatDualCurrency(interest.totalProfit)}
                  </div>
                  <div className="text-sm opacity-90 mt-1">
                    {t('termDepositCalculator.totalAmount')} {formatDualCurrency(interest.totalReturn)}
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-shimmer" style={{ width: '100%', animationDelay: '0.5s' }}></div>
                  </div>
                </div>
              </div>

              {user ? (
                canInvest ? (
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setContractModalOpen(true)}
                      className="w-full bg-white text-slate-800 hover:bg-slate-50 font-semibold py-3 transition-all duration-300 hover:shadow-lg animate-pulse-glow relative overflow-hidden group/btn"
                      size="lg"
                    >
                      <span className="relative z-10">{t('termDepositCalculator.signContract')}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
                    </Button>
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      className="w-full border-white/50 text-slate-800 hover:bg-white/20 font-semibold py-2 transition-all duration-300"
                      size="sm"
                    >
                      {t('interestCalculator.manageAccount')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white/20 p-3 rounded-lg text-center">
                      <div className="text-sm opacity-90">
                        {isOverBalance 
                          ? t('termDepositCalculator.overBalance')
                          : t('termDepositCalculator.enterInvestAmount')
                        }
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-white text-slate-800 hover:bg-slate-50 font-semibold py-3 transition-all duration-300 hover:shadow-lg animate-pulse-glow relative overflow-hidden group/btn"
                      size="lg"
                    >
                      <span className="relative z-10">{t('interestCalculator.manageAccount')}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
                    </Button>
                  </div>
                )
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => setRegistrationOpen(true)}
                    className="bg-white text-slate-800 hover:bg-slate-50 font-semibold py-4 px-6 transition-all duration-300 hover:shadow-lg animate-pulse-glow relative overflow-hidden group/btn text-base min-h-[48px] w-full sm:w-auto"
                    size="lg"
                  >
                    <span className="relative z-10">{t('termDepositCalculator.register')}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
                  </Button>
                  <Button 
                    onClick={() => setShowAuthModal(true)}
                    variant="outline"
                    className="border-white/50 text-slate-800 hover:bg-white/20 font-semibold py-4 px-6 transition-all duration-300 text-base min-h-[48px] w-full sm:w-auto"
                    size="lg"
                  >
                    {t('termDepositCalculator.login')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab="login"
      />
      <RegistrationModal 
        open={registrationOpen} 
        onOpenChange={setRegistrationOpen}
      />
      <TermDepositContractModal
        open={contractModalOpen}
        onOpenChange={setContractModalOpen}
        amount={amountValue}
        termMonths={selectedTerm}
        interestRate={interest.rate}
        onSuccess={fetchBalance}
      />
    </section>
  );
};

export default TermDepositCalculator;