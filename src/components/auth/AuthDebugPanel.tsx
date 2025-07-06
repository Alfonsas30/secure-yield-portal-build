import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Bug, Mail, Smartphone, Shield } from 'lucide-react';
import { useAuthDebug } from '@/hooks/useAuthDebug';
import { useAuth } from '@/contexts/AuthContext';

export function AuthDebugPanel() {
  const { profile } = useAuth();
  const { loading, debugInfo, debugMFA, sendEmailCode, verifyEmailCode, setupTOTP, verifyTOTPSetup } = useAuthDebug();
  const [isOpen, setIsOpen] = useState(false);
  const [debugEmail, setDebugEmail] = useState(profile?.email || '');
  const [emailCode, setEmailCode] = useState('');
  const [totpCode, setTotpCode] = useState('');

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Bug className="w-5 h-5" />
          Autentifikacijos Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Debug Info Section */}
        <div className="space-y-3">
          <div>
            <Label>Debug el. paštas</Label>
            <div className="flex gap-2">
              <Input
                value={debugEmail}
                onChange={(e) => setDebugEmail(e.target.value)}
                placeholder="el.pastas@pavyzdys.lt"
                className="flex-1"
              />
              <Button 
                onClick={() => debugMFA(debugEmail)}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                Tikrinti
              </Button>
            </div>
          </div>

          {debugInfo && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-amber-100 rounded-md transition-colors">
                <span className="text-sm font-medium">Debug rezultatai</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 pt-3">
                <div className="bg-white p-3 rounded-lg border">
                  <h4 className="font-semibold mb-2">Sistemos būsena</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Profilis:</span>
                      <Badge variant={debugInfo.profile ? "default" : "destructive"} className="ml-2">
                        {debugInfo.profile ? 'Rastas' : 'Nerastas'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Auth vartotojas:</span>
                      <Badge variant={debugInfo.authUser ? "default" : "destructive"} className="ml-2">
                        {debugInfo.authUser ? 'Rastas' : 'Nerastas'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">MFA įjungtas:</span>
                      <Badge variant={debugInfo.profile?.mfa_enabled ? "default" : "outline"} className="ml-2">
                        {debugInfo.profile?.mfa_enabled ? 'Taip' : 'Ne'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">TOTP įjungtas:</span>
                      <Badge variant={debugInfo.profile?.totp_enabled ? "default" : "outline"} className="ml-2">
                        {debugInfo.profile?.totp_enabled ? 'Taip' : 'Ne'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {debugInfo.nextSteps.length > 0 && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Problemos:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {debugInfo.nextSteps.map((step, index) => (
                        <li key={index}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        <Separator />

        {/* Email 2FA Testing */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email 2FA testavimas
          </h4>
          
          <div className="flex gap-2">
            <Button 
              onClick={sendEmailCode}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Siųsti kodą
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              placeholder="6 skaitmenų kodas"
              maxLength={6}
              className="w-32"
            />
            <Button 
              onClick={() => verifyEmailCode(emailCode)}
              disabled={loading || emailCode.length !== 6}
              variant="outline"
              size="sm"
            >
              Patikrinti
            </Button>
          </div>
        </div>

        <Separator />

        {/* TOTP Testing */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            TOTP testavimas
          </h4>
          
          <div className="flex gap-2">
            <Button 
              onClick={setupTOTP}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Sukonfigūruoti TOTP
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="6 skaitmenų kodas"
              maxLength={6}
              className="w-32"
            />
            <Button 
              onClick={() => verifyTOTPSetup(totpCode)}
              disabled={loading || totpCode.length !== 6}
              variant="outline"
              size="sm"
            >
              Patikrinti TOTP
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-600">
            <Shield className="w-3 h-3 inline mr-1" />
            Šis debug panel'is padeda testuoti autentifikacijos funkcijas. 
            Naudokite atsargiai production aplinkoje.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}