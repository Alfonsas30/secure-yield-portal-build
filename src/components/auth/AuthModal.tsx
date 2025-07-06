import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Shield, Chrome } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TOTPSetupModal } from "./TOTPSetupModal";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup";
}

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "", 
    displayName: "" 
  });
  const [resendEmail, setResendEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [showTOTPStep, setShowTOTPStep] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);

  const { 
    signIn, 
    signUp, 
    signInWithGoogle,
    resendConfirmation, 
    pendingMFAEmail, 
    sendVerificationCode, 
    verifyCodeAndSignIn,
    showTOTPSetup,
    setShowTOTPSetup,
    verifyTOTP
  } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn(loginData.email, loginData.password);
    
    if (!result.error) {
      if ((result as any).requiresMFA) {
        // Show MFA verification step
        setShowOtpStep(true);
      } else if ((result as any).requiresTOTP) {
        // Show TOTP verification step
        setShowTOTPStep(true);
      } else {
        // Regular login success
        setTimeout(() => {
          onOpenChange(false);
          setLoginData({ email: "", password: "" });
          setOtpCode("");
          setShowOtpStep(false);
          setShowTOTPStep(false);
        }, 500);
      }
    }
    
    setLoading(false);
  };

  const handleOtpVerification = async () => {
    if (!pendingMFAEmail || otpCode.length !== 6) return;
    
    setLoading(true);
    const { error } = await verifyCodeAndSignIn(pendingMFAEmail, loginData.password, otpCode);
    
    if (!error) {
      setTimeout(() => {
        onOpenChange(false);
        setLoginData({ email: "", password: "" });
        setOtpCode("");
        setShowOtpStep(false);
      }, 500);
    }
    
    setLoading(false);
  };

  const handleTOTPVerification = async () => {
    if (totpCode.length !== 6 && !showBackupCode) return;
    
    setLoading(true);
    const { error } = await verifyTOTP(totpCode, showBackupCode);
    
    if (!error) {
      setTimeout(() => {
        onOpenChange(false);
        setLoginData({ email: "", password: "" });
        setTotpCode("");
        setShowTOTPStep(false);
        setShowBackupCode(false);
      }, 500);
    }
    
    setLoading(false);
  };

  const handleTOTPSetupComplete = (backupCodes: string[]) => {
    setTimeout(() => {
      onOpenChange(false);
      setLoginData({ email: "", password: "" });
    }, 500);
  };

  const handleResendCode = async () => {
    if (!pendingMFAEmail) return;
    
    setLoading(true);
    await sendVerificationCode(pendingMFAEmail);
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      return;
    }

    setLoading(true);

    const { error } = await signUp(signupData.email, signupData.password, signupData.displayName);
    
    if (!error) {
      setSignupData({ email: "", password: "", confirmPassword: "", displayName: "" });
    }
    
    setLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!resendEmail) return;
    
    setLoading(true);
    await resendConfirmation(resendEmail);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            {t('auth.title')}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            {!showOtpStep && !showTOTPStep ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t('auth.email')}
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="login-password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {t('auth.continue')}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{t('auth.or')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={signInWithGoogle}
                  disabled={loading}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  {t('auth.signInWithGoogle')}
                </Button>
              </form>
            ) : showOtpStep ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">{t('auth.confirmationCode')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('auth.enterCode')} <br />
                    <strong>{pendingMFAEmail}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp">{t('auth.enterCode')}</Label>
                    <div className="flex justify-center mt-2">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={setOtpCode}
                        className="gap-2"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button 
                    onClick={handleOtpVerification} 
                    className="w-full" 
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t('auth.verifyAndLogin')}
                  </Button>

                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-sm"
                    >
                      {t('auth.resendCode')}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setShowOtpStep(false);
                        setOtpCode("");
                      }}
                      className="text-sm"
                    >
                      {t('auth.goBack')}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">TOTP Verification</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your authenticator code or backup code
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="totp">{showBackupCode ? 'Backup Code' : 'Authenticator Code'}</Label>
                    <div className="flex justify-center mt-2">
                      <InputOTP
                        maxLength={showBackupCode ? 8 : 6}
                        value={totpCode}
                        onChange={setTotpCode}
                        className="gap-2"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                          {showBackupCode && (
                            <>
                              <InputOTPSlot index={6} />
                              <InputOTPSlot index={7} />
                            </>
                          )}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button 
                    onClick={handleTOTPVerification} 
                    className="w-full" 
                    disabled={loading || (showBackupCode ? totpCode.length !== 8 : totpCode.length !== 6)}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Verify & Login
                  </Button>

                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowBackupCode(!showBackupCode)}
                      disabled={loading}
                      className="text-sm"
                    >
                      {showBackupCode ? 'Use Authenticator Code' : 'Use Backup Code'}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setShowTOTPStep(false);
                        setTotpCode("");
                        setShowBackupCode(false);
                      }}
                      className="text-sm"
                    >
                      {t('auth.goBack')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!showOtpStep && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">{t('auth.unverifiedEmail')}</p>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('auth.email')}
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleResendConfirmation}
                    disabled={loading || !resendEmail}
                  >
                    {t('auth.send')}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">{t('auth.name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    placeholder={t('auth.name')}
                    value={signupData.displayName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('auth.email')}
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Bent 6 simboliai"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="signup-confirm">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder={t('auth.confirmPassword')}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
                {signupData.password && signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{t('auth.passwordsDontMatch')}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || signupData.password !== signupData.confirmPassword}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('auth.register')}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              {t('auth.registrationNote')}
            </p>
          </TabsContent>
        </Tabs>

        <TOTPSetupModal
          open={showTOTPSetup}
          onOpenChange={setShowTOTPSetup}
          onSetupComplete={handleTOTPSetupComplete}
        />
      </DialogContent>
    </Dialog>
  );
}