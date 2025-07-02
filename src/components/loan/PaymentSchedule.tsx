import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoanCalculation } from "./types";

interface PaymentScheduleProps {
  calculations: LoanCalculation;
}

export const PaymentSchedule = ({ calculations }: PaymentScheduleProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-slate-900">
          {t('loans.schedule.title')}
        </CardTitle>
        <CardDescription className="text-slate-600">
          {t('loans.schedule.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">{t('loans.schedule.headers.month')}</TableHead>
                <TableHead className="text-center">{t('loans.schedule.headers.payment')}</TableHead>
                <TableHead className="text-center">{t('loans.schedule.headers.principal')}</TableHead>
                <TableHead className="text-center">{t('loans.schedule.headers.interest')}</TableHead>
                <TableHead className="text-center">{t('loans.schedule.headers.balance')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculations.paymentSchedule.slice(0, 12).map((payment) => (
                <TableRow key={payment.month}>
                  <TableCell className="text-center font-medium">{payment.month}</TableCell>
                  <TableCell className="text-center font-semibold text-blue-600">
                    {payment.payment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </TableCell>
                  <TableCell className="text-center text-green-600">
                    {payment.principal.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </TableCell>
                  <TableCell className="text-center text-orange-600">
                    {payment.interest.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </TableCell>
                  <TableCell className="text-center text-slate-600">
                    {payment.balance.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {calculations.paymentSchedule.length > 12 && (
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-slate-600">
              {t('loans.schedule.showingFirst')} {calculations.paymentSchedule.length} {t('loans.schedule.totalMonths')}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};