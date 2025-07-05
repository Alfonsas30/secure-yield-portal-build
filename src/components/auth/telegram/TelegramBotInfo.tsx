import { CheckCircle } from "lucide-react";

interface BotInfo {
  first_name: string;
  username: string;
  id: number;
}

interface TelegramBotInfoProps {
  botInfo: BotInfo;
}

export function TelegramBotInfo({ botInfo }: TelegramBotInfoProps) {
  return (
    <div className="space-y-2 p-2 bg-muted/20 rounded-md">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-3 h-3 text-green-500" />
        <span className="text-xs font-medium">Bot'as veikia</span>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Vardas:</strong> {botInfo.first_name}</p>
        <p><strong>Username:</strong> @{botInfo.username}</p>
        <p><strong>ID:</strong> {botInfo.id}</p>
      </div>
    </div>
  );
}