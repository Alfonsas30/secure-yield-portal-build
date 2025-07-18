
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PaymentConfirmationRequest {
  email: string;
  name: string;
  amount: number;
  payment_type: string;
  payment_id?: string;
  account_type?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== SEND-PAYMENT-CONFIRMATION STARTED ===");
  
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
    console.log('Resend client initialized for payment confirmation');

    const { 
      email, 
      name, 
      amount, 
      payment_type, 
      payment_id, 
      account_type 
    }: PaymentConfirmationRequest = await req.json();

    console.log("Payment confirmation request:", { email, name, amount, payment_type, payment_id });

    if (!email || !name || !amount || !payment_type) {
      return new Response(
        JSON.stringify({ error: "Trūksta duomenų mokėjimo patvirtinimui" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Determine payment type text
    let paymentTypeText = '';
    let nextSteps = '';
    
    switch (payment_type) {
      case 'registration':
        paymentTypeText = 'Sąskaitos registracijos mokestis';
        nextSteps = `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">📋 Kiti žingsniai:</h3>
            <ol style="color: #92400e; line-height: 1.6;">
              <li>Su jumis susisieks mūsų specialistas per 1-2 darbo dienas</li>
              <li>Bus suformuotos ir atsiųstos sutartys</li>
              <li>Po sutarčių pasirašymo bus atidaryta jūsų sąskaita</li>
              <li>Galėsite pradėti naudotis VILTB banko paslaugomis</li>
            </ol>
          </div>
        `;
        break;
      case 'deposit':
        paymentTypeText = 'Indėlio papildymas';
        nextSteps = `
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">💰 Jūsų indėlis papildytas!</h3>
            <p style="color: #16a34a;">
              Lėšos bus pridėtos prie jūsų sąskaitos balanso per kelias minutes. 
              Už visas lėšas sąskaitoje mokame 2% metinius palūkanas kasdien.
            </p>
          </div>
        `;
        break;
      case 'loan':
        paymentTypeText = 'Paskolos mokestis';
        nextSteps = `
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">📄 Paskolos procesas</h3>
            <p style="color: #1e40af;">
              Su jumis susisieks mūsų specialistas dėl paskolos sutarties sudarymo 
              ir tolimesnių veiksmų.
            </p>
          </div>
        `;
        break;
      default:
        paymentTypeText = 'Mokėjimas';
        nextSteps = '';
    }

    // Send confirmation email to user
    const emailResponse = await resend.emails.send({
      from: "VILTB Bankas <noreply@viltb.com>",
      to: [email],
      subject: "Mokėjimo patvirtinimas - VILTB Bankas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Mokėjimas patvirtintas</h1>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <h2 style="color: #16a34a; margin-top: 0;">✅ Mokėjimas sėkmingas!</h2>
            <p>Sveiki, <strong>${name}</strong>!</p>
            <p>Jūsų mokėjimas buvo sėkmingai apdorotas.</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Mokėjimo duomenys:</h3>
            <ul style="color: #6b7280; line-height: 1.6;">
              <li><strong>Mokėjimo tipas:</strong> ${paymentTypeText}</li>
              <li><strong>Suma:</strong> ${amount.toFixed(2)} €</li>
              <li><strong>Mokėjimo laikas:</strong> ${new Date().toLocaleString('lt-LT')}</li>
              ${payment_id ? `<li><strong>Mokėjimo ID:</strong> ${payment_id}</li>` : ''}
              ${account_type ? `<li><strong>Sąskaitos tipas:</strong> ${account_type === 'personal' ? 'Asmeninė' : 'Įmonės'}</li>` : ''}
            </ul>
          </div>

          ${nextSteps}

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">💡 Svarbu žinoti</h3>
            <ul style="color: #1e40af; line-height: 1.6;">
              <li>Šis el. laiškas yra jūsų mokėjimo patvirtinimas</li>
              <li>Išsaugokite šį laišką savo dokumentuose</li>
              <li>Klausimai? Susisiekite su mumis bet kuriuo metu</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280;">
              Ačiū, kad pasirinkote VILTB banką!
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            VILTB Banko sistema - Patikimas ir saugus<br>
            Ši automatinė žinutė išsiųsta mokėjimo patvirtinimo metu.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Error sending payment confirmation email:", emailResponse.error);
      throw new Error("Nepavyko išsiųsti mokėjimo patvirtinimo");
    }

    console.log("Payment confirmation email sent successfully:", emailResponse.data?.id);

    // Also notify admin
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    const adminEmailResponse = await resend.emails.send({
      from: "VILTB Bankas <noreply@viltb.com>",
      to: [adminEmail],
      subject: `Naujas mokėjimas - ${name} (${amount.toFixed(2)} €)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Naujas mokėjimo patvirtinimas</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Vardas:</strong> ${name}</p>
            <p><strong>El. paštas:</strong> ${email}</p>
            <p><strong>Mokėjimo tipas:</strong> ${paymentTypeText}</p>
            <p><strong>Suma:</strong> ${amount.toFixed(2)} €</p>
            <p><strong>Mokėjimo laikas:</strong> ${new Date().toLocaleString('lt-LT')}</p>
            ${payment_id ? `<p><strong>Payment ID:</strong> ${payment_id}</p>` : ''}
            ${account_type ? `<p><strong>Account Type:</strong> ${account_type}</p>` : ''}
          </div>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Mokėjimo patvirtinimas išsiųstas",
        email_id: emailResponse.data?.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-payment-confirmation:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Nepavyko išsiųsti mokėjimo patvirtinimo" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
