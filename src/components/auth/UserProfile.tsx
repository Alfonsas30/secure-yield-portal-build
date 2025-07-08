import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { UserPersonalInfo } from "./UserPersonalInfo";
import { UserBankAccount } from "./UserBankAccount";
import { UserSecuritySettings } from "./UserSecuritySettings";
import { AuthDebugPanel } from "./AuthDebugPanel";

interface UserProfileProps {
  onOpenMessengerSetup?: () => void;
}

export function UserProfile({ onOpenMessengerSetup }: UserProfileProps) {
  const { t } = useTranslation();
  const { profile, user, signOut } = useAuth();

  if (!profile || !user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <UserPersonalInfo profile={profile} />
      
      <UserBankAccount profile={profile} />
      
      <UserSecuritySettings 
        profile={profile} 
        onOpenMessengerSetup={onOpenMessengerSetup} 
      />

      <AuthDebugPanel />

      <div className="flex justify-center">
        <Button variant="outline" onClick={signOut}>
          {t('userProfile.logout')}
        </Button>
      </div>
    </div>
  );
}