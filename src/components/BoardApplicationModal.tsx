import { useState } from "react";
import * as React from "react";
import { useTranslation } from 'react-i18next';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trackBoardApplicationSubmitted, trackModalOpen } from "@/lib/analytics";

const formSchema = z.object({
  name: z.string().min(2, "Vardas turi būti bent 2 simbolių"),
  email: z.string().email("Neteisingas el. pašto formatas"),
  phone: z.string().optional(),
  experience: z.string().min(10, "Prašome aprašyti savo patirtį (bent 10 simbolių)"),
});

type FormData = z.infer<typeof formSchema>;

interface BoardApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BoardApplicationModal = ({ open, onOpenChange }: BoardApplicationModalProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Track modal opening
  React.useEffect(() => {
    if (open) {
      trackModalOpen('board_application');
    }
  }, [open]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      experience: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('board_applications')
        .insert([{
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          experience: data.experience
        }]);

      if (error) throw error;

      // Track successful submission
      trackBoardApplicationSubmitted();

      toast({
        title: t('boardApplication.toast.success'),
        description: t('boardApplication.toast.successDescription'),
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: t('boardApplication.toast.error'),
        description: t('boardApplication.toast.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-purple-50/30">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold bg-gradient-to-r from-purple-700 to-amber-600 bg-clip-text text-transparent">
            <Crown className="w-6 h-6 mr-2 text-amber-600" />
            {t('boardApplication.title')}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {t('boardApplication.description')}
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 font-bold text-base">
            {t('boardApplication.warning')}
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('boardApplication.form.name')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('boardApplication.form.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('boardApplication.form.email')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('boardApplication.form.emailPlaceholder')} type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('boardApplication.form.phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('boardApplication.form.phonePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('boardApplication.form.experience')} *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('boardApplication.form.experiencePlaceholder')}
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                {t('boardApplication.buttons.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('boardApplication.buttons.submitting')}
                  </>
                ) : (
                  t('boardApplication.buttons.submit')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};