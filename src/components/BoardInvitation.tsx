import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { BoardApplicationModal } from "./BoardApplicationModal";

const BoardInvitation = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-purple-100 via-amber-50 to-yellow-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-purple-300/30 to-amber-300/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-br from-amber-300/30 to-yellow-300/30 rounded-full blur-lg"></div>
          <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-purple-400/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-amber-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Badge variant="outline" className="mb-6 bg-gradient-to-r from-purple-50 to-amber-50 backdrop-blur-sm text-purple-700 border-purple-200">
            <Crown className="w-4 h-4 mr-2 text-amber-600" />
            {t('boardInvitation.badge')}
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-800 via-purple-600 to-amber-600 bg-clip-text text-transparent">
            {t('boardInvitation.title')}
          </h2>
          
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('boardInvitation.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => setModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-purple-700 to-amber-600 hover:from-purple-700 hover:via-purple-800 hover:to-amber-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group px-8 py-3"
            >
              <Crown className="w-5 h-5 mr-2" />
              <span className="relative z-10">{t('boardInvitation.button')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-slate-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              {t('boardInvitation.features.strategic')}
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
              {t('boardInvitation.features.financial')}
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              {t('boardInvitation.features.vision')}
            </div>
          </div>
        </div>
      </section>

      <BoardApplicationModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
};

export default BoardInvitation;