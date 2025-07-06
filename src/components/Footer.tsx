import { useTranslation } from 'react-i18next';
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, ExternalLink, Clock, Languages } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="font-bold text-xl">LTB Bankas</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4 mb-6">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                <Mail className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                <Phone className="w-5 h-5" />
              </div>
            </div>

            {/* Kontaktai */}
            <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
              <h4 className="font-semibold text-white mb-4">{t('footer.contact.title')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-300 mb-2">{t('footer.contact.phone')}</p>
                  <a 
                    href="tel:+37544416678"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium mb-2"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    {t('footer.contact.phoneNumber')}
                  </a>
                  <p className="text-xs text-slate-400">{t('footer.contact.messengers')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300 mb-2">{t('footer.contact.workingHours')}</p>
                  <div className="inline-flex items-center text-slate-300 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {t('footer.contact.schedule')}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-300 mb-2">{t('footer.contact.languages')}</p>
                  <div className="inline-flex items-center text-slate-300 text-sm">
                    <Languages className="w-4 h-4 mr-1" />
                    {t('footer.contact.supportedLanguages')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Paslaugos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('footer.services.title')}</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.services.dailyInterest')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.services.savingsAccount')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.services.paymentCards')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.services.transfers')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.services.mobileApp')}</a></li>
            </ul>
          </div>

          {/* Informacija */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('footer.information.title')}</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#apie-mus" className="hover:text-white transition-colors">{t('footer.information.aboutUs')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.information.security')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.information.licenses')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.information.careers')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.information.news')}</a></li>
            </ul>
          </div>

          {/* Pagalba */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('footer.help.title')}</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#kontaktai" className="hover:text-white transition-colors">{t('footer.help.contact')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.help.faq')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.help.guidelines')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.help.privacy')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.help.legal')}</a></li>
            </ul>
            
            {/* Techninė pagalba */}
            <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <h4 className="font-semibold text-white mb-2">{t('footer.techSupport.title')}</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-300 mb-1">{t('footer.techSupport.telegram')}</p>
                  <a 
                    href={t('footer.techSupport.telegramUrl')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    @VILTBbank
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-300 mb-1">{t('footer.techSupport.email')}</p>
                  <a 
                    href={`mailto:${t('footer.techSupport.emailAddress')}`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    {t('footer.techSupport.emailAddress')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-slate-400 text-sm">
            © {currentYear} {t('footer.copyright')}
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <span>{t('footer.license')}</span>
            <span>•</span>
            <span>{t('footer.insurance')}</span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            <strong>{t('footer.disclaimer.title')}</strong> {t('footer.disclaimer.text')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
