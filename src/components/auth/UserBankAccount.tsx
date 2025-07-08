import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface UserBankAccountProps {
  profile: any;
}

export function UserBankAccount({ profile }: UserBankAccountProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyAccountNumber = async () => {
    if (profile?.account_number) {
      await navigator.clipboard.writeText(profile.account_number);
      setCopied(true);
      toast({
        title: t('userProfile.copied'),
        description: t('userProfile.accountNumberCopied')
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t('userProfile.bankAccount')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>{t('userProfile.accountNumber')}</Label>
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <code className="flex-1 font-mono text-lg font-semibold text-blue-800">
              {profile.account_number}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAccountNumber}
              className="h-8 w-8 p-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('userProfile.uniqueNumber')}
          </p>
        </div>

        <Separator />

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2">{t('userProfile.importantInfo')}</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Sąskaitos numeris generuojamas automatiškai registracijos metu</li>
            <li>• Numeris atitinka Lietuvos banko standartus (LT + 2 raidės + 12 skaitmenų)</li>
            <li>• Niekada nesidalinkite savo sąskaitos duomenimis su nepažįstamais asmenimis</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}