import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, Mail, Calendar, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';

interface UserPersonalInfoProps {
  profile: any;
}

export function UserPersonalInfo({ profile }: UserPersonalInfoProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    phone: profile?.phone || ""
  });

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

  if (!profile) return null;

  return (
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
  );
}