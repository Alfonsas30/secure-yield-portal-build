import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, AlertCircle } from "lucide-react";
import { useTelegramBotSetup } from "@/hooks/useTelegramBotSetup";
import { TelegramBotControls } from "./telegram/TelegramBotControls";
import { TelegramBotStatus } from "./telegram/TelegramBotStatus";
import { TelegramTestMessage } from "./telegram/TelegramTestMessage";

export function TelegramBotSetup() {
  const {
    loading,
    botInfo,
    webhookInfo,
    tokenValid,
    error,
    testToken,
    setupWebhook,
    checkBotStatus
  } = useTelegramBotSetup();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Telegram Bot'o konfigūracija
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Pirma reikia sukonfigūruoti Telegram bot'ą sistemoje.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Klaida:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        <TelegramBotControls 
          loading={loading}
          tokenValid={tokenValid}
          onTestToken={testToken}
          onSetupWebhook={setupWebhook}
          onCheckStatus={checkBotStatus}
        />

        <TelegramBotStatus 
          botInfo={botInfo}
          webhookInfo={webhookInfo}
        />

        {tokenValid && (
          <TelegramTestMessage />
        )}
      </CardContent>
    </Card>
  );
}