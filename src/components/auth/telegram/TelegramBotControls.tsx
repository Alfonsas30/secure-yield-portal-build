import { Button } from "@/components/ui/button";
import { RefreshCw, TestTube } from "lucide-react";

interface TelegramBotControlsProps {
  loading: boolean;
  tokenValid: boolean;
  onTestToken: () => void;
  onSetupWebhook: () => void;
  onCheckStatus: () => void;
}

export function TelegramBotControls({ 
  loading, 
  tokenValid, 
  onTestToken, 
  onSetupWebhook, 
  onCheckStatus 
}: TelegramBotControlsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <Button 
        onClick={onTestToken}
        disabled={loading}
        size="sm"
        variant="outline"
        className="flex items-center gap-2 text-xs h-8"
      >
        {loading ? (
          <>
            <RefreshCw className="w-3 h-3 animate-spin" />
            Tikrinama...
          </>
        ) : (
          <>
            <TestTube className="w-3 h-3" />
            Testuoti Token
          </>
        )}
      </Button>
      <Button 
        onClick={onSetupWebhook}
        disabled={loading || !tokenValid}
        size="sm"
        className="text-xs h-8"
      >
        {loading ? (
          <>
            <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
            Konfigūruojama...
          </>
        ) : (
          "Webhook"
        )}
      </Button>
      <Button 
        variant="outline"
        onClick={onCheckStatus}
        disabled={loading}
        size="sm"
        className="text-xs h-8"
      >
        Patikrinti būseną
      </Button>
    </div>
  );
}