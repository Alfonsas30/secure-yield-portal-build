import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="font-bold text-xl">{t('footer.brand')}</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-4">
              {t('footer.brandDescription')}
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
            <h3 className="font-semibold text-lg mb-4">{t('footer.services')}</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.dailyInterest')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.termDeposits')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.loans')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('nav.services')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('nav.dashboard')}</a></li>
            </ul>
          </div>

          {/* Informacija */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('footer.information')}</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#apie-mus" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.howItWorks')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('nav.contact')}</a></li>
            </ul>
          </div>

          {/* Pagalba */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('footer.help')}</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#kontaktai" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.faq')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.howItWorks')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
            </ul>
            
            {/* Techninė pagalba */}
            <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <h4 className="font-semibold text-white mb-2">{t('footer.techSupport')}</h4>
              <p className="text-sm text-slate-300 mb-2">{t('footer.calculatorIssues')}</p>
              <a 
                href="mailto:gmbhinvest333@gmail.com?subject=Skaičiuoklės problema&body=Sveiki, turiu problemą su skaičiuokle:"
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
              >
                {t('footer.email')}
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-slate-400 text-sm">
            © {currentYear} {t('footer.brand')}. {t('footer.copyright')}
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <span>{t('footer.licensed')}</span>
            <span>•</span>
            <span>{t('footer.insured')}</span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            <strong>Svarbi informacija:</strong> {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
