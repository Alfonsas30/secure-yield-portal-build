import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

export default function DepositSuccess() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [eurAmount, setEurAmount] = useState("");
  const [ltAmount, setLtAmount] = useState("");

  useEffect(() => {
    const processPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const depositAmount = searchParams.get('amount');
      
      if (!sessionId || !depositAmount) {
        toast({
          title: t('discount.error'),
          description: t('deposit.sessionError'),
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('process-deposit-payment', {
          body: { session_id: sessionId }
        });

        if (error) throw error;

        if (data?.success) {
          setSuccess(true);
          setEurAmount(data.amount_eur.toString());
          setLtAmount(data.amount_lt.toString());
          toast({
            title: t('deposit.successTitle'),
            description: t('deposit.successMessage', { 
              eurAmount: data.amount_eur,
              ltAmount: data.amount_lt 
            }),
          });
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        toast({
          title: t('discount.error'),
          description: t('deposit.processingError'),
          variant: "destructive"
        });
        navigate('/dashboard');
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, navigate, toast, t]);

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>{t('deposit.processing')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-700">{t('deposit.successTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg">
              {t('deposit.successMessage', { eurAmount: eurAmount, ltAmount: ltAmount })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('deposit.balanceUpdated')}
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('deposit.backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}