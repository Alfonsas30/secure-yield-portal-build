
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Zap, Coins, Banknote, Star, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative py-20 px-4 min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 animate-gradient-shift bg-300%">
      {/* Plūduriuojantys pinigų elementai */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <Coins className="w-8 h-8 text-yellow-500 opacity-60" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <Banknote className="w-12 h-12 text-green-500 opacity-50" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float-slow">
          <Star className="w-6 h-6 text-blue-500 opacity-40" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float">
          <Sparkles className="w-10 h-10 text-purple-500 opacity-50" />
        </div>
        <div className="absolute top-60 left-1/3 animate-float-delayed">
          <Coins className="w-6 h-6 text-amber-500 opacity-30" />
        </div>
        <div className="absolute top-32 right-1/3 animate-float-slow">
          <Banknote className="w-8 h-8 text-emerald-500 opacity-40" />
        </div>
      </div>

      {/* Fono dalelių sistema */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-20 animate-particle-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto text-center max-w-6xl relative z-10">
        <div className="animate-slide-in-left">
          <Badge variant="outline" className="mb-6 bg-blue-50/80 backdrop-blur-sm text-blue-700 border-blue-200 px-6 py-3 hover:bg-blue-100/80 transition-all duration-300 animate-pulse-glow">
            <Zap className="w-4 h-4 mr-2 animate-pulse" />
            Naujoviški taupymo sprendimai
          </Badge>
        </div>
        
        <div className="relative mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-scale-in">
            <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-green-800 bg-clip-text text-transparent animate-gradient-x bg-300%">
              Taupyk protingai
            </span>
            <br />
            <span className="text-4xl md:text-6xl bg-gradient-to-r from-blue-600 via-green-600 to-blue-800 bg-clip-text text-transparent animate-gradient-shift bg-300%">
              su dienos palūkanomis
            </span>
          </h1>
          
          {/* Rašymo mašinėlės efekto indikatorius */}
          <div className="absolute -right-4 top-4 w-1 h-8 bg-blue-600 animate-blink hidden md:block"></div>
        </div>
        
        <div className="animate-slide-in-right">
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Pirmasis Lietuvoje bankas, mokantis palūkanas kasdien. 
            Jokių ataskaičių, jokių slepiamų mokesčių - tik saugus ir pelningas taupymas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <Button 
            size="lg" 
            className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow group"
          >
            <span className="relative z-10">Pradėti taupyti dabar</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 py-6 text-lg font-semibold border-2 hover:bg-slate-50 transition-all duration-300 backdrop-blur-sm bg-white/80 hover:scale-105 transform"
          >
            Sužinoti daugiau
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            {
              icon: TrendingUp,
              title: "Dienos palūkanos",
              description: "Gaukite palūkanas kiekvieną dieną, ne kartą per metus",
              color: "green",
              delay: "0.2s"
            },
            {
              icon: Shield,
              title: "100% saugumas",
              description: "Jūsų pinigai apsaugoti bankine licencija ir draudimu",
              color: "blue",
              delay: "0.4s"
            },
            {
              icon: Zap,
              title: "Jokių mokesčių",
              description: "Nėra slepiamų mokesčių ar mėnesinių tarifų",
              color: "purple",
              delay: "0.6s"
            }
          ].map((item, index) => {
            const IconComponent = item.icon;
            const colorMap = {
              green: "bg-green-100 text-green-600 group-hover:bg-green-200",
              blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
              purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
            };

            return (
              <div 
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300 animate-scale-in hover:scale-105 transform cursor-pointer hover:bg-white/90"
                style={{ animationDelay: item.delay }}
              >
                <div className={`${colorMap[item.color]} p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-all duration-300 animate-morph`}>
                  <IconComponent className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 group-hover:text-blue-800 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Hero;
