import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CreditCard, Coins, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BinanceConnectModal } from "./BinanceConnectModal";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BinanceBalance {
  asset: string;
  free: number;
  locked: number;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [binanceConnectOpen, setBinanceConnectOpen] = useState(false);
  const [binanceBalances, setBinanceBalances] = useState<BinanceBalance[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [isBinanceConnected, setIsBinanceConnected] = useState(false);

  useEffect(() => {
    if (open) {
      checkBinanceConnection();
    }
  }, [open]);

  const checkBinanceConnection = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('binance_api_key')
        .single();
      
      setIsBinanceConnected(!!profile?.binance_api_key);
      if (profile?.binance_api_key) {
        loadBinanceBalances();
      }
    } catch (error) {
      console.error('Error checking Binance connection:', error);
    }
  };

  const loadBinanceBalances = async () => {
    setLoadingBalances(true);
    try {
      const { data, error } = await supabase.functions.invoke('connect-binance-account', {
        body: { action: 'getBalances' }
      });

      if (error) throw error;
      if (data?.success) {
        setBinanceBalances(data.balances);
      }
    } catch (error) {
      console.error('Error loading Binance balances:', error);
      toast({
        title: t('discount.error'),
        description: t('binance.balances.error'),
        variant: "destructive"
      });
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleStripeDeposit = async () => {
    const depositAmount = parseFloat(amount);
    
    if (!depositAmount || depositAmount < 1 || depositAmount > 10000) {
      toast({
        title: t('discount.error'),
        description: t('deposit.amountError'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-deposit-payment', {
        body: { amount: depositAmount }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        onOpenChange(false);
        setAmount("");
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: t('discount.error'),
        description: t('deposit.paymentError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBinanceDeposit = async () => {
    const transferAmount = parseFloat(cryptoAmount);
    
    if (!transferAmount || !selectedAsset) {
      toast({
        title: t('discount.error'),
        description: t('binance.transfer.validation'),
        variant: "destructive"
      });
      return;
    }

    const selectedBalance = binanceBalances.find(b => b.asset === selectedAsset);
    if (!selectedBalance || transferAmount > selectedBalance.free) {
      toast({
        title: t('discount.error'),
        description: t('binance.transfer.insufficientBalance'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('connect-binance-account', {
        body: { 
          action: 'transfer',
          amount: transferAmount,
          asset: selectedAsset
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: t('binance.transfer.successTitle'),
          description: t('binance.transfer.successMessage', { 
            cryptoAmount: transferAmount,
            asset: selectedAsset,
            ltAmount: data.amount_lt 
          }),
        });
        onOpenChange(false);
        setCryptoAmount("");
        setSelectedAsset("");
        loadBinanceBalances();
      }
    } catch (error) {
      console.error('Binance transfer error:', error);
      toast({
        title: t('discount.error'),
        description: t('binance.transfer.error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t('deposit.title')}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="stripe" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stripe" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {t('deposit.methods.card')}
              </TabsTrigger>
              <TabsTrigger value="binance" className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Binance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stripe" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{t('deposit.amount')}</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max="10000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    EUR
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('deposit.range')}
                </p>
              </div>

              <Button 
                onClick={handleStripeDeposit}
                disabled={loading || !amount}
                className="w-full"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {loading ? t('deposit.processing') : t('deposit.pay')}
              </Button>
            </TabsContent>
            
            <TabsContent value="binance" className="space-y-4">
              {!isBinanceConnected ? (
                <Card>
                  <CardContent className="pt-6 text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t('binance.notConnected')}
                    </p>
                    <Button 
                      onClick={() => setBinanceConnectOpen(true)}
                      variant="outline"
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      {t('binance.connect.button')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{t('binance.balances.title')}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadBinanceBalances}
                      disabled={loadingBalances}
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingBalances ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>

                  {binanceBalances.length > 0 && (
                    <div className="space-y-3">
                      <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('binance.selectAsset')} />
                        </SelectTrigger>
                        <SelectContent>
                          {binanceBalances.map((balance) => (
                            <SelectItem key={balance.asset} value={balance.asset}>
                              <div className="flex items-center justify-between w-full">
                                <span>{balance.asset}</span>
                                <Badge variant="outline" className="ml-2">
                                  {balance.free.toFixed(6)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedAsset && (
                        <div className="space-y-2">
                          <Label htmlFor="cryptoAmount">
                            {t('binance.transfer.amount')} ({selectedAsset})
                          </Label>
                          <Input
                            id="cryptoAmount"
                            type="number"
                            step="0.000001"
                            value={cryptoAmount}
                            onChange={(e) => setCryptoAmount(e.target.value)}
                            placeholder="0.000000"
                          />
                          {selectedAsset && cryptoAmount && (
                            <p className="text-sm text-muted-foreground">
                              ≈ {(parseFloat(cryptoAmount) * (selectedAsset === 'USDT' || selectedAsset === 'USDC' ? 3.5 : selectedAsset === 'BTC' ? 315000 : 10500)).toFixed(2)} LT
                            </p>
                          )}
                        </div>
                      )}

                      <Button 
                        onClick={handleBinanceDeposit}
                        disabled={loading || !selectedAsset || !cryptoAmount}
                        className="w-full"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        {loading ? t('binance.transfer.processing') : t('binance.transfer.button')}
                      </Button>
                    </div>
                  )}

                  {binanceBalances.length === 0 && !loadingBalances && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t('binance.balances.empty')}
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <BinanceConnectModal 
        open={binanceConnectOpen}
        onOpenChange={setBinanceConnectOpen}
        onConnected={() => {
          setIsBinanceConnected(true);
          loadBinanceBalances();
        }}
      />
    </>
  );
}