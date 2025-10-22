import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInvoiceEmailRequest {
  invoice_id: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id }: SendInvoiceEmailRequest = await req.json();
    console.log("Sending invoice email for:", invoice_id);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch invoice with client and business settings
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("Fatura não encontrada");
    }

    if (!invoice.clients?.email) {
      throw new Error("Cliente não possui email");
    }

    // Fetch business settings for sender info
    const { data: businessSettings, error: settingsError } = await supabase
      .from("business_settings")
      .select("*")
      .eq("user_id", invoice.user_id)
      .single();

    if (settingsError) {
      console.warn("Business settings not found, using defaults");
    }

    const invoiceType = invoice.is_proforma ? "Pro-Forma" : "Fatura";
    const businessName = businessSettings?.business_name || "Empresa";
    const businessEmail = businessSettings?.email || "no-reply@empresa.com";

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f4; padding: 20px; text-align: center; }
            .content { padding: 20px; background: white; }
            .invoice-details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${invoiceType} de ${businessName}</h1>
            </div>
            <div class="content">
              <p>Estimado(a) ${invoice.clients.name},</p>
              
              <p>Segue em anexo a ${invoiceType.toLowerCase()} <strong>${invoice.invoice_number}</strong> emitida em ${new Date(invoice.issue_date).toLocaleDateString('pt-PT')}.</p>
              
              <div class="invoice-details">
                <p><strong>Número:</strong> ${invoice.invoice_number}</p>
                <p><strong>Data de Emissão:</strong> ${new Date(invoice.issue_date).toLocaleDateString('pt-PT')}</p>
                ${invoice.due_date ? `<p><strong>Data de Vencimento:</strong> ${new Date(invoice.due_date).toLocaleDateString('pt-PT')}</p>` : ''}
                <p><strong>Valor Total:</strong> ${Number(invoice.total).toFixed(2)} ${invoice.currency || 'AOA'}</p>
              </div>
              
              ${invoice.pdf_url ? `
                <p style="text-align: center;">
                  <a href="${invoice.pdf_url}" class="button">Ver PDF da ${invoiceType}</a>
                </p>
              ` : ''}
              
              ${invoice.payment_instructions ? `
                <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                  <strong>Instruções de Pagamento:</strong>
                  <p style="margin: 10px 0 0 0;">${invoice.payment_instructions}</p>
                </div>
              ` : ''}
              
              ${businessSettings?.iban ? `
                <div style="margin-top: 20px;">
                  <strong>Dados Bancários:</strong>
                  <p>Banco: ${businessSettings.bank_name || 'N/A'}<br>
                  IBAN: ${businessSettings.iban}<br>
                  Titular: ${businessSettings.account_holder || businessSettings.business_name}</p>
                </div>
              ` : ''}
              
              <p style="margin-top: 30px;">Em caso de dúvidas, não hesite em contactar-nos.</p>
              
              <p>Cumprimentos,<br>
              <strong>${businessName}</strong></p>
            </div>
            <div class="footer">
              ${businessSettings?.email ? `<p>Email: ${businessSettings.email}</p>` : ''}
              ${businessSettings?.phone ? `<p>Telefone: ${businessSettings.phone}</p>` : ''}
              ${businessSettings?.website ? `<p>Website: ${businessSettings.website}</p>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailData: any = {
      from: `${businessName} <${businessEmail}>`,
      to: [invoice.clients.email],
      subject: `${invoiceType} ${invoice.invoice_number} - ${businessName}`,
      html: emailHtml,
    };

    // Add CC to business email if available
    if (businessEmail && businessEmail !== "no-reply@empresa.com") {
      emailData.cc = [businessEmail];
    }

    const { error: emailError } = await resend.emails.send(emailData);

    if (emailError) {
      throw emailError;
    }

    // Log notification
    await supabase.from("notifications").insert({
      recipient_id: invoice.user_id,
      type: "invoice_sent",
      payload: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_name: invoice.clients.name,
        client_email: invoice.clients.email,
      },
      delivered: true,
    });

    console.log("Invoice email sent successfully to:", invoice.clients.email);

    return new Response(
      JSON.stringify({ success: true, message: "Email enviado com sucesso" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending invoice email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
