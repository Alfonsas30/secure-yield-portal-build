import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LoanApplicationRequest {
  name: string;
  email: string;
  phone?: string;
  monthlyIncome?: string;
  employmentInfo?: string;
  loanPurpose?: string;
  loanAmount: number;
  loanTerm: number;
  monthlyPayment: number;
  totalPayment: number;
  interestRate: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      throw new Error('El. pašto paslauga nesukonfigūruota');
    }

    const resend = new Resend(resendApiKey);
    console.log('Processing loan application submission');
    
    const data: LoanApplicationRequest = await req.json();

    // Validate required fields
    if (!data.name || !data.email || !data.loanAmount) {
      return new Response(
        JSON.stringify({ error: "Prašome užpildyti visus privalomius laukus" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Input validation and sanitization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: "Netinkamas el. pašto formatas" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    const sanitizedName = data.name.replace(/[<>]/g, '').trim();
    const sanitizedEmployment = data.employmentInfo?.replace(/[<>]/g, '').trim() || '';
    const sanitizedPurpose = data.loanPurpose?.replace(/[<>]/g, '').trim() || '';
    const sanitizedPhone = data.phone?.replace(/[<>]/g, '').trim() || '';

    // Send email to admin
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    console.log(`Sending admin notification to: ${adminEmail}`);
    
    const adminEmailResponse = await resend.emails.send({
      from: "LTB Bankas <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `Nauja paskolos paraiška - ${sanitizedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Nauja paskolos paraiška</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin-top: 0;">Kontaktinė informacija:</h3>
            <p><strong>Vardas:</strong> ${sanitizedName}</p>
            <p><strong>El. paštas:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            ${sanitizedPhone ? `<p><strong>Telefonas:</strong> ${sanitizedPhone}</p>` : ''}
            ${data.monthlyIncome ? `<p><strong>Mėnesinės pajamos:</strong> ${data.monthlyIncome} €</p>` : ''}
            ${sanitizedEmployment ? `<p><strong>Darbo vieta:</strong> ${sanitizedEmployment}</p>` : ''}
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">Paskolos parametrai:</h3>
            <p><strong>Suma:</strong> ${data.loanAmount.toLocaleString('lt-LT')} €</p>
            <p><strong>Terminas:</strong> ${data.loanTerm} mėn.</p>
            <p><strong>Palūkanų norma:</strong> ${data.interestRate}%</p>
            <p><strong>Mėnesinis mokėjimas:</strong> ${data.monthlyPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
            <p><strong>Bendra suma:</strong> ${data.totalPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
          </div>
          
          ${sanitizedPurpose ? `
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin-top: 0;">Paskolos paskirtis:</h3>
            <p style="white-space: pre-line; line-height: 1.6;">${sanitizedPurpose}</p>
          </div>
          ` : ''}
          
          <div style="margin-top: 20px; padding: 15px; background-color: #ecfdf5; border-radius: 8px;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              Ši paraiška buvo pateikta per LTB Bankas svetainės paskolos formą.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Admin email sent successfully:", adminEmailResponse);

    // Send confirmation email to customer
    console.log(`Sending confirmation email to customer: ${data.email}`);
    const customerEmailResponse = await resend.emails.send({
      from: "LTB Bankas <onboarding@resend.dev>",
      to: [data.email],
      subject: "Paskolos paraiška gauta - LTB Bankas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Ačiū už paskolos paraišką!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">Sveiki, ${sanitizedName}!</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Gavome jūsų paskolos paraišką šiems parametrams:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Jūsų paskolos parametrai:</h3>
            <p><strong>Suma:</strong> ${data.loanAmount.toLocaleString('lt-LT')} €</p>
            <p><strong>Terminas:</strong> ${data.loanTerm} mėn.</p>
            <p><strong>Mėnesinis mokėjimas:</strong> ${data.monthlyPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
            <p><strong>Palūkanų norma:</strong> ${data.interestRate}% per metus</p>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin-top: 0;">Kas toliau?</h3>
            <ul style="color: #047857; line-height: 1.6;">
              <li>Mūsų specialistai peržiūrės jūsų paraišką per 24 valandas</li>
              <li>Susisieksime su jumis nurodytu el. paštu arba telefonu</li>
              <li>Jei reikės papildomų dokumentų, informuosime apie tai</li>
              <li>Gavę teigiamą sprendimą, pasiūlysime paskolos sutartį</li>
            </ul>
          </div>
          
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">Jokių paslėptų mokesčių!</h4>
            <p style="color: #b45309; line-height: 1.6;">
              Mūsų paskolos su 14% metine palūkanų norma neturi jokių papildomų mokesčių. 
              Mokėsite tiksliai tiek, kiek parodė skaičiuoklė.
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Jei turite klausimų, drąsiai rašykite mums atgal arba skambinkite.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Geriausiai,<br>
            LTB Bankas komanda
          </p>
        </div>
      `,
    });

    console.log("Customer email sent successfully:", customerEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Paskolos paraiška sėkmingai pateikta" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-loan-application function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Nepavyko pateikti paraiškos. Pabandykite dar kartą." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);