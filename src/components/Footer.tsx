
import { Separator } from "@/components/ui/separator";
import { Banknote, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                <Banknote className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl">InnoBank</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-4">
              Pirmasis Lietuvoje bankas, mokantis palūkanas kasdien. Saugus, paprastas ir pelningas taupymas.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                <Mail className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                <Phone className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Paslaugos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Paslaugos</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Dienos palūkanos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Taupymo sąskaitā</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mokėjimų kortelės</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pervedimai</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mobilėje aplikacija</a></li>
            </ul>
          </div>

          {/* Informacija */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Informacija</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#apie-mus" className="hover:text-white transition-colors">Apie mus</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Saugumas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Licencijos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Karjera</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Naujienos</a></li>
            </ul>
          </div>

          {/* Pagalba */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Pagalba</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#kontaktai" className="hover:text-white transition-colors">Kontaktai</a></li>
              <li><a href="#" className="hover:text-white transition-colors">D.U.K.</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gairės</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privatumo politika</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Teisinė informacija</a></li>
            </ul>
          </div>
        </div>

        <Separator className="bg-slate-700 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-slate-400 text-sm">
            © {currentYear} InnoBank. Visos teisės šzasaugotos.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <span>Licencijuotas Lietuvos banko</span>
            <span>•</span>
            <span>Indėliai apdrausti iki 100,000 €</span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            <strong>Svarbi informacija:</strong> InnoBank yra licencijuotas kredito institucijos bankas, prižiūrimas Lietuvos banko. 
            Indėliai apdrausti pagal ES direktyvas iki 100,000 € per klientą. Palūkanų dydis priklauso nuo rinkos sąlygų ir gali keistis. 
            Prieš priimant sprendimus konsultuokitės su mūsų ekspertais.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
