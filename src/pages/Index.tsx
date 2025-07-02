
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
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-vibrant-purple/30 via-vibrant-cyan/30 to-vibrant-lime/30 animate-aurora-wave">
      <Navigation />
      <Hero />
      <Services />
      <InterestCalculator />
      <HowItWorks />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
