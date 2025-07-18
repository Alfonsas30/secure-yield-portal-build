
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RegistrationRequest {
  email: string;
  name: string;
  account_type: string;
  registration_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== SEND-REGISTRATION-CONFIRMATION STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Only POST method allowed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      }
    );
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      throw new Error("El. pašto paslauga nesukonfigūruota");
    }

    const resend = new Resend(resendApiKey);
    console.log('Resend client initialized for registration confirmation');

    const { email, name, account_type, registration_id }: RegistrationRequest = await req.json();
    console.log("Registration confirmation request:", { email, name, account_type, registration_id });

    if (!email || !name || !account_type) {
      return new Response(
        JSON.stringify({ error: "Trūksta duomenų registracijos patvirtinimui" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const accountTypeText = account_type === 'personal' ? 'Asmeninė sąskaita' : 'Įmonės sąskaita';
    const price = account_type === 'personal' ? '800 €' : '1500 €';

    // Send confirmation email to user
    const emailResponse = await resend.emails.send({
      from: "VILTB Bankas <noreply@viltb.com>",
      to: [email],
      subject: "Registracijos patvirtinimas - VILTB Bankas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Sveiki atvykę į VILTB!</h1>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <h2 style="color: #16a34a; margin-top: 0;">✅ Registracija sėkminga!</h2>
            <p>Sveiki, <strong>${name}</strong>!</p>
            <p>Jūsų registracija VILTB banke buvo sėkminga.</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Registracijos duomenys:</h3>
            <ul style="color: #6b7280; line-height: 1.6;">
              <li><strong>Vardas:</strong> ${name}</li>
              <li><strong>El. paštas:</strong> ${email}</li>
              <li><strong>Sąskaitos tipas:</strong> ${accountTypeText}</li>
              <li><strong>Mokestis:</strong> ${price}</li>
              ${registration_id ? `<li><strong>Registracijos ID:</strong> ${registration_id}</li>` : ''}
            </ul>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">📋 Kiti žingsniai:</h3>
            <ol style="color: #92400e; line-height: 1.6;">
              <li>Atlikite mokėjimą už sąskaitos atidarymą</li>
              <li>Po mokėjimo patvirtinimo su jumis susisieks mūsų specialistas</li>
              <li>Bus suformuotos sutartys ir atidaryta sąskaita</li>
              <li>Galėsite pradėti naudotis VILTB banko paslaugomis</li>
            </ol>
          </div>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">💰 Palūkanos</h3>
            <p style="color: #1e40af; margin: 0;">
              Už lėšas jūsų sąskaitoje mokame <strong>2% metinius palūkanas</strong>, 
              kurie skaičiuojami ir mokami kasdien automatiškai.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280;">
              Klausimai? Susisiekite su mumis el. paštu arba telefonu.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            VILTB Banko sistema - Patikimas ir saugus<br>
            Ši automatinė žinutė išsiųsta registracijos metu.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Error sending registration confirmation email:", emailResponse.error);
      throw new Error("Nepavyko išsiųsti registracijos patvirtinimo");
    }

    console.log("Registration confirmation email sent successfully:", emailResponse.data?.id);

    // Also notify admin
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    const adminEmailResponse = await resend.emails.send({
      from: "VILTB Bankas <noreply@viltb.com>",
      to: [adminEmail],
      subject: `Nauja registracija - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Nauja vartotojo registracija</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Vardas:</strong> ${name}</p>
            <p><strong>El. paštas:</strong> ${email}</p>
            <p><strong>Sąskaitos tipas:</strong> ${accountTypeText}</p>
            <p><strong>Mokestis:</strong> ${price}</p>
            <p><strong>Registracijos laikas:</strong> ${new Date().toLocaleString('lt-LT')}</p>
            ${registration_id ? `<p><strong>Registration ID:</strong> ${registration_id}</p>` : ''}
          </div>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Registracijos patvirtinimas išsiųstas",
        email_id: emailResponse.data?.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-registration-confirmation:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Nepavyko išsiųsti registracijos patvirtinimo" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
