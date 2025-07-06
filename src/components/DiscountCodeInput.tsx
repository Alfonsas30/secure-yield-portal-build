import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DiscountCodeInputProps {
  email: string;
  onValidationChange: (result: { valid: boolean; discount_percent?: number; message: string } | null) => void;
  value: string;
  onChange: (value: string) => void;
}

export function DiscountCodeInput({ email, onValidationChange, value, onChange }: DiscountCodeInputProps) {
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; discount_percent?: number; message: string } | null>(null);

  const validateDiscountCode = async (code: string, userEmail: string) => {
    if (!code.trim() || !userEmail.trim()) {
      setValidation(null);
      onValidationChange(null);
      return;
    }

    setValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: { code: code.trim(), email: userEmail.trim() }
      });

      if (error) throw error;
      setValidation(data);
      onValidationChange(data);
    } catch (error) {
      console.error("Error validating discount code:", error);
      const errorResult = {
        valid: false,
        message: "Klaida tikrinant nuolaidų kodą"
      };
      setValidation(errorResult);
      onValidationChange(errorResult);
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && email) {
        validateDiscountCode(value, email);
      } else {
        setValidation(null);
        onValidationChange(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, email]);

  return (
    <div>
      <Label htmlFor="discountCode">
        Nuolaidų kodas <span className="text-sm text-muted-foreground ml-1">(neprivaloma)</span>
      </Label>
      <div className="relative">
        <Input
          id="discountCode"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="Įveskite nuolaidų kodą"
          className={`pr-10 ${
            validation?.valid ? 'border-green-500' : 
            validation && !validation.valid ? 'border-red-500' : ''
          }`}
        />
        {validating && (
          <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
        )}
        {!validating && validation?.valid && (
          <Check className="absolute right-3 top-3 w-4 h-4 text-green-600" />
        )}
        {!validating && validation && !validation.valid && (
          <X className="absolute right-3 top-3 w-4 h-4 text-red-600" />
        )}
      </div>
      {validation && (
        <p className={`text-sm mt-1 ${
          validation.valid ? 'text-green-600' : 'text-red-600'
        }`}>
          {validation.message}
        </p>
      )}
    </div>
  );
}