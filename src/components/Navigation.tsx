
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu, Sparkles, User, LogOut, Languages } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AuthModal } from "./auth/AuthModal";
import { RegistrationModal } from "./RegistrationModal";
import { DiscountRequestModal } from "./DiscountRequestModal";
import { useNavigate } from "react-router-dom";
import { getExchangeRateDisplay } from "@/lib/currency";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [discountRequestModalOpen, setDiscountRequestModalOpen] = useState(false);
  
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const languageOptions = [
    { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const menuItems = [
    { href: "/#paslaugos", label: t('nav.services') },
    { href: "/#kaip-veikia", label: t('nav.howItWorks') },
    { href: "/#apie-mus", label: t('nav.about') },
    { href: "/#kontaktai", label: t('nav.contact') },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(href);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll progress ir blur efektas
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / documentHeight) * 100;
      
      setScrollProgress(progress);
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Scroll progress indikatorius */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200/50 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <nav className={`sticky top-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm border-b border-slate-100'
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <span className="font-bold text-xl text-slate-900 group-hover:text-blue-800 transition-colors duration-300">
                LTB Bankas
              </span>
              <Sparkles className="w-4 h-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
            </div>
            <div className="hidden lg:block text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              {getExchangeRateDisplay()}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={handleHomeClick}
              className="relative text-slate-600 hover:text-blue-600 transition-all duration-300 font-medium group py-2"
            >
              {t('nav.home')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 group-hover:w-full transition-all duration-300 ease-out"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md -z-10"></span>
            </button>
            {menuItems.map((item, index) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="relative text-slate-600 hover:text-blue-600 transition-all duration-300 font-medium group py-2 animate-slide-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.label}
                {/* Animuotas underline */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 group-hover:w-full transition-all duration-300 ease-out"></span>
                {/* Hover glow efektas */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md -z-10"></span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300">
                  <Languages className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-lg">
                {languageOptions.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`cursor-pointer hover:bg-blue-50 ${language === lang.code ? 'bg-blue-100 text-blue-600' : ''}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 hover:scale-105 transform relative overflow-hidden group"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="relative z-10">
                    {profile?.display_name || user.email}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-blue-100/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
                </Button>
                <Button 
                  variant="ghost"
                  onClick={signOut}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50/50 transition-all duration-300 hover:scale-105 transform"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setAuthModalTab("login");
                    setAuthModalOpen(true);
                  }}
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 hover:scale-105 transform relative overflow-hidden group"
                >
                  <span className="relative z-10">{t('nav.login')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-blue-100/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
                </Button>
                <Button 
                  onClick={() => setRegistrationModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-300 hover:shadow-lg animate-pulse-glow relative overflow-hidden group"
                >
                  <span className="relative z-10">{t('nav.register')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-blue-50 transition-all duration-300 hover:scale-110 transform"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-md">
              {/* Fono efektai */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 right-10 w-3 h-3 bg-blue-300 rounded-full opacity-30 animate-pulse"></div>
                <div className="absolute bottom-20 left-10 w-2 h-2 bg-green-300 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-purple-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              <div className="flex flex-col space-y-6 mt-6 relative z-10">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleHomeClick();
                  }}
                  className="text-lg font-medium text-slate-600 hover:text-blue-600 transition-all duration-300 hover:translate-x-2 transform text-left"
                >
                  {t('nav.home')}
                </button>
                {menuItems.map((item, index) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      setIsOpen(false);
                      handleNavClick(item.href);
                    }}
                    className="text-lg font-medium text-slate-600 hover:text-blue-600 transition-all duration-300 hover:translate-x-2 transform animate-slide-in-right text-left"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {item.label}
                  </button>
                ))}
                <Separator className="my-4 bg-gradient-to-r from-blue-200 to-green-200" />
                
                {/* Language Selector for Mobile */}
                <div className="flex gap-2">
                  {languageOptions.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={language === lang.code ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLanguage(lang.code)}
                      className="flex items-center gap-1"
                    >
                      <span>{lang.flag}</span>
                      <span className="text-xs">{lang.name}</span>
                    </Button>
                  ))}
                </div>
                
                <Separator className="my-4 bg-gradient-to-r from-blue-200 to-green-200" />
                {user ? (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/dashboard');
                      }}
                      className="justify-start hover:bg-blue-50 transition-all duration-300 hover:scale-105 transform animate-scale-in"
                      style={{ animationDelay: '0.4s' }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      {t('nav.dashboard')}
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        setIsOpen(false);
                        signOut();
                      }}
                      className="justify-start hover:bg-red-50 text-red-600 transition-all duration-300 hover:scale-105 transform animate-scale-in"
                      style={{ animationDelay: '0.5s' }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setIsOpen(false);
                        setAuthModalTab("login");
                        setAuthModalOpen(true);
                      }}
                      className="justify-start hover:bg-blue-50 transition-all duration-300 hover:scale-105 transform animate-scale-in"
                      style={{ animationDelay: '0.4s' }}
                    >
                      {t('nav.login')}
                    </Button>
                     <Button 
                       onClick={() => {
                         setIsOpen(false);
                         setRegistrationModalOpen(true);
                       }}
                       className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-300 hover:shadow-lg animate-scale-in relative overflow-hidden group"
                       style={{ animationDelay: '0.5s' }}
                      >
                        <span className="relative z-10">{t('nav.register')}</span>
                       <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                     </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
      
      <RegistrationModal
        open={registrationModalOpen}
        onOpenChange={setRegistrationModalOpen}
      />
      
      <DiscountRequestModal
        open={discountRequestModalOpen}
        onOpenChange={setDiscountRequestModalOpen}
      />
    </>
  );
};

export default Navigation;
