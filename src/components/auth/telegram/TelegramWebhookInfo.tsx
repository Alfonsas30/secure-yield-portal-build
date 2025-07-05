import { CheckCircle, AlertCircle } from "lucide-react";

interface WebhookInfo {
  url?: string;
  last_error_date?: number;
}

interface TelegramWebhookInfoProps {
  webhookInfo: WebhookInfo;
}

export function TelegramWebhookInfo({ webhookInfo }: TelegramWebhookInfoProps) {
  return (
    <div className="space-y-2 p-2 bg-muted/20 rounded-md">
      <div className="flex items-center gap-2">
        {webhookInfo.url ? (
          <>
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-xs font-medium">Webhook aktyvus</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-medium">Webhook nesukonfigūruotas</span>
          </>
        )}
      </div>
      {webhookInfo.url && (
        <div className="text-xs text-muted-foreground">
          <p className="break-all"><strong>URL:</strong> {webhookInfo.url}</p>
          {webhookInfo.last_error_date && (
            <p><strong>Atnaujinta:</strong> {new Date(webhookInfo.last_error_date * 1000).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}