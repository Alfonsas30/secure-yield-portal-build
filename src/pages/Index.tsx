
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Shield, Zap, Eye, Users, TrendingUp, Clock, Lock, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import InterestCalculator from "@/components/InterestCalculator";
import TermDepositCalculator from "@/components/TermDepositCalculator";
import LoanCalculator from "@/components/LoanCalculator";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BoardInvitation from "@/components/BoardInvitation";
import { LoanPaymentSuccess } from "@/components/LoanPaymentSuccess";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  const { t } = useTranslation();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('loan_payment');
    const sessionIdParam = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionIdParam) {
      setSessionId(sessionIdParam);
      setShowPaymentSuccess(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (showPaymentSuccess) {
    return (
      <>
        <SEOHead 
          title={t('seo.pages.loans.title')}
          description={t('seo.pages.loans.description')}
          keywords={t('seo.pages.loans.keywords')}
        />
        <div className="min-h-screen bg-gradient-to-br from-vibrant-purple/30 via-vibrant-cyan/30 to-vibrant-lime/30 animate-aurora-wave">
          <Navigation />
          <div className="container mx-auto px-4 py-20">
            <LoanPaymentSuccess sessionId={sessionId} />
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-gradient-to-br from-vibrant-purple/30 via-vibrant-cyan/30 to-vibrant-lime/30 animate-aurora-wave">
        <Navigation />
        <Hero />
        <Services />
      
      {/* Calculator Section with Tabs */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-slate-50/80 backdrop-blur-sm text-slate-700 border-slate-200">
              <Calculator className="w-4 h-4 mr-2" />
              {t('calculators.badge')}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              {t('calculators.title')}
            </h2>
          </div>
          
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 p-2 h-auto sm:h-10 mb-8 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
              <TabsTrigger 
                value="daily" 
                className="text-sm sm:text-xs lg:text-sm px-3 py-3 sm:py-1.5 rounded-md sm:rounded-sm font-medium whitespace-nowrap"
              >
                {t('calculators.tabs.daily')}
              </TabsTrigger>
              <TabsTrigger 
                value="term" 
                className="text-sm sm:text-xs lg:text-sm px-3 py-3 sm:py-1.5 rounded-md sm:rounded-sm font-bold text-slate-900 relative before:content-[''] before:absolute before:inset-[-2px] before:rounded-md before:bg-conic-gradient before:animate-rotating-border before:opacity-70 hover:before:opacity-100 transition-all duration-300 after:content-[''] after:absolute after:inset-0 after:bg-background after:rounded-sm after:z-[-1] whitespace-nowrap"
              >
                {t('calculators.tabs.term')}
              </TabsTrigger>
              <TabsTrigger 
                value="loans" 
                className="text-sm sm:text-xs lg:text-sm px-3 py-3 sm:py-1.5 rounded-md sm:rounded-sm font-semibold text-slate-900 bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 border border-orange-200 whitespace-nowrap"
              >
                {t('calculators.tabs.loans')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="w-full">
              <InterestCalculator />
            </TabsContent>
            <TabsContent value="term" className="w-full">
              <TermDepositCalculator />
            </TabsContent>
            <TabsContent value="loans" className="w-full">
              <LoanCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* About Us Section */}
      <section id="apie-mus" className="py-20 px-4 bg-gradient-to-br from-slate-100 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-blue-50/80 backdrop-blur-sm text-blue-700 border-blue-200">
              {t('aboutUs.badge')}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              {t('aboutUs.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('aboutUs.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">{t('aboutUs.security.title')}</h3>
                <p className="text-slate-600">{t('aboutUs.security.description')}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">{t('aboutUs.profitability.title')}</h3>
                <p className="text-slate-600">{t('aboutUs.profitability.description')}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">{t('aboutUs.experience.title')}</h3>
                <p className="text-slate-600">{t('aboutUs.experience.description')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <BoardInvitation />
      <HowItWorks />
      <FAQ />
        <Contact />
        <Footer />
      </div>
    </>
  );
};

export default Index;
