import { useState } from "react";
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
import { Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

      toast({
        title: "Paraiška sėkmingai pateikta!",
        description: "Mes su jumis susisieksime artimiausiu metu.",
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko pateikti paraiškos. Bandykite dar kartą.",
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
            Tapti valdybos nariu
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Užpildykite formą ir mes su jumis susisieksime artimiausiu metu aptarti galimybes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vardas ir pavardė *</FormLabel>
                  <FormControl>
                    <Input placeholder="Įveskite vardą ir pavardę" {...field} />
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
                  <FormLabel>El. paštas *</FormLabel>
                  <FormControl>
                    <Input placeholder="Įveskite el. paštą" type="email" {...field} />
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
                  <FormLabel>Telefono numeris</FormLabel>
                  <FormControl>
                    <Input placeholder="Įveskite telefono numerį" {...field} />
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
                  <FormLabel>Patirtis ir motyvacija *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Aprašykite savo patirtį finansų srityje, vadyboje ar susijusiose srityse, taip pat savo motyvaciją tapti valdybos nariu..."
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
                Atšaukti
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Siunčiama...
                  </>
                ) : (
                  'Pateikti paraišką'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};