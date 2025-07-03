import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoanPaymentSuccessProps {
  sessionId: string;
}

export const LoanPaymentSuccess = ({ sessionId }: LoanPaymentSuccessProps) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const processPayment = async () => {
      try {
        const loanData = localStorage.getItem('loanApplicationData');
        if (!loanData) {
          throw new Error('Paraiškos duomenys nerasti');
        }

        const { formData, calculatedData } = JSON.parse(loanData);

        // Process the payment and submit application
        const { error } = await supabase.functions.invoke('process-loan-payment', {
          body: {
            sessionId,
            formData: {
              ...formData,
              ...calculatedData
            }
          }
        });

        if (error) throw error;

        setSuccess(true);
        localStorage.removeItem('loanApplicationData');
        
        toast({
          title: "Paraiška sėkmingai pateikta!",
          description: "Mokėjimas patvirtintas. Susisieksime su jumis per 24 valandas.",
        });

      } catch (error: any) {
        console.error('Error processing payment:', error);
        toast({
          title: "Klaida",
          description: "Nepavyko apdoroti mokėjimo. Susisiekite su mumis.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    if (sessionId) {
      processPayment();
    }
  }, [sessionId, toast]);

  if (isProcessing) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <h3 className="text-xl font-semibold mb-2">Apdorojamas mokėjimas...</h3>
          <p className="text-slate-600">Prašome palaukti, kol patvirtinsime jūsų mokėjimą.</p>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-semibold mb-2 text-green-600">Mokėjimas patvirtintas!</h3>
          <p className="text-slate-600">Jūsų paskolos paraiška sėkmingai pateikta. Susisieksime su jumis per 24 valandas.</p>
        </CardContent>
      </Card>
    );
  }

  return null;
};