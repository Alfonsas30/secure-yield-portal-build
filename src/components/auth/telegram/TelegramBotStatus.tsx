import { Badge } from "@/components/ui/badge";
import { TelegramBotInfo } from "./TelegramBotInfo";
import { TelegramWebhookInfo } from "./TelegramWebhookInfo";

interface BotInfo {
  first_name: string;
  username: string;
  id: number;
}

interface WebhookInfo {
  url?: string;
  last_error_date?: number;
}

interface TelegramBotStatusProps {
  botInfo: BotInfo | null;
  webhookInfo: WebhookInfo | null;
}

export function TelegramBotStatus({ botInfo, webhookInfo }: TelegramBotStatusProps) {
  return (
    <div className="space-y-3">
      {botInfo && <TelegramBotInfo botInfo={botInfo} />}
      {webhookInfo && <TelegramWebhookInfo webhookInfo={webhookInfo} />}
      
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs h-5">🤖 Bot API</Badge>
        <Badge variant="outline" className="text-xs h-5">📡 Webhook</Badge>
        <Badge variant="outline" className="text-xs h-5">🔄 Real-time</Badge>
      </div>
    </div>
  );
}