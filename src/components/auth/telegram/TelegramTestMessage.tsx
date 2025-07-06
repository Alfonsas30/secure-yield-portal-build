import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TelegramTestMessage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testTelegramId, setTestTelegramId] = useState("");

  const sendTestMessage = async () => {
    if (!testTelegramId || !/^\d+$/.test(testTelegramId.trim())) {
      toast({
        title: "Klaida",
        description: "Įveskite galiojantį Telegram ID (skaičius)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('🧪 Testing Telegram message sending to ID:', testTelegramId);

    try {
      const { data, error } = await supabase.functions.invoke('send-telegram-2fa', {
        body: { 
          action: 'send_code',
          telegram_id: testTelegramId.trim()
        }
      });

      console.log('🧪 Test message response:', { data, error });

      if (error) {
        console.error('🚨 Test message error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ Test message sent successfully');
        toast({
          title: "Testo žinutė išsiųsta",
          description: "Patikrinkite savo Telegram chat'ą",
        });
      } else {
        throw new Error(data?.error || 'Nepavyko išsiųsti testo žinutės');
      }
    } catch (error: any) {
      console.error('🚨 Test message error:', error);
      const errorMessage = error?.message || error?.details || "Nepavyko išsiųsti testo žinutės";
      toast({
        title: "Klaida",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Testo žinutės siuntimas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="testTelegramId" className="text-xs">Test Telegram ID</Label>
          <Input
            id="testTelegramId"
            type="text"
            value={testTelegramId}
            onChange={(e) => setTestTelegramId(e.target.value)}
            placeholder="123456789"
            className="font-mono text-sm h-8"
          />
        </div>
        
        <Button 
          onClick={sendTestMessage}
          disabled={loading || !testTelegramId}
          size="sm"
          className="w-full h-8 text-xs"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              Siunčiama...
            </>
          ) : (
            <>
              <Send className="w-3 h-3 mr-2" />
              Siųsti testo žinutę
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}