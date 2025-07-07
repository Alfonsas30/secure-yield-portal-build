import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, CreditCard, Phone, Mail, Calendar, Copy, Check, ChevronDown, Shield, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { Simple2FASetupModal } from "./Simple2FASetupModal";
import { AuthDebugPanel } from "./AuthDebugPanel";

interface UserProfileProps {
  onOpenMessengerSetup?: () => void;
}

export function UserProfile({ onOpenMessengerSetup }: UserProfileProps) {
  const { t } = useTranslation();
  const { profile, user, signOut, setShowTOTPSetup } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showMessengerSetup, setShowMessengerSetup] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    phone: profile?.phone || ""
  });

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

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name.trim() || null,
          phone: formData.phone.trim() || null
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: t('userProfile.updateSuccess'),
        description: t('userProfile.profileUpdated')
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('discount.error'),
        description: t('userProfile.updateError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      display_name: profile?.display_name || "",
      phone: profile?.phone || ""
    });
    setEditing(false);
  };

  if (!profile || !user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('userProfile.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary view */}
          <div className="space-y-3">
            <div>
              <Label>{t('userProfile.name')}</Label>
              <div className="p-2 bg-muted rounded-md">
                {profile.display_name || t('userProfile.notSpecified')}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('userProfile.email')}
              </Label>
              <div className="p-2 bg-muted rounded-md flex items-center justify-between">
                {profile.email}
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {t('userProfile.verified')}
                </Badge>
              </div>
            </div>

            <div>
              <Label>{t('userProfile.accountNumber')}</Label>
              <div className="p-2 bg-muted rounded-md font-mono">
                {profile.account_number.slice(0, 10)}...
              </div>
            </div>
          </div>

          {/* Collapsible detailed information */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md transition-colors">
              <span className="text-sm font-medium">{t('userProfile.moreInfo')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 pt-4">
              <div>
                <Label>{t('userProfile.phone')}</Label>
                {editing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+370..."
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md">
                    {profile.phone || t('userProfile.notSpecified')}
                  </div>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('userProfile.registrationDate')}
                </Label>
                <div className="p-2 bg-muted rounded-md">
                  {new Date(profile.created_at).toLocaleDateString('lt-LT')}
                </div>
              </div>

              {editing && (
                <div>
                  <Label>{t('userProfile.name')}</Label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Įveskite vardą ir pavardę"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {editing ? (
                  <>
                    <Button onClick={handleSave} disabled={loading}>
                      {t('userProfile.save')}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                      {t('userProfile.cancel')}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditing(true)}>
                    {t('userProfile.edit')}
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

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

      <AuthDebugPanel />

      <div className="flex justify-center">
        <Button variant="outline" onClick={signOut}>
          {t('userProfile.logout')}
        </Button>
      </div>

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
    </div>
  );
}