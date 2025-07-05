import { useTranslation } from 'react-i18next';
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

const ContactHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center mb-16">
      <Badge variant="outline" className="mb-4 bg-green-50 text-green-700 border-green-200">
        <Mail className="w-4 h-4 mr-2" />
        {t('contact.badge')}
      </Badge>
      <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
        {t('contact.title')}
      </h2>
      <p className="text-xl text-slate-600 max-w-3xl mx-auto">
        {t('contact.description')}
      </p>
    </div>
  );
};

export default ContactHeader;