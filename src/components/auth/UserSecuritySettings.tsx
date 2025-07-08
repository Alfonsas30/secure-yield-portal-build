import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Simple2FASetupModal } from "./Simple2FASetupModal";

interface UserSecuritySettingsProps {
  profile: any;
  onOpenMessengerSetup?: () => void;
}

export function UserSecuritySettings({ profile, onOpenMessengerSetup }: UserSecuritySettingsProps) {
  const { toast } = useToast();
  const { setShowTOTPSetup } = useAuth();
  const [showMessengerSetup, setShowMessengerSetup] = useState(false);

  if (!profile) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Saugumo nustatymai
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* MFA Email Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Email 2FA</Label>
                <p className="text-xs text-muted-foreground">
                  Gaukite patvirtinimo kodus el. paštu prisijungiant
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={profile.mfa_enabled ? "default" : "outline"}
                  className={profile.mfa_enabled ? "text-green-600 border-green-600" : ""}
                >
                  {profile.mfa_enabled ? 'Įjungtas' : 'Išjungtas'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('profiles')
                        .update({ mfa_enabled: !profile.mfa_enabled })
                        .eq('user_id', profile.user_id);
                      
                      if (error) throw error;
                      
                      toast({
                        title: profile.mfa_enabled ? "MFA išjungtas" : "MFA įjungtas",
                        description: profile.mfa_enabled ? 
                          "Email patvirtinimas prisijungiant išjungtas" : 
                          "Email patvirtinimas prisijungiant įjungtas"
                      });
                      
                      // Refresh page to update profile state
                      window.location.reload();
                    } catch (error) {
                      toast({
                        title: "Klaida",
                        description: "Nepavyko atnaujinti MFA nustatymų",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  {profile.mfa_enabled ? 'Išjungti' : 'Įjungti'}
                </Button>
              </div>
            </div>

            {/* TOTP Section */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">TOTP (Authenticator)</Label>
                <p className="text-xs text-muted-foreground">
                  Naudokite authenticator programėlę saugesniam prisijungimui
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={profile.totp_enabled ? "default" : "outline"}
                  className={profile.totp_enabled ? "text-green-600 border-green-600" : ""}
                >
                  {profile.totp_enabled ? 'Sukonfigūruotas' : 'Nesukonfigūruotas'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTOTPSetup(true)}
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {profile.totp_enabled ? 'Valdyti' : 'Sukonfigūruoti'}
                </Button>
              </div>
            </div>

            {/* Messenger 2FA Section */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Messenger 2FA</Label>
                <p className="text-xs text-muted-foreground">
                  Sukonfigūruokite Telegram, Viber ar Signal 2FA
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenMessengerSetup?.()}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Nustatyti
                </Button>
              </div>
            </div>

            {/* Test Mode Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-blue-800">Test režimas</Label>
                  <p className="text-xs text-blue-600">
                    Išbandykite 2FA funkcionalumą su papildoma informacija
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Enable both MFA and show current status in console
                    console.log('=== MFA TEST MODE ===');
                    console.log('Current profile:', {
                      mfa_enabled: profile.mfa_enabled,
                      totp_enabled: profile.totp_enabled,
                      email: profile.email
                    });
                    
                    toast({
                      title: "Test režimas",
                      description: "Patikrinkite console.log informaciją"
                    });
                  }}
                  className="text-blue-700 border-blue-300"
                >
                  Test srautai
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Simple2FASetupModal 
        open={showMessengerSetup}
        onOpenChange={setShowMessengerSetup}
        onSetupComplete={() => {
          toast({
            title: "Sėkmingai sukonfigūruota",
            description: "2FA nustatymai atnaujinti"
          });
        }}
      />
    </>
  );
}