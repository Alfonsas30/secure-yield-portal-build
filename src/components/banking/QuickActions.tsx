import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Plus, Download, BarChart3 } from "lucide-react";
import { TransferModal } from "./TransferModal";
import { useTranslation } from 'react-i18next';

interface QuickActionsProps {
  onViewTransactions: () => void;
  onViewReports: () => void;
}

export function QuickActions({ onViewTransactions, onViewReports }: QuickActionsProps) {
  const { t } = useTranslation();
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('quickActions.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setTransferModalOpen(true)}
              className="flex items-center gap-2 h-12"
            >
              <Send className="w-4 h-4" />
              {t('quickActions.transfer')}
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-12"
              onClick={() => {
                // TODO: Implement deposit functionality
              }}
            >
              <Plus className="w-4 h-4" />
              {t('quickActions.deposit')}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onViewTransactions}
              className="flex items-center gap-2 h-12"
            >
              <Download className="w-4 h-4" />
              {t('quickActions.history')}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onViewReports}
              className="flex items-center gap-2 h-12"
            >
              <BarChart3 className="w-4 h-4" />
              {t('quickActions.reports')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <TransferModal 
        open={transferModalOpen} 
        onOpenChange={setTransferModalOpen}
      />
    </>
  );
}