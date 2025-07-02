
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu, Sparkles, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./auth/AuthModal";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { href: "#paslaugos", label: "Paslaugos" },
    { href: "#kaip-veikia", label: "Kaip veikia" },
    { href: "#apie-mus", label: "Apie mus" },
    { href: "#kontaktai", label: "Kontaktai" },
  ];

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
          <div className="flex items-center space-x-3 group cursor-pointer">
            <span className="font-bold text-xl text-slate-900 group-hover:text-blue-800 transition-colors duration-300">
              LTB Bankas
            </span>
            <Sparkles className="w-4 h-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className="relative text-slate-600 hover:text-blue-600 transition-all duration-300 font-medium group py-2 animate-slide-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.label}
                {/* Animuotas underline */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 group-hover:w-full transition-all duration-300 ease-out"></span>
                {/* Hover glow efektas */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md -z-10"></span>
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
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
                  <span className="relative z-10">Prisijungti</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-blue-100/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
                </Button>
                <Button 
                  onClick={() => {
                    setAuthModalTab("signup");
                    setAuthModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-300 hover:shadow-lg animate-pulse-glow relative overflow-hidden group"
                >
                  <span className="relative z-10">Registruotis</span>
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
                {menuItems.map((item, index) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium text-slate-600 hover:text-blue-600 transition-all duration-300 hover:translate-x-2 transform animate-slide-in-right"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
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
                      Mano paskyra
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
                      Atsijungti
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
                      Prisijungti
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsOpen(false);
                        setAuthModalTab("signup");
                        setAuthModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-300 hover:shadow-lg animate-scale-in relative overflow-hidden group"
                      style={{ animationDelay: '0.5s' }}
                    >
                      <span className="relative z-10">Registruotis</span>
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
    </>
  );
};

export default Navigation;
