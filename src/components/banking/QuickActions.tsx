import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Plus, Download, BarChart3 } from "lucide-react";
import { TransferModal } from "./TransferModal";

interface QuickActionsProps {
  onViewTransactions: () => void;
  onViewReports: () => void;
}

export function QuickActions({ onViewTransactions, onViewReports }: QuickActionsProps) {
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Greitieji veiksmai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setTransferModalOpen(true)}
              className="flex items-center gap-2 h-12"
            >
              <Send className="w-4 h-4" />
              Pervesti
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-12"
              onClick={() => {
                // TODO: Implement deposit functionality
              }}
            >
              <Plus className="w-4 h-4" />
              Papildyti
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onViewTransactions}
              className="flex items-center gap-2 h-12"
            >
              <Download className="w-4 h-4" />
              Istorija
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onViewReports}
              className="flex items-center gap-2 h-12"
            >
              <BarChart3 className="w-4 h-4" />
              Ataskaitos
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