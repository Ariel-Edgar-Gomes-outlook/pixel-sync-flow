import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReceiptEmailRequest {
  paymentId: string;
  clientEmail: string;
  clientName: string;
  receiptUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { paymentId, clientEmail, clientName, receiptUrl }: ReceiptEmailRequest = await req.json();

    console.log('Sending receipt email:', { paymentId, clientEmail });

    // Fetch payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        clients!inner(name, email),
        invoice_id
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      throw new Error(`Failed to fetch payment: ${paymentError.message}`);
    }

    // Fetch invoice details if available
    let invoiceNumber = 'N/A';
    if (payment.invoice_id) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('id', payment.invoice_id)
        .single();
      
      if (invoice) {
        invoiceNumber = invoice.invoice_number;
      }
    }

    // Fetch business settings
    const { data: settings } = await supabase
      .from('business_settings')
      .select('business_name, email, phone')
      .single();

    const businessName = settings?.business_name || 'Nossa Empresa';
    const businessEmail = settings?.email || 'contato@empresa.com';
    const businessPhone = settings?.phone || '';

    // Send email using Resend (you'll need to add RESEND_API_KEY secret)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Receipt generated but email not sent (RESEND_API_KEY not configured)' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Recibo de Pagamento</h1>
              <p>Confirmação de pagamento recebido</p>
            </div>
            <div class="content">
              <p>Olá <strong>${clientName}</strong>,</p>
              
              <p>Confirmamos o recebimento do seu pagamento. Segue em anexo o recibo oficial.</p>
              
              <div class="details">
                <h3>Detalhes do Pagamento:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Fatura:</strong> ${invoiceNumber}</li>
                  <li><strong>Valor:</strong> ${Number(payment.amount).toFixed(2)} ${payment.currency || 'AOA'}</li>
                  <li><strong>Data:</strong> ${new Date(payment.paid_at).toLocaleDateString('pt-PT')}</li>
                  <li><strong>Método:</strong> ${payment.method || 'N/A'}</li>
                </ul>
              </div>
              
              <center>
                <a href="${receiptUrl}" class="button" target="_blank">
                  📄 Baixar Recibo (PDF)
                </a>
              </center>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Este recibo tem valor legal e pode ser usado para fins contabilísticos.
              </p>
              
              <p>Obrigado pela sua preferência!</p>
              
              <p style="margin-top: 20px;">
                Atenciosamente,<br>
                <strong>${businessName}</strong>
              </p>
            </div>
            <div class="footer">
              <p>${businessName}</p>
              <p>Email: ${businessEmail} ${businessPhone ? `| Tel: ${businessPhone}` : ''}</p>
              <p style="margin-top: 10px; font-size: 11px;">
                Este é um email automático, por favor não responda.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${businessName} <onboarding@resend.dev>`,
        to: [clientEmail],
        subject: `Recibo de Pagamento - ${invoiceNumber}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      throw new Error(`Failed to send email: ${JSON.stringify(resendData)}`);
    }

    console.log('Email sent successfully:', resendData);

    // Update payment record
    await supabase
      .from('payments')
      .update({ receipt_sent_at: new Date().toISOString() })
      .eq('id', paymentId);

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-receipt-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});