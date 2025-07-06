import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import Navigation from "@/components/Navigation";

export default function PaymentCanceled() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead 
        title="Mokėjimas atšauktas - LTB Bankas"
        description="Jūsų registracijos mokėjimas buvo atšauktas"
        noIndex={true}
      />
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader className="pb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">
                {t('paymentCanceled.title', 'Mokėjimas atšauktas')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-600 text-lg">
                {t('paymentCanceled.message', 'Jūsų banko sąskaitos registracijos mokėjimas buvo atšauktas. Jokia suma nebuvo nuskaičiuota.')}
              </p>
              
              <div className="bg-orange-50 p-6 rounded-lg text-left">
                <h3 className="font-semibold text-orange-900 mb-3">
                  {t('paymentCanceled.whatNext', 'Ką daryti toliau?')}
                </h3>
                <ul className="space-y-2 text-orange-800">
                  <li className="flex items-start">
                    <span className="block w-6 h-6 bg-orange-200 rounded-full text-orange-800 text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">•</span>
                    {t('paymentCanceled.option1', 'Galite bandyti registruotis dar kartą')}
                  </li>
                  <li className="flex items-start">
                    <span className="block w-6 h-6 bg-orange-200 rounded-full text-orange-800 text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">•</span>
                    {t('paymentCanceled.option2', 'Susisiekite su mumis, jei turite klausimų')}
                  </li>
                  <li className="flex items-start">
                    <span className="block w-6 h-6 bg-orange-200 rounded-full text-orange-800 text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">•</span>
                    {t('paymentCanceled.option3', 'Patikrinkite savo el. paštą dėl nuolaidų kodų')}
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="flex-1">
                  <Link to="/" className="flex items-center justify-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('paymentCanceled.tryAgain', 'Bandyti dar kartą')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/" className="flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('paymentCanceled.backToHome', 'Grįžti į pradžią')}
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