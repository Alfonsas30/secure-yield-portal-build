import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Mail, User } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import Navigation from "@/components/Navigation";

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('session_id');
    setSessionId(sessionIdFromUrl);
  }, [searchParams]);

  return (
    <>
      <SEOHead 
        title="Mokėjimas sėkmingas - LTB Bankas"
        description="Jūsų registracijos mokėjimas buvo sėkmingai apmokėtas"
        noIndex={true}
      />
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader className="pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                {t('paymentSuccess.title', 'Mokėjimas sėkmingas!')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-600 text-lg">
                {t('paymentSuccess.message', 'Jūsų banko sąskaitos registracijos mokėjimas buvo sėkmingai apmokėtas.')}
              </p>
              
              {sessionId && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">
                    {t('paymentSuccess.sessionId', 'Mokėjimo ID:')}
                  </p>
                  <code className="text-xs text-slate-700 break-all">{sessionId}</code>
                </div>
              )}

              <div className="bg-blue-50 p-6 rounded-lg text-left">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  {t('paymentSuccess.nextSteps', 'Kiti žingsniai:')}
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <span className="block w-6 h-6 bg-blue-200 rounded-full text-blue-800 text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                    {t('paymentSuccess.step1', 'Gausite patvirtinimo laišką per 24 valandas')}
                  </li>
                  <li className="flex items-start">
                    <span className="block w-6 h-6 bg-blue-200 rounded-full text-blue-800 text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                    {t('paymentSuccess.step2', 'Sąskaitos duomenys bus išsiųsti el. paštu')}
                  </li>
                  <li className="flex items-start">
                    <span className="block w-6 h-6 bg-blue-200 rounded-full text-blue-800 text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                    {t('paymentSuccess.step3', 'Galėsite prisijungti prie savo sąskaitos')}
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="flex-1">
                  <Link to="/" className="flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {t('paymentSuccess.backToHome', 'Grįžti į pradžią')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/dashboard" className="flex items-center justify-center">
                    <User className="w-4 h-4 mr-2" />
                    {t('paymentSuccess.toDashboard', 'Į valdymo skydą')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}