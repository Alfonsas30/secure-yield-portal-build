import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup";
}

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
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

  const { signIn, signUp, resendConfirmation, pendingMFAEmail, sendVerificationCode, verifyCodeAndSignIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginData.email, loginData.password);
    
    if (!error && pendingMFAEmail) {
      // Show OTP step
      setShowOtpStep(true);
    } else if (!error) {
      // Regular login success
      setTimeout(() => {
        onOpenChange(false);
        setLoginData({ email: "", password: "" });
      }, 500);
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
            Banko sistema
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Prisijungimas</TabsTrigger>
            <TabsTrigger value="signup">Registracija</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            {!showOtpStep ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">El. paštas</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="vardas@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="login-password">Slaptažodis</Label>
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
                  Tęsti
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Patvirtinimo kodas</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Išsiuntėme 6 skaitmenų kodą į jūsų el. paštą: <br />
                    <strong>{pendingMFAEmail}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp">Įveskite 6 skaitmenų kodą</Label>
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
                    Patvirtinti ir prisijungti
                  </Button>

                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-sm"
                    >
                      Nesulaukėte kodo? Siųsti dar kartą
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
                      ← Grįžti atgal
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!showOtpStep && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Nepatvirtintas el. paštas?</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="El. paštas"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleResendConfirmation}
                    disabled={loading || !resendEmail}
                  >
                    Siųsti
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Vardas Pavardė</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    placeholder="Vardas Pavardė"
                    value={signupData.displayName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email">El. paštas</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="vardas@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-password">Slaptažodis</Label>
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
                <Label htmlFor="signup-confirm">Pakartokite slaptažodį</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="Pakartokite slaptažodį"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
                {signupData.password && signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">Slaptažodžiai nesutampa</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || signupData.password !== signupData.confirmPassword}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Registruotis
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              Registracijos metu automatiškai bus sukurtas unikalus sąskaitos numeris
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}