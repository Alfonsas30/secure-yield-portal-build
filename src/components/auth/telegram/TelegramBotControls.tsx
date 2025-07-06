import { Button } from "@/components/ui/button";
import { RefreshCw, TestTube, Webhook, CheckCircle } from "lucide-react";

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
        variant={tokenValid ? "default" : "outline"}
        className="flex items-center gap-2 text-xs h-8"
      >
        {loading ? (
          <>
            <RefreshCw className="w-3 h-3 animate-spin" />
            Tikrinama...
          </>
        ) : tokenValid ? (
          <>
            <CheckCircle className="w-3 h-3" />
            Token OK
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
        className="text-xs h-8 flex items-center gap-2"
      >
        {loading ? (
          <>
            <RefreshCw className="w-3 h-3 animate-spin" />
            Konfigūruojama...
          </>
        ) : (
          <>
            <Webhook className="w-3 h-3" />
            Webhook
          </>
        )}
      </Button>
      
      <Button 
        variant="outline"
        onClick={onCheckStatus}
        disabled={loading}
        size="sm"
        className="text-xs h-8"
      >
        <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Patikrinti būseną
      </Button>
    </div>
  );
}