
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center max-w-6xl">
        <Badge variant="outline" className="mb-6 bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
          <Zap className="w-4 h-4 mr-2" />
          Naujoviški taupymo sprendimai
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-green-800 bg-clip-text text-transparent leading-tight">
          Taupyk protingai
          <br />
          <span className="text-4xl md:text-6xl">su dienos palūkanomis</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Pirmasis Lietuvoje bankas, mokantis palūkanas kasdien. 
          Jokių ataskaičių, jokių slepiamų mokesčių - tik saugus ir pelningas taupymas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Pradėti taupyti dabar
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 py-6 text-lg font-semibold border-2 hover:bg-slate-50 transition-all duration-300"
          >
            Sužinoti daugiau
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Dienos palūkanos</h3>
            <p className="text-slate-600">Gaukite palūkanas kiekvieną dieną, ne kartą per metus</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">100% saugumas</h3>
            <p className="text-slate-600">Jūsų pinigai apsaugoti bankine licencija ir draudimu</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Jokių mokesčių</h3>
            <p className="text-slate-600">Nėra slepiamų mokesčių ar mėnesinių tarifo</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
