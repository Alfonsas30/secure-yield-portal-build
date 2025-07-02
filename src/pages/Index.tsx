
import { useState } from "react";
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
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import Footer from "@/components/Footer";

const Index = () => {
  return (
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
              Skaičiuoklės
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Pasirinkite skaičiuoklės tipą
            </h2>
          </div>
          
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="daily" className="text-sm">Dienos palūkanos</TabsTrigger>
              <TabsTrigger value="term" className="text-sm">Terminuoti indėliai</TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="w-full">
              <InterestCalculator />
            </TabsContent>
            <TabsContent value="term" className="w-full">
              <TermDepositCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      <HowItWorks />
      <FAQ />
      <Contact />
      <NewsletterSubscription />
      <Footer />
    </div>
  );
};

export default Index;
