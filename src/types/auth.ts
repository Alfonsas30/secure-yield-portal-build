import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  account_number: string;
  display_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  totp_enabled: boolean;
  totp_secret: string | null;
  mfa_enabled: boolean;
  mfa_verified: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  timeLeft: number;
  pendingMFAEmail: string | null;
  showTOTPSetup: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; requiresTOTP?: boolean; requiresMFA?: boolean }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  sendVerificationCode: (email: string) => Promise<{ error: any }>;
  verifyCodeAndSignIn: (email: string, password: string, code: string) => Promise<{ error: any }>;
  setupTOTP: () => Promise<{ error: any }>;
  verifyTOTP: (code: string, isBackupCode?: boolean) => Promise<{ error: any }>;
  setShowTOTPSetup: (show: boolean) => void;
}